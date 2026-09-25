'use strict';

/*
 * Тесты памяти вкладок (js/store.js).
 * Вместо localStorage — подставное хранилище, поэтому тесты работают в Node.
 */

const test = require('node:test').test;
const assert = require('node:assert/strict');
const Store = require('../js/store.js');

/** Простая имитация localStorage в памяти */
function fakeStorage(initial) {
  const data = Object.assign({}, initial);
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; }
  };
}

/** Хранилище, которое всё время бросает исключение (приватный режим) */
function brokenStorage() {
  const fail = () => { throw new Error('QuotaExceededError'); };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

const DEFAULTS = { date: '2026-11-06', target: 180, haveW: 0, haveP: 0 };

test('normalize: заполняет пропуски значениями по умолчанию', () => {
  assert.deepEqual(Store.normalize(null, DEFAULTS), DEFAULTS);
  assert.deepEqual(Store.normalize({}, DEFAULTS), DEFAULTS);
  assert.deepEqual(Store.normalize('мусор', DEFAULTS), DEFAULTS);
  assert.deepEqual(
    Store.normalize({ date: '2026-12-01', target: 360 }, DEFAULTS),
    { date: '2026-12-01', target: 360, haveW: 0, haveP: 0 }
  );
});

test('normalize: битые значения заменяются, пустая дата — тоже', () => {
  const r = Store.normalize({ date: '', target: 'много', haveW: NaN, haveP: Infinity }, DEFAULTS);
  assert.deepEqual(r, DEFAULTS);
});

test('save/load: состояние вкладки переживает перезагрузку', () => {
  const storage = fakeStorage();
  const store = Store.createStore(storage);
  const state = { date: '2026-12-31', target: 540, haveW: 12, haveP: 800 };

  assert.equal(store.available, true);
  assert.equal(store.save('genshin', state), true);
  assert.deepEqual(store.load('genshin', DEFAULTS), state);
});

test('у каждой игры свой ключ в хранилище', () => {
  const storage = fakeStorage();
  const store = Store.createStore(storage);
  store.save('genshin', { date: '2026-12-31', target: 180, haveW: 0, haveP: 0 });
  store.save('nte', { date: '2027-01-15', target: 90, haveW: 0, haveP: 0 });

  assert.deepEqual(Object.keys(storage.data).sort(), ['gacha3:genshin', 'gacha3:nte']);
  assert.equal(store.load('nte', DEFAULTS).target, 90);
  assert.equal(store.load('endfield', DEFAULTS).target, DEFAULTS.target); // ничего не сохраняли
});

test('load: повреждённый JSON не роняет приложение', () => {
  const store = Store.createStore(fakeStorage({ 'gacha3:genshin': '{не json' }));
  assert.deepEqual(store.load('genshin', DEFAULTS), DEFAULTS);
});

test('remove: состояние забывается', () => {
  const storage = fakeStorage();
  const store = Store.createStore(storage);
  store.save('genshin', { date: '2026-12-31', target: 180, haveW: 0, haveP: 0 });
  store.remove('genshin');
  assert.deepEqual(store.load('genshin', DEFAULTS), DEFAULTS);
});

test('недоступное хранилище: приложение работает без памяти', () => {
  const store = Store.createStore(brokenStorage());
  assert.equal(store.available, false);
  assert.equal(store.save('genshin', { date: '2026-12-31', target: 180, haveW: 0, haveP: 0 }), false);
  assert.deepEqual(store.load('genshin', DEFAULTS), DEFAULTS);
  assert.doesNotThrow(() => store.remove('genshin'));
});

test('хранилища нет вовсе (undefined) — тоже не ошибка', () => {
  const store = Store.createStore(undefined);
  assert.equal(store.available, false);
  assert.deepEqual(store.load('genshin', DEFAULTS), DEFAULTS);
});

test('PREFIX: ключи начинаются с gacha3:', () => {
  assert.equal(Store.PREFIX, 'gacha3:');
  assert.equal(Store.fullPath('nte'), 'gacha3:nte');
});
