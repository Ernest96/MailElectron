require('electron-reload')(__dirname);

const CredentialsManager = require('./js/utils/credentialsManager');
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const credentialsManager = new CredentialsManager();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    minWidth: 1050,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
  })

  mainWindow.loadFile('./html/login.html')

  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on('get-credentials', (event) => {
    let email = credentialsManager.getEmail();
    let password = credentialsManager.getPassword();

    console.log('getting ', email, password)
    event.returnValue = {
      "email": email,
      "password": password
    }
  });


  ipcMain.on('clear-credentials', () => {
    credentialsManager.clearCredentials();
  });

  ipcMain.on('is-logged-in', (event) => {
    event.returnValue = credentialsManager.isLoggedIn();
  });

  ipcMain.on('set-credentials', (event, email, password) => {
    credentialsManager.setEmailAndPassword(email, password);
    event.returnValue = true;
  });

  ipcMain.on('show-app', () => {
    mainWindow.loadFile('./html/app.html') // For testing purposes only
      .then(() => { window.show(); })
  });

})

app.on('window-all-closed', function () {
  app.quit()
})
