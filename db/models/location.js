"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      this.hasMany(models.user, { foreignKey: "location_id" });
      this.hasMany(models.restaurant, { foreignKey: "location_id" });
    }
  }
  Location.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "name",
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "city",
      },
      state: {
        type: DataTypes.STRING,
        field: "state",
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "country",
      },
      latitude: {
        type: DataTypes.DOUBLE,
        field: "latitude",
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DOUBLE,
        field: "longitude",
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
