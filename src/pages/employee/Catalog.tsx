import { useSearchParams } from 'react-router-dom'
import { sections, typeLabels, type ItemType } from '../../data/seed'
import { useMe, useStore } from '../../store'
import { canSee, Empty, inputCls, ItemTile, PageTitle } from '../../components/ui'

export default function Catalog() {
  const me = useMe()
  const { items, cart, toggleCart } = useStore()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const sec = params.get('s') ?? ''
  const type = params.get('t') ?? ''
  const max = Number(params.get('max') ?? 0)
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p, { replace: true }) }

  const visible = sections.filter(s => canSee(me.role, s))
  const list = items.filter(i =>
    !i.archived && visible.some(s => s.id === i.sectionId) && (!sec || i.sectionId === sec) && (!type || i.type === type) &&
    (!max || i.price <= max) && (!q || `${i.name} ${i.description} ${i.supplier}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <PageTitle title="Каталог льгот" sub={`${list.length} позиций доступно вашей группе`} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input type="search" placeholder="Поиск по названию, описанию, поставщику" value={q} onChange={e => set('q', e.target.value)} className={inputCls} />
        <select value={type} onChange={e => set('t', e.target.value)} className={inputCls} aria-label="Тип">
          <option value="">Все типы</option>
          {(Object.keys(typeLabels) as ItemType[]).map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
        </select>
        <select value={max || ''} onChange={e => set('max', e.target.value)} className={inputCls} aria-label="Цена">
          <option value="">Любая цена</option>
          {[1000, 2000, 3000, 5000].map(n => <option key={n} value={n}>до {n.toLocaleString('ru-RU')} б.</option>)}
        </select>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip on={!sec} onClick={() => set('s', '')}>Все разделы</Chip>
        {visible.map(s => <Chip key={s.id} on={sec === s.id} onClick={() => set('s', s.id)}>{s.emoji} {s.name}</Chip>)}
      </div>
      {list.length === 0 && <Empty>Ничего не найдено. Попробуйте изменить фильтры.</Empty>}
      <div className="space-y-8">
        {visible.filter(s => list.some(i => i.sectionId === s.id)).map(s => (
          <section key={s.id}>
            <h2 className="mb-3 text-lg font-semibold">{s.emoji} {s.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.filter(i => i.sectionId === s.id).map(i => <ItemTile key={i.id} item={i} inCart={cart.includes(i.id)} onToggle={() => toggleCart(i.id)} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${on ? 'bg-emerald-800 text-white ring-emerald-800' : 'bg-white text-stone-700 ring-stone-300 hover:bg-stone-50'}`}>{children}</button>
)
