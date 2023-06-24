"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      this.hasMany(models.review, { foreignKey: "restaurant_id" });
      this.hasMany(models.openinghour, { foreignKey: "restaurant_id" });

      this.belongsTo(models.pricerange, { foreignKey: "price_range_id" });
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
      });
    }
  }
  Restaurant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        references: {
          model: "location",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      photoUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      googleMapsUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      averageRating: {
        type: DataTypes.FLOAT,
        validate: {
          min: 0,
          max: 5,
        },
      },
      priceRangeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "pricerange",
          key: "id",
        },
        validate: {
          max: 4,
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
