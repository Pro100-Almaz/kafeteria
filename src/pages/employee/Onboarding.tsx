import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sections } from '../../data/seed'
import { overBudget, total } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { BudgetBar, Button, Card, canSee, ErrorText, PageTitle, Pts, sectionOf } from '../../components/ui'

// ФТ-ОНБ.3–5: рекомендованный пакет по грейду + конструктор с пересчётом бюджета
export default function Onboarding() {
  const me = useMe()
  const { items, completeOnboarding } = useStore()
  const navigate = useNavigate()
  const pool = items.filter(i => !i.archived && canSee(me.role, sectionOf(i)) && !i.needsApproval)
  const [picked, setPicked] = useState(() => pool.filter(i => i.recommendedFor?.includes(me.grade)).map(i => i.id))
  const [error, setError] = useState<string | null>(null)
  const available = me.frozen ? 0 : total(me)
  const used = pool.filter(i => picked.includes(i.id)).reduce((s, i) => s + i.price, 0)
  const over = overBudget([used], available)
  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))

  return (
    <div>
      <PageTitle title="Стартовый пакет льгот" sub={`Подобран для грейда ${me.grade}. Включайте и отключайте позиции — остаток пересчитается сразу.`} />
      <Card className="sticky top-28 z-10 mb-6 shadow-sm"><BudgetBar used={used} available={available} /></Card>
      <div className="space-y-6">
        {sections.filter(s => pool.some(i => i.sectionId === s.id)).map(s => (
          <div key={s.id}>
            <h2 className="mb-2 font-semibold">{s.emoji} {s.name}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {pool.filter(i => i.sectionId === s.id).map(i => {
                const on = picked.includes(i.id)
                return (
                  <label key={i.id} className={`flex cursor-pointer items-center gap-3 rounded-xl bg-white p-4 ring-1 transition ${on ? 'ring-2 ring-emerald-700' : 'ring-stone-200 hover:ring-stone-300'}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(i.id)} className="h-4 w-4 accent-emerald-800" />
                    <span className="flex-1">
                      <span className="block font-medium">{i.name}</span>
                      <span className="text-sm text-stone-500">{i.supplier}</span>
                    </span>
                    <Pts n={i.price} className="font-semibold" />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button disabled={over > 0 || picked.length === 0} onClick={() => {
          const err = completeOnboarding(picked)
          if (err) setError(err)
          else navigate('/orders')
        }}>Подтвердить выбор</Button>
        <Button variant="ghost" onClick={() => navigate('/catalog')}>Выберу сам в каталоге</Button>
        {over > 0 && <span className="text-sm text-red-700">Бюджет превышен на <Pts n={over} /> — отключите часть позиций.</span>}
      </div>
      <ErrorText text={error} />
    </div>
  )
}
