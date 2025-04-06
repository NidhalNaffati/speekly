import path from "node:path";
import {app, BrowserWindow} from "electron";
import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";
import {ModelItem} from "@/types/ModelItem.ts";

const MODELS_DIR_PATH = path.join(app.getAppPath(), 'models');
const MODELS_LIST_PATH = path.join(app.getAppPath(), 'src', 'data', 'models-list.json');

// Track active downloads to enable cancellation
const activeDownloads = new Map();

export function downloadModel(url: string, name: string) {
  const window = BrowserWindow.getFocusedWindow(); // Get the reference to the focused window

  const fileName = path.basename(url); // Extracting the file name from the provided URL
  const downloadPath = path.join(MODELS_DIR_PATH, fileName); // Generating the full path for the downloaded file

  try {
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(MODELS_DIR_PATH)) {
      console.log(`Creating directory: ${MODELS_DIR_PATH}`)
      fs.mkdirSync(MODELS_DIR_PATH, {recursive: true}); // Creating the directory recursively if it doesn't exist
    }

    const file = fs.createWriteStream(downloadPath); // Creating a writable stream to write the downloaded data into a file

    const request = https.get(url, response => { // Making a GET request to the provided URL
      if (response.statusCode === 200) { // Checking if the response status code is successful
        let downloadedBytes = 0; // Variable to track the downloaded bytes
        let totalBytes: number | undefined = undefined; // Variable to store the total bytes of the response, if available

        if (response.headers['content-length']) { // Checking if the response contains content length header
          totalBytes = parseInt(response.headers['content-length'], 10); // Parsing the content length to get the total bytes
        }

        response.on('data', chunk => { // Handling data received in chunks
          downloadedBytes += chunk.length; // Updating the downloaded bytes counter
          const progress = totalBytes ? (downloadedBytes / totalBytes) * 100 : 0; // Calculating the download progress percentage
          console.log(`Downloaded ${progress.toFixed(2)}%`); // Logging the download progress
          file.write(chunk); // Writing the received data chunk to the file

          // Sending download progress to the renderer process
          window?.webContents.send('download-progress', name, progress.toFixed(2));
        });

        response.on("end", () => { // Handling end of response
          file.end(); // Closing the file stream
          console.log(`Download complete: ${downloadPath}`); // Logging download completion
          // Clean up the active download reference
          activeDownloads.delete(name);
          // Extract and update model status
          extractFiles(downloadPath, MODELS_DIR_PATH, name);
        });

      } else {
        file.close(); // Closing the file stream
        fs.unlinkSync(downloadPath); // Deleting the incomplete file
        window?.webContents.send('download-error', name, `Error: HTTP ${response.statusCode}`); // Sending the error message to the renderer process
        console.error(`Error downloading file: Status Code ${response.statusCode}`); // Logging the error due to unsuccessful response status code
        activeDownloads.delete(name);
      }
    });

    // Store reference to the request for potential cancellation
    activeDownloads.set(name, {request, file, downloadPath});

    request.on("error", err => { // Handling request error
      // Handle the error message type
      if (err.message === 'getaddrinfo EAI_AGAIN alphacephei.com') {
        window?.webContents.send('download-error', name, 'Make sure that you are connected to the internet'); // Sending the error message to the renderer process
        console.error(`Error downloading file: ${err.message}`); // Logging the error message
      } else {
        if (fs.existsSync(downloadPath)) {
          fs.unlinkSync(downloadPath); // Deleting the file if there's an error during download
        }
        window?.webContents.send('download-error', name, 'Error during the download process'); // Sending the error message to the renderer process
        console.error(`Error downloading file: ${err.message}`); // Logging the error message
      }
      activeDownloads.delete(name);
    });
  } catch (error) {
    window?.webContents.send('download-error', name, 'Error initiating download'); // Sending the error message to the renderer process
    console.error(`Error downloading file: ${error}`); // Catching and logging any error occurred during the download process
    activeDownloads.delete(name);
  }
}

