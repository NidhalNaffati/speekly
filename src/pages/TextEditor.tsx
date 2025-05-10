import {TextEditor} from "@/components/TextEditor.tsx";

function TextEditorPage() {
    const handleSave = (content: string) => {
        // Save logic here
        console.log('Saved content:', content);
    };

    return (
        <div className="container mx-auto p-4">
            <TextEditor
                initialContent="Welcome to my presentation..."
                onSave={handleSave}
                fileName="Untitled"
                wordCount
                readingTime
                fullscreenControl
            />
        </div>
    );
}

export default TextEditorPage;