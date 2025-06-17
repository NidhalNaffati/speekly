import {Routes, Route} from 'react-router-dom';
import Settings from "../pages/Settings.tsx";
import Transcription from "../pages/Transcription.tsx";
import Models from "../pages/Models.tsx";
import Live from "../pages/LiveSpeak.tsx"
import Index from "@/pages/Index.tsx";
import WebSpeech from "@/pages/WebSpeech.tsx";
import NotFound from "@/pages/NotFound.tsx";
import TextEditorPage from "@/pages/TextEditor.tsx";

function AppRoutes() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Index/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/webspeech" element={<WebSpeech/>}/>
                <Route path="/transcription" element={<Transcription/>}/>
                <Route path="/models" element={<Models/>}/>
                <Route path="/live" element={<Live/>}/>
                <Route path="/text-editor" element={<TextEditorPage/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>
    );
}

export default AppRoutes;
