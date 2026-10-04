import type { Balance } from '../lib/points'

export type Role = 'employee' | 'maternity' | 'vip' | 'hr'
export type ItemType = 'physical' | 'digital' | 'promo' | 'card' | 'docs' | 'booking' | 'vacation'
export type OrderStatus = 'created' | 'processing' | 'done' | 'cancelled'

export type Employee = Balance & {
  id: string; name: string; position: string; grade: 1 | 2 | 3; department: string; city: string
  role: Role; email: string; hireDate: string; frozen: boolean; onboarded: boolean
  dmsProgram?: string; family: { name: string; birthDate: string; relation: string; program: string }[]
}
export type Section = { id: string; name: string; emoji: string; color: string; insurance?: boolean }
export type Item = {
  id: string; sectionId: string; category: string; name: string; description: string; supplier: string
  price: number; type: ItemType; conditions: string; archived: boolean; needsApproval?: boolean
  codes?: string[]; recommendedFor?: number[]
}
export type Order = {
  id: string; employeeId: string; itemId: string; itemName: string; price: number; split: Balance
  status: OrderStatus; createdAt: string; code?: string; comment?: string; details?: string
}
export type Tx = { id: string; employeeId: string; amount: number; note: string; date: string }
export type Audit = { id: string; at: string; actor: string; action: string; details: string }
export type Settings = { commissionPct: number; minTransfer: number; pointRub: number; charityMatch: number; codeThreshold: number }
export type DmsProgram = { id: string; name: string; insurer: string; price: number; maxAge: number; covers: string[]; excludes: string[]; clinics: string[] }

export const typeLabels: Record<ItemType, string> = {
  physical: 'Физический товар', digital: 'Цифровой товар', promo: 'Промокод', card: 'Виртуальная карта',
  docs: 'Компенсация по документам', booking: 'По записи / бронь', vacation: 'Доп. отпуск',
}
export const statusLabels: Record<OrderStatus, string> = {
  created: 'Создан', processing: 'В обработке', done: 'Выполнен', cancelled: 'Отменён',
}
export const roleLabels: Record<Role, string> = { employee: 'Сотрудник', maternity: 'Декрет', vip: 'ВИП', hr: 'HR / Админ' }

export const sections: Section[] = [
  { id: 'health', name: 'Моё здоровье', emoji: '🩺', color: 'bg-rose-100', insurance: true },
  { id: 'sport', name: 'Спорт и wellbeing', emoji: '🏃', color: 'bg-emerald-100' },
  { id: 'edu', name: 'Обучение', emoji: '🎓', color: 'bg-amber-50' },
  { id: 'rest', name: 'Отдых', emoji: '🏕️', color: 'bg-orange-100' },
  { id: 'family', name: 'Семья и дети', emoji: '👨‍👩‍👧', color: 'bg-sky-100' },
  { id: 'certs', name: 'Сертификаты', emoji: '🎁', color: 'bg-lime-100' },
  { id: 'general', name: 'Общие предложения', emoji: '⭐', color: 'bg-stone-200' },
]

const codes = (p: string, n: number) => Array.from({ length: n }, (_, i) => `${p}-${(7301 + i * 37).toString(36).toUpperCase()}`)

