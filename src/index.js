import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ------------ Ticket Drawer --------------
let ticketsDrawerRoot = null;

window.renderTicketsDrawer = (containerId, history, props) => {
  if (ticketsDrawerRoot && ticketsDrawerRoot._internalRoot) {
    ticketsDrawerRoot.render(
      <App {...props} />
    );
  } else {
    ticketsDrawerRoot = ReactDOM.createRoot(document.getElementById(containerId));
    ticketsDrawerRoot.render(
      <App {...props} />
    );
  }
};

// ------------ Ticket Dashboard --------------
let ticketDashboardRoot = null;

window.unmountTicketsDrawer = () => {
  if (ticketsDrawerRoot) {
    ticketsDrawerRoot.unmount();
  }
};

window.renderTicketDashboard = (containerId, history, props) => {
  if (ticketDashboardRoot && ticketDashboardRoot._internalRoot) {
    ticketDashboardRoot.render(
      <App {...props} />
    );
  } else {
    ticketDashboardRoot = ReactDOM.createRoot(document.getElementById(containerId));
    ticketDashboardRoot.render(
      <App {...props} />
    );
  }
};

window.unmountTicketDashboard = () => {
  if (ticketDashboardRoot) {
    ticketDashboardRoot.unmount();
  }
};

// ------------ Ticket Settings Drawer --------------
let settingsRoot = null

window.renderSettingsDrawer = (containerId, history, props) => {
  if (settingsRoot && settingsRoot._internalRoot) {
    settingsRoot.render(
      <App {...props} />
    );
  } else {
    settingsRoot = ReactDOM.createRoot(document.getElementById(containerId));
    settingsRoot.render(
      <App {...props} />
    );
  }
};

window.unmountSettingsDrawer = () => {
  if (settingsRoot) {
    settingsRoot.unmount()
  }
};


if (!document.getElementById('TicketsDrawer-container') &&
  !document.getElementById('TicketDashboard-container') &&
  !document.getElementById('SettingsDrawer-container')
) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<>{"Microservice not found!"}</>);
}

