import {useEffect, useState} from "react";
import {Mic, MicOff, AlertTriangle} from "lucide-react";
import {cn} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";

// Access the ipcRenderer from the window object without explicit import
const ipcRenderer = window.ipcRenderer;

function MicState() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied" | null>(null);
  const {toast} = useToast();

  useEffect(() => {
    // Listen for mic status updates from Electron
    ipcRenderer.on("vosk-status", (_event, started) => {
      setIsRunning(started);
    });

    // Listen for permission status updates
    ipcRenderer.on("mic-permission-status", (_event: any, status: "prompt" | "granted" | "denied") => {
      setPermissionStatus(status);

      // Show dialog immediately if permission is denied
      if (status === "denied") {
        setShowPermissionDialog(true);
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access in your system settings.",
          variant: "destructive",
        });
      } else if (status === "granted") {
        toast({
          title: "Microphone Access Granted",
          description: "You can now use the microphone features.",
        });
      }
    });

    // Check microphone permission on component mount
    ipcRenderer.send("check-mic-permission");

    return () => {
      ipcRenderer.removeAllListeners("vosk-status");
      ipcRenderer.removeAllListeners("mic-permission-status");
    };
  }, [toast]);

  const handleMicToggle = () => {
    if (permissionStatus === "denied") {
      setShowPermissionDialog(true);
    } else if (permissionStatus === "prompt") {
      handleRequestPermission();
    } else if (permissionStatus === "granted") {
      // Toggle microphone if we have permission
      ipcRenderer.send(isRunning ? "stop-mic" : "start-mic");
    }
  };

  const handleRequestPermission = () => {
    ipcRenderer.send("request-mic-permission");
    setShowPermissionDialog(false);
  };

  const openSystemSettings = () => {
    ipcRenderer.send("open-system-settings");
    setShowPermissionDialog(false);
  };

  return (
    <>
      {/* Mic status indicator */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all cursor-pointer",
          isRunning
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-destructive/10 text-destructive border-destructive/20"
        )}
        onClick={handleMicToggle}
      >
        {isRunning ? (
          <Mic className="h-4 w-4 animate-pulse"/>
        ) : (
          <MicOff className="h-4 w-4"/>
        )}
      </div>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500"/>
              Microphone Access Required
            </DialogTitle>
            <DialogDescription>
              This app needs access to your microphone for speech recognition features.
              Please enable microphone access in your system settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-muted-foreground">
              Without microphone access, you won't be able to use the voice recognition features.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="default" onClick={handleRequestPermission}>
                Request Permission
              </Button>
              <Button variant="secondary" onClick={openSystemSettings}>
                Open Settings
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MicState;
