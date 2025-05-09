import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "../pages/Home.tsx";
import Settings from "../pages/Settings.tsx";
import Transcription from "../pages/Transcription.tsx";
import Models from "../pages/Models.tsx";
import Live from "../pages/LiveSpeak.tsx"
import Index from "@/pages/Index.tsx";
import WebSpeech from "@/pages/WebSpeech.tsx";
import NotFound from "@/pages/NotFound.tsx";

function AppRoutes() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/settings" element={<Settings/>}/>
                    <Route path="/webspeech" element={<WebSpeech/>}/>
                    <Route path="/transcription" element={<Transcription/>}/>
                    <Route path="/models" element={<Models/>}/>
                    <Route path="/live" element={<Live/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default AppRoutes;
