import { InMemoryCache } from "@apollo/client";

// Merge cached results
// Apollo Client stores your query results in its in-memory cache.
// The cache handles most operations intelligently and efficiently,
// but it doesn't automatically know that we want to merge our two
// distinct lists of launches. To fix this, we'll define a merge
// function for the paginated field in our schema.

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        launches: {
          keyArgs: false,
          merge(existing, incoming) {
            let launches = [];
            if (existing && existing.launches) {
              launches = launches.concat(existing.launches);
            }
            if (incoming && incoming.launches) {
              launches = launches.concat(incoming.launches);
            }
            return {
              ...incoming,
              launches,
            };
          },
        },
      },
    },
  },
});

// This merge function takes our existing cached launches and the
// incoming launches and combines them into a single list, which it
// then returns. The cache stores this combined list and returns it
// to all queries that use the launches field.

// This example demonstrates a use of field policies, which are
// cache configuration options that are specific to individual
// fields in your schema.
