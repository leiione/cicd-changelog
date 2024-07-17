import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

let root = null

window.renderTicketsDrawer = (containerId, history, props) => {
  if (root && root._internalRoot) {
    root.render(
      <App {...props} />
    );
  } else {
    root = ReactDOM.createRoot(document.getElementById(containerId));
    root.render(
      <App {...props} />
    );
  }
};

window.unmountTicketsDrawer = () => {
  if (root) {
    root.unmount()
  }
};

if (!document.getElementById('TicketsDrawer-container')) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<>{"Microservice not found!"}</>);
}

