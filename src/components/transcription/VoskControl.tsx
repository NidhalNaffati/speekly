import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Play, Square, Loader} from "lucide-react";
import MicState from "./MicState";
import {IpcRenderer} from "electron";

// Access the ipcRenderer from the window object
const ipcRenderer: IpcRenderer = window.ipcRenderer;

function VoskControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    ipcRenderer.on("vosk-status", (_event, started) => {
      console.log("Received vosk-status event: ", started ? "started" : "stopped");
      setIsRunning(started);
      setIsLoading(false); // Stop loading when status is received
    });

    return () => {
      ipcRenderer.removeAllListeners("vosk-status");
    };
  }, []);

  function startVosk() {
    setIsLoading(true); // Start loading when the button is clicked
    ipcRenderer.send("start-recognition");
  }

  function stopVosk() {
    ipcRenderer.send("stop-recognition");
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button
        onClick={isRunning ? stopVosk : startVosk}
        disabled={isLoading}
        variant={isRunning ? "destructive" : "default"}
        className="w-40 gap-2"
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin"/>
        ) : isRunning ? (
          <Square className="h-4 w-4"/>
        ) : (
          <Play className="h-4 w-4"/>
        )}
        {isLoading ? "Loading" : isRunning ? "Stop" : "Record"}
      </Button>
      <MicState/>
    </div>
  );
}

export default VoskControl;
