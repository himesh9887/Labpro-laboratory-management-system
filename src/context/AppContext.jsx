import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('labpro-dark') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('labpro-dark', dark);
    } catch {
      // ignore
    }
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
