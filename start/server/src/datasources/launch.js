const { RESTDataSource } = require("apollo-datasource-rest");
// The RESTDataSource class provides helper methods that correspond to HTTP verbs like GET and POST.
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }
  async getAllLaunches() {
    //   The call to this.get('launches') sends a GET request to https://api.spacexdata.com/v2/launches and stores the array of returned launches in response.

    const response = await this.get("launches");
    return Array.isArray(response)
      ? response.map((launch) => this.launchReducer(launch))
      : [];
    //   We use this.launchReducer to transform each returned launch into the format expected by our schema. If there are no launches, an empty array is returned.
    // The launchReducer method, which transforms returned launch data into the shape that our schema expects. This approach decouples the structure of your schema from the structure of the various data sources that populate its fields.
  }
  //   Using a reducer like this enables the getAllLaunches method to remain concise as our definition of a Launch potentially changes and grows over time. It also helps with testing the LaunchAPI class, which we'll cover later.

  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }

  //   The getLaunchById method takes a launch's flight number and returns the data for the associated launch.
  async getLaunchById({ launchId }) {
    const response = await this.get("launches", { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  //   The getLaunchesByIds method returns the result of multiple calls to getLaunchById.
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map((launchId) => this.getLaunchById({ launchId }))
    );
  }
}

module.exports = LaunchAPI;
