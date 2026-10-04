import { expect, test } from 'vitest'
import { ageOn, overBudget, refund, spend, transferCost } from './points'

test('сгораемые списываются первыми', () => {
  const r = spend({ burnable: 1000, permanent: 5000 }, 1500)
  expect(r.balance).toEqual({ burnable: 0, permanent: 4500 })
  expect(refund(r.balance, r.split)).toEqual({ burnable: 1000, permanent: 5000 })
})

test('нельзя потратить больше баланса', () => {
  expect(() => spend({ burnable: 100, permanent: 100 }, 201)).toThrow('не хватает 1')
})

test('комиссия перевода 25% удерживается сверх суммы', () => {
  expect(transferCost(1000, 25)).toBe(1250)
  expect(transferCost(1000, 0)).toBe(1000)
})

test('превышение бюджета', () => {
  expect(overBudget([3000, 2500], 5000)).toBe(500)
  expect(overBudget([3000], 5000)).toBe(0)
})

test('возраст', () => {
  expect(ageOn('1960-10-05', new Date('2026-10-04'))).toBe(65)
  expect(ageOn('1960-10-04', new Date('2026-10-04'))).toBe(66)
})
