import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { unmountComponentAtNode } from 'react-dom';

window.renderTicketsDrawer = (containerId, props) => {
  const root = ReactDOM.createRoot(document.getElementById(containerId));
  root.render(
    <App {...props} />
  );
};

window.unmountTicketsDrawer = containerId => {
  if(document.getElementById(containerId)) {
    unmountComponentAtNode(document.getElementById(containerId));
  }
 };

if (!document.getElementById('TicketsDrawer-container')) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}
