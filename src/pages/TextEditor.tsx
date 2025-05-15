import {useEffect, useRef, useState} from 'react';
import {TextEditor} from "@/components/TextEditor";
import {Script, ScriptTable} from '@/components/ScriptTable';
import {useToast} from '@/hooks/use-toast';
import {AlertCircle, PlusCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {v4 as uuidv4} from 'uuid';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {IpcRenderer} from "electron";
import {ScriptDetails} from "@/components/ScriptDetails.tsx";

const ipcRenderer: IpcRenderer = window.ipcRenderer;

// IPC channel names
const IPC_CHANNELS = {
    SAVE_SCRIPTS: 'save-scripts',
    LOAD_SCRIPTS: 'load-scripts',
    BACKUP_SCRIPT: 'backup-script',
    GET_SCRIPTS_PATH: 'get-scripts-path',
    GET_BACKUPS_PATH: 'get-backups-path'
};

// Helper function to count words
const countWords = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
};

function TextEditorPage() {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [currentScript, setCurrentScript] = useState<Script | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [scriptToDelete, setScriptToDelete] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const backupIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const {toast} = useToast();

    // Helper functions to interact with IPC
    const saveScriptsToFile = async (scriptsData: Script[]) => {
        try {
            const jsonData = JSON.stringify(scriptsData, null, 2);
            return await ipcRenderer.invoke(IPC_CHANNELS.SAVE_SCRIPTS, 'scripts.json', jsonData);
        } catch (error) {
            console.error('Error saving scripts via IPC:', error);
            throw error;
        }
    };

    const loadScriptsFromFile = async () => {
        try {
            const result = await ipcRenderer.invoke(IPC_CHANNELS.LOAD_SCRIPTS, 'scripts.json');
            if (result.success && result.data) {
                return JSON.parse(result.data);
            }
            return [];
        } catch (error) {
            console.error('Error loading scripts via IPC:', error);
            throw error;
        }
    };

    const backupScriptsToFile = async (scriptsData: Script[]) => {
        try {
            const jsonData = JSON.stringify(scriptsData, null, 2);
            return await ipcRenderer.invoke(IPC_CHANNELS.BACKUP_SCRIPT, 'scripts.json', jsonData);
        } catch (error) {
            console.error('Error backing up scripts via IPC:', error);
            throw error;
        }
    };

    const loadBackupScripts = async () => {
        // This is a simplified approach - in a real implementation you might
        // want to list backup files and load the most recent one
        try {
            const backupsPath = await ipcRenderer.invoke(IPC_CHANNELS.GET_BACKUPS_PATH);
            console.log('Backups directory:', backupsPath);
            // Attempting to load from backup would require listing files in the backup directory
            // which isn't directly supported by the current IPC setup
            // For now, return empty array indicating no backups found
            return [];
        } catch (error) {
            console.error('Error loading backup scripts:', error);
            return [];
        }
    };

    const setupAutoBackup = (scriptsData: Script[], intervalMinutes: number) => {
        if (backupIntervalRef.current) {
            clearInterval(backupIntervalRef.current);
        }

        // Create interval for backing up
        return setInterval(() => {
            console.log('Creating automatic backup...');
            backupScriptsToFile(scriptsData)
                .then(result => {
                    if (result.success) {
                        console.log('Auto backup created at:', result.backupPath);
                    } else {
                        console.error('Auto backup failed:', result.error);
                    }
                })
                .catch(err => console.error('Auto backup error:', err));
        }, intervalMinutes * 60 * 1000);
    };

    // Load scripts on component mount
    useEffect(() => {
        const loadAllScripts = async () => {
            setIsLoading(true);
            try {
                // Try loading scripts from the primary storage
                const loadedScripts = await loadScriptsFromFile();

                if (loadedScripts && loadedScripts.length > 0) {
                    setScripts(loadedScripts);
                    setLoadError(null);
                } else {
                    // If no scripts found, try loading from backup
                    console.log('No scripts found in primary storage, trying backup...');
                    const backupScripts = await loadBackupScripts();

                    if (backupScripts && backupScripts.length > 0) {
                        setScripts(backupScripts);
                        toast({
                            title: 'Restored from backup',
                            description: 'Your scripts were restored from a backup.',
                        });
                    } else {
                        // No scripts found in backup either - this is likely a new user
                        console.log('No backup scripts found. Starting with empty script list.');
                        setScripts([]);
                    }
                }
            } catch (error) {
                console.error('Failed to load scripts:', error);
                setLoadError('Failed to load your scripts. Please try again.');
                toast({
                    title: 'Error loading scripts',
                    description: 'There was a problem loading your saved scripts.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadAllScripts();

        // Clean up backup interval on unmount
        return () => {
            if (backupIntervalRef.current) {
                clearInterval(backupIntervalRef.current);
                backupIntervalRef.current = null;
            }
        };
    }, [toast]);

    // Save scripts whenever they change
    useEffect(() => {
        if (!isLoading && scripts.length > 0) {
            const saveAllScripts = async () => {
                try {
                    await saveScriptsToFile(scripts);
                    console.log('Scripts saved successfully:', scripts.length);

                    // Set up automatic backup
                    if (backupIntervalRef.current) {
                        clearInterval(backupIntervalRef.current);
                    }
                    backupIntervalRef.current = setupAutoBackup(scripts, 5);
                } catch (error) {
                    console.error('Failed to save scripts:', error);
                    toast({
                        title: 'Error saving scripts',
                        description: 'There was a problem saving your scripts. Your changes might not be saved.',
                        variant: 'destructive',
                    });
                }
            };

            saveAllScripts();
        }
    }, [scripts, isLoading, toast, setupAutoBackup]);

    const handleCreateNewScript = () => {
        const newScript: Script = {
            id: uuidv4(),
            title: 'Untitled Script',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 0
        };

        setCurrentScript(newScript);
        setShowEditor(true);
        setIsViewMode(false);
    };

    const handleEditScript = (script: Script) => {
        setCurrentScript({...script});
        setShowEditor(true);
        setIsViewMode(false);
    };

    const handleViewScript = (script: Script) => {
        setCurrentScript({...script});
        setShowEditor(true);
        setIsViewMode(true);
    };

    const handleSave = (content: string) => {
        if (!currentScript) return;

        const now = new Date();
        const wordCount = countWords(content);

        const updatedScript = {
            ...currentScript,
            content,
            updatedAt: now,
            wordCount
        };

        // Check if this is an update to an existing script or a new one
        const isExistingScript = scripts.some(script => script.id === currentScript.id);

        if (isExistingScript) {
            setScripts(scripts.map(script =>
                script.id === currentScript.id ? updatedScript : script
            ));
            toast({
                title: 'Script updated',
                description: `"${updatedScript.title}" has been updated.`,
            });
        } else {
            setScripts([...scripts, updatedScript]);
            toast({
                title: 'Script created',
                description: `"${updatedScript.title}" has been saved.`,
            });
        }

        // Update the current script with new data
        setCurrentScript(updatedScript);

        // Create an immediate backup after saving
        backupScriptsToFile([...scripts.filter(s => s.id !== updatedScript.id), updatedScript])
            .catch(error => console.error('Failed to create backup after save:', error));
    };

    const handleDeletePrompt = (scriptId: string) => {
        setScriptToDelete(scriptId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!scriptToDelete) return;

        const scriptToRemove = scripts.find(script => script.id === scriptToDelete);
        if (scriptToRemove) {
            // Create a backup before deleting
            try {
                await backupScriptsToFile(scripts);
            } catch (error) {
                console.error('Failed to backup before delete:', error);
            }

            // Remove the script from state
            const updatedScripts = scripts.filter(script => script.id !== scriptToDelete);
            setScripts(updatedScripts);

            // Close editor if the deleted script is currently open
            if (currentScript?.id === scriptToDelete) {
                setCurrentScript(null);
                setShowEditor(false);
            }

            toast({
                title: 'Script deleted',
                description: `"${scriptToRemove.title}" has been deleted.`,
            });

            // Save the updated scripts list (without the deleted script)
            try {
                await saveScriptsToFile(updatedScripts);
            } catch (error) {
                console.error('Failed to save after delete:', error);
                toast({
                    title: 'Error saving after delete',
                    description: 'The script was removed from view but may not be permanently deleted.',
                    variant: 'destructive',
                });
            }
        }

        setIsDeleteDialogOpen(false);
        setScriptToDelete(null);
    };

    const handleTitleChange = (title: string) => {
        if (!currentScript) return;

        const updatedScript = {...currentScript, title, updatedAt: new Date()};
        setCurrentScript(updatedScript);

        if (scripts.some(script => script.id === currentScript.id)) {
            setScripts(scripts.map(script =>
                script.id === currentScript.id ? updatedScript : script
            ));
        }
    };

    const handleBackToList = () => {
        setShowEditor(false);
        setCurrentScript(null);
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-lg">Loading your scripts...</p>
                </div>
            ) : loadError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive"/>
                    <h3 className="mt-4 text-lg font-bold">Failed to load scripts</h3>
                    <p className="mt-2 text-muted-foreground">{loadError}</p>
                    <Button
                        className="mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            ) : showEditor ? (
                <div className="space-y-4">
                    {/* Add the ScriptDetails component here */}
                    {currentScript && (
                        <ScriptDetails
                            script={currentScript}
                            isEditing={!isViewMode}
                        />
                    )}
                    <TextEditor
                        initialContent={currentScript?.content || ''}
                        onSave={handleSave}
                        fileName={currentScript?.title || 'Untitled'}
                        onFileNameChange={handleTitleChange}
                        wordCount
                        readingTime
                        fullscreenControl
                        isViewMode={isViewMode}
                        onBack={handleBackToList}
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">My Scripts</h1>
                        <Button onClick={handleCreateNewScript} className="speekly-gradient">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Create New Script
                        </Button>
                    </div>
                    {scripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <p className="text-lg text-muted-foreground">You don't have any scripts yet.</p>
                            <Button
                                onClick={handleCreateNewScript}
                                className="mt-4 speekly-gradient"
                            >
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Create Your First Script
                            </Button>
                        </div>
                    ) : (
                        <ScriptTable
                            scripts={scripts}
                            onEditScript={handleEditScript}
                            onDeleteScript={handleDeletePrompt}
                            onViewScript={handleViewScript}
                        />
                    )}
                </>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your script.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default TextEditorPage;