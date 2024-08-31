const { app, BrowserWindow, Menu, dialog } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      //preload : path.join(__dirname, "renderer/preload.js")
      nodeIntegration: true, //允许渲染进程使用Nodejs
      contextIsolation: false, //允许渲染进程使用Nodejs
    },
    autoHideMenuBar: true,
  });

  let template = [
    {
      label: "帮助",
      submenu: [
        {
          label: "控制台",
          click: () => {
            win.webContents.openDevTools();
          },
        },
        { label: "关于" },
      ],
    },
  ];

  let m = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(m);

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});
