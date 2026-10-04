import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMe, useStore } from '../../store'
import { Button, Card, Empty, ErrorText, fmtDate, OkText, PageTitle, Pts, Status } from '../../components/ui'

export default function Orders() {
  const me = useMe()
  const { orders, cancelOrder } = useStore()
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const mine = orders.filter(o => o.employeeId === me.id)

  return (
    <div>
      <PageTitle title="Мои заказы" sub="Статусы, коды сертификатов и отмена" />
      <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />
      {mine.length === 0 ? <Empty>Заказов пока нет. <Link to="/catalog" className="text-emerald-800 underline">Выбрать льготы</Link></Empty> : (
        <div className="mt-3 space-y-2">
          {mine.map(o => (
            <Card key={o.id} className="!p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-stone-500">№{o.id} · {fmtDate(o.createdAt)}</div>
                  <div className="font-medium">{o.itemName}</div>
                </div>
                <Pts n={o.price} className="font-semibold" />
                <Status s={o.status} />
                {o.status !== 'cancelled' && (
                  <Button variant="danger" className="!px-2.5 !py-1 text-xs" disabled={!!o.code}
                    title={o.code ? 'Заказ с промокодом отменить нельзя' : undefined}
                    onClick={() => {
                      if (!confirm(`Отменить заказ №${o.id}? Баллы вернутся на счёт.`)) return
                      const err = cancelOrder(o.id)
                      setMsg(err ? { err } : { ok: `Заказ №${o.id} отменён, ${o.price} баллов возвращены.` })
                    }}>Отменить</Button>
                )}
              </div>
              {o.code && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
                  <span>Код: <code className="rounded bg-white px-2 py-0.5 font-mono font-semibold ring-1 ring-stone-200">{o.code}</code></span>
                  <span className="text-stone-500">отправлен на {me.email} · отмена невозможна</span>
                  <button className="ml-auto text-emerald-800 hover:underline" onClick={() => setMsg({ ok: `Код по заказу №${o.id} повторно отправлен на ${me.email}` })}>Отправить повторно</button>
                </div>
              )}
              {o.status === 'processing' && !o.code && <p className="mt-2 text-sm text-amber-800">Ожидает согласования / исполнения поставщиком</p>}
              {o.comment && <p className="mt-2 text-sm text-stone-600">Комментарий HR: {o.comment}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
