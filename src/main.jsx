import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import './assets/styles/index.css';

const client = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <AuthProvider>
        <AppProvider>
          <DataProvider>
            <BrowserRouter>
              <App />
              <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
            </BrowserRouter>
          </DataProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
