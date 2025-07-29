import { ThemeProvider } from '@/context/ThemeProvider';
import AppContent from './components/app-content';
import { RefreshProvider } from './context/PageRefreshContext';

export default function App() {
  return (
    <ThemeProvider>
      <RefreshProvider>
        <AppContent />
      </RefreshProvider>
    </ThemeProvider>
  );
}
