import { ApolloClient, ApolloProvider } from "@apollo/client";
import { cache } from "./cache";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import injectStyles from "./styles";

// Initialize ApolloClient
// The ApolloClient constructor requires two parameters:

// The uri of our GraphQL server (in this case localhost:4000/graphql).
// An instance of InMemoryCache to use as the client's cache.
// We import this instance from the cache.js file.

const client = new ApolloClient({
  cache,
  uri: "http://localhost:4000/graphql",
});

// To connect Apollo Client to React, we wrap our app in the ApolloProvider
// component from the @apollo/client package. We pass our client instance to
// the ApolloProvider component via the client prop.
// Pass the ApolloClient instance to the ApolloProvider component
ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>,
  document.getElementById("root")
);

// The ApolloProvider component is similar to React’s context provider:
// it wraps your React app and places client on the context, which enables
// you to access it from anywhere in your component tree.
