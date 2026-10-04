import { useState } from 'react'
import { statusLabels, type OrderStatus } from '../../data/seed'
import { useStore } from '../../store'
import { Button, Card, Empty, ErrorText, Field, fmtDate, inputCls, Modal, OkText, PageTitle, Pts, Status } from '../../components/ui'

export default function AdminOrders() {
  const { orders, employees, items, decideOrder } = useStore()
  const [status, setStatus] = useState<OrderStatus | ''>('processing')
  const [q, setQ] = useState('')
  const [deciding, setDeciding] = useState<{ id: string; approve: boolean } | null>(null)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const name = (id: string) => employees.find(e => e.id === id)?.name ?? '—'
  const list = orders.filter(o => (!status || o.status === status) && (!q || `${o.id} ${o.itemName} ${name(o.employeeId)}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <PageTitle title="Заказы и согласования" sub="Маршрут: руководитель → HR" />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px]">
        <input type="search" className={inputCls} placeholder="№ заказа, сотрудник, позиция" value={q} onChange={e => setQ(e.target.value)} />
        <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as OrderStatus | '')} aria-label="Статус">
          <option value="">Все статусы</option>
          {(Object.keys(statusLabels) as OrderStatus[]).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>
      <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />
      {list.length === 0 ? <Empty>Нет заказов по фильтру</Empty> : (
        <Card className="mt-3 overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr><th className="px-4 py-3">№</th><th className="px-4 py-3">Дата</th><th className="px-4 py-3">Сотрудник</th><th className="px-4 py-3">Позиция</th><th className="px-4 py-3 text-right">Сумма</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map(o => {
                const approval = items.find(i => i.id === o.itemId)?.needsApproval
                return (
                  <tr key={o.id} className="align-top">
                    <td className="px-4 py-3 tabular-nums">{o.id}</td>
                    <td className="whitespace-nowrap px-4 py-3">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3">{name(o.employeeId)}</td>
                    <td className="px-4 py-3">
                      {o.itemName}
                      {approval && <span className="ml-1.5 rounded bg-amber-100 px-1.5 text-xs text-amber-900">согласование</span>}
                      {o.details && <div className="text-xs text-stone-500">📎 {o.details}</div>}
                      {o.comment && <div className="text-xs text-stone-500">💬 {o.comment}</div>}
                    </td>
                    <td className="px-4 py-3 text-right"><Pts n={o.price} /></td>
                    <td className="px-4 py-3"><Status s={o.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {o.status === 'processing' && <>
                        <Button className="!px-2.5 !py-1 text-xs" onClick={() => { setComment(''); setDeciding({ id: o.id, approve: true }) }}>{approval ? 'Одобрить' : 'Выполнен'}</Button>{' '}
                        <Button variant="danger" className="!px-2.5 !py-1 text-xs" onClick={() => { setComment(''); setDeciding({ id: o.id, approve: false }) }}>Отклонить</Button>
                      </>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
      {deciding && (
        <Modal title={`${deciding.approve ? 'Одобрить' : 'Отклонить'} заказ №${deciding.id}`} onClose={() => setDeciding(null)}>
          <Field label={deciding.approve ? 'Комментарий (необязательно)' : 'Причина отказа'} hint={deciding.approve ? undefined : 'Баллы будут возвращены сотруднику'}>
            <textarea className={inputCls} rows={3} value={comment} onChange={e => setComment(e.target.value)} autoFocus />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeciding(null)}>Отмена</Button>
            <Button variant={deciding.approve ? 'primary' : 'danger'} onClick={() => {
              const err = decideOrder(deciding.id, deciding.approve, comment)
              if (err) return setMsg({ err })
              setMsg({ ok: `Заказ №${deciding.id} ${deciding.approve ? 'одобрен' : 'отклонён'}. Запись добавлена в журнал аудита.` })
              setDeciding(null)
            }}>Подтвердить</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
