import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { total } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { Card, fmt, fmtDate, PageTitle, Pts } from '../../components/ui'

export default function Points() {
  const me = useMe()
  const txs = useStore(s => s.txs).filter(t => t.employeeId === me.id).sort((a, b) => a.date.localeCompare(b.date))
  let run = 0
  const series = txs.map(t => ({ date: fmtDate(t.date), balance: (run += t.amount) }))

  return (
    <div className="space-y-6">
      <PageTitle title="Мои баллы" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile label="Всего" n={total(me)} />
        <Tile label="Доступно к расходованию" n={me.frozen ? 0 : total(me)} note={me.frozen ? 'Заморожено администратором' : undefined} />
        <Tile label="Сгорают 15.01.2027" n={me.burnable} note={me.burnable ? 'Тратятся в первую очередь. Напомним за 30 и 7 дней.' : undefined} warn={me.burnable > 0} />
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Динамика баланса</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} tickFormatter={fmt} />
              <Tooltip formatter={v => [`${fmt(Number(v))} б.`, 'Баланс']} />
              <Area type="stepAfter" dataKey="balance" stroke="#065f46" fill="#d1fae5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="!p-0">
        <h2 className="px-5 pt-5 font-semibold">История операций</h2>
        <ul className="mt-2 divide-y divide-stone-100">
          {[...txs].reverse().map(t => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span><span className="block">{t.note}</span><span className="text-xs text-stone-500">{fmtDate(t.date)}</span></span>
              <span className={`font-semibold tabular-nums ${t.amount > 0 ? 'text-emerald-800' : 'text-stone-900'}`}>{t.amount > 0 ? '+' : ''}{fmt(t.amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const Tile = ({ label, n, note, warn }: { label: string; n: number; note?: string; warn?: boolean }) => (
  <Card className={warn ? 'ring-amber-300' : ''}>
    <p className="text-sm text-stone-500">{label}</p>
    <Pts n={n} className="mt-1 block text-2xl font-semibold text-stone-900" />
    {note && <p className={`mt-2 text-xs ${warn ? 'text-amber-800' : 'text-stone-500'}`}>{note}</p>}
  </Card>
)
