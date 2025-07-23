import { ThemeProvider } from "@/context/ThemeProvider";
import AppContent from "@/components/app-content";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
