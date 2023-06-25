"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: "user_id" });
      this.belongsTo(models.restaurant, { foreignKey: "restaurant_id" });

      this.belongsToMany(models.user, {
        through: "review_upvotes",
        foreignKey: "review_id",
      });
    }
  }
  Review.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      rating: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      body: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      photoUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      recommendedDishes: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "review",
      tableName: "reviews",
      underscored: true,
    }
  );
  return Review;
};