export const items: Item[] = [
  { id: 'dms-dent', sectionId: 'health', category: 'Расширение ДМС', name: 'Стоматология к ДМС', description: 'Лечение и профилактика зубов в клиниках-партнёрах.', supplier: 'Ингосстрах', price: 2500, type: 'digital', conditions: 'Действует до конца полисного года.', archived: false, recommendedFor: [3] },
  { id: 'dms-diag', sectionId: 'health', category: 'Расширение ДМС', name: 'Расширенная диагностика', description: 'МРТ, КТ, check-up раз в год.', supplier: 'Ингосстрах', price: 1800, type: 'digital', conditions: 'Направление от терапевта.', archived: false },
  { id: 'psy', sectionId: 'health', category: 'Wellbeing', name: 'Сессия с психологом', description: 'Онлайн-консультация 50 минут.', supplier: 'Ясно', price: 600, type: 'booking', conditions: 'Запись на свободный слот.', archived: false, recommendedFor: [1, 2, 3] },
  { id: 'fit', sectionId: 'sport', category: 'Фитнес', name: 'Абонемент в фитнес-клуб, 3 мес.', description: 'Сеть клубов по всей России.', supplier: 'World Class', price: 3000, type: 'digital', conditions: 'Активация в течение 30 дней.', archived: false, recommendedFor: [3] },
  { id: 'pool', sectionId: 'sport', category: 'Фитнес', name: 'Бассейн, 8 посещений', description: 'Абонемент в бассейн рядом с домом.', supplier: 'SportPass', price: 1200, type: 'promo', conditions: 'Промокод действует 1 год.', archived: false, codes: codes('POOL', 12), recommendedFor: [1] },
  { id: 'yoga', sectionId: 'sport', category: 'Wellbeing', name: 'Йога онлайн, 1 год', description: 'Подписка на онлайн-занятия.', supplier: 'Yoga Online', price: 900, type: 'promo', conditions: 'Отмена невозможна после выдачи кода.', archived: false, codes: codes('YOGA', 3) },
  { id: 'eng', sectionId: 'edu', category: 'Языки', name: 'Английский язык, курс 3 мес.', description: 'Групповые занятия с преподавателем.', supplier: 'Skyeng', price: 2800, type: 'digital', conditions: 'Доступ направляется на почту.', archived: false, recommendedFor: [1, 2] },
  { id: 'course', sectionId: 'edu', category: 'Курсы', name: 'Онлайн-курс по аналитике данных', description: 'Профессиональная программа, 4 месяца.', supplier: 'Яндекс Практикум', price: 4500, type: 'digital', conditions: 'Лимит мест: 10 в квартал.', archived: false, recommendedFor: [3] },
  { id: 'conf', sectionId: 'edu', category: 'Конференции', name: 'Участие в отраслевой конференции', description: 'Компенсация билета до 6000 баллов.', supplier: '—', price: 6000, type: 'docs', conditions: 'Загрузите подтверждающие документы.', archived: false, needsApproval: true },
  { id: 'vac', sectionId: 'rest', category: 'Отпуск', name: 'Дополнительный день отпуска', description: 'Один оплачиваемый день к отпуску.', supplier: 'Компания', price: 1500, type: 'vacation', conditions: 'Требуется согласование руководителя и HR.', archived: false, needsApproval: true },
  { id: 'base', sectionId: 'rest', category: 'Базы отдыха', name: 'База отдыха «Сосны», 2 ночи', description: 'Номер на двоих, завтрак включён.', supplier: 'Сосны', price: 5000, type: 'booking', conditions: 'Бронь не позднее чем за 7 дней до заезда.', archived: false },
  { id: 'travel', sectionId: 'rest', category: 'Туризм', name: 'Туристический сертификат', description: 'Номинал 3000 ₽ на любой тур.', supplier: 'Островок', price: 3000, type: 'card', conditions: 'Код направляется на почту.', archived: false, recommendedFor: [3] },
  { id: 'kinder', sectionId: 'family', category: 'Дети', name: 'Компенсация детского сада', description: 'Частичная компенсация оплаты за месяц.', supplier: '—', price: 2000, type: 'docs', conditions: 'Приложите чек и договор.', archived: false, needsApproval: true },
  { id: 'camp', sectionId: 'family', category: 'Дети', name: 'Детский лагерь, смена', description: 'Летний лагерь, 14 дней.', supplier: 'Артек-партнёр', price: 4000, type: 'booking', conditions: 'Возраст ребёнка 7–15 лет.', archived: false },
  { id: 'toy', sectionId: 'family', category: 'Подарки', name: 'Подарок ребёнку', description: 'Набор LEGO с доставкой.', supplier: 'Детский мир', price: 1500, type: 'physical', conditions: 'Доставка 5–7 дней.', archived: false },
  { id: 'ozon', sectionId: 'certs', category: 'Маркетплейсы', name: 'Сертификат Ozon, 1000 ₽', description: 'Электронный подарочный сертификат.', supplier: 'Giftery', price: 1000, type: 'promo', conditions: 'Срок действия — 1 год.', archived: false, codes: codes('OZON', 20) },
  { id: 'gold', sectionId: 'certs', category: 'Подарочные карты', name: 'Подарочная карта «ПВК», 2000 ₽', description: 'Карта «Подарок в квадрате» на выбор впечатлений.', supplier: 'prostodar', price: 2000, type: 'card', conditions: 'Номер карты придёт на почту.', archived: false },
  { id: 'merch', sectionId: 'general', category: 'Мерч', name: 'Корпоративный худи', description: 'Тёплый худи с логотипом компании.', supplier: 'Компания', price: 800, type: 'physical', conditions: 'Доставка в офис.', archived: false, recommendedFor: [1] },
  { id: 'coffee', sectionId: 'general', category: 'Офис', name: 'Кофе в офисе, месяц', description: 'Безлимитный кофе в кофейне на 1 этаже.', supplier: 'Coffee Point', price: 700, type: 'promo', conditions: 'Промокод на месяц.', archived: false, codes: codes('CUP', 15) },
  { id: 'flex', sectionId: 'general', category: 'Нефинансовые', name: 'Гибкий график', description: 'Свободное начало рабочего дня с 8 до 11.', supplier: 'Компания', price: 0, type: 'vacation', conditions: 'Согласование руководителя.', archived: false, needsApproval: true },
]

