import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import TicketDetails from "./TicketDetails";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import { Provider } from "react-redux";
import store from "config/store";

const App = ({ theme, ...rest }) => {
  LicenseInfo.setLicenseKey(
    "87e0aec7e210b546954ef56bc9d381ffTz02ODY5MCxFPTE3MTg0Mjg0MjE3MTQsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );

  const generateClassName = createGenerateClassName({
    productionPrefix: "subscriberMF-",
  });

  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <StylesProvider generateClassName={generateClassName}>
          <ThemeProvider theme={theme}>
            <TicketDetails {...rest} />
          </ThemeProvider>
        </StylesProvider>
      </StyledEngineProvider>
    </Provider>
  );
};

export default App;
