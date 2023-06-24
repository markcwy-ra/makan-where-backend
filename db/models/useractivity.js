"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserActivity extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: "user_id" });
    }
  }
  UserActivity.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      activityType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "useractivity",
      tableName: "user_activities",
      underscored: true,
    }
  );
  return UserActivity;
};
