require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
// import and call the createStore function to set up our SQLite database
const { createStore } = require("./utils");
const resolvers = require("./resolvers");

const LaunchAPI = require("./datasources/launch");
const UserAPI = require("./datasources/user");
const isEmail = require("isemail");

const store = createStore();

// Pass a dataSources option to the ApolloServer constructor. This option is a function that returns an object containing newly instantiated data sources.
//If you use this.context in a datasource (src/datasources/user.js), it's critical to create a new instance in the dataSources function, rather than sharing a single instance. Otherwise, initialize might be called during the execution of asynchronous code for a particular user, replacing this.context with the context of another user.
const server = new ApolloServer({
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || "";
    const email = Buffer.from(auth, "base64").toString("ascii");
    if (!isEmail.validate(email)) return { user: null };
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
  /*
The context function defined above is called once for every GraphQL operation 
that clients send to our server. The return value of this function becomes the 
context argument that's passed to every resolver that runs as part of that operation.
 
Here's what our context function does:

1. Obtain the value of the Authorization header (if any) included in the incoming request.
2. Decode the value of the Authorization header.
3. If the decoded value resembles an email address, obtain user details for that email address 
from the database and return an object that includes those details in the user field.

By creating this context object at the beginning of each operation's execution, all of our 
resolvers can access the details for the logged-in user and perform actions specifically for 
that user.*/
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
