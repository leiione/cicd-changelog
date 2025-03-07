import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import TicketDetails from "./TicketDetails";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import { Provider } from "react-redux";
import store from "config/store";
import { ApolloProvider } from "@apollo/client";
import { client } from "config/apollo";
import AddTicket from "AddTicket";
import { useEffect } from "react";
import { onINP } from "web-vitals";

const App = ({ theme, container, category, ...rest }) => {
  LicenseInfo.setLicenseKey(
    "fd66ab9dddde526bc16fd7b6b658b42eTz03MTIyNCxFPTE3MjE2MjQ2OTkwMDAsUz1wcmVtaXVtLExNPXN1YnNjcmlwdGlvbixLVj0y"
  );

  const generateClassName = createGenerateClassName({
    productionPrefix: "crmMF-",
  });

   useEffect(() => {
    if (window && window.newrelic) {
      onINP(({ value }) => {
        window.newrelic.addPageAction('CRM Microservice (INP)', { inp: value });
      });
    }
  }, [])

  const getMSContent = () => {
    switch (category) {
      case 'Add Ticket':
        return <AddTicket {...rest} />
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
              {getMSContent()}
            </ThemeProvider>
          </StylesProvider>
        </StyledEngineProvider>
      </Provider>
    </ApolloProvider>
  );
};

export default App;
