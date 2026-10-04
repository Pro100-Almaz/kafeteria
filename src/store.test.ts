import { beforeEach, expect, test } from 'vitest'
import { useStore } from './store'

const s = () => useStore.getState()
const emp = (id: string) => s().employees.find(e => e.id === id)!
beforeEach(() => { s().reset(); s().setCurrent('e1') })

test('заказ списывает сгораемые первыми, отмена возвращает и пишет аудит', () => {
  expect(s().checkout(['vac'])).toBeNull() // 1500, needs approval
  expect(emp('e1')).toMatchObject({ burnable: 3500, permanent: 1500 })
  const o = s().orders[0]
  expect(o.status).toBe('processing')
  expect(s().cancelOrder(o.id)).toBeNull()
  expect(emp('e1')).toMatchObject({ burnable: 5000, permanent: 1500 })
  expect(s().audit[0].action).toBe('Отмена заказа и возврат')
})

test('превышение бюджета блокирует заказ', () => {
  expect(s().checkout(['base', 'course'])).toBe('Превышение бюджета на 3000 баллов')
})

test('промокод выдаётся, отмена невозможна', () => {
  const before = s().items.find(i => i.id === 'ozon')!.codes!.length
  s().checkout(['ozon'])
  const o = s().orders[0]
  expect(o.code).toBeTruthy()
  expect(s().items.find(i => i.id === 'ozon')!.codes!.length).toBe(before - 1)
  expect(s().cancelOrder(o.id)).toBe('Заказ с промокодом отменить нельзя')
})

test('HR одобряет доп. день отпуска, аудит с пользователем и комментарием', () => {
  s().checkout(['vac'])
  const id = s().orders[0].id
  s().setCurrent('e4')
  expect(s().decideOrder(id, true, 'Согласовано руководителем')).toBeNull()
  expect(s().orders[0].status).toBe('done')
  expect(s().audit[0]).toMatchObject({ actor: 'Ольга Кузнецова', action: 'Согласование: одобрено' })
  expect(s().audit[0].details).toContain('Согласовано руководителем')
})

test('ручное начисление требует комментарий', () => {
  s().setCurrent('e4')
  expect(s().adjustPoints('e5', 500, '  ', true)).toBe('Комментарий обязателен')
  expect(s().adjustPoints('e5', 500, 'День строителя', true)).toBeNull()
  expect(emp('e5').burnable).toBe(4300)
  expect(s().audit[0].action).toBe('Ручное начисление')
})

test('перевод 1000 с комиссией 25% списывает 1250', () => {
  expect(s().transfer('e5', 1000)).toBeNull()
  expect(emp('e1').burnable + emp('e1').permanent).toBe(6500 - 1250)
  expect(emp('e5').permanent).toBe(1500)
  expect(s().transfer('e5', 50)).toBe('Минимальная сумма перевода — 100')
})

test('архив скрывает позицию, удаление с активным заказом заблокировано', () => {
  s().setArchived('vac', true)
  expect(s().items.find(i => i.id === 'vac')!.archived).toBe(true)
  expect(s().orders.find(o => o.itemId === 'vac')!.itemName).toBe('Дополнительный день отпуска')
  expect(s().deleteItem('vac')).toMatch(/заблокировано/)
})

test('заморозка блокирует траты', () => {
  s().setFrozen('e1', true)
  expect(s().checkout(['psy'])).toBe('Баллы заморожены администратором')
})

test('повторное решение по обработанному заказу и перевод самому себе запрещены', () => {
  s().checkout(['vac'])
  const id = s().orders[0].id
  s().cancelOrder(id)
  expect(s().decideOrder(id, true, '')).toBe('Заказ уже обработан')
  expect(s().transfer('e1', 500)).toBe('Нельзя перевести баллы самому себе')
  s().setArchived('psy', true)
  expect(s().checkout(['psy'])).toMatch(/недоступна/)
})
