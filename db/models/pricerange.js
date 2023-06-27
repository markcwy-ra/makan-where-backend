"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PriceRange extends Model {
    static associate(models) {
      this.hasMany(models.restaurant, { foreignKey: "price_range_id" });
    }
  }
  PriceRange.init(
    {
      priceRange: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "price_range",
        validate: {
          isIn: [["$", "$$", "$$$", "$$$$"]],
        },
      },
    },
    {
      sequelize,
      modelName: "pricerange",
      tableName: "price_ranges",
      underscored: true,
    }
  );
  return PriceRange;
};
