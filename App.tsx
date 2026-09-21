import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WeatherDashboard from "./WeatherDashboard";

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="bottom-left" /><WeatherDashboard /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
