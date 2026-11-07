"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("metinDesktop", Object.freeze({
  loadData: fallbackData => ipcRenderer.invoke("metin:data:load", fallbackData),
  saveData: data => ipcRenderer.invoke("metin:data:save", data),
  showDataFolder: () => ipcRenderer.invoke("metin:data:show-folder")
}));
