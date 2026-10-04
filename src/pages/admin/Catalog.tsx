import { useState } from 'react'
import { sections, typeLabels, type Item, type ItemType } from '../../data/seed'
import { useStore } from '../../store'
import { Button, Card, ErrorText, Field, inputCls, Modal, OkText, PageTitle, Pts, sectionOf } from '../../components/ui'

const blank = (): Item => ({ id: `new-${Date.now().toString(36)}`, sectionId: 'general', category: '', name: '', description: '', supplier: '', price: 1000, type: 'digital', conditions: '', archived: false })

export default function AdminCatalog() {
  const { items, orders, saveItem, setArchived, deleteItem } = useStore()
  const [edit, setEdit] = useState<Item | null>(null)
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const [showArchived, setShowArchived] = useState(false)
  const list = items.filter(i => showArchived || !i.archived)

  return (
    <div>
      <PageTitle title="Каталог" sub="Разделы, позиции, архив, остатки кодов" action={<Button onClick={() => setEdit(blank())}>+ Новая позиция</Button>} />
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-emerald-800" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} /> Показать архивные</label>
      <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />
      <Card className="mt-3 overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr><th className="px-4 py-3">Позиция</th><th className="px-4 py-3">Раздел</th><th className="px-4 py-3">Тип</th><th className="px-4 py-3 text-right">Цена</th><th className="px-4 py-3 text-right">Заказов</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {list.map(i => (
              <tr key={i.id} className={i.archived ? 'text-stone-400' : ''}>
                <td className="px-4 py-3"><span className="font-medium">{i.name}</span>{i.archived && <span className="ml-2 rounded bg-stone-200 px-1.5 text-xs text-stone-600">архив</span>}<div className="text-xs text-stone-500">{i.supplier}</div></td>
                <td className="px-4 py-3">{sectionOf(i).emoji} {sectionOf(i).name}</td>
                <td className="px-4 py-3">{typeLabels[i.type]}{i.codes && <div className="text-xs text-stone-500">кодов: {i.codes.length}</div>}</td>
                <td className="px-4 py-3 text-right"><Pts n={i.price} /></td>
                <td className="px-4 py-3 text-right tabular-nums">{orders.filter(o => o.itemId === i.id).length}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button className="text-emerald-800 hover:underline" onClick={() => setEdit(i)}>Изменить</button>
                  <button className="ml-3 text-stone-600 hover:underline" onClick={() => { setArchived(i.id, !i.archived); setMsg({ ok: `«${i.name}» ${i.archived ? 'восстановлена' : 'перенесена в архив и скрыта с витрины'}` }) }}>{i.archived ? 'Восстановить' : 'В архив'}</button>
                  <button className="ml-3 text-red-700 hover:underline" onClick={() => {
                    if (!confirm(`Удалить «${i.name}»?`)) return
                    const err = deleteItem(i.id)
                    setMsg(err ? { err } : { ok: `«${i.name}» удалена` })
                  }}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {edit && <ItemForm item={edit} onClose={() => setEdit(null)} onSave={i => { saveItem(i); setEdit(null); setMsg({ ok: `«${i.name}» сохранена — уже на витрине` }) }} />}
    </div>
  )
}

function ItemForm({ item, onClose, onSave }: { item: Item; onClose: () => void; onSave: (i: Item) => void }) {
  const [f, setF] = useState(item)
  const up = (p: Partial<Item>) => setF({ ...f, ...p })
  return (
    <Modal title={item.name ? 'Редактирование позиции' : 'Новая позиция'} onClose={onClose}>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); onSave(f) }}>
        <div className="sm:col-span-2"><Field label="Название"><input required className={inputCls} value={f.name} onChange={e => up({ name: e.target.value })} /></Field></div>
        <Field label="Раздел"><select className={inputCls} value={f.sectionId} onChange={e => up({ sectionId: e.target.value })}>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Категория"><input required className={inputCls} value={f.category} onChange={e => up({ category: e.target.value })} /></Field>
        <Field label="Тип"><select className={inputCls} value={f.type} onChange={e => up({ type: e.target.value as ItemType })}>{(Object.keys(typeLabels) as ItemType[]).map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}</select></Field>
        <Field label="Цена, баллы"><input required type="number" min={0} className={inputCls} value={f.price} onChange={e => up({ price: +e.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="Поставщик"><input className={inputCls} value={f.supplier} onChange={e => up({ supplier: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Описание"><textarea rows={2} className={inputCls} value={f.description} onChange={e => up({ description: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Условия"><input className={inputCls} value={f.conditions} onChange={e => up({ conditions: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Вложения (PDF, изображения)" hint="В демо файлы не сохраняются"><input type="file" accept=".pdf,image/*" multiple className="text-sm" /></Field></div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="accent-emerald-800" checked={!!f.needsApproval} onChange={e => up({ needsApproval: e.target.checked })} /> Требует согласования руководителя / HR</label>
        <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </Modal>
  )
}
