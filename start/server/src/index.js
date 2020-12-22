require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
// import and call the createStore function to set up our SQLite database
const { createStore } = require("./utils");
const resolvers = require("./resolvers");

const LaunchAPI = require("./datasources/launch");
const UserAPI = require("./datasources/user");

const store = createStore();

// Pass a dataSources option to the ApolloServer constructor. This option is a function that returns an object containing newly instantiated data sources.
//If you use this.context in a datasource (src/datasources/user.js), it's critical to create a new instance in the dataSources function, rather than sharing a single instance. Otherwise, initialize might be called during the execution of asynchronous code for a particular user, replacing this.context with the context of another user.
const server = new ApolloServer({
  typeDefs,
  //   By providing your resolver map to Apollo Server like so, it knows how to call resolver functions as needed to fulfill incoming queries.
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    // pass the database to the UserAPI constructor.
    userAPI: new UserAPI({ store }),
  }),
});

server.listen().then(({ url }) => {
  console.log(`
    🚀 Server ready at ${url}
    Explore at https://studio.apollographql.com/dev
    `);
});
