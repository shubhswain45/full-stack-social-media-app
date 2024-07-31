import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { mode } from '@chakra-ui/theme-tools';
import { AuthProvider } from './context/authContext';
import { SelectedConversationProvider } from './context/selectedConversationContext';
import './index.css'
import { SocketContextProvider } from './context/SocketContext';

// Define global styles
const styles = {
  global: (props) => ({
    body: {
      color: mode('gray.800', 'whiteAlpha.900')(props),
      bg: mode('gray.100', '#101010')(props),
    },
  }),
};

// Configure theme settings
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  styles,
  colors: {
    gray: {
      light: '#616161',
      dark: '#1e1e1e',
    },
  },
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    },
  },
});

// Get the root element
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <SocketContextProvider>
            <SelectedConversationProvider>
              <AuthProvider>
                <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                <App />
              </AuthProvider>
            </SelectedConversationProvider>
          </SocketContextProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
