import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Item, OrderStatus, Role, Section } from '../data/seed'
import { sections, statusLabels } from '../data/seed'

export const fmt = (n: number) => n.toLocaleString('ru-RU')
export const fmtDate = (s: string) => new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDateTime = (s: string) => new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// РОЛ.2–3: видимость разделов по роли
export const canSee = (role: Role, s: Section) =>
  role === 'vip' ? s.id === 'general' : role === 'maternity' ? !s.insurance : true
export const sectionOf = (item: Item) => sections.find(s => s.id === item.sectionId)!

export function Button({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const v = {
    primary: 'bg-emerald-800 text-white hover:bg-emerald-900 disabled:bg-stone-200 disabled:text-stone-500',
    ghost: 'bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-stone-50 disabled:text-stone-400',
    danger: 'bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50 disabled:text-stone-400',
  }[variant]
  return <button {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${v} ${className}`} />
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl bg-white p-5 ring-1 ring-stone-200 ${className}`}>{children}</div>
)

export const Pts = ({ n, className = '' }: { n: number; className?: string }) => (
  <span className={`tabular-nums ${className}`}>{fmt(n)}&nbsp;<span className="text-[0.85em] opacity-70">б.</span></span>
)

const statusColor: Record<OrderStatus, string> = {
  created: 'bg-stone-100 text-stone-700', processing: 'bg-amber-100 text-amber-800',
  done: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-50 text-red-700',
}
export const Status = ({ s }: { s: OrderStatus }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[s]}`}>{statusLabels[s]}</span>
)

export const PageTitle = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {sub && <p className="mt-1 text-stone-500">{sub}</p>}
    </div>
    {action}
  </div>
)

export function BudgetBar({ used, available }: { used: number; available: number }) {
  const over = used - available
  const pct = available ? Math.min(100, (used / available) * 100) : 100
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-stone-600">Выбрано <Pts n={used} className="font-semibold text-stone-900" /> из <Pts n={available} /></span>
        {over > 0
          ? <span className="font-medium text-red-700">Превышение: <Pts n={over} /></span>
          : <span className="text-stone-600">Остаток: <Pts n={available - used} className="font-semibold text-emerald-800" /></span>}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${over > 0 ? 'bg-red-600' : 'bg-emerald-700'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ItemTile({ item, inCart, onToggle }: { item: Item; inCart: boolean; onToggle: () => void }) {
  const s = sectionOf(item)
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 transition hover:ring-stone-300">
      <Link to={`/item/${item.id}`} className={`flex h-28 items-center justify-center text-5xl ${s.color}`}>{s.emoji}</Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-xs text-stone-500">{item.category} · {item.supplier}</div>
        <Link to={`/item/${item.id}`} className="mt-1 font-medium leading-snug text-stone-900 hover:underline">{item.name}</Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Pts n={item.price} className="font-semibold" />
          <Button variant={inCart ? 'ghost' : 'primary'} onClick={onToggle}>{inCart ? 'Убрать' : 'В корзину'}</Button>
        </div>
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4" onClick={onClose}>
      <div role="dialog" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-stone-400 hover:text-stone-700" aria-label="Закрыть">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
  </label>
)
export const inputCls = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20'

export const ErrorText = ({ text }: { text: string | null }) =>
  text ? <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{text}</p> : null
export const OkText = ({ text }: { text: string | null }) =>
  text ? <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{text}</p> : null

export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">{children}</div>
)
