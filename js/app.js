/*
 * Точка входа: вкладки игр, состояние каждой вкладки, обработчики, перерисовка.
 * Загружается последним: после utils.js, games.js, store.js, calc.js и render.js.
 *
 * У каждой игры — своя вкладка со своим состоянием (дата, цель, накопления).
 * Состояние переживает перезагрузку страницы: см. js/store.js.
 */
(function (global) {
  'use strict';

  var U = global.Utils;
  var Games = global.Games;
  var Calc = global.Calc;
  var Render = global.Render;
  var Store = global.Store;

  var els = {
    body:      document.body,
    tabs:      document.getElementById('tabs'),
    date:      document.getElementById('targetDate'),
    target:    document.getElementById('targetWishes'),
    haveW:     document.getElementById('haveWishes'),
    haveP:     document.getElementById('havePrimos'),
    dateChips: document.getElementById('dateChips'),
    wishChips: document.getElementById('wishChips'),
    lblHaveWHint: document.getElementById('lblHaveWHint'),
    lblHaveP:     document.getElementById('lblHaveP'),
    noteLine:     document.getElementById('noteLine'),
    resetBtn:     document.getElementById('resetBtn'),
    out:       document.getElementById('out')
  };

  var store = Store.createStore(global.localStorage);
  var current = Games.defaultKey(); // открытая вкладка
  var state = {};                   // состояния всех вкладок

  function game() { return Games.get(current); }
  function num(el) { return U.parseNum(el.value); }

  /* ---- состояние вкладки ---- */

  /** Состояние по умолчанию: цель через 42 дня (патч), цель — первый пресет игры */
  function defaultState(key) {
    var d = U.todayMidnight();
    d.setDate(d.getDate() + 42);
    return { date: U.isoLocal(d), target: Games.get(key).chips[0], haveW: 0, haveP: 0 };
  }

  /** Прочитать поля формы как состояние */
  function readInputs() {
    return {
      date: els.date.value || '',
      target: num(els.target),
      haveW: num(els.haveW),
      haveP: num(els.haveP)
    };
  }

  /** Перенести состояние в поля формы */
  function applyStateToInputs() {
    var s = state[current];
    els.date.value = s.date;
    els.target.value = s.target;
    els.haveW.value = s.haveW;
    els.haveP.value = s.haveP;
  }

  /* ---- подсветка активных чипсов ---- */

  function syncChips() {
    var today = U.todayMidnight();
    var d = U.parseIsoDate(els.date.value);
    var diff = d ? Math.round((d - today) / 86400000) : null;

    document.querySelectorAll('.chips button[data-days]').forEach(function (b) {
      b.classList.toggle('on', diff !== null && diff === parseInt(b.dataset.days, 10));
    });

    var goal = num(els.target);
    els.wishChips.querySelectorAll('button[data-wishes]').forEach(function (b) {
      b.classList.toggle('on', goal > 0 && goal === parseFloat(b.dataset.wishes));
    });
  }

  /* ---- перерисовка: форма → расчёт → вывод ---- */

  function render() {
    syncChips();

    var result = Calc.calculate({
      game:       current,
      targetDate: U.parseIsoDate(els.date.value),
      today:      U.todayMidnight(),
      goal:       num(els.target),
      haveWishes: num(els.haveW),
      havePrimos: num(els.haveP)
    });

    Render.render(els.out, result, game());
  }

  /** Любое изменение полей: запомнить состояние вкладки и перерисовать */
  function touch() {
    state[current] = readInputs();
    store.save(current, state[current]);
    render();
  }

  /* ---- подписи, которые зависят от игры ---- */

  function patchLabels() {
    var G = game();
    els.lblHaveWHint.textContent = G.haveWHint;
    els.lblHaveP.textContent = G.havePLabel;
    els.noteLine.textContent = G.note;
  }

  /** Пресеты цели собираются заново для каждой игры — у них свои числа */
  function buildWishChips() {
    els.wishChips.innerHTML = game().chips.map(function (v) {
      return '<button data-wishes="' + v + '">' + v + '</button>';
    }).join('');
    bindChips(els.wishChips);
  }

  /* ---- переключение игр ---- */

  function setGame(key) {
    if (!Games.has(key)) return;

    // уходящая вкладка уносит свои значения с собой
    state[current] = readInputs();
    store.save(current, state[current]);

    current = key;
    els.body.className = game().bodyClass; // цветовая тема игры
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('on', b.dataset.game === key);
    });

    patchLabels();
    buildWishChips();
    applyStateToInputs();
    render();
  }

  /* ---- обработчики ---- */

  ['input', 'change'].forEach(function (ev) {
    els.date.addEventListener(ev, touch);
    [els.target, els.haveW, els.haveP].forEach(function (el) {
      el.addEventListener(ev, touch);
      // при уходе с поля — прибрать ввод к целому неотрицательному числу
      el.addEventListener('blur', function () {
        if (el.value !== '') { el.value = Math.max(0, Math.round(num(el))); }
        touch();
      });
    });
  });

  /** Чипсы: data-days — дата через N дней, data-wishes — цель в крутках */
  function bindChips(root) {
    root.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.days) {
          var t = U.todayMidnight();
          t.setDate(t.getDate() + parseInt(btn.dataset.days, 10));
          els.date.value = U.isoLocal(t);
          touch();
        } else if (btn.dataset.wishes) {
          els.target.value = btn.dataset.wishes;
          touch();
        }
      });
    });
  }

  // чипсы даты статичны и живут в разметке — привязываем их один раз
  bindChips(els.dateChips);

  els.tabs.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.tab') : null;
    if (btn && btn.dataset.game && btn.dataset.game !== current) setGame(btn.dataset.game);
  });

  els.resetBtn.addEventListener('click', function () {
    state[current] = defaultState(current);
    applyStateToInputs();
    store.save(current, state[current]);
    render();
  });

  /* ---- старт ---- */

  Games.ORDER.forEach(function (key) {
    state[key] = store.load(key, defaultState(key));
  });

  els.body.className = game().bodyClass;
  patchLabels();
  buildWishChips();
  applyStateToInputs();
  render();

})(typeof window !== 'undefined' ? window : globalThis);
