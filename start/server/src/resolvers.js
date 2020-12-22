/*
A resolver is a function that's responsible for populating the data for a single field in your schema. Whenever a client queries for a particular field, the resolver for that field fetches the requested data from the appropriate data source.

A resolver function returns one of the following:

Data of the type required by the resolver's corresponding schema field (string, integer, object, etc.)
A promise that fulfills with data of the required type

The resolver function signature

fieldName: (parent, args, context, info) => data;

parent - 	This is the return value of the resolver for this field's parent (the resolver for a parent field always executes before the resolvers for that field's children).
args - This object contains all GraphQL arguments provided for this field.
context - This object is shared across all resolvers that execute for a particular operation. Use this to share per-operation state, such as authentication information and access to data sources.
info - This contains information about the execution state of the operation (used only in advanced cases).
*/
const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false,
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
  },
  //   This resolver obtains a large or small patch from mission, which is the object returned by the default resolver for the parent field in our schema, Launch.mission.
  Mission: {
    // The default size is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },

  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      );
    },
  },
};

// we define our resolvers in a map, where the map's keys correspond to our schema's types (Query) and fields (launches, launch, me).

/*
Regarding the function arguments above:

All three resolver functions assign their first positional argument (parent) to the variable _ as a convention to indicate that they don't use its value.
The launches and me functions assign their second positional argument (args) to __ for the same reason.

(The launch function does use the args argument, however, because our schema's launch field takes an id argument.)
All three resolver functions do use the third positional argument (context). Specifically, they destructure it to access the dataSources we defined.
None of the resolver functions includes the fourth positional argument (info), because they don't use it and there's no other need to include it.

*/
