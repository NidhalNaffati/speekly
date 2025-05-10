import {app} from "electron";
import path from "node:path";
import * as fs from "fs";

const userDataPath = app.getPath('userData');
const settingsFilePath = path.join(userDataPath, 'settings.json');

interface Settings {
  model: string;
  wordSimilarityPercentage: number;
}

const defaultSettings: Settings = {
  model: "vosk-model-en-us-0.22",
  wordSimilarityPercentage: 80,
};

export function loadSettings() {
  try {
    // If the settings file it doesn't exist, create it with default settings
    if (!fs.existsSync(settingsFilePath)) {
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 4), "utf8");
      console.log("Settings file created with default values.");
      return defaultSettings;
    }

    // Read the file synchronously
    const settingsData = fs.readFileSync(settingsFilePath, "utf8");
    // Parse JSON data
    return JSON.parse(settingsData);

  } catch (error) {
    console.error("Error reading settings:", error);
    return getDefaultSettings();
  }
}

export function getParameter(parameter: string) {
  const settings = loadSettings();
  // read the parameter from the settings
  return settings[parameter];
}

export function saveSettings(settings: Settings) {
  try {
    console.log("Saving settings ... ", settings);
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export function updateParameter(parameter: string, value: string) {
  const settings = loadSettings();
  settings[parameter] = value;
  saveSettings(settings);
}

export function getDefaultSettings() {
  // write the default settings to the file
  saveSettings(defaultSettings);
  return defaultSettings;
}
