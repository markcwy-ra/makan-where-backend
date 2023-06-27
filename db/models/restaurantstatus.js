"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RestaurantStatus extends Model {
    static associate(models) {
      this.hasMany(models.restaurant, { foreignKey: "status_id" });
    }
  }
  RestaurantStatus.init(
    {
      status: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        field: "status",
        validate: {
          isIn: [["operational", "closed_temporarily", "closed_permanently"]],
        },
      },
    },
    {
      sequelize,
      modelName: "restaurantstatus",
      tableName: "restaurant_status",
      underscored: true,
    }
  );
  return RestaurantStatus;
};
