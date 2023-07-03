/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");

class MapController extends BaseController {
  constructor(model, restaurantModel) {
    super(model);
    this.restaurantModel = restaurantModel;
  }

  getRestaurantsInViewport = async (req, res) => {
    // Fetch viewport bounds from request
    const { north, south, east, west } = req.query;

    try {
      const northBoundary = parseFloat(north);
      const southBoundary = parseFloat(south);
      const eastBoundary = parseFloat(east);
      const westBoundary = parseFloat(west);

      const restaurants = await this.restaurantModel.findAll({
        include: [
          {
            model: this.model,
            where: {
              [Op.and]: [
                {
                  latitude: {
                    [Op.between]: [southBoundary, northBoundary],
                  },
                },
                {
                  longitude: {
                    [Op.between]: [westBoundary, eastBoundary],
                  },
                },
              ],
            },
            as: "location",
          },
        ],
        limit: 15,
        order: [
          ["averageRating", "DESC"],
          ["name", "ASC"],
        ],
      });

      return res.status(200).json({ success: true, restaurants });
    } catch (err) {
      console.log("Error getting restaurants:", err);
      return res.status(500).json({
        success: false,
        msg: "An error occurred while fetching restaurants in viewport",
      });
    }
  };
}

module.exports = MapController;
