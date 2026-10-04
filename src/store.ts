import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as seed from './data/seed'
import type { Audit, Employee, Item, Order, OrderStatus, Settings, Tx } from './data/seed'
import { refund, spend, total, transferCost } from './lib/points'

type Data = {
  currentId: string; employees: Employee[]; items: Item[]; orders: Order[]; txs: Tx[]; audit: Audit[]
  settings: Settings; cart: string[]
}

type Actions = {
  setCurrent: (id: string) => void
  toggleCart: (itemId: string) => void
  clearCart: () => void
  checkout: (itemIds: string[], details?: string) => string | null
  completeOnboarding: (itemIds: string[]) => string | null
  cancelOrder: (orderId: string) => string | null
  decideOrder: (orderId: string, approve: boolean, comment: string) => string | null
  adjustPoints: (employeeId: string, amount: number, comment: string, burnable: boolean) => string | null
  setFrozen: (employeeId: string, frozen: boolean) => void
  transfer: (toId: string, amount: number) => string | null
  donate: (fund: string, amount: number) => string | null
  setDms: (programId: string) => string | null
  addFamily: (m: Employee['family'][number], price: number) => string | null
  saveItem: (item: Item) => void
  setArchived: (itemId: string, archived: boolean) => void
  deleteItem: (itemId: string) => string | null
  saveSettings: (s: Settings) => void
  reset: () => void
}

const initial = (): Data => structuredClone({
  currentId: 'e1', employees: seed.employees, items: seed.items, orders: seed.orders, txs: seed.txs,
  audit: seed.audit, settings: seed.settings, cart: [],
})

const now = () => new Date().toISOString()
const uid = () => Math.random().toString(36).slice(2, 9)
const active = (s: OrderStatus) => s === 'created' || s === 'processing'

