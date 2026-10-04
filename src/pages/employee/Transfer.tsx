import { useState } from 'react'
import { funds } from '../../data/seed'
import { total, transferCost } from '../../lib/points'
import { useMe, useStore } from '../../store'
import { Button, Card, ErrorText, Field, fmt, inputCls, Modal, OkText, PageTitle, Pts } from '../../components/ui'

export default function Transfer() {
  const me = useMe()
  const { employees, settings, transfer, donate } = useStore()
  const colleagues = employees.filter(e => e.id !== me.id && e.role !== 'hr')
  const [to, setTo] = useState(colleagues[0]?.id ?? '')
  const [amount, setAmount] = useState(500)
  const [fund, setFund] = useState(funds[0])
  const [gift, setGift] = useState(300)
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({})
  const [cert, setCert] = useState<{ fund: string; amount: number; no: string } | null>(null)
  const cost = transferCost(amount || 0, settings.commissionPct)

  return (
    <div>
      <PageTitle title="Переводы и благотворительность" sub={`Доступно: ${fmt(total(me))} б.`} />
      <ErrorText text={msg.err ?? null} /><OkText text={msg.ok ?? null} />
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Перевод коллеге</h2>
          <div className="mt-4 space-y-3">
            <Field label="Получатель">
              <select className={inputCls} value={to} onChange={e => setTo(e.target.value)}>
                {colleagues.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
              </select>
            </Field>
            <Field label="Сумма" hint={`Минимум ${settings.minTransfer} б. Комиссия ${settings.commissionPct}% удерживается сверх суммы.`}>
              <input type="number" min={settings.minTransfer} className={inputCls} value={amount || ''} onChange={e => setAmount(+e.target.value)} />
            </Field>
            <dl className="rounded-lg bg-stone-50 p-3 text-sm">
              <div className="flex justify-between"><dt>Получит коллега</dt><dd><Pts n={amount || 0} /></dd></div>
              <div className="flex justify-between"><dt>Комиссия</dt><dd><Pts n={cost - (amount || 0)} /></dd></div>
              <div className="mt-1 flex justify-between border-t border-stone-200 pt-1 font-semibold"><dt>Спишется с вас</dt><dd><Pts n={cost} /></dd></div>
            </dl>
            <Button className="w-full" disabled={!to || !amount} onClick={() => {
              const err = transfer(to, amount)
              setMsg(err ? { err } : { ok: `Переведено ${fmt(amount)} б. → ${employees.find(e => e.id === to)!.name}` })
            }}>Перевести</Button>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Благотворительность</h2>
          <div className="mt-4 space-y-3">
            <Field label="Фонд">
              <select className={inputCls} value={fund} onChange={e => setFund(e.target.value)}>{funds.map(f => <option key={f}>{f}</option>)}</select>
            </Field>
            <Field label="Сумма">
              <div className="flex gap-2">
                <input type="number" min={1} className={inputCls} value={gift || ''} onChange={e => setGift(+e.target.value)} />
                <Button variant="ghost" onClick={() => setGift(total(me))}>100%</Button>
              </div>
            </Field>
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
              Компания добавит к вашему вкладу ×{settings.charityMatch} (софинансирование). Фонд получит <Pts n={(gift || 0) * (1 + settings.charityMatch)} className="font-semibold" />.
            </p>
            <Button className="w-full" disabled={!gift} onClick={() => {
              const err = donate(fund, gift)
              if (err) return setMsg({ err })
              setMsg({})
              setCert({ fund, amount: gift, no: `БЛ-${Date.now().toString().slice(-6)}` })
            }}>Пожертвовать</Button>
          </div>
        </Card>
      </div>
      {cert && (
        <Modal title="Сертификат участника" onClose={() => setCert(null)}>
          <div className="rounded-xl border-2 border-emerald-800 p-6 text-center">
            <div className="text-4xl">💚</div>
            <p className="mt-3 text-sm text-stone-500">Сертификат № {cert.no}</p>
            <p className="mt-2 text-lg font-semibold">{me.name}</p>
            <p className="mt-1 text-stone-600">поддержал(а) {cert.fund}</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-800">{fmt(cert.amount * (1 + settings.charityMatch))} ₽</p>
            <p className="text-xs text-stone-500">включая софинансирование компании</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
