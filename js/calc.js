/*
 * Чистая логика расчёта. Модуль ничего не знает про DOM,
 * поэтому его можно тестировать прямо в Node (см. tests/calc.test.js).
 */
(function (global) {
  'use strict';

  /** Сколько примогемов стоит 1 крутка (Переплетённая судьба) */
  var PRIMOS_PER_WISH = 160;

  /** Округление вверх с допуском для ошибок плавающей точки (3.0000000001 → 3) */
  function ceilEps(n) { return Math.ceil(n - 1e-9); }

  /**
   * Рассчитать план накопления.
   *
   * @param {Object}  input
   * @param {Date|null} input.targetDate дата цели (локальная полночь) или null
   * @param {Date}      input.today      «сегодня» (локальная полночь)
   * @param {number}    input.goal       сколько круток хотим иметь
   * @param {number}    input.haveWishes сколько круток уже есть
   * @param {number}    input.havePrimos сколько примогемов уже есть
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

    // Всё, что уже накоплено, в пересчёте на примогемы
    var totalNow = haveWishes * PRIMOS_PER_WISH + havePrimos;

    var result = {
      primosPerWish: PRIMOS_PER_WISH,
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

    var needTotal = goal * PRIMOS_PER_WISH;          // всего примогемов для цели
    var missing = Math.max(0, needTotal - totalNow); // сколько не хватает
    var perDay = missing / daysLeft;                 // точное значение «в день»
    var perDayReq = ceilEps(perDay);                 // «хотя бы столько» — округляем вверх
    var perWishDay = perDay / PRIMOS_PER_WISH;       // круток в день (может быть < 1)

    result.rawDays = rawDays;
    result.daysLeft = daysLeft;
    result.dateInPast = rawDays < 0;
    result.dateIsToday = rawDays === 0;
    result.oneDayLeft = rawDays === 1;
    result.needTotal = needTotal;
    result.missing = missing;
    result.missingWishes = missing / PRIMOS_PER_WISH;
    result.perDay = perDay;
    result.perDayReq = perDayReq;
    result.perWishDay = perWishDay;
    result.progress = needTotal > 0 ? Math.min(100, totalNow / needTotal * 100) : 100;
    result.primosNow = Math.floor(totalNow / PRIMOS_PER_WISH); // полных круток на руках
    result.goalReached = missing <= 0;
    result.extraWishes = Math.floor((totalNow - needTotal) / PRIMOS_PER_WISH); // запас сверх цели
    return result;
  }

  var api = {
    PRIMOS_PER_WISH: PRIMOS_PER_WISH,
    calculate: calculate
  };

  // Браузер: window.Calc; Node (тесты): module.exports
  global.Calc = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
