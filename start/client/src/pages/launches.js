import React, { Fragment, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { LaunchTile, Header, Button, Loading } from "../components";

export const LAUNCH_TILE_DATA = gql`
  fragment LaunchTile on Launch {
    __typename
    id
    isBooked
    rocket {
      id
      name
    }
    mission {
      name
      missionPatch
    }
  }
`;

// define the shape of the query we'll use to fetch a paginated list of launches.
// Pagination details
// Notice that in addition to fetching a list of launches, our query fetches
// hasMore and cursor fields. That's because the launches query returns paginated
// results:

// - The hasMore field indicates whether there are additional launches beyond the list returned by the server.
// - The cursor field indicates the client's current position within the list of launches. We can execute the query again and provide our most recent cursor as the value of the $after variable to fetch the next set of launches in the list.

export const GET_LAUNCHES = gql`
  query GetLaunchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;
// Notice that our query definition pulls in the LAUNCH_TILE_DATA definition
// above it. LAUNCH_TILE_DATA defines a GraphQL fragment, which is named
// LaunchTile. A fragment is useful for defining a set of fields that you can
// include across multiple queries without rewriting them.
// In the query above, we include the LaunchTile fragment in our query by
// preceding it with ..., similar to JavaScript spread syntax.

const Launches = () => {
  // We'll use Apollo Client's useQuery React Hook to execute our new query
  // within the Launches component. The hook's result object provides
  // properties that help us populate and render our component throughout
  // the query's execution.

  // Apollo Client provides a fetchMore helper function to assist with paginated queries. It enables you to execute the same query with different values for variables (such as the current cursor).
  const { data, loading, error, fetchMore } = useQuery(GET_LAUNCHES);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (loading) return <Loading />;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  // This component passes our GET_LAUNCHES query to useQuery and obtains data,
  // loading, and error properties from the result. Depending on the state of those
  // properties, we render a list of launches, a loading indicator, or an error
  // message.

  return (
    <Fragment>
      <Header />
      {data.launches &&
        data.launches.launches &&
        data.launches.launches.map((launch) => (
          <LaunchTile key={launch.id} launch={launch} />
        ))}
      {data.launches &&
        data.launches.hasMore &&
        (isLoadingMore ? (
          <Loading />
        ) : (
          <Button
            onClick={async () => {
              setIsLoadingMore(true);
              await fetchMore({
                variables: {
                  after: data.launches.cursor,
                },
              });

              setIsLoadingMore(false);
            }}
          >
            Load More
          </Button>
        ))}
    </Fragment>
  );
};

export default Launches;

// connect fetchMore to a button within the Launches component that fetches
// additional launches when it's clicked.
// When our new button is clicked, it calls fetchMore (passing the current
// cursor as the value of the after variable) and displays a Loading notice
// until the query returns results.

// If nothing happpens and you check your browser's network activity, you'll
// see that the button did in fact send a followup query to the server, and the
// server did in fact respond with a list of launches. However, Apollo Client
// keeps these lists separate, because they represent the results of queries
// with different variable values (in this case, the value of after).
// We need Apollo Client to instead merge the launches from our fetchMore
// query with the launches from our original query. Let's configure that behavior.
