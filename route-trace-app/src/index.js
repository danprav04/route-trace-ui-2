// ----- File: src/index.js -----

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
// Remove ThemeProvider, createTheme, CssBaseline from here
import App from './App';
import store from './store/store';
import './index.css'; // Keep if you have other global non-MUI styles, otherwise remove

// Old basic theme is removed. Theme is now handled within App.js
// const theme = createTheme({ ... });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Remove ThemeProvider and CssBaseline from here */}
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// ----- End File: src/index.js -----