import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const token = localStorage.getItem("Visp.token");
const vispDB = localStorage.getItem("Visp.database") // SANDBOX || LIVE

let CRM_URI = process.env.CRM_MS_URI_LIVE || process.env.REACT_APP_CRM_MS_URI_LIVE
let CRM_URI_WS = process.env.CRM_MS_URI_LIVE_WS || process.env.REACT_APP_CRM_MS_URI_LIVE_WS
if (vispDB === "SANDBOX") {
  CRM_URI = process.env.CRM_MS_URI_MIRROR || process.env.REACT_APP_CRM_MS_URI_MIRROR
  CRM_URI_WS = process.env.CRM_MS_URI_MIRROR_WS || process.env.REACT_APP_CRM_MS_URI_MIRROR_WS
}
const httpLink = new HttpLink({
  uri: CRM_URI,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: CRM_URI_WS,
    connectionParams: {
      authorization: token || "",
    },
  })
);

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: token || "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export const checkIfCacheExists = (
  client,
  queryProps,
  readFragment = false,
  getData = false
) => {
  try {
    const clientMethod = readFragment ? "readFragment" : "readQuery";
    // See https://www.apollographql.com/docs/react/advanced/caching.html#readquery
    const cache = client[clientMethod](queryProps);
    if (getData) {
      return cache;
    }
    return Boolean(cache);
  } catch (e) {
    return false;
  }
};
