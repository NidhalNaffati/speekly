import {BrowserWindow} from "electron";
import {initializeSettingsIPC} from './settings';
import {registerModelDownloadIPC} from "./model-handler.ts";
import {registerVoskIPC} from "./vosk.ts";
import {initializeScriptsIPC} from "./scripts.ts";

export function registerIPCHandlers(window: BrowserWindow) {
    initializeScriptsIPC();
    initializeSettingsIPC();
    registerModelDownloadIPC();
    registerVoskIPC(window);
}