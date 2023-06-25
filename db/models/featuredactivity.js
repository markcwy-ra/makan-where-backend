"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FeaturedActivity extends Model {
    static associate(models) {}
  }
  FeaturedActivity.init(
    {
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      userActivityCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "featuredactivity",
      tableName: "featured_activities",
      underscored: true,
    }
  );
  return FeaturedActivity;
};
