import {ipcMain} from "electron";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import {getDefaultSettings, getParameter, loadSettings, saveSettings, updateParameter} from "../utils/app-settings.ts";

// Define IPC channel names
const IPC_CHANNELS = {
  GET_SETTINGS: 'get-settings',
  GET_DEFAULT_SETTINGS: 'get-default-settings',
  GET_PARAMETER: 'get-parameter',
  SAVE_SETTINGS: 'save-settings',
  UPDATE_PARAMETER: 'update-parameter'
};

export function initializeSettingsIPC() {

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return loadSettings();
  });

  ipcMain.handle(IPC_CHANNELS.GET_DEFAULT_SETTINGS, () => {
    return getDefaultSettings();
  });

  ipcMain.handle(IPC_CHANNELS.GET_PARAMETER, (_even: IpcMainInvokeEvent, parameter) => {
    return getParameter(parameter);
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_PARAMETER, (_even: IpcMainInvokeEvent, parameter, value) => {
    updateParameter(parameter, value);
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_even: IpcMainInvokeEvent, settings) => {
    saveSettings(settings);
  });

}
