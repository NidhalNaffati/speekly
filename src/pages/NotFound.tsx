import {useLocation} from "react-router-dom";
import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Home} from "lucide-react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="text-center px-4">
                <h1 className="text-7xl font-bold mb-4 gradient-text">404</h1>
                <p className="text-xl text-muted-foreground mb-8">Oops! This page doesn't exist</p>
                <Button className="speekly-gradient" asChild>
                    <a href="/">
                        <Home className="mr-2 h-4 w-4"/> Return to Home
                    </a>
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
