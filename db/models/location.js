"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      this.hasMany(models.user, { foreignKey: "location_id" });
      this.hasMany(models.restaurant, { foreignKey: "location_id" });
      this.hasMany(models.makanlist, { foreignKey: "location_id" });
    }
  }
  Location.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -180,
          max: 180,
        },
      },
    },
    {
      sequelize,
      modelName: "location",
      tableName: "locations",
      underscored: true,
      validate: {
        bothCoordsOrNone() {
          if ((this.latitude === null) !== (this.longitude === null)) {
            throw new Error("Either both latitude and longitude, or neither!");
          }
        },
      },
    }
  );
  return Location;
};
