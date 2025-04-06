import {ChangeEvent, useEffect, useState} from "react";
import {IpcRenderer} from "electron";
import {Save, Check, Settings as SettingsIcon, Sliders} from 'lucide-react';

const ipcRenderer: IpcRenderer = window.ipcRenderer;

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [model, setModel] = useState("");
  const [wordSimilarityPercentage, setWordSimilarityPercentage] = useState(0);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");

  useEffect(() => {
    // List all the available models
    ipcRenderer.invoke("list-available-models")
      .then((result) => {
        setAvailableModels(result);
      })
      .catch((error) => {
        console.error('Error listing models:', error);
      });
  }, []);

  useEffect(() => {
    // Get the settings from the main process
    ipcRenderer.invoke("get-settings").then((result) => {
      setSettings(result);
      setModel(result.model);
      setWordSimilarityPercentage(result.wordSimilarityPercentage);
    }).catch((error) => {
      console.error('Error getting settings:', error);
    });

    // Clean up on unmount
    return () => {
      ipcRenderer.removeAllListeners("get-settings");
    };
  }, []);

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setModel(event.target.value);
  };

  const handleWordSimilarityPercentageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWordSimilarityPercentage(parseInt(event.target.value));
  };

  const handleSaveSettings = () => {
    setSaveStatus("saving");
    ipcRenderer.invoke("save-settings", {model, wordSimilarityPercentage}).then(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    }).catch((error) => {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2000);
    });
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex space-x-1">
          <div className="w-2 h-8 bg-speekly-green rounded animate-wave-1"></div>
          <div className="w-2 h-8 bg-speekly-teal rounded animate-wave-2"></div>
          <div className="w-2 h-8 bg-speekly-blue rounded animate-wave-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center">
        <div className="p-3 rounded-full bg-primary/10 mr-4">
          <SettingsIcon className="w-6 h-6 text-primary"/>
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-muted-foreground">Configure your transcription preferences</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-speekly-teal"/>
            Model Configuration
          </h2>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="grid gap-4">
              <label htmlFor="model" className="text-sm font-medium">
                Transcription Model
              </label>
              <select
                id="model"
                value={model}
                onChange={handleModelChange}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
              >
                {availableModels.map((availableModel) => (
                  <option key={availableModel} value={availableModel}>{availableModel}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Select the model to use for audio transcription</p>
            </div>

            <div className="grid gap-4">
              <div className="flex justify-between">
                <label htmlFor="wordSimilarityPercentage" className="text-sm font-medium">
                  Word Similarity Threshold
                </label>
                <span className="text-sm font-medium text-primary">{wordSimilarityPercentage}%</span>
              </div>
              <input
                id="wordSimilarityPercentage"
                type="range"
                min="0"
                max="100"
                value={wordSimilarityPercentage}
                onChange={handleWordSimilarityPercentageChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the minimum similarity required for word matching during script comparison
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === "saving"}
              className={`speekly-gradient flex items-center px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-md ${
                saveStatus === "saving" ? "opacity-80" : ""
              }`}
            >
              {saveStatus === "saving" ? (
                <>Saving...</>
              ) : saveStatus === "saved" ? (
                <><Check className="w-4 h-4 mr-2"/> Saved Successfully</>
              ) : (
                <><Save className="w-4 h-4 mr-2"/> Save Settings</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Need help configuring your settings? Check our
        <a href="#" className="text-primary hover:underline">documentation</a>.
      </div>
    </div>
  );
}