export const dmsPrograms: DmsProgram[] = [
  { id: 'base', name: 'Базовая', insurer: 'Ингосстрах', price: 0, maxAge: 64, covers: ['Поликлиника', 'Вызов врача на дом', 'Скорая помощь'], excludes: ['Стоматология', 'Госпитализация'], clinics: ['Медси', 'СМ-Клиника'] },
  { id: 'opt', name: 'Оптимальная', insurer: 'Ингосстрах', price: 3500, maxAge: 64, covers: ['Всё из Базовой', 'Плановая госпитализация', 'Стоматология (терапия)'], excludes: ['Протезирование'], clinics: ['Медси', 'СМ-Клиника', 'GMS'] },
  { id: 'senior', name: 'Серебряный возраст', insurer: 'РЕСО', price: 4500, maxAge: 80, covers: ['Поликлиника', 'Кардиология', 'Скорая помощь'], excludes: ['Стоматология'], clinics: ['Медси'] },
]
export const familyPrice = 4000

export const funds = ['Фонд «Подари жизнь»', 'Фонд «Вера»', 'Приют «Ника»']

export const employees: Employee[] = [
  { id: 'e1', name: 'Анна Иванова', position: 'Ведущий аналитик', grade: 2, department: 'Финансы', city: 'Москва', role: 'employee', email: 'a.ivanova@corp.ru', hireDate: '2021-03-15', burnable: 5000, permanent: 1500, frozen: false, onboarded: false, dmsProgram: 'base', family: [] },
  { id: 'e2', name: 'Мария Петрова', position: 'Специалист', grade: 1, department: 'Продажи', city: 'Казань', role: 'maternity', email: 'm.petrova@corp.ru', hireDate: '2020-06-01', burnable: 0, permanent: 2500, frozen: false, onboarded: true, dmsProgram: 'base', family: [] },
  { id: 'e3', name: 'Игорь Смирнов', position: 'Директор департамента', grade: 3, department: 'Строительство', city: 'Москва', role: 'vip', email: 'i.smirnov@corp.ru', hireDate: '2015-01-20', burnable: 0, permanent: 3000, frozen: false, onboarded: true, family: [] },
  { id: 'e4', name: 'Ольга Кузнецова', position: 'HR бизнес-партнёр', grade: 2, department: 'HR', city: 'Москва', role: 'hr', email: 'o.kuznetsova@corp.ru', hireDate: '2019-09-10', burnable: 5000, permanent: 3500, frozen: false, onboarded: true, family: [] },
  { id: 'e5', name: 'Дмитрий Соколов', position: 'Инженер ПТО', grade: 1, department: 'Строительство', city: 'Екатеринбург', role: 'employee', email: 'd.sokolov@corp.ru', hireDate: '2023-02-01', burnable: 3800, permanent: 500, frozen: false, onboarded: true, dmsProgram: 'base', family: [] },
  { id: 'e6', name: 'Елена Морозова', position: 'Руководитель группы', grade: 3, department: 'Финансы', city: 'Санкт-Петербург', role: 'employee', email: 'e.morozova@corp.ru', hireDate: '2017-11-05', burnable: 2100, permanent: 4000, frozen: false, onboarded: true, dmsProgram: 'opt', family: [] },
  { id: 'e7', name: 'Павел Волков', position: 'Менеджер', grade: 2, department: 'Продажи', city: 'Новосибирск', role: 'employee', email: 'p.volkov@corp.ru', hireDate: '2022-07-18', burnable: 4500, permanent: 0, frozen: false, onboarded: true, dmsProgram: 'base', family: [] },
]

