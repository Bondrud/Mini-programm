# 💰 Калькулятор примогемов — сколько нужно фармить в день

[![CI](https://github.com/Bondrud/Mini-programm/actions/workflows/ci.yml/badge.svg)](https://github.com/Bondrud/Mini-programm/actions/workflows/ci.yml)
[![Release](https://github.com/Bondrud/Mini-programm/actions/workflows/release.yml/badge.svg)](https://github.com/Bondrud/Mini-programm/actions/workflows/release.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Bondrud/Mini-programm?include_prereleases&sort=semver)](https://github.com/Bondrud/Mini-programm/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Мини-приложение для игроков Genshin Impact. Отвечает на главный вопрос каждого копильщика: **сколько примогемов нужно зарабатывать в день, чтобы к нужной дате накопить нужное число круток?**

![Скриншот приложения](docs/screenshot.png)

## ⬇️ Скачать

Готовые сборки — на странице [**Releases**](https://github.com/Bondrud/Mini-programm/releases/latest):

| Файл | Для какой системы | Как запустить |
|---|---|---|
| `GenshinCalc-Portable-x.y.z.exe` | Windows 10/11 (64-bit) | 👍 проще всего: один файл без установки — скачать и запустить |
| `GenshinCalc-Setup-x.y.z.exe` | Windows 10/11 (64-bit) | установщик: запустить и следовать подсказкам |
| `GenshinCalc-HTML-x.y.z.zip` | любая ОС | распаковать и открыть `index.html` в браузере |

> Приложение не подписано сертификатом, поэтому SmartScreen при первом запуске может предупредить: **«Подробнее» → «Выполнить в любом случае»**.

## ✨ Возможности

- 📅 **Дата цели** — с быстрыми пресетами: неделя, 2 недели, месяц, патч (42 дня), 3 месяца
- 🎯 **Цель в крутках** — пресеты от 180 до 1260 (180 круток ≈ гарантия на баннере)
- 💎 **Учёт текущих накоплений** — судьбы и примогемы, что уже есть
- 📊 **Сводка** — сколько не хватает, норма в день / неделю / месяц, прогресс-бар
- ⚠️ **Предупреждения** — дата прошла, дата сегодня, остался 1 день
- 🌙 Тёмная тема, адаптивная вёрстка — удобно и с телефона

## 🚀 Запуск

Приложение — обычная статическая страница, ничего устанавливать не нужно:

1. скачайте репозиторий (`Code → Download ZIP` или `git clone`);
2. откройте `index.html` в браузере.

Либо поднимите локальный сервер:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 🧮 Как считается

1 крутка (Переплетённая судьба) = **160 примогемов**.

```
не хватает  = цель × 160 − (судьбы × 160 + примогемы)
норма в день = не хватает / дней до цели   (округление вверх)
```

Если дата цели — сегодня или уже прошла, расчёт всё равно показывается (как для 1 дня), плюс выводится предупреждение.

## 📁 Структура проекта

```
├── index.html              # разметка страницы
├── css/
│   └── styles.css          # стили: тёмная тема, карточки, адаптив
├── js/
│   ├── utils.js            # форматирование чисел, склонения, даты
│   ├── calc.js             # чистая логика расчёта (без DOM)
│   ├── render.js           # отрисовка результата в HTML
│   └── app.js              # точка входа: форма, обработчики, перерисовка
├── electron/
│   ├── main.js             # главная программа Electron-приложения (exe)
│   ├── icon.ico            # иконка приложения (Windows)
│   └── icon.png            # она же в PNG
├── tests/
│   ├── calc.test.js        # тесты логики расчёта
│   ├── utils.test.js       # тесты утилит
│   └── render.test.js      # тесты отрисовки
├── docs/
│   ├── screenshot.png      # скриншот для README
│   └── release-notes.md    # текст для страницы релиза
└── .github/workflows/      # CI (тесты), Pages и сборка exe-релизов
```

Модули сознательно написаны как обычные скрипты (не ES-модули), чтобы страница работала даже при открытии по двойному клику через `file://`. При этом `utils.js`, `calc.js` и `render.js` экспортируют свой API и в CommonJS — поэтому они тестируются в Node без браузера и без зависимостей.

## 🧪 Тесты

```bash
npm test        # или просто: node --test
```

Тесты покрывают логику расчёта (округления, крайние случаи с датами), склонения и отрисовку. CI прогоняет их на Node 20 и 22 при каждом пуше и в pull request'ах.

## 🌐 GitHub Pages

После мержа в `main` сайт автоматически публикуется на GitHub Pages — workflow [`deploy.yml`](.github/workflows/deploy.yml). Чтобы это заработало, включите в настройках репозитория: **Settings → Pages → Source: GitHub Actions**.

## 🖥️ Десктоп-версия (exe)

Приложение оборачивается в [Electron](https://www.electronjs.org/) — интерфейс тот же, но в отдельном окне, без браузера. Сборка для Windows (установщик + портативный exe) происходит на GitHub Actions.

```bash
# локальный запуск десктоп-версии (нужен Node.js)
npm install
npm start

# локальная сборка exe (Windows)
npm run dist
```

### Как выпустить новую версию

1. поднимите `version` в `package.json` (например, `1.1.0`);
2. сделайте коммит и поставьте тег: `git tag v1.1.0 && git push origin v1.1.0`;
3. workflow [`release.yml`](.github/workflows/release.yml) сам соберёт exe и опубликует релиз с файлами на странице Releases.

## 📄 Лицензия

[MIT](LICENSE) — используйте и форкайте свободно.
