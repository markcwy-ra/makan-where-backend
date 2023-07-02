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
        field: "target_id",
      },
      targetType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "target_type",
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: "score",
        defaultValue: 0.0,
      },
      userActivityCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_activity_count",
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