// История для графиков и дашборда
const o = (id: string, employeeId: string, itemId: string, status: OrderStatus, createdAt: string, extra: Partial<Order> = {}): Order => {
  const it = items.find(i => i.id === itemId)!
  return { id, employeeId, itemId, itemName: it.name, price: it.price, split: { burnable: it.price, permanent: 0 }, status, createdAt, ...extra }
}
export const orders: Order[] = [
  o('1001', 'e5', 'fit', 'done', '2026-02-10'),
  o('1002', 'e5', 'ozon', 'done', '2026-03-02', { code: 'OZON-SEED1' }),
  o('1003', 'e6', 'course', 'done', '2026-03-15'),
  o('1004', 'e6', 'base', 'done', '2026-05-20'),
  o('1005', 'e7', 'fit', 'done', '2026-04-11'),
  o('1006', 'e7', 'vac', 'processing', '2026-09-28'),
  o('1007', 'e2', 'camp', 'processing', '2026-06-01'),
  o('1008', 'e6', 'kinder', 'processing', '2026-09-30', { details: 'Чек №4512, договор с ДОУ №17' }),
  o('1009', 'e5', 'psy', 'done', '2026-07-08'),
  o('1010', 'e7', 'ozon', 'done', '2026-08-19', { code: 'OZON-SEED2' }),
]

export const txs: Tx[] = [
  { id: 't1', employeeId: 'e1', amount: 5000, note: 'Базовое начисление 2026', date: '2026-01-15' },
  { id: 't2', employeeId: 'e1', amount: 2500, note: 'За стаж: 5 лет', date: '2026-03-15' },
  { id: 't3', employeeId: 'e1', amount: -1500, note: 'Сертификат Ozon ×1, Бассейн', date: '2026-04-02' },
  { id: 't4', employeeId: 'e1', amount: 500, note: 'День рождения', date: '2026-06-21' },
  { id: 't5', employeeId: 'e1', amount: -1000, note: 'Перевод коллеге', date: '2026-08-10' },
  ...employees.filter(e => e.id !== 'e1').map((e, i) => ({ id: `tb${i}`, employeeId: e.id, amount: e.burnable + e.permanent, note: 'Начисления 2026', date: '2026-01-15' })),
]

export const audit: Audit[] = [
  { id: 'a1', at: '2026-01-15T09:00:00', actor: 'Система', action: 'Базовое начисление', details: '5000 баллов × 5 сотрудников (кроме ВИП и декрета)' },
  { id: 'a2', at: '2026-03-15T09:00:00', actor: 'Система', action: 'Начисление за стаж', details: 'Анна Иванова: +2500' },
]

export const settings: Settings = { commissionPct: 25, minTransfer: 100, pointRub: 1, charityMatch: 1, codeThreshold: 5 }
