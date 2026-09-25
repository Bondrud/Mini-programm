'use strict';

/*
 * Тесты отрисовки (js/render.js).
 * Модули подключаются как в браузере — через глобалы, поэтому
 * utils.js обязательно require-ится раньше render.js.
 */

const test = require('node:test').test;
const assert = require('node:assert/strict');

require('../js/utils.js');   // выставляет globalThis.Utils
const Calc = require('../js/calc.js');
const Render = require('../js/render.js'); // подхватывает Utils при загрузке

function calc(over) {
  return Calc.calculate(Object.assign({
    targetDate: new Date(2026, 8, 25 + 30), // 25.10.2026
    today: new Date(2026, 8, 25),
    goal: 180,
    haveWishes: 0,
    havePrimos: 0
  }, over));
}

/** Фейковый контейнер вместо DOM-элемента */
function out() { return { innerHTML: '' }; }

function render(result) {
  const el = out();
  Render.render(el, result);
  return el.innerHTML;
}

test('нет даты — предупреждение об ошибке', () => {
  const html = render(calc({ targetDate: null }));
  assert.match(html, /Укажите дату цели/);
  assert.match(html, /warnbox/);
});

test('цель не задана — предупреждение', () => {
  const html = render(calc({ goal: 0 }));
  assert.match(html, /Укажите, сколько круток/);
});

test('основной план: заголовок, единицы, прогресс-бар', () => {
  const html = render(calc());
  assert.match(html, /Нужно зарабатывать/);
  assert.match(html, /примогемов \/ день/);
  assert.match(html, /Прогресс:/);
  assert.match(html, /class="bar"/);
  assert.doesNotMatch(html, /warnbox/);
});

test('предупреждение, если дата уже прошла', () => {
  const html = render(calc({ targetDate: new Date(2026, 8, 20) }));
  assert.match(html, /Дата цели уже в прошлом/);
  assert.match(html, /Нужно зарабатывать/); // расчёт при этом показан
});

test('цель достигнута — зелёная карточка с запасом', () => {
  const html = render(calc({ haveWishes: 200 }));
  assert.match(html, /Цель уже достигнута/);
  assert.match(html, /Запас:/);
  assert.match(html, /сверх цели/);
  assert.doesNotMatch(html, /Нужно зарабатывать/);
});
