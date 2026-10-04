import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { total } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { BudgetBar, Button, Card, Empty, ErrorText, Field, inputCls, PageTitle, Pts, sectionOf } from '../../components/ui'

export default function Cart() {
  const me = useMe()
  const { items, cart, toggleCart, checkout } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState('')
  const list = cart.map(id => items.find(i => i.id === id)!).filter(Boolean)
  const used = list.reduce((s, i) => s + i.price, 0)
  const available = me.frozen ? 0 : total(me)
  const needsDocs = list.some(i => i.type === 'docs')

  if (!list.length) return <><PageTitle title="Корзина" /><Empty>Корзина пуста. <Link to="/catalog" className="text-emerald-800 underline">Перейти в каталог</Link></Empty></>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <PageTitle title="Корзина" sub="Позиции можно убрать до подтверждения заказа" />
        <div className="space-y-2">
          {list.map(i => (
            <Card key={i.id} className="flex items-center gap-4 !p-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl ${sectionOf(i).color}`}>{sectionOf(i).emoji}</span>
              <div className="flex-1">
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-stone-500">{i.needsApproval ? 'Требует согласования' : i.supplier}</div>
              </div>
              <Pts n={i.price} className="font-semibold" />
              <button onClick={() => toggleCart(i.id)} className="text-sm text-stone-500 hover:text-red-700">Убрать</button>
            </Card>
          ))}
        </div>
      </div>
      <Card className="h-fit lg:mt-16">
        <BudgetBar used={used} available={available} />
        {needsDocs && (
          <div className="mt-5">
            <Field label="Подтверждающие документы" hint="В демо достаточно указать название файла или номер чека">
              <input className={inputCls} value={docs} onChange={e => setDocs(e.target.value)} placeholder="Чек №… / договор №…" />
            </Field>
          </div>
        )}
        <Button className="mt-5 w-full" disabled={used > available || (needsDocs && !docs.trim())} onClick={() => {
          const err = checkout(cart, docs || undefined)
          if (err) setError(err)
          else navigate('/orders')
        }}>Оформить за <Pts n={used} /></Button>
        <ErrorText text={error} />
      </Card>
    </div>
  )
}
