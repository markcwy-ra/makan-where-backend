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
        field: "user_id",
        references: {
          model: "user",
          key: "id",
        },
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "restaurant_id",
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      rating: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "rating",
        validate: {
          min: 1,
          max: 5,
        },
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
        field: "title",
      },
      body: {
        allowNull: false,
        type: DataTypes.TEXT,
        field: "body",
      },
      photoUrl: {
        type: DataTypes.STRING,
        field: "photo_url",
        validate: {
          isUrl: true,
        },
      },
      recommendedDishes: {
        type: DataTypes.TEXT,
        field: "recommended_dishes",
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
