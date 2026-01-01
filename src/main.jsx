// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

function render() {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Initial render
render();

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept(['./App'], () => {
    // Re-render the app when App or its dependencies change
    render();
  });
}
