import { createContext, useContext, useEffect, useState } from 'react';
import storageService from '../services/storageService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dark, setDark] = useState(() => storageService.get('dark', false));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    storageService.set('dark', dark);
  }, [dark]);

  return (
    <AppContext.Provider
      value={{ sidebarOpen, setSidebarOpen, mobileDrawerOpen, setMobileDrawerOpen, dark, setDark }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
