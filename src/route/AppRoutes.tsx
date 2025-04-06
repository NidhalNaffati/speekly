import {Route, Routes} from "react-router-dom";
import Home from "../pages/Home.tsx";
import Settings from "../pages/Settings.tsx";
import Transcription from "../pages/Transcription.tsx";
import Models from "../pages/Models.tsx";
import Live from "../pages/LiveSpeak.tsx"

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" Component={Home}/>
        <Route path="/settings" Component={Settings}/>
        <Route path="/transcription" Component={Transcription}/>
        <Route path="/models" Component={Models}/>
        <Route path="/live" Component={Live}/>
      </Routes>
    </>
  );
}

export default AppRoutes;
