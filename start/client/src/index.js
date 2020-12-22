import { ApolloClient } from "@apollo/client";
import { cache } from "./cache";

// The ApolloClient constructor requires two parameters:

// The uri of our GraphQL server (in this case localhost:4000/graphql).
// An instance of InMemoryCache to use as the client's cache.
// We import this instance from the cache.js file.

const client = new ApolloClient({
  cache,
  uri: "http://localhost:4000/graphql",
});
