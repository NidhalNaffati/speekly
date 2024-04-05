import path from "node:path";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import https from "https";

export function downloadFile(url: string) {
  const window = BrowserWindow.getFocusedWindow(); // Get the reference to the focused window

  const fileName = path.basename(url); // Extracting the file name from the provided URL
  const downloadDir = path.join(app.getAppPath(), "models"); // Generating the directory path where the file will be downloaded
  const downloadPath = path.join(downloadDir, fileName); // Generating the full path for the downloaded file

  try {
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(downloadDir)) {
      console.log(`Creating directory: ${downloadDir}`)
      fs.mkdirSync(downloadDir, { recursive: true }); // Creating the directory recursively if it doesn't exist
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
        });

        response.on("end", () => { // Handling end of response
          file.end(); // Closing the file stream
          console.log(`Download complete: ${downloadPath}`); // Logging download completion
          if (window) {
            window.webContents.send('download-complete', "Download Complete from the main process"); // Sending a message to the renderer process indicating download completion
          }
        });

      } else {
        file.close(); // Closing the file stream
        fs.unlinkSync(downloadPath); // Deleting the incomplete file
        console.error(`Error downloading file: Status Code ${response.statusCode}`); // Logging the error due to unsuccessful response status code
      }
    });

    request.on("error", err => { // Handling request error
      fs.unlinkSync(downloadPath); // Deleting the file if there's an error during download
      console.error(`Error downloading file: ${err.message}`); // Logging the error message
    });
  } catch (error) {
    console.error(`Error downloading file: ${error}`); // Catching and logging any error occurred during the download process
  }
}
