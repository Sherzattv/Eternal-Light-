const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let controllerWindow;
let displayWindow;

function createWindows() {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
    });

    // 1. Окно оператора (Пульт)
    controllerWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        title: "Вечный Свет - Пульт",
        webPreferences: {
            nodeIntegration: true, // Внимание: для простоты, в продакшене лучше contextIsolation
            contextIsolation: false
        }
    });
    controllerWindow.loadFile('controller.html');

    // 2. Окно трансляции (Экран)
    let displayOpts = {
        width: 800,
        height: 600,
        title: "Вечный Свет - Экран",
        show: false, // Пока не покажем явно
        frame: false, // Без рамок
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    };

    if (externalDisplay) {
        displayOpts.x = externalDisplay.bounds.x + 50;
        displayOpts.y = externalDisplay.bounds.y + 50;
        displayOpts.fullscreen = true; // Сразу на весь экран второго монитора
    }

    displayWindow = new BrowserWindow(displayOpts);
    displayWindow.loadFile('display.html');

    if (externalDisplay) {
        displayWindow.show();
    }

    // Слушаем закрытие пульта, чтобы закрыть всё
    controllerWindow.on('closed', () => {
        app.quit();
    });

    // Логика открытия окна трансляции по кнопке (если оно было закрыто)
    // В веб-версии это window.open, тут можно управлять через IPC, но пока оставим как есть.
}

app.whenReady().then(() => {
    createWindows();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
