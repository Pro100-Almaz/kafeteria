export type Balance = { burnable: number; permanent: number }

export const total = (b: Balance) => b.burnable + b.permanent

// ФТ-БАЛ.4: сгораемые баллы списываются первыми
export function spend(b: Balance, amount: number): { balance: Balance; split: Balance } {
  if (amount <= 0) throw new Error('Сумма должна быть больше нуля')
  if (amount > total(b)) throw new Error(`Недостаточно баллов: не хватает ${amount - total(b)}`)
  const fromBurnable = Math.min(b.burnable, amount)
  const split = { burnable: fromBurnable, permanent: amount - fromBurnable }
  return { balance: { burnable: b.burnable - split.burnable, permanent: b.permanent - split.permanent }, split }
}

// Возврат ровно в те «корзины», из которых списали
export const refund = (b: Balance, split: Balance): Balance => ({
  burnable: b.burnable + split.burnable,
  permanent: b.permanent + split.permanent,
})

// ФТ-СОЦ.1: комиссия удерживается сверх суммы перевода (получатель получает сумму целиком)
export const transferCost = (amount: number, commissionPct: number) =>
  amount + Math.ceil((amount * commissionPct) / 100)

export const overBudget = (prices: number[], available: number) =>
  Math.max(0, prices.reduce((s, p) => s + p, 0) - available)

export const ageOn = (birthDate: string, on: Date) => {
  const d = new Date(birthDate)
  let age = on.getFullYear() - d.getFullYear()
  if (on < new Date(on.getFullYear(), d.getMonth(), d.getDate())) age--
  return age
}
