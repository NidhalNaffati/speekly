// Main IPC handler for scripts
import {ipcMain} from "electron";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import {loadScripts, saveScripts, backupScript, getScriptsFilePath, getBackupsDirectory} from "../utils/script-handler.ts";

// Define IPC channel names
const IPC_CHANNELS = {
    SAVE_SCRIPTS: 'save-scripts',
    LOAD_SCRIPTS: 'load-scripts',
    BACKUP_SCRIPT: 'backup-script',
    GET_SCRIPTS_PATH: 'get-scripts-path',
    GET_BACKUPS_PATH: 'get-backups-path'
};

export function initializeScriptsIPC() {
    ipcMain.handle(IPC_CHANNELS.SAVE_SCRIPTS, (_event: IpcMainInvokeEvent, filename: string, data: string) => {
        return saveScripts(filename, data);
    });

    ipcMain.handle(IPC_CHANNELS.LOAD_SCRIPTS, (_event: IpcMainInvokeEvent, filename: string) => {
        return loadScripts(filename);
    });

    ipcMain.handle(IPC_CHANNELS.BACKUP_SCRIPT, (_event: IpcMainInvokeEvent, filename: string, data: string) => {
        return backupScript(filename, data);
    });

    ipcMain.handle(IPC_CHANNELS.GET_SCRIPTS_PATH, () => {
        return getScriptsFilePath();
    });

    ipcMain.handle(IPC_CHANNELS.GET_BACKUPS_PATH, () => {
        return getBackupsDirectory();
    });
}