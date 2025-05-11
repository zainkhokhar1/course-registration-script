const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('login-details', async (event, credentials) => {
  const { misId, password } = credentials;
  const desktopPath = path.join(os.homedir(), 'Desktop');

  const options = new chrome.Options();

  options.setUserPreferences({
    'savefile.default_directory': desktopPath,
    'printing.print_preview_sticky_settings.appState': JSON.stringify({
      version: 2,
      recentDestinations: [{
        id: 'Save as PDF',
        origin: 'local',
        account: '',
      }],
      selectedDestinationId: 'Save as PDF',
      destinationDefaults: {},
    }),
    'savefile.autodownload': true,
  });

  options.addArguments('--kiosk-printing');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get("http://111.68.99.168/Login101.aspx");

    await driver.wait(until.elementLocated(By.id('ctl00_AccountPlaceHolder_TextBox1')), 10000);
    await driver.findElement(By.id('ctl00_AccountPlaceHolder_TextBox1')).sendKeys(misId);
    await driver.findElement(By.id('ctl00_AccountPlaceHolder_TextBox2')).sendKeys(password);
    await driver.findElement(By.name('ctl00$AccountPlaceHolder$btnLogin')).click();

    await driver.findElement(By.className('dashboard-module')).click();
    await driver.findElement(By.id('ctl00_ContentPlaceHolder1_HyperLink1')).click();
    await driver.findElement(By.id('ctl00_ContentPlaceHolder1_btnNext')).click();
    await driver.findElement(By.id('ctl00_ContentPlaceHolder1_btnFin')).click();
    await driver.findElement(By.id('ctl00_ContentPlaceHolder1_lnkForm')).click();

    await driver.sleep(3000);

    // Trigger silent PDF print
    await driver.executeScript('window.print();');

    await driver.sleep(3000);

    console.log("✅ PDF saved to Desktop!");
    event.reply('automation-complete', 'PDF saved to Desktop!');
  } catch (error) {
    console.error("❌ Error during automation:", error);
    event.reply('automation-error', error.message);
  } finally {
    await driver.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
