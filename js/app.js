/*
 * Точка входа: ссылки на элементы формы, обработчики событий, перерисовка.
 * Загружается последним: после js/utils.js, js/calc.js и js/render.js.
 */
(function (global) {
  'use strict';

  var U = global.Utils;
  var Calc = global.Calc;
  var Render = global.Render;

  var els = {
    date:   document.getElementById('targetDate'),
    target: document.getElementById('targetWishes'),
    haveW:  document.getElementById('haveWishes'),
    haveP:  document.getElementById('havePrimos'),
    out:    document.getElementById('out')
  };

  function num(el) { return U.parseNum(el.value); }

  // ---- подсветка активных чипсов
  function syncChips() {
    var today = U.todayMidnight();
    var d = U.parseIsoDate(els.date.value);
    var diff = d ? Math.round((d - today) / 86400000) : null;

    document.querySelectorAll('.chips button[data-days]').forEach(function (b) {
      b.classList.toggle('on', diff !== null && diff === parseInt(b.dataset.days, 10));
    });

    var goal = num(els.target);
    document.querySelectorAll('.chips button[data-wishes]').forEach(function (b) {
      b.classList.toggle('on', goal > 0 && goal === parseFloat(b.dataset.wishes));
    });
  }

  // ---- выставить дату цели через N дней от сегодня
  function setDatePlus(daysFromNow) {
    var t = U.todayMidnight();
    t.setDate(t.getDate() + daysFromNow);
    els.date.value = U.isoLocal(t);
    render();
  }

  // ---- перерисовка: форма → расчёт → вывод
  function render() {
    syncChips();

    var result = Calc.calculate({
      targetDate: U.parseIsoDate(els.date.value),
      today:      U.todayMidnight(),
      goal:       num(els.target),
      haveWishes: num(els.haveW),
      havePrimos: num(els.haveP)
    });

    Render.render(els.out, result);
  }

  // ---- обработчики
  ['input', 'change'].forEach(function (ev) {
    els.date.addEventListener(ev, render);
    [els.target, els.haveW, els.haveP].forEach(function (el) {
      el.addEventListener(ev, render);
      // при уходе с поля — прибрать ввод к целому неотрицательному числу
      el.addEventListener('blur', function () {
        if (el.value !== '') { el.value = Math.max(0, Math.round(num(el))); }
        render();
      });
    });
  });

  document.querySelectorAll('.chips button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.days) {
        setDatePlus(parseInt(btn.dataset.days, 10));
      } else if (btn.dataset.wishes) {
        els.target.value = btn.dataset.wishes;
        render();
      }
    });
  });

  // старт: дата цели — через 42 дня (стандартная длительность патча)
  setDatePlus(42);

})(typeof window !== 'undefined' ? window : globalThis);
