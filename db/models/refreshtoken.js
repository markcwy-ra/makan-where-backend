"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: "user_id" });
    }
  }
  RefreshToken.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "token",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_valid",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "refreshtoken",
      tableName: "refresh_tokens",
      underscored: true,
    }
  );
  return RefreshToken;
};
