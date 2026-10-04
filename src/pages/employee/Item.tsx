import { Link, useParams } from 'react-router-dom'
import { typeLabels } from '../../data/seed'
import { useMe, useStore } from '../../store'
import { Button, Card, canSee, Empty, Pts, sectionOf } from '../../components/ui'

export default function ItemPage() {
  const { id } = useParams()
  const me = useMe()
  const { items, cart, toggleCart } = useStore()
  const item = items.find(i => i.id === id)
  if (!item) return <Empty>Позиция не найдена. <Link to="/catalog" className="text-emerald-800 underline">В каталог</Link></Empty>
  const s = sectionOf(item)
  const allowed = canSee(me.role, s)

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <div className={`flex aspect-square max-h-96 items-center justify-center rounded-2xl text-8xl ${s.color}`}>{s.emoji}</div>
      <div>
        <Link to={`/catalog?s=${s.id}`} className="text-sm text-stone-500 hover:underline">{s.name} / {item.category}</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">{item.name}</h1>
        <p className="mt-3 text-stone-600">{item.description}</p>
        <Pts n={item.price} className="mt-5 block text-3xl font-semibold text-stone-900" />
        {item.archived ? (
          <p className="mt-4 rounded-lg bg-stone-200 px-3 py-2 text-sm">Позиция в архиве и недоступна для заказа.</p>
        ) : !allowed ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Раздел недоступен для вашей группы сотрудников.</p>
        ) : (
          <div className="mt-5 flex gap-2">
            <Button onClick={() => toggleCart(item.id)} variant={cart.includes(item.id) ? 'ghost' : 'primary'}>
              {cart.includes(item.id) ? 'Убрать из корзины' : 'Добавить в корзину'}
            </Button>
            {cart.includes(item.id) && <Link to="/cart"><Button variant="ghost">Перейти в корзину</Button></Link>}
          </div>
        )}
        <Card className="mt-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-stone-500">Поставщик</dt><dd className="font-medium">{item.supplier}</dd></div>
            <div><dt className="text-stone-500">Тип</dt><dd className="font-medium">{typeLabels[item.type]}</dd></div>
            <div className="sm:col-span-2"><dt className="text-stone-500">Условия</dt><dd className="font-medium">{item.conditions}</dd></div>
            {item.needsApproval && <div className="sm:col-span-2"><dt className="text-stone-500">Согласование</dt><dd className="font-medium">Требуется одобрение руководителя / HR</dd></div>}
            {item.codes && <div><dt className="text-stone-500">Осталось кодов</dt><dd className="font-medium">{item.codes.length}</dd></div>}
          </dl>
          <p className="mt-4 border-t border-stone-100 pt-3 text-sm text-stone-500">📎 Подробные условия.pdf · 📷 Фото (вложения загружаются HR в Пульте)</p>
        </Card>
      </div>
    </div>
  )
}
