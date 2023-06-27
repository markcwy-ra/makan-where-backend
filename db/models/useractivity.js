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
        field: "user_id",
        references: {
          model: "user",
          key: "id",
        },
      },
      activityType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "activity_type",
      },
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
