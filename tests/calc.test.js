'use strict';

/* Тесты чистой логики расчёта (js/calc.js). */

const test = require('node:test').test;
const assert = require('node:assert/strict');

require('../js/games.js'); // выставляет globalThis.Games — каталог игр для расчёта
const Calc = require('../js/calc.js');

/** Заготовка входных данных: сегодня 25.09.2026, цель через 30 дней */
function input(over) {
  return Object.assign({
    targetDate: new Date(2026, 8, 25 + 30), // 25.10.2026
    today: new Date(2026, 8, 25),           // 25.09.2026
    goal: 180,
    haveWishes: 0,
    havePrimos: 0
  }, over);
}

test('1 крутка = 160 примогемов', () => {
  assert.equal(Calc.PRIMOS_PER_WISH, 160);
});

test('базовый расчёт: 180 круток за 30 дней с нуля', () => {
  const r = Calc.calculate(input());
  assert.equal(r.missingDate, false);
  assert.equal(r.invalidGoal, false);
  assert.equal(r.rawDays, 30);
  assert.equal(r.needTotal, 180 * 160);
  assert.equal(r.missing, 28800);
  assert.equal(r.perDay, 960);
  assert.equal(r.perDayReq, 960);
  assert.equal(r.perWishDay, 6);
  assert.equal(r.goalReached, false);
  assert.equal(r.progress, 0);
});

test('накопления уменьшают нехватку', () => {
  const r = Calc.calculate(input({ haveWishes: 5, havePrimos: 800 }));
  assert.equal(r.totalNow, 5 * 160 + 800); // 1600
  assert.equal(r.missing, 28800 - 1600);
  assert.ok(r.progress > 0);
});

test('дробная норма округляется вверх', () => {
  // 1 крутка за 3 дня: 160 / 3 = 53,33… → 54
  const r = Calc.calculate(input({ goal: 1, targetDate: new Date(2026, 8, 28) }));
  assert.equal(r.rawDays, 3);
  assert.equal(r.perDay, 160 / 3);
  assert.equal(r.perDayReq, 54);
});

test('точное деление не даёт +1 из-за плавающей точки', () => {
  // 1 крутка за 2 дня: 160 / 2 = 80 ровно
  const r = Calc.calculate(input({ goal: 1, targetDate: new Date(2026, 8, 27) }));
  assert.equal(r.rawDays, 2);
  assert.equal(r.perDayReq, 80);
});

test('цель уже достигнута: есть запас в крутках', () => {
  const r = Calc.calculate(input({ haveWishes: 200 }));
  assert.equal(r.goalReached, true);
  assert.equal(r.missing, 0);
  assert.equal(r.primosNow, 200);
  assert.equal(r.extraWishes, 20);
  assert.equal(r.progress, 100);
});

test('запас считается и из остатка примогемов', () => {
  // totalNow = 12×160 + 100 = 2020; цель 10 круток = 1600; запас 420 → 2 полных крутки
  const r = Calc.calculate(input({ goal: 10, haveWishes: 12, havePrimos: 100 }));
  assert.equal(r.goalReached, true);
  assert.equal(r.extraWishes, 2);
});

test('дата цели в прошлом', () => {
  const r = Calc.calculate(input({ targetDate: new Date(2026, 8, 20) }));
  assert.equal(r.rawDays, -5);
  assert.equal(r.dateInPast, true);
  assert.equal(r.daysLeft, 1); // расчёт всё равно делается как для 1 дня
});

test('дата цели — сегодня', () => {
  const r = Calc.calculate(input({ targetDate: new Date(2026, 8, 25) }));
  assert.equal(r.rawDays, 0);
  assert.equal(r.dateIsToday, true);
  assert.equal(r.oneDayLeft, false);
});

test('до цели остался один день', () => {
  const r = Calc.calculate(input({ targetDate: new Date(2026, 8, 26) }));
  assert.equal(r.rawDays, 1);
  assert.equal(r.oneDayLeft, true);
});

test('дата не указана', () => {
  const r = Calc.calculate(input({ targetDate: null }));
  assert.equal(r.missingDate, true);
});

test('цель должна быть больше нуля', () => {
  assert.equal(Calc.calculate(input({ goal: 0 })).invalidGoal, true);
  assert.equal(Calc.calculate(input({ goal: -5 })).invalidGoal, true);
});

/* ---- другие игры: стоимость крутки берётся из каталога (js/games.js) ---- */

test('без игры считается по цене крутки Genshin Impact (160)', () => {
  const r = Calc.calculate(input());
  assert.equal(r.perPull, 160);
  assert.equal(r.perPull, Calc.PRIMOS_PER_WISH);
  assert.equal(r.needTotal, 180 * 160);
});

test('Arknights: Endfield — 1 крутка = 500 Oroberyl', () => {
  const r = Calc.calculate(input({ game: 'endfield', goal: 120 }));
  assert.equal(r.perPull, 500);
  assert.equal(r.needTotal, 120 * 500);
  assert.equal(r.missing, 60000);
  assert.equal(r.perDay, 2000);
  assert.equal(r.perDayReq, 2000);
});

test('Neverness to Everness — 1 крутка = 160 Annulith', () => {
  const r = Calc.calculate(input({ game: 'nte', goal: 90 }));
  assert.equal(r.perPull, 160);
  assert.equal(r.needTotal, 14400);
  assert.equal(r.perDay, 480);
});

test('накопления считаются в валюте своей игры', () => {
  // Endfield: 2 крутки (1000) + 500 Oroberyl = 1500; цель 120 круток = 60000
  const r = Calc.calculate(input({ game: 'endfield', goal: 120, haveWishes: 2, havePrimos: 500 }));
  assert.equal(r.totalNow, 1500);
  assert.equal(r.missing, 60000 - 1500);
  assert.equal(r.perDayReq, 1950);
});

test('округление вверх работает и для цены 500', () => {
  // 1 крутка за 3 дня: 500 / 3 = 166,67… → 167
  const r = Calc.calculate(input({ game: 'endfield', goal: 1, targetDate: new Date(2026, 8, 28) }));
  assert.equal(r.perDay, 500 / 3);
  assert.equal(r.perDayReq, 167);
});

test('цель достигнута и запас — тоже в крутках своей игры', () => {
  const r = Calc.calculate(input({ game: 'endfield', goal: 10, havePrimos: 6000 }));
  assert.equal(r.goalReached, true);
  assert.equal(r.primosNow, 12);    // 6000 / 500
  assert.equal(r.extraWishes, 2);   // 1000 / 500
});

test('в результат попадает конфигурация игры — для подписей при отрисовке', () => {
  const r = Calc.calculate(input({ game: 'nte' }));
  assert.equal(r.game.key, 'nte');
  assert.equal(r.game.currency, 'Annulith');
  assert.equal(r.game.curStat, 'Annulith');
});

test('явный perPull переопределяет игру', () => {
  const r = Calc.calculate(input({ game: 'genshin', goal: 10, perPull: 250 }));
  assert.equal(r.perPull, 250);
  assert.equal(r.needTotal, 2500);
});

test('неизвестная игра — расчёт по умолчанию, без падения', () => {
  const r = Calc.calculate(input({ game: 'half-life-3', goal: 180 }));
  assert.equal(r.perPull, 160);
  assert.equal(r.game.key, 'genshin');
});
