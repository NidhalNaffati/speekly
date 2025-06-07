import {ipcMain, dialog, BrowserWindow} from "electron";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import {promises as fs} from 'fs';
import * as path from 'path';

// Define IPC channel names
const IPC_CHANNELS = {
    OPEN_FILE_DIALOG: 'dialog:openFile',
    READ_FILE: 'file:read',
    GET_FILE_STATS: 'file:stats',
    VALIDATE_FILE: 'file:validate'
};

// Supported file extensions for script files
const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function initializeFileDialogIPC() {

    // Open file dialog
    ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async (_event: IpcMainInvokeEvent, options = {}) => {
        try {
            const focusedWindow = BrowserWindow.getFocusedWindow();

            const defaultOptions = {
                properties: ['openFile', 'multiSelections'],
                filters: [
                    {name: 'Text Files', extensions: ['txt', 'md']},
                    {name: 'Code Files', extensions: ['js', 'ts', 'html', 'json']},
                    {name: 'Data Files', extensions: ['csv']},
                    {name: 'All Supported', extensions: ['txt', 'md', 'json', 'js', 'ts', 'html', 'csv']}
                ]
            };

            const dialogOptions = {...defaultOptions, ...options};

            if (focusedWindow) {
                return await dialog.showOpenDialog(focusedWindow, dialogOptions);
            } else {
                return await dialog.showOpenDialog(dialogOptions);
            }

        } catch (error) {
            console.error('Error opening file dialog:', error);
            throw error;
        }
    });

    // Read file content
    ipcMain.handle(IPC_CHANNELS.READ_FILE, async (_event: IpcMainInvokeEvent, filePath: string) => {
        try {
            if (!filePath) {
                return {error: 'Invalid file path provided'};
            }

            // Validate file extension
            const fileExtension = path.extname(filePath).toLowerCase();
            if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
                return {error: `Unsupported file type: ${fileExtension}`};
            }

            // Check if file exists and get stats
            const stats = await fs.stat(filePath);

            if (!stats.isFile()) {
                return {error: 'Path is not a file'};
            }

            if (stats.size > MAX_FILE_SIZE) {
                return {error: `File is too large (${Math.round(stats.size / 1024 / 1024)}MB). Maximum size is 10MB.`};
            }

            // Read file content
            const content = await fs.readFile(filePath, 'utf8');
            const fileName = path.basename(filePath);

            return {
                content,
                fileName,
                filePath,
                size: stats.size,
                extension: fileExtension
            };
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    });

    // Get file statistics
    ipcMain.handle(IPC_CHANNELS.GET_FILE_STATS, async (_event: IpcMainInvokeEvent, filePath: string) => {
        try {
            if (!filePath) {
                throw new Error('Invalid file path provided');
            }

            const stats = await fs.stat(filePath);
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath).toLowerCase();

            return {
                fileName,
                filePath,
                size: stats.size,
                extension: fileExtension,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            console.error('Error getting file stats:', error);
            throw error;
        }
    });

    // Validate file (check if it's supported and within size limits)
    ipcMain.handle(IPC_CHANNELS.VALIDATE_FILE, async (_event: IpcMainInvokeEvent, filePath: string) => {
        try {
            if (!filePath) {
                return {
                    isValid: false,
                    error: 'Invalid file path provided'
                };
            }

            const fileExtension = path.extname(filePath).toLowerCase();

            if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
                return {
                    isValid: false,
                    error: `Unsupported file type: ${fileExtension}`
                };
            }

            const stats = await fs.stat(filePath);

            if (!stats.isFile()) {
                return {
                    isValid: false,
                    error: 'Path is not a file'
                };
            }

            if (stats.size > MAX_FILE_SIZE) {
                return {
                    isValid: false,
                    error: `File is too large (${Math.round(stats.size / 1024 / 1024)}MB). Maximum size is 10MB.`
                };
            }

            return {
                isValid: true,
                fileName: path.basename(filePath),
                size: stats.size,
                extension: fileExtension
            };
        } catch (error: unknown) {
            console.error('Error reading file:', error instanceof Error ? error.message : error);
            throw error instanceof Error ? error : new Error('Unknown error');
        }

    });

}