export function cancelDownload(modelName: string) {
  const download = activeDownloads.get(modelName);
  if (download) {
    const {request, file, downloadPath} = download;

    // Abort the request
    if (request && request.abort) {
      request.abort();
    }

    // Close and delete the partial file
    if (file) {
      file.close();
    }

    if (fs.existsSync(downloadPath)) {
      try {
        fs.unlinkSync(downloadPath);
      } catch (error) {
        console.error(`Error deleting partial download: ${error}`);
      }
    }

    // Remove from active downloads
    activeDownloads.delete(modelName);

    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.send('download-cancelled', modelName);
    }

    console.log(`Download cancelled for model: ${modelName}`);
  }
}

function extractFiles(zipPath: string, extractDir: string, modelName: string) {
  const window = BrowserWindow.getFocusedWindow(); // Get the reference to the focused window

  try {
    const zip = new AdmZip(zipPath); // Creating a new instance of AdmZip with the downloaded zip file
    zip.extractAllTo(extractDir, true); // Extracting the contents of the zip file to the provided directory
    updateModelDownloadStatus(modelName, true); // Updating the downloaded status
    window?.webContents.send('download-complete', modelName); // Sending a message to the renderer process indicating download completion
    console.log(`Extracted files to: ${extractDir}`); // Logging the extraction completion
  } catch (error) {
    window?.webContents.send('download-error', modelName, 'Error during extraction'); // Sending the error message to the renderer process
    console.error(`Error extracting files: ${error}`); // Catching and logging any error occurred during the extraction process
  } finally {
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath); // Deleting the downloaded zip file after extraction
      console.log(`Deleted zip file: ${zipPath}`); // Logging the deletion of the zip file
    }
  }
}

export function deleteModel(modelName: string): void {
  const window = BrowserWindow.getFocusedWindow();
  try {
    if (fs.existsSync(MODELS_DIR_PATH)) { // Checking if the model directory exists
      // Only delete specific model folder rather than entire models directory
      const modelPath = path.join(MODELS_DIR_PATH, modelName);
      if (fs.existsSync(modelPath)) {
        fs.rmSync(modelPath, {recursive: true}); // Delete just this model's directory
        console.log(`Model ${modelName} deleted successfully.`);
        updateModelDownloadStatus(modelName, false); // updating the downloaded status
        window?.webContents.send('delete-complete', modelName);
      } else {
        console.error(`Model ${modelName} not found.`);
        window?.webContents.send('delete-error', modelName, 'Model not found');
      }
    } else {
      console.error(`Models directory not found.`);
      window?.webContents.send('delete-error', modelName, 'Models directory not found');
    }
  } catch (err) {
    console.error('Error deleting model:', err);
    window?.webContents.send('delete-error', modelName, 'Error deleting model');
  }
}

export function listAvailableModels(): string[] {
  try {
    if (!fs.existsSync(MODELS_DIR_PATH)) {
      return [];
    }
    const models = fs.readdirSync(MODELS_DIR_PATH); // Reading the contents of the models directory
    console.log('Available models:', models)
    return models;
  } catch (err) {
    console.error('Error listing models:', err);
    return [];
  }
}

function updateDownloadStatus(models: ModelItem[], modelName: string, status: boolean): ModelItem[] {
  return models.map(model => { // Mapping over the models list
    if (model.Model === modelName) { // Checking if the model name matches the provided model name
      return {
        ...model, // Keeping the existing model data
        Downloaded: status // Updating the downloaded status of the model
      };
    }
    return model;
  });
}

function updateModelDownloadStatus(modelName: string, status: boolean): void {
  fs.readFile(MODELS_LIST_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    try {
      const models: ModelItem[] = JSON.parse(data);
      const updatedModels = updateDownloadStatus(models, modelName, status);
      const updatedData = JSON.stringify(updatedModels, null, 4);

      fs.writeFile(MODELS_LIST_PATH, updatedData, 'utf8', err => {
        if (err) {
          console.error('Error writing to file:', err);
          return;
        }
      });
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}
