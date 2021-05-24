const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const initStore = new Store();

ipcMain.on('request_main_store_main_data', (event, data) => {
	console.log('=== request_main_store_main_data ===')
	const account = JSON.stringify(data.account);
	const coupangAPI = JSON.stringify(data.coupangAPI);
	const content = JSON.stringify(data.content);
	console.log(coupangAPI);
	let pythonPath = 'python3';
	const scriptPath = './public/assets/scripts/python/main.py';

	if (process.platform === 'win32') pythonPath = './public/assets/ext_modules/portable_python/python.exe';

	const { spawn } = require('child_process');
	const pyShell = spawn(pythonPath, [scriptPath, account, content, coupangAPI]);

	pyShell.stdout.on('data', (data) => {
			console.log(`stdout : ${data}`);
	});
	pyShell.stderr.on('data', (data) => {
			console.log(`stderr : ${data}`);
	});
	pyShell.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
	});
});
