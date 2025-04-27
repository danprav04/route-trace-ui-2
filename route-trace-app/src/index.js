// ----- File: src\index.js -----
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
// ThemeProvider and CssBaseline are now applied within App.js
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