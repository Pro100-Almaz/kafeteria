import { useState } from 'react'
import type { Settings } from '../../data/seed'
import { useStore } from '../../store'
import { Button, Card, Field, inputCls, OkText, PageTitle } from '../../components/ui'

const fields: [keyof Settings, string, string][] = [
  ['commissionPct', 'Комиссия перевода баллов, %', 'По умолчанию 25%'],
  ['minTransfer', 'Минимальная сумма перевода, баллы', ''],
  ['pointRub', 'Стоимость балла, ₽', 'Используется в выгрузках для бухгалтерии'],
  ['charityMatch', 'Множитель софинансирования благотворительности', '1 = компания удваивает вклад'],
  ['codeThreshold', 'Порог предупреждения об остатке кодов', ''],
]

export default function AdminSettings() {
  const { settings, saveSettings } = useStore()
  const [f, setF] = useState(settings)
  const [ok, setOk] = useState<string | null>(null)
  return (
    <div className="max-w-2xl">
      <PageTitle title="Настройки платформы" sub="Меняются без доработки кода, все изменения пишутся в журнал аудита" />
      <Card>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveSettings(f); setOk('Настройки сохранены') }}>
          {fields.map(([k, label, hint]) => (
            <Field key={k} label={label} hint={hint || undefined}>
              <input type="number" min={0} step="any" required className={inputCls} value={f[k]} onChange={e => setF({ ...f, [k]: +e.target.value })} />
            </Field>
          ))}
          <Button type="submit">Сохранить</Button>
        </form>
        <OkText text={ok} />
      </Card>
    </div>
  )
}
