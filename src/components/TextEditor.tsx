import React, {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Copy, Download, FileText, Maximize, Minimize, Save, Trash2, ArrowLeft} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {Textarea} from '@/components/ui/textarea';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';

interface TextEditorProps {
    initialContent?: string;
    onSave?: (content: string) => void;
    onClear?: () => void;
    fileName?: string;
    onFileNameChange?: (fileName: string) => void;
    wordCount?: boolean;
    readingTime?: boolean;
    fullscreenControl?: boolean;
    isViewMode?: boolean;  // Add this prop for view-only mode
    onBack?: () => void;   // Add this prop for navigation back to list
}

export function TextEditor(
    {
        initialContent = '',
        onSave,
        onClear,
        fileName: initialFileName = 'Untitled',
        onFileNameChange,
        wordCount = true,
        readingTime = true,
        fullscreenControl = true,
        isViewMode = false,  // Default to edit mode
        onBack,
    }: TextEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [fileName, setFileName] = useState(initialFileName);
    const [showFileNameInput, setShowFileNameInput] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileNameInputRef = useRef<HTMLInputElement>(null);
    const {toast} = useToast();

    useEffect(() => {
        setContent(initialContent);
        setIsDirty(false);
    }, [initialContent]);

    useEffect(() => {
        setFileName(initialFileName);
    }, [initialFileName]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isViewMode) return; // Don't allow changes in view mode
        setContent(e.target.value);
        setIsDirty(true);
    };

    const handleSave = () => {
        if (onSave && !isViewMode) {
            onSave(content);
            setIsDirty(false);
            toast({
                title: 'Saved successfully',
                description: fileName ? `Your script "${fileName}" has been saved.` : 'Your script has been saved.',
            });
        }
    };

    const handleClear = () => {
        if (isViewMode) return; // Don't allow clearing in view mode
        setContent('');
        setIsDirty(true);
        if (onClear) onClear();
        toast({
            title: 'Editor cleared',
        });
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast({
                title: 'Copied to clipboard',
            });
        } catch (err) {
            toast({
                title: 'Failed to copy',
                variant: 'destructive',
            });
        }
    };

    const handleDownload = () => {
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen && textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const countWords = (text: string) => {
        return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    };

    const calculateReadingTime = (text: string) => {
        const words = countWords(text);
        const wordsPerMinute = 200; // Average reading speed
        return Math.ceil(words / wordsPerMinute);
    };

    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewMode) return; // Don't allow changing filename in view mode
        const newFileName = e.target.value;
        setFileName(newFileName);
        if (onFileNameChange) {
            onFileNameChange(newFileName);
        }
    };

    const toggleFileNameInput = () => {
        if (isViewMode) return; // Don't allow toggling filename input in view mode
        setShowFileNameInput(!showFileNameInput);
        if (!showFileNameInput && fileNameInputRef.current) {
            setTimeout(() => fileNameInputRef.current?.focus(), 0);
        }
    };

    const handleFileNameBlur = () => {
        setShowFileNameInput(false);
        if (onFileNameChange && fileName !== initialFileName) {
            onFileNameChange(fileName);
        }
    };

    return (
        <div
            className={`bg-card border rounded-xl shadow-sm overflow-hidden ${
                isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'relative'
            }`}
        >
            {/* Editor Header */}
            <div className="bg-muted p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <FileText className="h-5 w-5 text-speekly-blue"/>
                    {showFileNameInput && !isViewMode ? (
                        <Input
                            ref={fileNameInputRef}
                            value={fileName}
                            onChange={handleFileNameChange}
                            onBlur={handleFileNameBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleFileNameBlur()}
                            className="h-8 w-40"
                        />
                    ) : (
                        <h3
                            className={`font-medium ${!isViewMode ? 'cursor-pointer hover:underline' : ''}`}
                            onClick={!isViewMode ? toggleFileNameInput : undefined}
                        >
                            {fileName || 'Untitled Script'}
                            {isDirty && !isViewMode && '*'}
                        </h3>
                    )}
                    {isViewMode && (
                        <Badge variant="outline" className="ml-2">
                            View Mode
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {wordCount && (
                        <Badge variant="outline" className="mr-2">
                            {countWords(content)} words
                        </Badge>
                    )}
                    {readingTime && (
                        <Badge variant="outline">
                            ~{calculateReadingTime(content)} min read
                        </Badge>
                    )}

                    {fullscreenControl && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleFullscreen}
                                        className="rounded-full"
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="h-4 w-4"/>
                                        ) : (
                                            <Maximize className="h-4 w-4"/>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <div className="p-4">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Type your script here..."
                    className={`min-h-[300px] w-full resize-none text-base ${isViewMode ? 'bg-muted/20 cursor-text' : ''}`}
                    spellCheck="true"
                    readOnly={isViewMode}
                />
            </div>

            {/* Editor Footer */}
            <div className="bg-muted/30 p-4 border-t flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {!isViewMode && (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!isDirty}
                            className="speekly-gradient"
                        >
                            <Save className="mr-2 h-4 w-4"/>
                            Save
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyToClipboard}
                                    disabled={!content}
                                >
                                    <Copy className="mr-2 h-4 w-4"/>
                                    Copy
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy to clipboard</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownload}
                                    disabled={!content}
                                >
                                    <Download className="mr-2 h-4 w-4"/>
                                    Download
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download as {fileName}.txt</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {!isViewMode && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClear}
                                        disabled={!content}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Clear
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear the editor</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </div>
    );
}