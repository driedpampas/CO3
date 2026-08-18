const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronCookies', {
    set: (url, name, value) => ipcRenderer.invoke('cookie-set', url, name, value),
    get: url => ipcRenderer.invoke('cookie-get', url),
    clearAll: () => ipcRenderer.invoke('cookie-clear'),
});

contextBridge.exposeInMainWorld('electronDB', {
    exec: (sql, params) => ipcRenderer.invoke('db:exec', sql, params),
    transaction: ops => ipcRenderer.invoke('db:transaction', ops),
});
