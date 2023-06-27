"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MealType extends Model {
    static associate(models) {
      this.belongsToMany(models.restaurant, {
        through: "restaurant_meal_types",
        foreignKey: "meal_type_id",
      });
    }
  }
  MealType.init(
    {
      meal: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "meal",
        validate: {
          isIn: [["breakfast", "brunch", "lunch", "dinner"]],
        },
      },
    },
    {
      sequelize,
      modelName: "mealtype",
      tableName: "meal_types",
      underscored: true,
    }
  );
  return MealType;
};
