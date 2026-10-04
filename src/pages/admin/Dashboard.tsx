import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { total } from '../../lib/points'
import { useStore } from '../../store'
import { Card, fmt, PageTitle, Pts } from '../../components/ui'

// ФТ-АНЛ.1: все цифры считаются из текущих данных
export default function Dashboard() {
  const { employees, orders, items, settings } = useStore()
  const live = orders.filter(o => o.status !== 'cancelled')
  const spent = live.reduce((s, o) => s + o.price, 0)
  const unused = employees.reduce((s, e) => s + total(e), 0)
  const pending = orders.filter(o => o.status === 'processing').length
  const lowCodes = items.filter(i => i.codes && i.codes.length < settings.codeThreshold)

  const byDept = [...new Set(employees.map(e => e.department))].map(d => {
    const ids = employees.filter(e => e.department === d).map(e => e.id)
    const s = live.filter(o => ids.includes(o.employeeId)).reduce((a, o) => a + o.price, 0)
    const left = employees.filter(e => e.department === d).reduce((a, e) => a + total(e), 0)
    return { name: d, pct: s + left ? Math.round((s / (s + left)) * 100) : 0 }
  })
  const top = Object.entries(live.reduce<Record<string, number>>((m, o) => ((m[o.itemName] = (m[o.itemName] ?? 0) + 1), m), {}))
    .map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)

  return (
    <div className="space-y-6">
      <PageTitle title="Дашборд эффективности" sub="Обновляется в реальном времени по действиям сотрудников" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Потрачено баллов" value={<Pts n={spent} />} sub={`≈ ${fmt(spent * settings.pointRub)} ₽`} />
        <Kpi label="Неиспользованный остаток" value={<Pts n={unused} />} sub={`${employees.length} сотрудников`} />
        <Kpi label="Заказов" value={fmt(live.length)} sub={`${pending} ждут обработки`} link={pending ? '/admin/orders' : undefined} />
        <Kpi label="Использование бюджета" value={`${spent + unused ? Math.round((spent / (spent + unused)) * 100) : 0}%`} sub="по компании" />
      </div>
      {lowCodes.length > 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ⚠️ Заканчиваются коды: {lowCodes.map(i => `«${i.name}» (${i.codes!.length})`).join(', ')}. Порог — {settings.codeThreshold}.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Использование бюджета по подразделениям, %</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Использовано']} />
                <Bar dataKey="pct" fill="#065f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Топ популярных льгот</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" fontSize={12} allowDecimals={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={170} fontSize={11} tickLine={false} />
                <Tooltip formatter={v => [v, 'Заказов']} />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

const Kpi = ({ label, value, sub, link }: { label: string; value: React.ReactNode; sub: string; link?: string }) => (
  <Card>
    <p className="text-sm text-stone-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
    {link ? <Link to={link} className="mt-1 block text-xs font-medium text-emerald-800 hover:underline">{sub} →</Link> : <p className="mt-1 text-xs text-stone-500">{sub}</p>}
  </Card>
)
