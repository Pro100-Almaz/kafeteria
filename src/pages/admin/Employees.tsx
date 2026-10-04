import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { roleLabels } from '../../data/seed'
import { total } from '../../lib/points'
import { useStore } from '../../store'
import { Button, Card, Empty, ErrorText, Field, fmt, fmtDate, inputCls, OkText, PageTitle, Pts, Status } from '../../components/ui'

export function Employees() {
  const employees = useStore(s => s.employees)
  const [q, setQ] = useState('')
  const list = employees.filter(e => `${e.name} ${e.department} ${e.city}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <PageTitle title="Сотрудники" sub="Синхронизация с 1С:ЗУП: эмуляция, последняя — сегодня 06:00" />
      <input type="search" className={`${inputCls} mb-4`} placeholder="Поиск по ФИО, подразделению, городу" value={q} onChange={e => setQ(e.target.value)} />
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr><th className="px-4 py-3">Сотрудник</th><th className="px-4 py-3">Подразделение</th><th className="px-4 py-3">Группа</th><th className="px-4 py-3">Грейд</th><th className="px-4 py-3 text-right">Баланс</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {list.map(e => (
              <tr key={e.id} className="hover:bg-stone-50">
                <td className="px-4 py-3"><Link to={`/admin/employees/${e.id}`} className="font-medium text-emerald-900 hover:underline">{e.name}</Link><div className="text-xs text-stone-500">{e.position}</div></td>
                <td className="px-4 py-3">{e.department}<div className="text-xs text-stone-500">{e.city}</div></td>
                <td className="px-4 py-3">{roleLabels[e.role]}</td>
                <td className="px-4 py-3">{e.grade}</td>
                <td className="px-4 py-3 text-right">{e.frozen && <span className="mr-2 text-xs text-red-700">❄ заморожено</span>}<Pts n={total(e)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function EmployeeCard() {
  const { id } = useParams()
  const { employees, txs, orders, adjustPoints, setFrozen } = useStore()
  const e = employees.find(x => x.id === id)
  const [amount, setAmount] = useState(500)
  const [mode, setMode] = useState<'burn' | 'perm' | 'minus'>('burn')
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  if (!e) return <Empty>Сотрудник не найден</Empty>
  const history = txs.filter(t => t.employeeId === e.id).sort((a, b) => b.date.localeCompare(a.date))
  const myOrders = orders.filter(o => o.employeeId === e.id)

  return (
    <div className="space-y-6">
      <Link to="/admin/employees" className="text-sm text-stone-500 hover:underline">← Все сотрудники</Link>
      <PageTitle title={e.name} sub={`${e.position} · ${e.department}, ${e.city} · ${roleLabels[e.role]} · грейд ${e.grade} · в компании с ${fmtDate(e.hireDate)}`}
        action={<Button variant={e.frozen ? 'primary' : 'danger'} onClick={() => setFrozen(e.id, !e.frozen)}>{e.frozen ? 'Разморозить баллы' : '❄ Заморозить баллы'}</Button>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-stone-500">Баланс{e.frozen && <span className="ml-2 text-red-700">заморожен</span>}</p>
          <Pts n={total(e)} className="mt-1 block text-3xl font-semibold" />
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Сгораемые</dt><dd><Pts n={e.burnable} /></dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Несгораемые</dt><dd><Pts n={e.permanent} /></dd></div>
          </dl>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Ручное начисление / списание</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
            <Field label="Сумма"><input type="number" min={1} className={inputCls} value={amount || ''} onChange={x => setAmount(+x.target.value)} /></Field>
            <Field label="Операция">
              <select className={inputCls} value={mode} onChange={x => setMode(x.target.value as typeof mode)}>
                <option value="burn">Начислить сгораемые (1 год)</option>
                <option value="perm">Начислить несгораемые</option>
                <option value="minus">Списать</option>
              </select>
            </Field>
            <div className="sm:col-span-2"><Field label="Комментарий *"><input className={inputCls} value={comment} onChange={x => setComment(x.target.value)} placeholder="Например: День строителя" /></Field></div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={() => {
              const err = adjustPoints(e.id, mode === 'minus' ? -amount : amount, comment, mode === 'burn')
              if (err) return setMsg({ err })
              setMsg({ ok: `Готово: ${mode === 'minus' ? '−' : '+'}${fmt(amount)} б. Операция записана в журнал аудита.` })
              setComment('')
            }}>Провести</Button>
            <span className="text-xs text-stone-500">🔐 В продуктиве операция подтверждается 2FA</span>
          </div>
          <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="!p-0">
          <h2 className="px-5 pt-5 font-semibold">Движение по счёту</h2>
          <ul className="mt-2 divide-y divide-stone-100">
            {history.map(t => (
              <li key={t.id} className="flex justify-between gap-3 px-5 py-2.5 text-sm">
                <span>{t.note}<span className="block text-xs text-stone-500">{fmtDate(t.date)}</span></span>
                <span className={`font-semibold tabular-nums ${t.amount > 0 ? 'text-emerald-800' : ''}`}>{t.amount > 0 ? '+' : ''}{fmt(t.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="!p-0">
          <h2 className="px-5 pt-5 font-semibold">Заказы</h2>
          {myOrders.length === 0 ? <p className="px-5 py-4 text-sm text-stone-500">Нет заказов</p> : (
            <ul className="mt-2 divide-y divide-stone-100">
              {myOrders.map(o => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span>№{o.id} {o.itemName}<span className="block text-xs text-stone-500">{fmtDate(o.createdAt)}</span></span>
                  <Status s={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
