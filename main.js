"use strict";

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const defaultCharacter = { id: "dropszeusz", name: "Dropszeusz" };
const emptyData = {
  version: 1,
  tasks: [],
  dayNotes: [],
  dayFinances: [],
  huntCounts: [],
  skillBooks: [],
  biologStages: [],
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
  if (data.dayFinances !== undefined) {
    if (!Array.isArray(data.dayFinances) || data.dayFinances.length > 100000) return false;
    const financeKeys = new Set();
    for (const finance of data.dayFinances) {
      if (
        !finance || typeof finance.characterId !== "string" ||
        !characterIds.has(finance.characterId) ||
        typeof finance.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(finance.date) ||
        !Number.isSafeInteger(finance.earned) || finance.earned < 0 ||
        !Number.isSafeInteger(finance.spent) || finance.spent < 0
      ) {
        return false;
      }
      const key = `${finance.characterId}\u0000${finance.date}`;
      if (financeKeys.has(key)) return false;
      financeKeys.add(key);
    }
  }
  if (data.dayNotes !== undefined) {
    if (!Array.isArray(data.dayNotes) || data.dayNotes.length > 100000) return false;
    for (const note of data.dayNotes) {
      if (
        !note || typeof note.characterId !== "string" ||
        !characterIds.has(note.characterId) ||
        typeof note.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(note.date) ||
        typeof note.text !== "string"
      ) {
        return false;
      }
    }
  }
  if (data.huntCounts !== undefined) {
    if (!Array.isArray(data.huntCounts) || data.huntCounts.length > 100000) return false;
    const countKeys = new Set();
    for (const count of data.huntCounts) {
      if (
        !count || typeof count.characterId !== "string" ||
        !characterIds.has(count.characterId) ||
        typeof count.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(count.date) ||
        !Number.isSafeInteger(count.metins) || count.metins < 0 ||
        !Number.isSafeInteger(count.bosses) || count.bosses < 0 ||
        !Number.isSafeInteger(count.miniBosses) || count.miniBosses < 0 ||
        (count.easy !== undefined && (!Number.isSafeInteger(count.easy) || count.easy < 0)) ||
        (count.medium !== undefined && (!Number.isSafeInteger(count.medium) || count.medium < 0)) ||
        (count.hard !== undefined && (!Number.isSafeInteger(count.hard) || count.hard < 0))
      ) {
        return false;
      }
      const key = `${count.characterId}\u0000${count.date}`;
      if (countKeys.has(key)) return false;
      countKeys.add(key);
    }
  }
  if (data.skillBooks !== undefined) {
    if (!Array.isArray(data.skillBooks) || data.skillBooks.length > 10000) return false;
    if (!data.skillBooks.every(item =>
      item && typeof item.characterId === "string" && characterIds.has(item.characterId) &&
      typeof item.id === "string" && typeof item.name === "string" &&
      typeof item.level === "string" && Number.isSafeInteger(item.progress) && item.progress >= 0 &&
      Number.isSafeInteger(item.target) && item.target > 0 &&
      (
        (Number.isSafeInteger(item.cooldownMinutes) && item.cooldownMinutes > 0) ||
        (typeof item.cooldownHours === "number" && item.cooldownHours > 0)
      ) &&
      (item.readyAt === null || (typeof item.readyAt === "string" && !Number.isNaN(Date.parse(item.readyAt))))
    )) return false;
  }
  if (data.biologStages !== undefined) {
    if (!Array.isArray(data.biologStages) || data.biologStages.length > 10000) return false;
    if (!data.biologStages.every(item =>
      item && typeof item.characterId === "string" && characterIds.has(item.characterId) &&
      typeof item.id === "string" && typeof item.name === "string" &&
      Number.isSafeInteger(item.progress) && item.progress >= 0 &&
      Number.isSafeInteger(item.target) && item.target > 0 &&
      (
        (Number.isSafeInteger(item.cooldownMinutes) && item.cooldownMinutes > 0) ||
        (typeof item.cooldownHours === "number" && item.cooldownHours > 0)
      ) &&
      (item.readyAt === null || (typeof item.readyAt === "string" && !Number.isNaN(Date.parse(item.readyAt))))
    )) return false;
  }
  return data.tasks.every(task =>
    task && typeof task.id === "string" &&
    typeof task.title === "string" && task.title.trim() &&
    task.title.length <= 120 && typeof task.date === "string" &&
    typeof task.done === "boolean" &&
    (task.dates === undefined || (
      Array.isArray(task.dates) && task.dates.length > 0 &&
      task.dates.every(date => typeof date === "string") &&
      task.dates.includes(task.date)
    )) &&
    (task.completedDates === undefined || (
      Array.isArray(task.completedDates) &&
      task.completedDates.every(date =>
        typeof date === "string" && (task.dates || [task.date]).includes(date)
      )
    )) &&
    (task.completedAtByDate === undefined || (
      task.completedAtByDate && typeof task.completedAtByDate === "object" &&
      !Array.isArray(task.completedAtByDate) &&
      Object.entries(task.completedAtByDate).every(([date, timestamp]) =>
        (task.dates || [task.date]).includes(date) &&
        typeof timestamp === "string" && !Number.isNaN(Date.parse(timestamp))
      )
    )) &&
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

function writeDataSync(data) {
  if (!isValidData(data)) throw new Error("Dane zadań lub postaci mają nieprawidłowy format.");
  fsSync.mkdirSync(path.dirname(dataFile), { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.tmp`;
  const file = fsSync.openSync(temporaryFile, "w");
  try {
    fsSync.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    fsSync.fsyncSync(file);
  } finally {
    fsSync.closeSync(file);
  }
  fsSync.renameSync(temporaryFile, dataFile);
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

ipcMain.on("metin:data:save-sync", (event, data) => {
  try {
    writeDataSync(data);
    event.returnValue = { saved: true, dataPath: dataFile };
  } catch (error) {
    event.returnValue = { saved: false, error: error.message };
  }
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
