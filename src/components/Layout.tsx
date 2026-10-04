import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { roleLabels } from '../data/seed'
import { total } from '../lib/points'
import { useMe, useStore } from '../store'
import { Pts } from './ui'

const employeeNav = [
  ['/', 'Главная'], ['/catalog', 'Каталог'], ['/health', 'Моё здоровье'], ['/orders', 'Заказы'],
  ['/points', 'Баллы'], ['/transfer', 'Переводы'],
] as const
const adminNav = [
  ['/admin', 'Дашборд'], ['/admin/orders', 'Заказы'], ['/admin/employees', 'Сотрудники'],
  ['/admin/catalog', 'Каталог'], ['/admin/settings', 'Настройки'], ['/admin/audit', 'Журнал аудита'],
] as const

export default function Layout({ admin }: { admin?: boolean }) {
  const me = useMe()
  const { employees, setCurrent, reset, cart } = useStore()
  const navigate = useNavigate()
  const nav = admin ? adminNav : me.role === 'vip' || me.role === 'maternity' ? employeeNav.filter(([p]) => p !== '/health') : employeeNav

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
        Демо-версия · данные условные, интеграции (SSO, 1С:ЗУП, почта, поставщики) эмулируются
      </div>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to={admin ? '/admin' : '/'} className="flex items-center gap-2 font-semibold text-stone-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white">☕</span>
            <span>Кафетерий льгот{admin && <span className="ml-1.5 font-normal text-stone-500">· Пульт</span>}</span>
          </NavLink>
          <div className="flex w-full min-w-0 items-center gap-3 sm:ml-auto sm:w-auto">
            {!admin && (
              <NavLink to="/cart" className="relative rounded-lg px-2 py-1 text-sm hover:bg-stone-100">
                Корзина{cart.length > 0 && <span className="ml-1 rounded-full bg-emerald-800 px-1.5 text-xs text-white">{cart.length}</span>}
              </NavLink>
            )}
            {!admin && <span className="hidden text-sm sm:inline">Баланс: <Pts n={me.frozen ? 0 : total(me)} className="font-semibold" /></span>}
            <select
              aria-label="Сменить роль"
              value={me.id}
              onChange={e => {
                setCurrent(e.target.value)
                const next = employees.find(x => x.id === e.target.value)!
                navigate(next.role === 'hr' ? '/admin' : '/')
              }}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-sm sm:flex-none"
            >
              {employees.filter(e => ['e1', 'e2', 'e3', 'e4'].includes(e.id)).map(e => (
                <option key={e.id} value={e.id}>{roleLabels[e.role]}: {e.name}</option>
              ))}
            </select>
            <button
              onClick={() => { if (confirm('Сбросить все демо-данные к исходным?')) { reset(); navigate('/') } }}
              className="whitespace-nowrap text-xs text-stone-500 underline-offset-2 hover:underline"
            >Сбросить демо</button>
          </div>
          <nav className="-mx-1 flex w-full gap-1 overflow-x-auto">
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/' || to === '/admin'}
                className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-emerald-50 font-medium text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}>
                {label}
              </NavLink>
            ))}
            {me.role === 'hr' && (
              <NavLink to={admin ? '/catalog' : '/admin'} className="ml-auto whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100">
                {admin ? 'Витрина →' : 'Пульт →'}
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    </div>
  )
}
