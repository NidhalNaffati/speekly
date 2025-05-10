import childProcess from "child_process";
import {BrowserWindow} from "electron";
import path from "node:path";
import {getParameter} from "../app-settings.ts";

function startVoskProcess(win: BrowserWindow) {
  console.log("Starting Vosk process...");

  // Get the current model from the settings
  const model = getParameter("model");
  const modelPath = `models/${model}`;

  // Spawn the Vosk process with Node inspector enabled
  const voskProcess = childProcess.spawn(
    "node", // Use the Node.js executable
    [
      "--inspect", // Enable the Node inspector
      path.join(__dirname, "../electron/utils/vosk-process/transcription.js"), // Path to the transcription script
      modelPath // Path to the Vosk model
    ],
    { // Pipe the child process' stdout and stderr to the parent process
      stdio: ["pipe", "pipe", process.stdout, "ipc"],
    }
  );

  // Define interfaces for the message structure
  interface Message {
    modelExists?: boolean;
    modelLoaded?: boolean;
    started?: boolean;
    error?: string;
  }

  // Listen for messages from the child process and log them
  voskProcess.on("message", (message: Message) => {
    const {modelExists, modelLoaded, started, error} = message;

    if (modelExists !== undefined) {
      console.log(modelExists ? "Model exists ✅ " : "Model does not exist ❌");
    }

    if (modelLoaded !== undefined) {
      console.log(modelLoaded ? "Model loaded  ✅ " : "Model loading failed ❌");
    }

    if (started !== undefined) {
      console.log(started ? "Vosk started  ✅ " : "Vosk starting failed ❌");
      win?.webContents.send("vosk-status", true);
    }

    if (error !== undefined) {
      console.log(error);
    }
  });


  // Define interfaces for the message structure
  interface PartialResultMessage {
    partialResult: {
      partial: string;
    };
  }

  // Listen for messages from the child process
  voskProcess.on("message", (message: PartialResultMessage) => {
    if (message.partialResult) {
      const partialResult = message.partialResult.partial; // Extract the 'partial' value as a string
      // Send the partial result to the renderer process
      win?.webContents.send("recognized-text", partialResult);
      console.log(`>> ${partialResult}`);
    }
  });

  // Handle server process errors
  voskProcess.on("error", (err) => {
    console.error("Server process error:", err);
  });

  // Handle server process exit
  voskProcess.on("exit", (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  });

  return voskProcess;
}

function stopVoskProcess(voskProcess: childProcess.ChildProcess, win: BrowserWindow) {
  win?.webContents.send("vosk-status", false);
  if (voskProcess) {
    console.log("Killing Vosk process...");
    voskProcess.kill();
  }
}

export {startVoskProcess, stopVoskProcess};
