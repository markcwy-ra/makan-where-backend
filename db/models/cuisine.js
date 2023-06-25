"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cuisine extends Model {
    static associate(models) {
      this.belongsToMany(models.user, {
        through: "user_cuisine_preferences",
        foreignKey: "cuisine_id",
      });
      this.belongsToMany(models.restaurant, {
        through: "restaurant_cuisines",
        foreignKey: "cuisine_id",
      });
    }
  }
  Cuisine.init(
    {
      cuisine: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "cuisine",
      tableName: "cuisines",
      underscored: true,
    }
  );
  return Cuisine;
};
