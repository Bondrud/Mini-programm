/*
 * Главная программа Electron-приложения.
 * Открывает окно с интерфейсом калькулятора (index.html).
 */
'use strict';

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 1300,
    minWidth: 480,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: '#0d1017', // фон окна в тон приложению — без белой вспышки при запуске
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,   // безопасные настройки по умолчанию
      nodeIntegration: false,
      spellcheck: false
    }
  });

  // без меню-бара: приложению оно не нужно
  Menu.setApplicationMenu(null);

  // внешние ссылки (если появятся) — открывать в браузере, а не в окне
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    // macOS: клик по иконке в доке, когда окон нет
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
