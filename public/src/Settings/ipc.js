const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const initStore = new Store();
const axios = require('axios');

const ipcDataType = require('../ipcDataType');
const { generateHmac } = require('../hmacGenerator');

// 네이버 계정 인증 요청
ipcMain.on('request_naver_data_store_data', (event, naver_data) => {
  console.log('=== request_naver_data_store_data ===');
  const target = naver_data.target;
  const account = JSON.stringify(naver_data.account);

  let pythonPath = 'python3';
  const scriptPath = './public/assets/scripts/python/settings.py';

  if (process.platform === 'win32') pythonPath = './public/assets/ext_modules/portable_python/python.exe';

  const { spawn } = require('child_process');
  const pyShell = spawn(pythonPath, [scriptPath, target, account]);
  
  pyShell.stdout.on('data', (data) => {
    const ret = ipcDataType.res_naver_account_store;
    if (data.toString().indexOf('success') > -1) {
      initStore.set('naver_account', naver_data.account);
      ret.status = 'success';
      ret.err = '';
      ret.data = naver_data.account;
    } else {
      initStore.set('naver_account', naver_data.account);
      ret.status = 'error';
      ret.err = 'NOACCOUNT';
      ret.data = {};
    }
    event.sender.send('response_naver_data_store_data', ret);
    console.log(`stdout : ${data.toString()}`);
  });

  pyShell.stderr.on('data', (data) => {
    console.log(`stderr : ${data}`);
  });
  
  pyShell.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

// 네이버 계정 데이터 가져오기
ipcMain.on('request_naver_data_load_data', (event, naver_data) => {
  console.log('=== request_naver_data_load_data ===');
  const ret = ipcDataType.res_naver_account_load;

  if (typeof initStore.get('naver_account') === 'undefined' || typeof initStore.get('naver_account') === undefined) {
    ret.status = 'error';
    ret.err = 'NODATA';
    ret.data = {};
  } else {
    ret.status = 'success';
    ret.err = '';
    ret.data = initStore.get('naver_account');
  }

  console.log(ret);
  event.sender.send('response_naver_data_load_data', ret);
});

// 쿠팡파트너스 인증요청
ipcMain.on('request_coupangapi_data_store_data', (event, coupang_api) => {
  console.log('=== request_coupangapi_data_store_data ===');
  const ACCESS_KEY = coupang_api.access_key;
  const SECRET_KEY = coupang_api.secret_key;
  const REQUEST_METHOD = 'POST';
  const DOMAIN = 'https://api-gateway.coupang.com';
  const URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
  const REQUEST = { "coupangUrls": [
      "https://www.coupang.com/np/search?component=&q=good&channel=user", 
      "https://www.coupang.com/np/coupangglobal"
  ]};
  (async () => {
    const authorization = generateHmac(REQUEST_METHOD, URL, SECRET_KEY, ACCESS_KEY);
    axios.defaults.baseURL = DOMAIN;
    try {
      const response = await axios.request({
        method: REQUEST_METHOD,
        url: URL,
        headers: { Authorization: authorization },
        data: REQUEST
      });
      if (response.data.rCode === "0") {
        const ret = ipcDataType.res_coupang_api_store;
        ret.status = 'success';
        ret.err = '';
        ret.data = coupang_api;
        initStore.set('coupang_api', coupang_api);
        event.sender.send('response_coupangapi_data_store_data', ret);
      }
    } catch (err) {
      console.error(err.response.data);
      if (err.response.data.code === 'ERROR') {
        const ret = ipcDataType.res_coupang_api_store;
        ret.status = 'error';
        ret.err = err.repsonse.data.message;
        ret.data = err.response.data.transactionId;
        event.sender.send('response_coupangapi_data_store_data', ret);
      }
    }
  })();
});

// 쿠팡파트너스 apikey 가져오기
ipcMain.on('request_coupangapi_data_load_data', (event, coupang_api) => {
  console.log('=== request_coupangapi_data_load_data ===');
  const ret = ipcDataType.res_coupang_api_load;

  if (typeof initStore.get('coupang_api') === undefined || typeof initStore.get('coupang_api') === 'undefined') {
    ret.status = 'error';
    ret.err = 'NODATA';
    ret.data = {};
  } else {
    ret.status = 'success';
    ret.err = '';
    ret.data = initStore.get('coupang_api');
  }

  console.log(ret);
  event.sender.send('response_coupangapi_data_load_data', ret);
});
