/*
 * Память вкладок: каждая игра хранит своё состояние в localStorage.
 * Модуль изолирует все неприятности хранилища (приватный режим, битый JSON,
 * отсутствующие поля) и поэтому тестируется в Node с подставным хранилищем.
 */
(function (global) {
  'use strict';

  /** Префикс ключей в localStorage — свой у каждой игры: 'gacha3:genshin' */
  var PREFIX = 'gacha3:';

  function fullPath(key) { return PREFIX + key; }

  /** Живое ли хранилище: в приватном режиме запись может бросать исключение */
  function isUsable(storage) {
    if (!storage) return false;
    try {
      storage.setItem('__probe__', '1');
      storage.removeItem('__probe__');
      return true;
    } catch (e) { return false; }
  }

  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  /**
   * Привести сохранённый объект к полному состоянию.
   * Чего нет или что повреждено — заменяется значением по умолчанию.
   *
   * @param {Object|null} raw      разобранный JSON из хранилища
   * @param {Object}      defaults состояние по умолчанию: { date, target, haveW, haveP }
   * @returns {Object} состояние
   */
  function normalize(raw, defaults) {
    var o = (raw && typeof raw === 'object') ? raw : {};
    return {
      date:   typeof o.date === 'string' && o.date ? o.date : defaults.date,
      target: isNum(o.target) ? o.target : defaults.target,
      haveW:  isNum(o.haveW) ? o.haveW : 0,
      haveP:  isNum(o.haveP) ? o.haveP : 0
    };
  }

  /**
   * Создать хранилище состояний.
   * @param {Object} [storage] объект с getItem/setItem/removeItem (обычно localStorage)
   */
  function createStore(storage) {
    var usable = isUsable(storage);

    return {
      /** доступно ли хранилище — если нет, приложение просто работает без памяти */
      available: usable,

      /** Прочитать состояние игры; ничего нет или данные битые → defaults */
      load: function (key, defaults) {
        if (!usable) return normalize(null, defaults);
        try {
          return normalize(JSON.parse(storage.getItem(fullPath(key))), defaults);
        } catch (e) {
          return normalize(null, defaults);
        }
      },

      /** Записать состояние игры; ошибка хранилища не должна ронять интерфейс */
      save: function (key, state) {
        if (!usable) return false;
        try {
          storage.setItem(fullPath(key), JSON.stringify(state));
          return true;
        } catch (e) { return false; }
      },

      /** Забыть состояние игры */
      remove: function (key) {
        if (!usable) return;
        try { storage.removeItem(fullPath(key)); } catch (e) {}
      }
    };
  }

  var api = {
    PREFIX: PREFIX,
    fullPath: fullPath,
    normalize: normalize,
    createStore: createStore
  };

  // Браузер: window.Store; Node (тесты): module.exports
  global.Store = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
