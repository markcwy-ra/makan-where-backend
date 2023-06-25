"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OpeningHour extends Model {
    static associate(models) {
      this.belongsTo(models.restaurant, { foreignKey: "restaurant_id" });
    }
  }
  OpeningHour.init(
    {
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      day: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          isIn: [
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
              "Weekdays",
              "Weekends",
              "Public Holidays",
            ],
          ],
        },
      },
      openingTime: {
        type: DataTypes.TIME,
        validate: {
          isAfterClosing(value) {
            if (this.closingTime && value >= this.closingTime) {
              throw new Error("Opening time must be before closing time");
            }
          },
        },
      },
      closingTime: {
        type: DataTypes.TIME,
        validate: {
          isBeforeOpening(value) {
            if (this.openingTime && value <= this.openingTime) {
              throw new Error("Closing time must be after opening time");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "openinghour",
      tableName: "opening_hours",
      underscored: true,
    }
  );
  return OpeningHour;
};
