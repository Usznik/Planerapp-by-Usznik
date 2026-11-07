"use strict";

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const defaultCharacter = { id: "dropszeusz", name: "Dropszeusz" };
const emptyData = {
  version: 1,
  tasks: [],
  characters: [defaultCharacter],
  selectedCharacterId: defaultCharacter.id
};
const dataFile = path.join(app.getPath("userData"), "metin-plan.json");

function isValidData(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.tasks) || !Array.isArray(data.characters)) {
    return false;
  }
  if (data.characters.length === 0 || data.tasks.length > 10000 || data.characters.length > 100) {
    return false;
  }

  const characterIds = new Set();
  for (const character of data.characters) {
    if (
      !character || typeof character.id !== "string" ||
      typeof character.name !== "string" || !character.name.trim() ||
      character.name.length > 40 || characterIds.has(character.id)
    ) {
      return false;
    }
    characterIds.add(character.id);
  }

  if (!characterIds.has(data.selectedCharacterId)) return false;
  return data.tasks.every(task =>
    task && typeof task.id === "string" &&
    typeof task.title === "string" && task.title.trim() &&
    task.title.length <= 120 && typeof task.date === "string" &&
    typeof task.done === "boolean" &&
    characterIds.has(task.characterId) &&
    (task.category === undefined || typeof task.category === "string") &&
    (task.note === undefined || typeof task.note === "string")
  );
}

async function writeData(data) {
  if (!isValidData(data)) throw new Error("Dane zadań lub postaci mają nieprawidłowy format.");
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.tmp`;
  const file = await fs.open(temporaryFile, "w");
  try {
    await file.writeFile(`${JSON.stringify(data, null, 2)}\n`, "utf8");
    await file.sync();
  } finally {
    await file.close();
  }
  await fs.rename(temporaryFile, dataFile);
}

ipcMain.handle("metin:data:load", async (_event, fallbackData) => {
  try {
    const contents = await fs.readFile(dataFile, "utf8");
    const data = JSON.parse(contents);
    if (!isValidData(data)) throw new Error("Plik z danymi ma nieprawidłowy format.");
    return { data, dataPath: dataFile };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;

    const packagedDataFile = path.join(app.getAppPath(), "data", "metin-plan.json");
    try {
      const contents = await fs.readFile(packagedDataFile, "utf8");
      const initialData = JSON.parse(contents);
      if (!isValidData(initialData)) throw new Error("Dołączony plik z danymi ma nieprawidłowy format.");
      await writeData(initialData);
      return { data: initialData, dataPath: dataFile };
    } catch (seedError) {
      if (seedError.code !== "ENOENT") throw seedError;
    }

    const initialData = isValidData(fallbackData) ? fallbackData : emptyData;
    await writeData(initialData);
    return { data: initialData, dataPath: dataFile };
  }
});

ipcMain.handle("metin:data:save", async (_event, data) => {
  await writeData(data);
  return { saved: true, dataPath: dataFile };
});

ipcMain.handle("metin:data:show-folder", async () => {
  const error = await shell.openPath(path.dirname(dataFile));
  if (error) throw new Error(error);
  return { opened: true };
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 360,
    minHeight: 600,
    title: "Metin2 — Dziennik wypraw",
    backgroundColor: "#171512",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
