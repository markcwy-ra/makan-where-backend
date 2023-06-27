"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Makanlist extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: "user_id" });
      this.belongsTo(models.location, { foreignKey: "location_id" });

      this.belongsToMany(models.restaurant, {
        through: "makanlist_restaurants",
        foreignKey: "makanlist_id",
      });
      this.belongsToMany(models.user, {
        through: "makanlist_upvotes",
        foreignKey: "makanlist_id",
      });
    }
  }
  Makanlist.init(
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "title",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "description",
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "location_id",
        references: {
          model: "location",
          key: "id",
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "photo_url",
        validate: {
          isUrl: true,
        },
      },
    },
    {
      sequelize,
      modelName: "makanlist",
      tableName: "makanlists",
      underscored: true,
    }
  );
  return Makanlist;
};
