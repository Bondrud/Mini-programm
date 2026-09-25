/*
 * Отрисовка результата: превращает то, что вернул Calc.calculate(), в HTML.
 * Загружается после js/utils.js (использует Utils для форматирования).
 *
 * Названия валют подставляются из игры — поэтому модуль принимает
 * конфигурацию игры третьим аргументом либо берёт её из результата расчёта.
 */
(function (global) {
  'use strict';

  var U = global.Utils;

  /** Подписи, если игра не передана и не пришлась в результате (Genshin Impact) */
  var DEFAULT_LABELS = { currency: 'примогемов', curStat: 'примогемов' };

  function labelsOf(game, result) {
    return game || result.game || DEFAULT_LABELS;
  }

  /* ---- маленькие строители ---- */

  function warnBox(text) {
    return '<section class="card warnbox"><p class="err">' + text + '</p></section>';
  }

  /**
   * Плитка со статистикой.
   * @param {string} label     подпись
   * @param {string} valueHtml значение (HTML)
   * @param {string} [style]   дополнительные стили для значения
   */
  function stat(label, valueHtml, style) {
    return '<div class="stat"><div class="k">' + label + '</div>' +
      '<div class="v"' + (style ? ' style="' + style + '"' : '') + '>' + valueHtml + '</div></div>';
  }

  /* ---- предупреждения о крайних случаях ---- */

  function warningsHtml(r) {
    var html = '';
    if (r.dateInPast) {
      html += warnBox('⚠ Дата цели уже в прошлом (' + U.formatDate(r.targetDate) + '). Укажите будущую дату.');
    } else if (r.dateIsToday) {
      html += warnBox('⚠ Дата цели — сегодня. Считать «в день» нечего, поэтому расчёт сделан как для 1 дня.');
    } else if (r.oneDayLeft) {
      html += warnBox('⏳ До цели остался 1 день — успеть почти нереально, но цифры посчитаны.');
    }
    return html;
  }

  /* ---- «Цель уже достигнута» ---- */

  function reachedHtml(r) {
    return '<section class="card"><div class="hero-main" style="border-color:rgba(111,219,142,.4)">' +
        '<div class="hero-label">Цель уже достигнута</div>' +
        '<div class="big" style="color:var(--green)">' + U.fmt(r.primosNow) +
          '<span class="unit">' + U.wishes(r.primosNow) + ' есть на руках</span></div>' +
        '<div class="alt">К ' + U.formatDate(r.targetDate) + ' ничего зарабатывать не нужно. ' +
          'Запас: <b>' + U.fmt(r.extraWishes) + '</b> ' + U.wishes(r.extraWishes) + ' сверх цели.</div>' +
      '</div></section>';
  }

  /* ---- основной блок с планом накопления ---- */

  function planHtml(r, L) {
    var daysToShow = Math.max(r.rawDays, 0);
    return '<section class="card"><div class="hero">' +
      '<div class="hero-main">' +
        '<div class="hero-label">Нужно зарабатывать</div>' +
        '<div class="big">' + U.fmt(r.perDayReq) + '<span class="unit">' + L.currency + ' / день</span></div>' +
        '<div class="alt">Это <b>' + U.fmt2(r.perWishDay) + '</b> ' + U.wishes(r.perWishDay) + ' в день' +
          (r.perWishDay < 1
            ? ' (то есть 1 крутка примерно за ' + U.fmt1(1 / r.perWishDay) + ' ' + U.days(1 / r.perWishDay) + ')'
            : '') + '</div>' +
        '<div class="alt" style="margin-top:6px">≈ <b>' + U.fmt(r.perDayReq * 7) + '</b> ' + L.currency +
          ' в неделю · <b>' + U.fmt(r.perDayReq * 30) + '</b> в месяц</div>' +
      '</div>' +
      '<div class="stats">' +
        stat('До цели', U.fmt(daysToShow) + ' <small>' + U.days(daysToShow) + (r.rawDays < 0 ? ' (дата прошла)' : '') + '</small>') +
        stat('Дата цели', U.formatDate(r.targetDate), 'font-size:15px') +
        stat('Не хватает', U.fmt(r.missingWishes) + ' <small>' + U.wishes(r.missingWishes) + '</small>') +
        stat('Не хватает ' + L.curStat, U.fmt(r.missing)) +
        stat('Есть сейчас', U.fmt(r.primosNow) + ' <small>' + U.wishes(r.primosNow) + '</small>') +
        stat('Цель', U.fmt(r.goal) + ' <small>' + U.wishes(r.goal) + '</small>') +
      '</div></div>' +

      '<div class="bar"><i style="width:' + r.progress.toFixed(2) + '%"></i></div>' +
      '<div class="bar-info"><span>Прогресс: ' + U.fmt(r.primosNow) + ' из ' + U.fmt(r.goal) + ' ' + U.wishes(r.goal) +
        '</span><span>' + r.progress.toFixed(1).replace('.', ',') + '%</span></div>' +

    '</section>';
  }

  /* ---- главная функция модуля ---- */

  /**
   * Нарисовать результат расчёта в элемент #out.
   * @param {Element} outEl   контейнер для вывода
   * @param {Object}  result  результат Calc.calculate()
   * @param {Object} [game]   конфигурация игры (js/games.js) — подписи валюты
   */
  function render(outEl, result, game) {
    if (result.missingDate) {
      outEl.innerHTML = warnBox('⚠ Укажите дату цели — без неё расчёт невозможен.');
      return;
    }

    var html = warningsHtml(result);

    if (result.invalidGoal) {
      outEl.innerHTML = html +
        '<section class="card"><p class="err">Укажите, сколько круток вы хотите иметь (цель больше 0).</p></section>';
      return;
    }

    if (result.goalReached) {
      outEl.innerHTML = html + reachedHtml(result);
      return;
    }

    outEl.innerHTML = html + planHtml(result, labelsOf(game, result));
  }

  var api = { render: render, DEFAULT_LABELS: DEFAULT_LABELS };

  // Браузер: window.Render; Node (тесты): module.exports
  global.Render = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }

})(typeof window !== 'undefined' ? window : globalThis);
