/*
 * Каталог игр: всё, чем одна вкладка отличается от другой.
 * Модуль — чистые данные, без DOM и без логики расчёта.
 * Загружается раньше js/calc.js и js/render.js.
 *
 * Поля:
 *   name       — название игры (вкладка)
 *   bodyClass  — класс для <body>, включает цветовую тему
 *   perPull    — сколько валюты стоит 1 крутка
 *   currency   — валюта в родительном падеже мн. ч.: «нужно X примогемов / день»
 *   curStat    — валюта в подписи «Не хватает …»
 *   havePLabel — подпись поля накопленной валюты
 *   haveWHint  — подсказка у поля «Есть круток сейчас»: как называются крутки
 *   chips      — пресеты цели в крутках
 *   note       — строка-пояснение под формой
 */
(function (global) {
  'use strict';

  var GAMES = {
    genshin: {
      name: 'Genshin Impact',
      bodyClass: 'g-genshin',
      perPull: 160,
      currency: 'примогемов',
      curStat: 'примогемов',
      havePLabel: 'Есть примогемов сейчас',
      haveWHint: '(судьбы)',
      chips: [180, 360, 540, 720, 900, 1080, 1260],
      note: 'Расчёт: 1 крутка (Переплетённая судьба) = 160 примогемов.'
    },
    endfield: {
      name: 'Arknights: Endfield',
      bodyClass: 'g-endfield',
      perPull: 500,
      currency: 'Oroberyl',
      curStat: 'Oroberyl',
      havePLabel: 'Есть Oroberyl сейчас',
      haveWHint: '(HH-пермиты)',
      chips: [120, 240, 360, 480, 600, 720, 840],
      note: 'Расчёт: 1 крутка (Chartered HH Permit) = 500 Oroberyl.'
    },
    nte: {
      name: 'Neverness to Everness',
      bodyClass: 'g-nte',
      perPull: 160,
      currency: 'Annulith',
      curStat: 'Annulith',
      havePLabel: 'Есть Annulith сейчас',
      haveWHint: '(Solid Dice)',
      chips: [90, 180, 270, 360, 450, 540, 630],
      note: 'Расчёт: 1 крутка (Solid Dice) = 160 Annulith.'
    }
  };

  /** Порядок вкладок — он же порядок кнопок в интерфейсе */
  var ORDER = ['genshin', 'endfield', 'nte'];

  /** Игра, открытая при первом запуске */
  var DEFAULT = 'genshin';

  /** Есть ли такая игра в каталоге */
  function has(key) {
    return Object.prototype.hasOwnProperty.call(GAMES, key);
  }

  /**
   * Конфигурация игры по ключу.
   * @param {string} [key] ключ игры; пустое/неизвестное значение → игра по умолчанию
   * @returns {Object} конфигурация (с полем key)
   */
  function get(key) {
    var k = has(key) ? key : DEFAULT;
    var game = GAMES[k];
    // копия: наружу не отдаём исходный объект каталога
    return Object.assign({ key: k }, game);
  }

  /** Все игры в порядке вкладок: [{ key, name, perPull, … }, …] */
  function list() {
    return ORDER.map(get);
  }

  /** Ключ игры по умолчанию */
  function defaultKey() { return DEFAULT; }

  var api = {
    GAMES: GAMES,
    ORDER: ORDER,
    has: has,
    get: get,
    list: list,
    defaultKey: defaultKey
  };

  // Браузер: window.Games; Node (тесты): module.exports
  global.Games = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
