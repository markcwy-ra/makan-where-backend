/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const axios = require("axios");

class RestaurantsController extends BaseController {
  constructor(
    model,
    locationModel,
    openingHourModel,
    priceRangeModel,
    restaurantStatusModel,
    userModel
  ) {
    super(model);
    this.locationModel = locationModel;
    this.openingHourModel = openingHourModel;
    this.priceRangeModel = priceRangeModel;
    this.restaurantStatusModel = restaurantStatusModel;
    this.userModel = userModel;
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
      include: [
        this.locationModel,
        this.priceRangeModel,
        this.restaurantStatusModel,
        this.openingHourModel,
      ],
    });

    // If not, get details from API and add to db
    if (!restaurant) {
      // Place details search
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,address_components,formatted_address,place_id,editorial_summary,price_level,business_status,geometry,photos,opening_hours&key=${process.env.GMAPS_API_KEY}`
      );
      const restaurantDataFromAPI = response.data.result;

      restaurant = await this.createRestaurantEntry(restaurantDataFromAPI);

      // Re-fetch restaurant with eager loading
      restaurant = await this.model.findOne({
        where: { id: restaurant.id },
        include: [
          this.locationModel,
          this.priceRangeModel,
          this.restaurantStatusModel,
          this.openingHourModel,
        ],
      });
    }

    return res.json({
      success: true,
      msg: "Successfully retrieved restaurant details",
      data: restaurant,
    });
  };

  // Upvote restaurant
  upvoteRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    const { userId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      const restaurant = await this.model.findByPk(restaurantId);

      if (user && restaurant) {
        await user.addUpvotedRestaurants(restaurant);
        return res.json({
          success: true,
          msg: "Successfully upvoted restaurant",
        });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or restaurant not found" });
      }
    } catch (err) {
      console.log("Error adding upvote:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Remove upvote for restaurant
  removeRestaurantUpvote = async (req, res) => {
    const { restaurantId } = req.params;
    const { userId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      const restaurant = await this.model.findByPk(restaurantId);

      if (user && restaurant) {
        await user.removeUpvotedRestaurants(restaurant);
        return res.json({
          success: true,
          msg: "Successfully removed restaurant upvote",
        });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or restaurant not found" });
      }
    } catch (err) {
      console.log("Error removing upvote:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Get all users who upvoted restaurant
  getRestaurantUpvotes = async (req, res) => {
    const { restaurantId } = req.params;

    try {
      const restaurant = await this.model.findByPk(restaurantId);

      if (restaurant) {
        const upvotes = await restaurant.getUpvotedBy();
        return res.json(upvotes);
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
      }
    } catch (err) {
      console.log("Error getting upvotes:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Count total upvotes for restaurant
  countRestaurantUpvotes = async (req, res) => {
    const { restaurantId } = req.params;

    try {
      const restaurant = await this.model.findByPk(restaurantId);
      const count = await restaurant.countUpvotedBy();
      return res.json({ count });
    } catch (err) {
      console.log("Error counting total upvotes for restaurant");
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Get restaurants upvoted by user
  getUserUpvotes = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotes = await user.getUpvotedRestaurants();
      return res.json(upvotes);
    } catch (err) {
      console.log("Error counting restaurants upvoted by user");
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Count number of restaurants upvoted by user
  countUserUpvotes = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const count = await user.countUpvotedRestaurants();
      return res.json({ count });
    } catch (err) {
      console.log("Error counting restaurants upvoted by user");
      return res.status(500).json({ error: true, msg: err });
    }
  };

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
      let priceRangeId = null;
      if (price_level !== undefined) {
        const priceSymbols = ["$", "$$", "$$$", "$$$$"];
        const priceRange = await this.priceRangeModel.findOne({
          where: { priceRange: priceSymbols[price_level - 1] },
        });

        if (priceRange) {
          priceRangeId = priceRange.id;
        }
      }

      // Find restaurant status
      let statusId = null;
      if (business_status !== undefined) {
        const restaurantStatus = await this.restaurantStatusModel.findOne({
          where: { status: business_status.toLowerCase() },
        });

        if (restaurantStatus) {
          statusId = restaurantStatus.id;
        }
      }

      // Create restaurant
      const [restaurant, restaurantCreated] = await this.model.findOrCreate({
        where: { placeId: place_id },
        defaults: {
          name: name,
          address: formatted_address,
          placeId: place_id,
          locationId: location.id,
          description: editorial_summary ? editorial_summary.overview : null,
          photoUrl: photoUrl,
          googleMapsUrl: googleMapsUrl,
          priceRangeId: priceRangeId,
          statusId: statusId,
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
          if (
            period.open &&
            period.open.time &&
            period.close &&
            period.close.time
          ) {
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
      }

      return restaurant;
    } catch (err) {
      console.log("Error creating restaurant entry:", err);
      return null;
    }
  };
}

module.exports = RestaurantsController;
