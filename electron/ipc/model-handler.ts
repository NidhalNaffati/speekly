import { ipcMain } from "electron";
import { deleteModel, downloadModel, cancelDownload, listAvailableModels } from "../utils/model-files-handler.ts";

const IPC_CHANNELS = {
  DOWNLOAD_MODEL: 'download-model',
  CANCEL_DOWNLOAD: 'cancel-download',
  DELETE_MODEL: 'delete-model',
  LIST_AVAILABLE_MODELS: 'list-available-models',
};

export function registerModelDownloadIPC() {
  ipcMain.on(IPC_CHANNELS.DOWNLOAD_MODEL, (_event, url, name) => {
    downloadModel(url, name);
  });

  ipcMain.on(IPC_CHANNELS.CANCEL_DOWNLOAD, (_event, name) => {
    cancelDownload(name);
  });

  ipcMain.on(IPC_CHANNELS.DELETE_MODEL, (_event, name) => {
    deleteModel(name);
  });

  ipcMain.handle(IPC_CHANNELS.LIST_AVAILABLE_MODELS, () => {
    return listAvailableModels();
  });
}
