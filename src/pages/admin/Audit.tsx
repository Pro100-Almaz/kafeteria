import { useState } from 'react'
import { useStore } from '../../store'
import { Card, fmtDateTime, inputCls, PageTitle } from '../../components/ui'

export default function AdminAudit() {
  const audit = useStore(s => s.audit)
  const [q, setQ] = useState('')
  const list = audit.filter(a => `${a.actor} ${a.action} ${a.details}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <PageTitle title="Журнал аудита" sub="Финансово значимые операции, изменения настроек, ролей и каталога" />
      <input type="search" className={`${inputCls} mb-4`} placeholder="Фильтр по пользователю, действию, деталям" value={q} onChange={e => setQ(e.target.value)} />
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr><th className="px-4 py-3">Время</th><th className="px-4 py-3">Пользователь</th><th className="px-4 py-3">Действие</th><th className="px-4 py-3">Детали</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {list.map(a => (
              <tr key={a.id}>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{fmtDateTime(a.at)}</td>
                <td className="whitespace-nowrap px-4 py-3">{a.actor}</td>
                <td className="px-4 py-3 font-medium">{a.action}</td>
                <td className="px-4 py-3 text-stone-600">{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
