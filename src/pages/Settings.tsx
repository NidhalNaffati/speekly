import {Navbar} from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import Settings from "@/components/Settings.tsx";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <main>
        <Settings/>
      </main>
      <Footer/>
    </div>
  );
};

export default Index;
