'use strict';

/* Тесты утилит (js/utils.js): склонения, округление, разбор чисел и дат. */

const test = require('node:test').test;
const assert = require('node:assert/strict');
const U = require('../js/utils.js');

test('plural: русские склонения', () => {
  assert.equal(U.plural(1, 'день', 'дня', 'дней'), 'день');
  assert.equal(U.plural(2, 'день', 'дня', 'дней'), 'дня');
  assert.equal(U.plural(4, 'день', 'дня', 'дней'), 'дня');
  assert.equal(U.plural(5, 'день', 'дня', 'дней'), 'дней');
  assert.equal(U.plural(11, 'крутка', 'крутки', 'круток'), 'круток');
  assert.equal(U.plural(14, 'крутка', 'крутки', 'круток'), 'круток');
  assert.equal(U.plural(21, 'крутка', 'крутки', 'круток'), 'крутка');
  assert.equal(U.plural(22, 'крутка', 'крутки', 'круток'), 'крутки');
  assert.equal(U.plural(100, 'крутка', 'крутки', 'круток'), 'круток');
  assert.equal(U.plural(101, 'крутка', 'крутки', 'круток'), 'крутка');
});

test('готовые склонения: days / wishes / months', () => {
  assert.equal(U.days(1), 'день');
  assert.equal(U.days(3), 'дня');
  assert.equal(U.days(42), 'дня');
  assert.equal(U.days(90), 'дней');
  assert.equal(U.wishes(180), 'круток');
  assert.equal(U.months(3), 'месяца');
});

test('up: округление вверх с допуском на плавающую точку', () => {
  assert.equal(U.up(53.34), 54);
  assert.equal(U.up(80), 80);
  assert.equal(U.up(2.0000000001), 2); // ошибка представления не даёт лишнюю единицу
});

test('parseNum: запятая, отрицательные, мусор', () => {
  assert.equal(U.parseNum('42'), 42);
  assert.equal(U.parseNum('42,5'), 42.5);
  assert.equal(U.parseNum(7), 7);
  assert.equal(U.parseNum('-10'), 0);
  assert.equal(U.parseNum('abc'), 0);
  assert.equal(U.parseNum(''), 0);
});

test('isoLocal: дата в формат <input type=date>', () => {
  assert.equal(U.isoLocal(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(U.isoLocal(new Date(2026, 11, 31)), '2026-12-31');
});

test('parseIsoDate: разбор и обратная совместимость с isoLocal', () => {
  const d = U.parseIsoDate('2026-01-05');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 0);
  assert.equal(d.getDate(), 5);
  assert.equal(U.isoLocal(d), '2026-01-05');
});

test('parseIsoDate: некорректные значения дают null', () => {
  assert.equal(U.parseIsoDate(''), null);
  assert.equal(U.parseIsoDate('2026-01'), null);
  assert.equal(U.parseIsoDate('abc'), null);
  assert.equal(U.parseIsoDate(undefined), null);
});

test('todayMidnight: время обнуляется', () => {
  const d = U.todayMidnight();
  assert.equal(d.getHours(), 0);
  assert.equal(d.getMinutes(), 0);
  assert.equal(d.getSeconds(), 0);
  assert.equal(d.getMilliseconds(), 0);
});
