import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import TicketDetails from "./TicketDetails";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import { Provider } from "react-redux";
import store from "config/store";
import { ApolloProvider } from "@apollo/client";
import { client } from "config/apollo";
import AddTicket from "AddTicket";
import Dashboard from "Dashboard";
import { useEffect } from "react";
import { onINP } from "web-vitals";
import { Monitoring } from "react-scan/monitoring"; // Import this first before React
import InstallerAvailbility from "InstallerAvailbility";
import GlobalSnackbar from "Common/GlobalSnackbar";

LicenseInfo.setLicenseKey(
  process.env.REACT_APP_MUI_X_PREMIUM_KEY
);

const App = ({ theme, container, category, ...rest }) => {

  const isp_id = localStorage.getItem("Visp.ispId")
  const isp_domain = localStorage.getItem("Visp.domain")

  const generateClassName = createGenerateClassName({
    productionPrefix: `crm-${Math.random()}`,
  });

  useEffect(() => {
    if (window && window.newrelic) {
      onINP((event) => {
        if (event) {
          const worstEntry = event.entries.reduce((max, entry) => (entry.value > max.value ? entry : max), event.entries[0]);
          const target = worstEntry.target || {};
          window.newrelic.addPageAction('CRM Microservice (INP)', {
            inp: worstEntry.duration,
            isp_id,
            isp_domain,
            rating: event.rating,
            interactionType: worstEntry.name,    // 'click', 'keydown', etc.
            targetElement: target.tagName || 'no-element',
            targetText: target.innerText?.trim().substring(0, 30) || 'no-text',
            targetClass: target.className || 'no-class',
            targetId: target.id || 'no-id'
          });
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getMSContent = () => {
    switch (category) {
      case 'Add Ticket':
        return <AddTicket {...rest} />
      case 'CRMDashboard':
        return <Dashboard {...rest} />
      case "Technician Availability":
        return <InstallerAvailbility {...rest} /> 
      default:
        return <TicketDetails category={category} {...rest} />
    }
  }

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <StylesProvider generateClassName={generateClassName}>
            <ThemeProvider theme={theme}>
              <Monitoring
                apiKey={process.env.REACT_APP_REACT_SCAN_API_KEY} // Moved to .env file for better configuration management
                url="https://monitoring.react-scan.com/api/v1/ingest"
              />
              {getMSContent()}
              <GlobalSnackbar />
            </ThemeProvider>
          </StylesProvider>
        </StyledEngineProvider>
      </Provider>
    </ApolloProvider>
  );
};

export default App;