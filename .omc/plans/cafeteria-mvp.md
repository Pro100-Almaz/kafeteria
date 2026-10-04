# План MVP «Кафетерий льгот» — frontend-only demo

**Status:** pending approval
**Source:** `кафетерий льгот.docx` (ТЗ, ~100 требований)
**Constraints:** no backend · 2–3 days · goal = show idea + our capability · UI in Russian

## Requirements Summary

A single static SPA with a **role switcher** in the header (Сотрудник / Декрет / HR-Админ).
All data comes from mock fixtures and persists in `localStorage`. "Reset demo" restores the seed.
The demo shows the core loop from the ТЗ: HR accrues points / adds a benefit → employee sees it, builds a package within budget → order → HR approves → status and balance update.

### In scope (mapped to ТЗ codes)
| Area | ТЗ codes | MVP depth |
|---|---|---|
| Onboarding | ОНБ.2–5 | Welcome screen + recommended package by grade + package builder; confirmation is blocked when over budget |
| Catalog / storefront | КАТ.1–3, 9, 10 | Sections → categories → items, search + filters, item card, cart, live remaining budget |
| Role visibility | РОЛ.2–3 | Декрет role hides «Страхование»; ВИП only sees «Общие предложения» |
| ДМС | ДМС.1, 3, 4, 5 | «Моё здоровье» page, add-ons, family member form with age validation |
| Points | БАЛ.1, 4, 10 | Burnable/non-burnable balances, burnable spent first, history + usage chart |
| Orders | ЗАК.1, 2, 4, 5, 6 | Checkout, statuses, cancel with refund (blocked for promo codes), approval for "доп. день отпуска" |
| Promo codes | СЕР.2 | Code auto-issued from the mock pool on purchase, shown in order |
| Transfers / charity | СОЦ.1, 4 | Transfer with 25% commission (setting); donation to a fund |
| Admin (Пульт) | АДМ-02, 06, 08, 11, 15, 23, 24 | Item CRUD + archive, manual accrual/deduction with required comment, employee card, orders + approvals, settings, audit log |
| Analytics | АНЛ.1 | Dashboard: budget usage by department, top benefits, unused points |

### Explicitly out of scope (state in demo talk-track as "phase 2 / backend")
SSO/2FA, 1С:ЗУП, email/SMTP, ПВК/Giftery integrations, Excel import, campaigns/windows, surveys, lotteries, gamification, news, support tickets, anomaly detection, accounting export, real file uploads.

## Stack
- Vite + React 18 + TypeScript
- Tailwind + shadcn/ui (cards, dialogs, tables, forms) — looks polished out of the box
- Zustand + `persist` middleware → `localStorage`
- React Router (hash router → works on any static host)
- Recharts for the dashboard and points chart
- Deploy: Vercel/Netlify static, send the client a link

No API layer, no mock server, no i18n library (Russian strings inline).

## Structure
```
src/
  data/seed.ts          # employees, catalog, orders, settings, audit — one file
  store.ts              # zustand store + all actions (accrue, order, approve, cancel, transfer)
  lib/points.ts         # spend logic (burnable first), budget calc
  lib/points.test.ts    # one test file: spend priority, over-budget block, commission
  components/           # Layout, RoleSwitcher, BudgetBar, ItemCard
  pages/employee/       # Welcome, Onboarding, Catalog, Item, Cart, Health, Orders, Points, Transfer
  pages/admin/          # Dashboard, Catalog, Employees, EmployeeCard, Orders, Settings, Audit
```

## Implementation Steps
**Day 1: foundation + employee happy path**
1. Scaffold Vite+TS, Tailwind, shadcn, router, layout with role switcher + "Сбросить демо".
2. `seed.ts`: ~5 employees (one per role, different grades), ~25 items across sections (Здоровье, Спорт, Обучение, Отдых, Семья, Сертификаты, Общие предложения), 3 ДМС programs + add-ons, promo code pools, settings (`commissionPct: 25`, `pointRub: 1`, `minTransfer: 100`).
3. `store.ts` + `lib/points.ts`: balance split, `spend()` burnable first, `canAfford`, every mutation appends to audit.
4. Pages: Welcome (status + CTA), Onboarding (recommended package by grade, toggles, live budget bar, over-budget block), Catalog (sections/shelves, search, filters), Item card, Cart/checkout.

**Day 2: rest of employee side + admin**
5. Orders (statuses, cancel/refund rules, promo code reveal), Points (balance, history, Recharts chart), ДМС page (family form + age check), Transfer/charity.
6. Admin: Orders table with filters + approve/reject with comment; Employees + EmployeeCard (accrual/deduction, freeze); Catalog CRUD + archive (blocked delete if active orders); Settings form; Audit log table.

**Day 3: dashboard, polish, deploy**
7. Admin dashboard (3 charts + KPI tiles), computed from store data so it reacts to demo actions.
8. Polish: empty states, toasts, mobile-responsive storefront, branding placeholder (logo/colors in one CSS var set).
9. `points.test.ts` (Vitest), deploy, write a 1-page demo script (click path for the presentation).

## Acceptance Criteria
1. `npm run build` produces static files; the deployed link opens with no console errors.
2. Switching the role to «Декрет» hides the insurance section; «ВИП» only shows «Общие предложения».
3. In onboarding, a package over budget disables «Подтвердить» and shows the overage in points.
4. Buying an item with 1000 burnable + 5000 non-burnable points and a price of 1500 leaves 0 burnable + 4500 non-burnable (covered by a unit test).
5. Transferring 1000 points with commission 25% debits 1250 from the sender (or credits 750, whichever rule we pick; the test documents it).
6. Ordering «Доп. день отпуска» creates the order in status «в обработке»; approving it as HR changes the employee's status to «выполнен», and the audit log gets an entry with user, time and comment.
7. Cancelling a promo-code order is not available; cancelling another order refunds the points and logs it to audit.
8. A manual accrual with an empty comment is rejected; with a comment it updates the balance, the employee card and the audit log.
9. Archiving an item hides it from the catalog, and existing orders still show it.
10. The dashboard numbers change after a new order is placed (no hardcoded values).
11. A page reload keeps the state; «Сбросить демо» restores the seed.

## Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Scope creep from a 100-requirement ТЗ | In/out table above is the contract; extra ideas go to "phase 2" slide |
| Client reads the demo as "almost done" | Banner «Демо-версия, данные условные»; talk-track lists backend/integrations explicitly |
| Ambiguous rules (commission debited vs withheld) | Pick one, make it a setting, mention it as an open question for the client |
| Day 2 overload | Cut order: Transfer/charity → ДМС family form → Catalog CRUD (keep accrual + approvals + audit) |
| Visual quality below "capability" bar | shadcn defaults + one accent color; no custom design work |

## Verification Steps
- `npx vitest run`: points tests pass (AC 4, 5).
- Manual click-through of the demo script covering AC 2, 3, 6–11, in a fresh incognito window.
- `npm run build && npx vite preview`: smoke test of the built bundle (AC 1).
- Check the storefront at 375px width.

## Open questions for client (non-blocking)
- Transfer commission: is it on top of the amount, or deducted from what the recipient gets?
- Branding (logo/colors) for the demo?
