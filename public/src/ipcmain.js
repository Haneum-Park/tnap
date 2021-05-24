require('./Main/ipc');
require('./Settings/ipc');

const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const initStore = new Store();

ipcMain.on('request_userinfo_data_store_data', (event, data) => {
  console.log('=== request_userinfo_data_store_data ===');
  initStore.clear();
});