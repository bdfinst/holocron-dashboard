import { QueryClient, QueryClientProvider } from 'react-query';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { Theme, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';

const emotionCache = createCache({
  key: 'css',
  prepend: true,
  nonce: 'nonce-dontcare',
});

const defaultTheme = createTheme({
  background: '#e1e5ea',
  palette: {
    mode: 'light',
    link: '#695958',
    background: { paper: 'rgb(240,248,255,0.9)' },
    primary: {
      main: '#FFFFFF',
    },
    header: '#9BB0C4',
  },
  chart: {
    axis: {
      fill: 'black',
    },
    yellow: '#949419',
    blue: '#191F94',
    red: '#B60F18',
    green: '#26B71F',
    orange: '#EBA834',
    fillTransparencyPct: 0.6,
  },
});

type Options = {
  route?: string;
  theme?: Theme;
  initialEntries?: string[];
};

const RenderWithWrapper = (element: React.ReactNode, options: Options = {}, routes?: React.ReactNode) => {
  const { theme = defaultTheme, initialEntries = ['/'] } = options;

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          {routes ? routes : (
            <Route path="*" element={
              <CacheProvider value={emotionCache}>
                <ThemeProvider theme={theme}>{element}</ThemeProvider>
              </CacheProvider>
            } />
          )}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export default RenderWithWrapper;
