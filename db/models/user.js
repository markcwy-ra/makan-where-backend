"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require(".");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.review, { foreignKey: "user_id" });
      this.hasMany(models.makanlist, { foreignKey: "user_id" });
      this.hasMany(models.useractivity, { foreignKey: "user_id" });

      this.belongsTo(models.location, { foreignKey: "location_id" });

      this.belongsToMany(models.user, {
        through: "follows",
        foreignKey: "follower_id",
      });
      this.belongsToMany(models.user, {
        through: "follows",
        foreignKey: "following_id",
      });
      this.belongsToMany(models.dietarypreference, {
        through: "user_dietary_preferences",
        foreignKey: "user_id",
      });
      this.belongsToMany(models.cuisine, {
        through: "user_cuisine_preferences",
        foreignKey: "user_id",
      });
      this.belongsToMany(models.restaurant, {
        through: "restaurant_upvotes",
        foreignKey: "user_id",
      });
      this.belongsToMany(models.review, {
        through: "review_upvotes",
        foreignKey: "user_id",
      });
      this.belongsToMany(models.makanlist, {
        through: "makanlist_upvotes",
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notNull: {
            msg: "Please enter your email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isValidPassword(value) {
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(value)) {
              throw new Error(
                "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
              );
            }
          },
          notNull: {
            msg: "Please enter your password",
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Please enter your username",
          },
        },
      },
      refreshToken: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      locationId: {
        type: DataTypes.INTEGER,
        references: {
          model: "location",
          key: "id",
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      lastLogin: {
        type: DataTypes.DATE,
        validate: {
          isDate: true,
        },
      },
    },
    {
      sequelize,
      modelName: "user",
      tableName: "users",
      underscored: true,
      hooks: {
        beforeValidate: (user, options) => {
          user.username = user.username.trim(); // remove leading and trailing spaces
        },
      },
    }
  );
  return User;
};