/*
 * Утилиты: форматирование чисел, русские склонения, работа с датами.
 * Модуль не зависит от остального кода — используется и в браузере,
 * и в тестах (Node). Загружается первым из всех js-модулей.
 */
(function (global) {
  'use strict';

  /** Разбор числа из строки/поля ввода: запятая как разделитель, мусор и ≤0 → 0 */
  function parseNum(value) {
    var v = parseFloat(String(value).replace(',', '.'));
    return isFinite(v) && v > 0 ? v : 0;
  }

  /* ---- форматирование ---- */

  function fmt(n) { return Math.round(n).toLocaleString('ru-RU'); }
  function fmt1(n) { return n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function fmt2(n) { return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  /** Округление вверх с допуском для ошибок плавающей точки (3.0000000001 → 3) */
  function up(n) { return Math.ceil(n - 1e-9); }

  /* ---- склонения ---- */

  /** Русское склонение: plural(5, 'день', 'дня', 'дней') → 'дней' */
  function plural(n, one, few, many) {
    n = Math.abs(Math.round(n)) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 === 1) return one;
    if (n1 >= 2 && n1 <= 4) return few;
    return many;
  }
  function days(n) { return plural(n, 'день', 'дня', 'дней'); }
  function wishes(n) { return plural(n, 'крутка', 'крутки', 'круток'); }
  function months(n) { return plural(n, 'месяц', 'месяца', 'месяцев'); }

  /* ---- даты ---- */

  /** Полночь сегодняшнего дня (локальное время) */
  function todayMidnight() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** Дата в формате YYYY-MM-DD (для <input type=date>) */
  function isoLocal(d) {
    var m = ('0' + (d.getMonth() + 1)).slice(-2), day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  /** «25 сентября 2026 г.» */
  function formatDate(d) {
    try {
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return isoLocal(d); }
  }

  /** 'YYYY-MM-DD' → Date (локальная полночь) или null, если строка не похожа на дату */
  function parseIsoDate(value) {
    var parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  var api = {
    parseNum: parseNum,
    fmt: fmt,
    fmt1: fmt1,
    fmt2: fmt2,
    up: up,
    plural: plural,
    days: days,
    wishes: wishes,
    months: months,
    todayMidnight: todayMidnight,
    isoLocal: isoLocal,
    formatDate: formatDate,
    parseIsoDate: parseIsoDate
  };

  // Браузер: window.Utils; Node (тесты): module.exports
  global.Utils = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
