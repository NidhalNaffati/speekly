import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {Navbar} from "@/components/Navbar";
import {BrowserRouter} from "react-router-dom";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "./components/ThemeProvider";
import AppRoutes from "@/route/AppRoutes.tsx";

const queryClient = new QueryClient();

const App = () => (
    <ThemeProvider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <BrowserRouter>
                    <Toaster/>
                    <Sonner/>
                    <Navbar/>
                    <main className="pt-16">
                        <AppRoutes/>
                    </main>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    </ThemeProvider>
);

export default App;