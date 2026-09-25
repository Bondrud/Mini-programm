/*
 * Чистая логика расчёта. Модуль ничего не знает про DOM,
 * поэтому его можно тестировать прямо в Node (см. tests/calc.test.js).
 *
 * Стоимость крутки берётся из игры (js/games.js) — у Genshin Impact это
 * 160 примогемов, у Arknights: Endfield — 500 Oroberyl и т. д.
 */
(function (global) {
  'use strict';

  /** Сколько примогемов стоит 1 крутка (Переплетённая судьба) в Genshin Impact */
  var PRIMOS_PER_WISH = 160;

  /** Стоимость крутки, если игра не указана (совместимость со старыми вызовами) */
  var DEFAULT_PER_PULL = PRIMOS_PER_WISH;

  /** Округление вверх с допуском для ошибок плавающей точки (3.0000000001 → 3) */
  function ceilEps(n) { return Math.ceil(n - 1e-9); }

  /**
   * Разобрать игру из входных данных.
   * Каталог ищется в момент вызова, а не при загрузке модуля, —
   * тогда порядок подключения скриптов не важен.
   * @returns {Object|null} конфигурация игры или null, если каталог недоступен
   */
  function resolveGame(input) {
    var Games = global.Games;
    if (!Games || typeof Games.get !== 'function') return null;
    return Games.get(input.game || input.gameKey);
  }

  /**
   * Рассчитать план накопления.
   *
   * @param {Object}  input
   * @param {Date|null} input.targetDate дата цели (локальная полночь) или null
   * @param {Date}      input.today      «сегодня» (локальная полночь)
   * @param {number}    input.goal       сколько круток хотим иметь
   * @param {number}    input.haveWishes сколько круток уже есть
   * @param {number}    input.havePrimos сколько валюты уже есть
   * @param {string}   [input.game]      ключ игры из каталога (js/games.js)
   * @param {number}   [input.perPull]   стоимость крутки — переопределяет игру
   *
   * @returns {Object} результат с флагами (missingDate, invalidGoal, goalReached,
   *                   dateInPast, dateIsToday, oneDayLeft) и числами для отрисовки
   */
  function calculate(input) {
    var today = input.today;
    var target = input.targetDate;
    var goal = Math.max(0, input.goal || 0);
    var haveWishes = Math.max(0, input.haveWishes || 0);
    var havePrimos = Math.max(0, input.havePrimos || 0);

    var game = resolveGame(input);
    // явный perPull важнее игры; без него — игра; без игры — цена крутки Genshin
    var perPull = input.perPull || (game && game.perPull) || DEFAULT_PER_PULL;

    // Всё, что уже накоплено, в пересчёте на валюту игры
    var totalNow = haveWishes * perPull + havePrimos;

    var result = {
      game: game,
      perPull: perPull,
      primosPerWish: perPull, // прежнее имя поля — оставлено для совместимости
      targetDate: target,
      today: today,
      goal: goal,
      haveWishes: haveWishes,
      havePrimos: havePrimos,
      totalNow: totalNow,
      missingDate: !target,   // дата не указана / некорректна
      invalidGoal: goal <= 0  // цель не задана
    };

    if (!target) { return result; }

    var rawDays = Math.round((target - today) / 86400000); // целых дней до цели
    var daysLeft = Math.max(rawDays, 1);                   // минимум 1 день, чтобы не делить на 0

    var needTotal = goal * perPull;                    // всего валюты для цели
    var missing = Math.max(0, needTotal - totalNow);   // сколько не хватает
    var perDay = missing / daysLeft;                   // точное значение «в день»
    var perDayReq = ceilEps(perDay);                   // «хотя бы столько» — округляем вверх
    var perWishDay = perDay / perPull;                 // круток в день (может быть < 1)

    result.rawDays = rawDays;
    result.daysLeft = daysLeft;
    result.dateInPast = rawDays < 0;
    result.dateIsToday = rawDays === 0;
    result.oneDayLeft = rawDays === 1;
    result.needTotal = needTotal;
    result.missing = missing;
    result.missingWishes = missing / perPull;
    result.perDay = perDay;
    result.perDayReq = perDayReq;
    result.perWishDay = perWishDay;
    result.progress = needTotal > 0 ? Math.min(100, totalNow / needTotal * 100) : 100;
    result.primosNow = Math.floor(totalNow / perPull); // полных круток на руках
    result.goalReached = missing <= 0;
    result.extraWishes = Math.floor((totalNow - needTotal) / perPull); // запас сверх цели
    return result;
  }

  var api = {
    PRIMOS_PER_WISH: PRIMOS_PER_WISH,
    DEFAULT_PER_PULL: DEFAULT_PER_PULL,
    calculate: calculate
  };

  // Браузер: window.Calc; Node (тесты): module.exports
  global.Calc = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
