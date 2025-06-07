import React, {useCallback, useState} from 'react';
import {Upload, FileText, AlertCircle} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {v4 as uuidv4} from 'uuid';
import {Script} from './ScriptTable';

interface DragDropUploadProps {
    onScriptsUploaded: (scripts: Script[]) => void;
    className?: string;
}

export function DragDropUpload({onScriptsUploaded, className = ''}: DragDropUploadProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const {toast} = useToast();

    const processFile = useCallback(async (file: File): Promise<Script | null> => {
        try {
            // Validate file size
            if (file.size > 10 * 1024 * 1024) { // 10MB
                throw new Error('File size exceeds 10MB limit');
            }

            // Get file extension
            const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
            const supportedExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.csv'];

            // Validate file extension
            if (!supportedExtensions.includes(fileExt)) {
                throw new Error(`Unsupported file type: ${file.name}`);
            }

            const content = await file.text();
            const now = new Date();

            // Remove file extension from title
            const title = file.name.replace(/\.[^/.]+$/, "");

            // Count words in content
            const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

            // Try to parse as JSON first (in case it's an exported script)
            try {
                const parsed = JSON.parse(content);
                if (parsed.title && parsed.content !== undefined) {
                    // This looks like an exported script
                    return {
                        id: uuidv4(),
                        title: parsed.title || title,
                        content: parsed.content,
                        createdAt: now,
                        updatedAt: now,
                        wordCount: typeof parsed.content === 'string' ?
                            (parsed.content.trim() === '' ? 0 : parsed.content.trim().split(/\s+/).length) : 0
                    };
                }
            } catch {
                // Not JSON, treat as plain text
            }

            // Create new script from file content
            return {
                id: uuidv4(),
                title: title || 'Imported Script',
                content,
                createdAt: now,
                updatedAt: now,
                wordCount
            };
        } catch (error) {
            console.error('Error processing file:', error);
            toast({
                title: 'File Processing Error',
                description: error instanceof Error ? error.message : 'Failed to process file',
                variant: 'destructive',
            });
            return null;
        }
    }, [toast]);

    const handleFiles = useCallback(async (files: FileList) => {
        setIsProcessing(true);
        const processedScripts: Script[] = [];
        const errors: string[] = [];

        try {
            for (const file of Array.from(files)) {
                try {
                    const script = await processFile(file);
                    if (script) {
                        processedScripts.push(script);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        errors.push(error.message);
                    } else {
                        errors.push(`Failed to process ${file.name}`);
                    }
                }
            }

            if (processedScripts.length > 0) {
                onScriptsUploaded(processedScripts);
                toast({
                    title: 'Scripts uploaded successfully',
                    description: `${processedScripts.length} script(s) have been imported.`,
                });
            }

            if (errors.length > 0) {
                toast({
                    title: 'Some files failed to upload',
                    description: `Successfully processed ${processedScripts.length} files, but ${errors.length} failed.`,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast({
                title: 'Upload failed',
                description: 'There was an error processing your files.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    }, [processFile, onScriptsUploaded, toast]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
        // Reset input value to allow uploading the same file again
        e.target.value = '';
    }, [handleFiles]);

    return (
        <Card
            className={`transition-all duration-200 ${isDragActive ? 'border-primary bg-primary/5' : 'border-dashed'} ${className}`}>
            <CardContent className="p-8">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="text-center space-y-4"
                >
                    <div
                        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                        ) : (
                            <Upload className="h-8 w-8"/>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                            {isProcessing ? 'Processing files...' : 'Upload Scripts'}
                        </h3>
                        <p className="text-muted-foreground">
                            {isDragActive
                                ? 'Drop your files here to upload them'
                                : 'Drag and drop your script files here, or click to browse'
                            }
                        </p>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="file"
                            multiple
                            accept=".txt,.md,.json,.js,.ts,.html,.csv,text/*,application/json"
                            onChange={handleFileInput}
                            className="hidden"
                            id="file-upload"
                            disabled={isProcessing}
                        />
                        <label htmlFor="file-upload">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                disabled={isProcessing}
                                asChild
                            >
                                <span>
                                    <FileText className="mr-2 h-4 w-4"/>
                                        Choose Files
                                </span>
                            </Button>
                        </label>

                        <div className="flex items-center justify-center text-xs text-muted-foreground space-x-2">
                            <AlertCircle className="h-3 w-3"/>
                            <span>Supports: .txt, .md, .json, .js, .ts, .html, .csv files (max 10MB each)</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}