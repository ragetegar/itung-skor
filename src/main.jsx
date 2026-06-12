import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import Scoreboard from './components/Scoreboard.jsx';
import './index.css';

const Page = /^\/scoreboard(?:\/|$)/.test(window.location.pathname) ? Scoreboard : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
