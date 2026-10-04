import { useState } from 'react'
import { dmsPrograms, familyPrice } from '../../data/seed'
import { ageOn } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { Button, Card, canSee, Empty, ErrorText, Field, inputCls, ItemTile, OkText, PageTitle, Pts, sectionOf } from '../../components/ui'

export default function Health() {
  const me = useMe()
  const { items, cart, toggleCart, setDms, addFamily } = useStore()
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const [form, setForm] = useState({ name: '', birthDate: '', sex: 'Ж', relation: 'Супруг(а)', program: 'base' })

  const healthItems = items.filter(i => i.sectionId === 'health' && !i.archived)
  if (!healthItems[0] || !canSee(me.role, sectionOf(healthItems[0]))) {
    return <><PageTitle title="Моё здоровье" /><Empty>Страховые программы недоступны для вашей группы сотрудников.</Empty></>
  }
  const policy = dmsPrograms.find(p => p.id === me.dmsProgram)
  const prog = dmsPrograms.find(p => p.id === form.program)!
  const age = form.birthDate ? ageOn(form.birthDate, new Date()) : null
  const tooOld = age !== null && age > prog.maxAge
  const alt = tooOld ? dmsPrograms.find(p => p.maxAge >= age!) : undefined
  const familyCost = familyPrice + prog.price

  return (
    <div className="space-y-8">
      <PageTitle title="Моё здоровье" sub="ДМС, расширения программы и страхование близких" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {policy ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-stone-500">{policy.insurer} · полис № ДМС-2026-{me.id.toUpperCase()}48</p>
                  <h2 className="text-xl font-semibold">Программа «{policy.name}»</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Действует до 31.12.2026</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
                <List title="Что входит" items={policy.covers} mark="✓" />
                <List title="Что не входит" items={policy.excludes} mark="—" />
                <List title="Клиники" items={policy.clinics} mark="•" />
              </div>
            </>
          ) : <p className="text-stone-600">Базовый ДМС не оформлен. Неиспользованные баллы можно потратить на другие льготы.</p>}
        </Card>
        <Card>
          <h3 className="font-semibold">Сменить программу</h3>
          <p className="mt-1 text-sm text-stone-500">Доплата — разница в стоимости, списывается баллами</p>
          <div className="mt-3 space-y-2">
            {dmsPrograms.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{p.name} <span className="text-stone-500">· <Pts n={p.price} /></span></span>
                {p.id === me.dmsProgram
                  ? <span className="text-xs font-medium text-emerald-800">текущая</span>
                  : <Button variant="ghost" className="!px-2.5 !py-1 text-xs" onClick={() => {
                      const err = setDms(p.id)
                      setMsg(err ? { err } : { ok: `Заявка на замену программы на «${p.name}» принята. Статус: в обработке у страховщика.` })
                    }}>Выбрать</Button>}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Расширения и wellbeing</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {healthItems.map(i => <ItemTile key={i.id} item={i} inCart={cart.includes(i.id)} onToggle={() => toggleCart(i.id)} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">ДМС для членов семьи</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={e => {
            e.preventDefault()
            const err = addFamily({ name: form.name, birthDate: form.birthDate, relation: form.relation, program: prog.name }, familyCost)
            if (err) return setMsg({ err })
            setMsg({ ok: `${form.name} добавлен(а) в программу «${prog.name}». Полис оформляется.` })
            setForm(f => ({ ...f, name: '', birthDate: '' }))
          }}>
            <div className="sm:col-span-2"><Field label="ФИО"><input required className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field></div>
            <Field label="Дата рождения"><input required type="date" className={inputCls} value={form.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={e => setForm({ ...form, birthDate: e.target.value })} /></Field>
            <Field label="Пол"><select className={inputCls} value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option>Ж</option><option>М</option></select></Field>
            <Field label="Степень родства"><select className={inputCls} value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })}>{['Супруг(а)', 'Ребёнок', 'Родитель'].map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Программа"><select className={inputCls} value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}>{dmsPrograms.map(p => <option key={p.id} value={p.id}>{p.name} (до {p.maxAge} лет)</option>)}</select></Field>
            <div className="sm:col-span-2">
              {tooOld && (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Возраст {age} лет превышает лимит программы ({prog.maxAge}).{' '}
                  {alt && <button type="button" className="font-medium underline" onClick={() => setForm({ ...form, program: alt.id })}>Выбрать «{alt.name}»</button>}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">Стоимость: <Pts n={familyCost} className="font-semibold" /></span>
                <Button type="submit" disabled={tooOld}>Оформить</Button>
              </div>
            </div>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Застрахованные родственники</h2>
          {me.family.length === 0 ? <p className="mt-3 text-sm text-stone-500">Пока никого не добавлено.</p> : (
            <ul className="mt-3 divide-y divide-stone-100">
              {me.family.map((f, i) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span><span className="font-medium">{f.name}</span> <span className="text-stone-500">· {f.relation}, {ageOn(f.birthDate, new Date())} лет</span></span>
                  <span className="text-amber-800">«{f.program}» · оформляется</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}

const List = ({ title, items, mark }: { title: string; items: string[]; mark: string }) => (
  <div>
    <div className="mb-1 font-medium text-stone-900">{title}</div>
    <ul className="space-y-0.5 text-stone-600">{items.map(x => <li key={x}>{mark} {x}</li>)}</ul>
  </div>
)
