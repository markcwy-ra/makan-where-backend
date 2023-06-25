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
        references: {
          model: "user",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "location",
          key: "id",
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
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
