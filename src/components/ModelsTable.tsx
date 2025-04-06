import {useState, useEffect, useRef} from 'react';
import {Download, Trash2, X, Clock} from 'lucide-react';
import {ModelItem} from "../types/ModelItem";
import {useToast} from "@/hooks/use-toast";

interface DownloadInfo {
  progress: number;
  startTime: number;
  estimatedTimeRemaining: string | null;
}

interface ModelsTableProps {
  models: ModelItem[];
  language: string;
}

const ModelsTable = ({models, language}: ModelsTableProps) => {
  // Local state for managing downloads
  const [downloads, setDownloads] = useState<Record<string, DownloadInfo>>({});
  const [modelsData, setModelsData] = useState<ModelItem[]>(models);
  const {toast} = useToast();

  // Use refs to avoid table rerendering issues
  const downloadsRef = useRef<Record<string, DownloadInfo>>({});

  useEffect(() => {
    setModelsData(models);
  }, [models]);

  useEffect(() => {
    // Set up IPC listeners for download events
    const onDownloadProgress = (_event: any, modelName: string, progress: number) => {
      // Update progress without causing full re-render
      downloadsRef.current = {
        ...downloadsRef.current,
        [modelName]: {
          ...downloadsRef.current[modelName],
          progress: Number(progress)
        }
      };

      // Calculate estimated time remaining
      const download = downloadsRef.current[modelName];
      if (download && download.startTime && progress > 0) {
        const elapsedTime = (Date.now() - download.startTime) / 1000; // in seconds
        const totalTime = elapsedTime / (progress / 100);
        const remainingTime = totalTime - elapsedTime;

        let timeString: string;
        if (remainingTime < 60) {
          timeString = `${Math.ceil(remainingTime)}s`;
        } else if (remainingTime < 3600) {
          timeString = `${Math.ceil(remainingTime / 60)}m`;
        } else {
          timeString = `${Math.floor(remainingTime / 3600)}h ${Math.ceil((remainingTime % 3600) / 60)}m`;
        }

        downloadsRef.current[modelName].estimatedTimeRemaining = timeString;
      }

      // Update state periodically to trigger render
      setDownloads({...downloadsRef.current});
    };

    const onDownloadComplete = (_event: any, modelName: string) => {
      // Remove from active downloads
      const newDownloads = {...downloadsRef.current};
      delete newDownloads[modelName];
      downloadsRef.current = newDownloads;
      setDownloads(newDownloads);

      // Update local model data to show as downloaded
      setModelsData(prevModels =>
        prevModels.map(model =>
          model.Model === modelName ? {...model, Downloaded: true} : model
        )
      );

      toast({
        title: "Download Complete",
        description: `${modelName} has been downloaded successfully.`,
      });
    };

    const onDownloadError = (_event: any, modelName: string, errorMessage: string) => {
      // Remove from active downloads
      const newDownloads = {...downloadsRef.current};
      delete newDownloads[modelName];
      downloadsRef.current = newDownloads;
      setDownloads(newDownloads);

      toast({
        title: "Download Failed",
        description: errorMessage || `Failed to download ${modelName}.`,
        variant: "destructive"
      });
    };

    const onDeleteComplete = (_event: any, modelName: string) => {
      // Update local model data to show as not downloaded
      setModelsData(prevModels =>
        prevModels.map(model =>
          model.Model === modelName ? {...model, Downloaded: false} : model
        )
      );

      toast({
        title: "Model Deleted",
        description: `${modelName} has been removed.`,
      });
    };

    // Register event listeners
    window.ipcRenderer.on('download-progress', onDownloadProgress);
    window.ipcRenderer.on('download-complete', onDownloadComplete);
    window.ipcRenderer.on('download-error', onDownloadError);
    window.ipcRenderer.on('delete-complete', onDeleteComplete);

    return () => {
      // Clean up event listeners
      window.ipcRenderer.removeListener('download-progress', onDownloadProgress);
      window.ipcRenderer.removeListener('download-complete', onDownloadComplete);
      window.ipcRenderer.removeListener('download-error', onDownloadError);
      window.ipcRenderer.removeListener('delete-complete', onDeleteComplete);
    };
  }, [toast]);

  const handleDownload = (modelUrl: string, modelName: string) => {
    // Start a new download
    const newDownloads = {
      ...downloadsRef.current,
      [modelName]: {
        progress: 0,
        startTime: Date.now(),
        estimatedTimeRemaining: null
      }
    };

    downloadsRef.current = newDownloads;
    setDownloads(newDownloads);

    // Send download request to main process
    window.ipcRenderer.send('download-model', modelUrl, modelName);
  };

  const handleCancelDownload = (modelName: string) => {
    // Send cancel request to main process
    window.ipcRenderer.send('cancel-download', modelName);

    // Remove from active downloads
    const newDownloads = {...downloadsRef.current};
    delete newDownloads[modelName];
    downloadsRef.current = newDownloads;
    setDownloads(newDownloads);

    toast({
      title: "Download Cancelled",
      description: `Download of ${modelName} was cancelled.`,
    });
  };

  const handleDelete = (modelName: string) => {
    // Send delete request to main process
    window.ipcRenderer.send('delete-model', modelName);

    toast({
      title: "Deleting...",
      description: `Removing ${modelName}...`,
    });
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h2 className="text-xl font-semibold">{language}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
          <tr className="bg-muted/50 text-sm">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/5">Model</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/12">Size</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/6">Word Error/Speed</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/4">Notes</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/12">License</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground w-1/5">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-border">
          {modelsData.map((item, index) => {
            const downloadInfo = downloads[item.Model];

            return (
              <tr key={index} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{item.Model}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.Size}</td>
                <td className="px-4 py-3 text-muted-foreground">{item['Word error rate/Speed']}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.Notes}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.License}</td>
                <td className="px-4 py-3 text-right h-14"> {/* Fixed height to prevent shaking */}
                  {item.Downloaded ? (
                    <button
                      className="inline-flex items-center px-3 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      onClick={() => handleDelete(item.Model)}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5"/> Delete
                    </button>
                  ) : downloadInfo ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center justify-end space-x-2 w-full">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full speekly-gradient rounded-full transition-all duration-300"
                            style={{width: `${downloadInfo.progress}%`}}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-12 text-right">{downloadInfo.progress.toFixed(0)}%</span>
                        <button
                          onClick={() => handleCancelDownload(item.Model)}
                          className="ml-1 text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                          title="Cancel download"
                        >
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                      {downloadInfo.estimatedTimeRemaining && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1"/>
                          <span>{downloadInfo.estimatedTimeRemaining} remaining</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center px-3 py-1.5 rounded speekly-gradient text-white hover:shadow-md transition-all"
                      onClick={() => handleDownload(item.URL, item.Model)}
                    >
                      <Download className="w-4 h-4 mr-1.5"/> Download
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelsTable;
