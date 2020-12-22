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

module.exports = {
  Query: {
    launches: (_, __, { dataSources }) =>
      dataSources.launchAPI.getAllLaunches(),
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
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
