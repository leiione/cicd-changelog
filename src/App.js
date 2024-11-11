import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import TicketDetails from "./TicketDetails";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import { Provider } from "react-redux";
import store from "config/store";
import { ApolloProvider } from "@apollo/client";
import { client } from "config/apollo";
import AddTicket from "AddTicket";

const App = ({ theme, container, category, ...rest }) => {
  LicenseInfo.setLicenseKey(
    "87e0aec7e210b546954ef56bc9d381ffTz02ODY5MCxFPTE3MTg0Mjg0MjE3MTQsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );

  const generateClassName = createGenerateClassName({
    productionPrefix: "crmMF-",
  });

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
