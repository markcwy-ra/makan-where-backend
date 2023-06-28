"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      this.hasMany(models.review, { foreignKey: "restaurant_id" });
      this.hasMany(models.openinghour, { foreignKey: "restaurant_id" });

      this.belongsTo(models.pricerange, { foreignKey: "price_range_id" });
      this.belongsTo(models.restaurantstatus, { foreignKey: "status_id" });
      this.belongsTo(models.location, { foreignKey: "location_id" });

      this.belongsToMany(models.makanlist, {
        through: "makanlist_restaurants",
        foreignKey: "restaurant_id",
      });
      this.belongsToMany(models.cuisine, {
        through: "restaurant_cuisines",
        foreignKey: "restaurant_id",
      });
      this.belongsToMany(models.dietarypreference, {
        through: "restaurant_dietary_preferences",
        foreignKey: "restaurant_id",
      });
      this.belongsToMany(models.user, {
        through: "restaurant_upvotes",
        foreignKey: "restaurant_id",
        as: "upvotedBy",
      });
      this.belongsToMany(models.mealtype, {
        through: "restaurant_meal_types",
        foreignKey: "restaurant_id",
      });
    }
  }
  Restaurant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "name",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "address",
      },
      placeId: {
        type: DataTypes.STRING,
        field: "place_id",
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        field: "location_id",
        references: {
          model: "location",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
        field: "description",
      },
      photoUrl: {
        type: DataTypes.TEXT,
        field: "photo_url",
        validate: {
          isUrl: true,
        },
      },
      googleMapsUrl: {
        type: DataTypes.STRING,
        field: "google_maps_url",
        validate: {
          isUrl: true,
        },
      },
      averageRating: {
        type: DataTypes.FLOAT,
        field: "average_rating",
        validate: {
          min: 0,
          max: 5,
        },
      },
      priceRangeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "price_range_id",
        references: {
          model: "pricerange",
          key: "id",
        },
        validate: {
          max: 4,
          min: 1,
        },
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status_id",
        references: {
          model: "restaurantstatus",
          key: "id",
        },
        validate: {
          max: 3,
          min: 1,
        },
      },
    },
    {
      sequelize,
      modelName: "restaurant",
      tableName: "restaurants",
      underscored: true,
    }
  );
  return Restaurant;
};
