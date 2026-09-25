'use strict';

/* Тесты каталога игр (js/games.js): данные вкладок и стоимость крутки. */

const test = require('node:test').test;
const assert = require('node:assert/strict');
const Games = require('../js/games.js');

test('в каталоге три игры в нужном порядке', () => {
  assert.deepEqual(Games.ORDER, ['genshin', 'endfield', 'nte']);
  assert.deepEqual(Games.list().map(g => g.key), ['genshin', 'endfield', 'nte']);
});

test('по умолчанию открывается Genshin Impact', () => {
  assert.equal(Games.defaultKey(), 'genshin');
  assert.equal(Games.get().key, 'genshin');
  assert.equal(Games.get('нет-такой-игры').key, 'genshin'); // неизвестный ключ → дефолт
});

test('стоимость крутки у каждой игры', () => {
  assert.equal(Games.get('genshin').perPull, 160);
  assert.equal(Games.get('endfield').perPull, 500);
  assert.equal(Games.get('nte').perPull, 160);
});

test('названия игр и классы темы', () => {
  assert.equal(Games.get('genshin').name, 'Genshin Impact');
  assert.equal(Games.get('endfield').name, 'Arknights: Endfield');
  assert.equal(Games.get('nte').name, 'Neverness to Everness');
  assert.deepEqual(Games.list().map(g => g.bodyClass), ['g-genshin', 'g-endfield', 'g-nte']);
});

test('у каждой игры свои пресеты цели, подписи и пояснение', () => {
  for (const g of Games.list()) {
    assert.ok(Array.isArray(g.chips) && g.chips.length > 0, g.key + ': пресеты цели');
    assert.ok(g.chips.every(v => Number.isFinite(v) && v > 0), g.key + ': пресеты — положительные числа');
    assert.equal(g.currency.length > 0, true, g.key + ': валюта');
    assert.equal(g.curStat.length > 0, true, g.key + ': подпись нехватки');
    assert.match(g.havePLabel, /^Есть /, g.key + ': подпись поля валюты');
    assert.match(g.haveWHint, /^\(.*\)$/, g.key + ': подсказка в скобках');
    assert.match(g.note, /1 крутка/, g.key + ': пояснение расчёта');
  }
});

test('пояснение соответствует стоимости крутки', () => {
  assert.match(Games.get('genshin').note, /160 примогемов/);
  assert.match(Games.get('endfield').note, /500 Oroberyl/);
  assert.match(Games.get('nte').note, /160 Annulith/);
});

test('get() отдаёт копию — каталог нельзя испортить снаружи', () => {
  const g = Games.get('genshin');
  g.perPull = 1;
  g.name = 'испорчено';
  assert.equal(Games.get('genshin').perPull, 160);
  assert.equal(Games.get('genshin').name, 'Genshin Impact');
});

test('has(): известные и неизвестные ключи', () => {
  assert.equal(Games.has('genshin'), true);
  assert.equal(Games.has('nte'), true);
  assert.equal(Games.has('toString'), false); // не принимаем свойства Object.prototype
  assert.equal(Games.has(undefined), false);
});
