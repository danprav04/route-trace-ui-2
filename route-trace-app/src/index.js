// ----- File: src\index.js -----
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
// ThemeProvider and CssBaseline are now applied within App.js

// Import Fontsource packages right at the top
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/material-icons'; // Imports the Material Icons font-face

import App from './App';
import store from './store/store';
// Import global CSS AFTER MUI baseline if needed for overrides,
// but prefer MUI styling methods (sx prop, styled-components).
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
          {/* App now contains ThemeProvider and CssBaseline */}
          <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);