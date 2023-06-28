/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const axios = require("axios");

class RestaurantsController extends BaseController {
  constructor(
    model,
    locationModel,
    mealTypeModel,
    openingHourModel,
    priceRangeModel,
    restaurantStatusModel
  ) {
    super(model);
    this.locationModel = locationModel;
    this.mealTypeModel = mealTypeModel;
    this.openingHourModel = openingHourModel;
    this.priceRangeModel = priceRangeModel;
    this.restaurantStatusModel = restaurantStatusModel;
  }

  // Get restaurants from search
  getRestaurants = async (req, res) => {
    const { searchTerm, priceLevel, lat, lng } = req.query;

    try {
      // API request
      const apiUrl = new URL(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
      );

      // Set parameters
      apiUrl.searchParams.set(`location`, `${lat}, ${lng}`);
      apiUrl.searchParams.set(`radius`, 5000);
      apiUrl.searchParams.set(`type`, `restaurant`);
      apiUrl.searchParams.set(`keyword`, searchTerm);
      apiUrl.searchParams.set(`key`, process.env.GMAPS_API_KEY);

      // Add filters to request
      if (priceLevel) {
        apiUrl.searchParams.set(`maxprice`, priceLevel);
      }

      const response = await axios.get(apiUrl.href);
      let results = response.data.results;

      return res.json({
        success: true,
        msg: "Successfully retrieved search results",
        data: results,
      });
    } catch (err) {
      console.log("Error retrieving restaurants:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Error retrieving restaurants" });
    }
  };

  // Get restaurant details from API or add restaurant to db
  getOrAddRestaurant = async (req, res) => {
    const { placeId } = req.params;

    // Check if restaurant is in db
    let restaurant = await this.model.findOne({
      where: { placeId },
    });

    // If not, get details from API and add to db
    if (!restaurant) {
      // Place details search
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,address_components,formatted_address,place_id,editorial_summary,price_level,business_status,geometry,photos,opening_hours&key=${process.env.GMAPS_API_KEY}`
      );
      const restaurantDataFromAPI = response.data.result;
      restaurant = await this.createRestaurantEntry(restaurantDataFromAPI);
    }

    return res.json({
      success: true,
      msg: "Successfully retrieved restaurant details",
      data: restaurant,
    });
  };

  // Update restaurant info

  // Upvote restaurant

  // Count upvotes for restaurant

  // Remove upvote for restaurant

  createRestaurantEntry = async (restaurantDataFromAPI) => {
    try {
      const {
        name,
        address_components,
        formatted_address,
        place_id,
        editorial_summary,
        price_level,
        business_status,
        geometry,
        photos,
        opening_hours,
      } = restaurantDataFromAPI;
      const { lat, lng } = geometry.location;
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${place_id}`;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${process.env.GMAPS_API_KEY}`;

      let city, state, country;
      for (let i = 0; i < address_components.length; i++) {
        if (address_components[i].types.includes("locality")) {
          city = address_components[i].long_name;
        }
        if (
          address_components[i].types.includes("administrative_area_level_1")
        ) {
          state = address_components[i].long_name;
        }
        if (address_components[i].types.includes("country")) {
          country = address_components[i].long_name;
        }
      }

      // Create location entry
      const [location, locationCreated] = await this.locationModel.findOrCreate(
        {
          where: { latitude: lat, longitude: lng },
          defaults: {
            name: formatted_address,
            city: city,
            state: state,
            country: country,
            latitude: lat,
            longitude: lng,
          },
        }
      );

      // Find price range
      const priceSymbols = ["$", "$$", "$$$", "$$$$"];
      const priceRange = await this.priceRangeModel.findOne({
        where: { priceRange: priceSymbols[price_level - 1] },
      });

      // Find restaurant status
      const restaurantStatus = await this.restaurantStatusModel.findOne({
        where: { status: business_status.toLowerCase() },
      });

      // Create restaurant
      const [restaurant, restaurantCreated] = await this.model.findOrCreate({
        where: { placeId: place_id },
        defaults: {
          name: name,
          address: formatted_address,
          placeId: place_id,
          locationId: location.id,
          description: editorial_summary ? editorial_summary : null,
          photoUrl: photoUrl,
          googleMapsUrl: googleMapsUrl,
          priceRangeId: priceRange.id,
          statusId: restaurantStatus.id,
        },
      });

      // Create opening hours
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (opening_hours && opening_hours.periods) {
        for (const period of opening_hours.periods) {
          const openingHour = {
            day: days[period.open.day],
            openingTime: `${period.open.time.slice(
              0,
              2
            )}:${period.open.time.slice(2)}`,
            closingTime: `${period.close.time.slice(
              0,
              2
            )}:${period.close.time.slice(2)}`,
            restaurantId: restaurant.id,
          };
          await this.openingHourModel.create(openingHour);
        }
      }

      return restaurant;
    } catch (err) {
      console.log("Error creating restaurant entry:", err);
      return null;
    }
  };
}

module.exports = RestaurantsController;