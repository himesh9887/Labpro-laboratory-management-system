import { createContext, useContext, useEffect, useState } from 'react';
const AppContext = createContext();
export function AppProvider({ children }) { const [sidebarOpen, setSidebarOpen] = useState(true); const [dark, setDark] = useState(false); useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]); return <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, dark, setDark }}>{children}</AppContext.Provider>; }
export const useApp = () => useContext(AppContext);
