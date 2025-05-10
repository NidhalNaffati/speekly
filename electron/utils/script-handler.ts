import {app} from "electron";
import path from "node:path";
import * as fs from "fs/promises";

// Define file paths
const userDataPath = app.getPath('userData');
const SCRIPTS_DIR = path.join(userDataPath, 'scripts');
const BACKUP_DIR = path.join(userDataPath, 'backups');

// Helper function to ensure directories exist
async function ensureDirectories() {
    await fs.mkdir(SCRIPTS_DIR, {recursive: true});
    await fs.mkdir(BACKUP_DIR, {recursive: true});
}

// Initialize directories when this module is loaded
ensureDirectories().catch(error => console.error('Error creating directories:', error));

// Returns the full path to the scripts directory
export function getScriptsFilePath() {
    return SCRIPTS_DIR;
}

// Returns the full path to the backups directory
export function getBackupsDirectory() {
    return BACKUP_DIR;
}

// Save script to a file
export async function saveScripts(filename: string, data: string) {
    try {
        const filePath = path.join(SCRIPTS_DIR, filename);
        await fs.writeFile(filePath, data);
        return {success: true, filePath};
    } catch (error) {
        console.error('Error saving script:', error);
        return {success: false, error: String(error)};
    }
}

// Load script from a file
export async function loadScripts(filename: string) {
    try {
        const filePath = path.join(SCRIPTS_DIR, filename);
        // Check if the file exists before trying to read it
        try {
            await fs.access(filePath);
        } catch {
            // Return empty data if file doesn't exist, not an error
            return {success: true, data: null};
        }

        const content = await fs.readFile(filePath, 'utf-8');
        return {success: true, data: content};
    } catch (error) {
        console.error('Error loading script:', error);
        return {success: false, error: String(error)};
    }
}

// Create a backup of a script
export async function backupScript(filename: string, data: string) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `${filename}-${timestamp}.bak`;
        const backupPath = path.join(BACKUP_DIR, backupFilename);
        await fs.writeFile(backupPath, data);
        return {success: true, backupPath};
    } catch (error) {
        console.error('Error creating backup:', error);
        return {success: false, error: String(error)};
    }
}