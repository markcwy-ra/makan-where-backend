"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DietaryPreference extends Model {
    static associate(models) {
      this.belongsToMany(models.user, {
        through: "user_dietary_preferences",
        foreignKey: "dietary_preference_id",
      });
      this.belongsToMany(models.restaurant, {
        through: "restaurant_dietary_preferences",
        foreignKey: "dietary_preference_id",
      });
    }
  }
  DietaryPreference.init(
    {
      preference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "preference",
        validate: {
          isIn: [["Vegan", "Vegetarian", "Gluten-free", "Halal"]],
        },
      },
    },
    {
      sequelize,
      modelName: "dietarypreference",
      tableName: "dietary_preferences",
      underscored: true,
    }
  );
  return DietaryPreference;
};
