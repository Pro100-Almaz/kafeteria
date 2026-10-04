import { Link } from 'react-router-dom'
import { roleLabels, sections } from '../../data/seed'
import { total } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { Button, Card, canSee, ItemTile, Pts } from '../../components/ui'

export default function Home() {
  const me = useMe()
  const { items, orders, cart, toggleCart } = useStore()
  const visible = sections.filter(s => canSee(me.role, s))
  const recommended = items.filter(i => !i.archived && i.recommendedFor?.includes(me.grade) && visible.some(s => s.id === i.sectionId))
  const activeOrders = orders.filter(o => o.employeeId === me.id && o.status === 'processing').length

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-sm text-stone-500">{roleLabels[me.role]} · {me.position}, грейд {me.grade}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Здравствуйте, {me.name.split(' ')[0]}!</h1>
          {me.frozen ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Ваши баллы временно заморожены. Обратитесь в HR.</p>
          ) : !me.onboarded ? (
            <>
              <p className="mt-3 text-stone-600">Бюджет на 2026 год сформирован, льготы ещё не выбраны. Мы подготовили пакет под вашу должность — примите его или соберите свой.</p>
              <Link to="/onboarding"><Button className="mt-4">Выбрать льготы</Button></Link>
            </>
          ) : (
            <p className="mt-3 text-stone-600">
              {activeOrders ? `Заказов в обработке: ${activeOrders}. ` : ''}Окно выбора открыто до 31 декабря 2026.
            </p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Доступно к расходованию</p>
          <Pts n={me.frozen ? 0 : total(me)} className="mt-1 block text-3xl font-semibold text-stone-900" />
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Сгораемые (до 15.01.2027)</dt><dd><Pts n={me.burnable} /></dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Несгораемые</dt><dd><Pts n={me.permanent} /></dd></div>
          </dl>
          <Link to="/points" className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:underline">История операций →</Link>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Разделы</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {visible.map(s => (
            <Link key={s.id} to={`/catalog?s=${s.id}`} className={`rounded-xl p-4 transition hover:brightness-95 ${s.color}`}>
              <div className="text-3xl">{s.emoji}</div>
              <div className="mt-2 text-sm font-medium text-stone-900">{s.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Рекомендуем для вас</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map(i => <ItemTile key={i.id} item={i} inCart={cart.includes(i.id)} onToggle={() => toggleCart(i.id)} />)}
          </div>
        </section>
      )}
    </div>
  )
}