export const useStore = create<Data & Actions>()(persist((set, get) => {
  const me = () => get().employees.find(e => e.id === get().currentId)!
  const emp = (id: string) => get().employees.find(e => e.id === id)!
  const patchEmp = (id: string, p: Partial<Employee>) =>
    set(s => ({ employees: s.employees.map(e => (e.id === id ? { ...e, ...p } : e)) }))
  const log = (action: string, details: string) =>
    set(s => ({ audit: [{ id: uid(), at: now(), actor: me().name, action, details }, ...s.audit] }))
  const tx = (employeeId: string, amount: number, note: string) =>
    set(s => ({ txs: [...s.txs, { id: uid(), employeeId, amount, note, date: now() }] }))

  // Списание с проверкой заморозки и баланса; возвращает split или текст ошибки
  const charge = (e: Employee, amount: number) => {
    if (e.frozen) return 'Баллы заморожены администратором'
    try {
      const r = spend(e, amount)
      patchEmp(e.id, r.balance)
      return r.split
    } catch (err) {
      return (err as Error).message
    }
  }

  return {
    ...initial(),
    setCurrent: id => set({ currentId: id, cart: [] }),
    toggleCart: itemId => set(s => ({ cart: s.cart.includes(itemId) ? s.cart.filter(i => i !== itemId) : [...s.cart, itemId] })),
    clearCart: () => set({ cart: [] }),

    checkout: (itemIds, details) => {
      const e = me()
      const found = itemIds.map(id => get().items.find(i => i.id === id))
      if (found.some(i => !i || i.archived)) return 'Часть позиций больше недоступна — обновите корзину'
      const list = found as Item[]
      const sum = list.reduce((a, i) => a + i.price, 0)
      if (e.frozen) return 'Баллы заморожены администратором'
      if (sum > total(e)) return `Превышение бюджета на ${sum - total(e)} баллов`
      const empty = list.find(i => i.codes && !i.codes.length)
      if (empty) return `Коды для «${empty.name}» закончились`
      let nextId = Math.max(...get().orders.map(o => +o.id)) + 1
      for (const it of list) {
        const split = it.price ? charge(me(), it.price) : { burnable: 0, permanent: 0 }
        if (typeof split === 'string') return split
        let code: string | undefined
        if (it.codes) {
          code = it.codes[0]
          set(s => ({ items: s.items.map(i => (i.id === it.id ? { ...i, codes: it.codes!.slice(1) } : i)) }))
        }
        const status: OrderStatus = it.needsApproval || it.type === 'physical' || it.type === 'booking' ? 'processing' : 'done'
        const order: Order = { id: String(nextId++), employeeId: e.id, itemId: it.id, itemName: it.name, price: it.price, split, status, createdAt: now(), code, details }
        set(s => ({ orders: [order, ...s.orders] }))
        if (it.price) tx(e.id, -it.price, it.name)
        log('Заказ', `№${order.id} «${it.name}» — ${it.price} баллов`)
      }
      set({ cart: [] })
      return null
    },

    completeOnboarding: itemIds => {
      const err = get().checkout(itemIds)
      if (!err) patchEmp(get().currentId, { onboarded: true })
      return err
    },

    cancelOrder: orderId => {
      const o = get().orders.find(x => x.id === orderId)!
      const it = get().items.find(i => i.id === o.itemId)
      if (o.code || it?.type === 'promo') return 'Заказ с промокодом отменить нельзя'
      if (o.status === 'cancelled') return 'Заказ уже отменён'
      const e = emp(o.employeeId)
      patchEmp(e.id, refund(e, o.split))
      set(s => ({ orders: s.orders.map(x => (x.id === orderId ? { ...x, status: 'cancelled' } : x)) }))
      tx(e.id, o.price, `Возврат: ${o.itemName}`)
      log('Отмена заказа и возврат', `№${o.id} «${o.itemName}», ${e.name}: +${o.price}`)
      return null
    },

    decideOrder: (orderId, approve, comment) => {
      const o = get().orders.find(x => x.id === orderId)!
      if (o.status !== 'processing') return 'Заказ уже обработан'
      if (!approve) {
        if (!comment.trim()) return 'Укажите причину отказа'
        const err = get().cancelOrder(orderId)
        if (err) return err
      } else {
        set(s => ({ orders: s.orders.map(x => (x.id === orderId ? { ...x, status: 'done' } : x)) }))
      }
      set(s => ({ orders: s.orders.map(x => (x.id === orderId ? { ...x, comment } : x)) }))
      log(approve ? 'Согласование: одобрено' : 'Согласование: отклонено', `№${o.id} «${o.itemName}» — ${emp(o.employeeId).name}${comment ? `. Комментарий: ${comment}` : ''}`)
      return null
    },

    adjustPoints: (employeeId, amount, comment, burnable) => {
      if (!comment.trim()) return 'Комментарий обязателен'
      if (!Number.isInteger(amount) || amount === 0) return 'Введите сумму'
      const e = emp(employeeId)
      if (amount > 0) {
        patchEmp(e.id, burnable ? { burnable: e.burnable + amount } : { permanent: e.permanent + amount })
      } else {
        try {
          patchEmp(e.id, spend(e, -amount).balance)
        } catch (err) {
          return (err as Error).message
        }
      }
      tx(e.id, amount, `${amount > 0 ? 'Начисление' : 'Списание'} HR: ${comment}`)
      log(amount > 0 ? 'Ручное начисление' : 'Ручное списание', `${e.name}: ${amount > 0 ? '+' : ''}${amount}${amount > 0 ? (burnable ? ' (сгораемые)' : ' (несгораемые)') : ''}. ${comment}`)
      return null
    },

    setFrozen: (employeeId, frozen) => {
      patchEmp(employeeId, { frozen })
      log(frozen ? 'Заморозка баллов' : 'Разморозка баллов', emp(employeeId).name)
    },

    transfer: (toId, amount) => {
      const { commissionPct, minTransfer } = get().settings
      if (toId === me().id) return 'Нельзя перевести баллы самому себе'
      if (!Number.isInteger(amount)) return 'Сумма должна быть целым числом'
      if (amount < minTransfer) return `Минимальная сумма перевода — ${minTransfer}`
      const cost = transferCost(amount, commissionPct)
      const split = charge(me(), cost)
      if (typeof split === 'string') return split
      const to = emp(toId)
      patchEmp(toId, { permanent: to.permanent + amount })
      tx(me().id, -cost, `Перевод: ${to.name} (комиссия ${cost - amount})`)
      tx(toId, amount, `Перевод от ${me().name}`)
      log('Перевод баллов', `${me().name} → ${to.name}: ${amount}, комиссия ${cost - amount}`)
      return null
    },

    donate: (fund, amount) => {
      if (!Number.isInteger(amount) || amount <= 0) return 'Введите целую сумму больше нуля'
      const split = charge(me(), amount)
      if (typeof split === 'string') return split
      const match = amount * get().settings.charityMatch
      tx(me().id, -amount, `Благотворительность: ${fund}`)
      log('Благотворительность', `${me().name} → ${fund}: ${amount} + софинансирование компании ${match}`)
      return null
    },

    setDms: programId => {
      const p = seed.dmsPrograms.find(x => x.id === programId)!
      const cur = seed.dmsPrograms.find(x => x.id === me().dmsProgram)
      const diff = p.price - (cur?.price ?? 0)
      if (diff > 0) {
        const split = charge(me(), diff)
        if (typeof split === 'string') return split
        tx(me().id, -diff, `Смена ДМС на «${p.name}»`)
      }
      patchEmp(me().id, { dmsProgram: programId })
      log('Заявка на замену ДМС', `${me().name}: «${cur?.name ?? '—'}» → «${p.name}»`)
      return null
    },

    addFamily: (m, price) => {
      const split = charge(me(), price)
      if (typeof split === 'string') return split
      patchEmp(me().id, { family: [...me().family, m] })
      tx(me().id, -price, `ДМС для родственника: ${m.name}`)
      log('ДМС для члена семьи', `${me().name}: ${m.name} (${m.relation})`)
      return null
    },

    saveItem: item => {
      const exists = get().items.some(i => i.id === item.id)
      set(s => ({ items: exists ? s.items.map(i => (i.id === item.id ? item : i)) : [...s.items, item] }))
      log(exists ? 'Изменение позиции' : 'Создание позиции', `«${item.name}», ${item.price} баллов`)
    },
    setArchived: (itemId, archived) => {
      set(s => ({ items: s.items.map(i => (i.id === itemId ? { ...i, archived } : i)) }))
      log(archived ? 'Архивация позиции' : 'Восстановление позиции', get().items.find(i => i.id === itemId)!.name)
    },
    deleteItem: itemId => {
      if (get().orders.some(o => o.itemId === itemId && active(o.status))) return 'Есть активные заказы — удаление заблокировано. Используйте архивацию.'
      const name = get().items.find(i => i.id === itemId)!.name
      set(s => ({ items: s.items.filter(i => i.id !== itemId) }))
      log('Удаление позиции', name)
      return null
    },
    saveSettings: settings => {
      const prev = get().settings
      const changed = (Object.keys(settings) as (keyof Settings)[]).filter(k => prev[k] !== settings[k]).map(k => `${k}: ${prev[k]} → ${settings[k]}`)
      set({ settings })
      if (changed.length) log('Изменение настроек', changed.join(', '))
    },
    reset: () => set(initial()),
  }
}, { name: 'cafeteria-demo-v1', partialize: s => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as Data }))

export const useMe = () => useStore(s => s.employees.find(e => e.id === s.currentId)!)
