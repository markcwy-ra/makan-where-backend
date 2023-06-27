"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.review, { foreignKey: "user_id" });
      this.hasMany(models.makanlist, { foreignKey: "user_id" });
      this.hasMany(models.useractivity, { foreignKey: "user_id" });
      this.hasMany(models.refreshtoken, { foreignKey: "user_id" });
      this.hasMany(models.passwordresettoken, { foreignKey: "user_id" });

      this.belongsTo(models.location, { foreignKey: "location_id" });

      this.belongsToMany(models.user, {
        through: "follows",
        foreignKey: "follower_id",
        as: "followingUsers",
      });
      this.belongsToMany(models.user, {
        through: "follows",
        foreignKey: "following_id",
        as: "followerUsers",
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
        field: "email",
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
        field: "password",
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
        field: "username",
        validate: {
          notNull: {
            msg: "Please enter your username",
          },
        },
      },
      address: {
        type: DataTypes.STRING,
        field: "address",
      },
      locationId: {
        type: DataTypes.INTEGER,
        field: "location_id",
        references: {
          model: "location",
          key: "id",
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        field: "photo_url",
        validate: {
          isUrl: true,
        },
      },
      lastLogin: {
        type: DataTypes.DATE,
        field: "last_login",
        validate: {
          isDate: true,
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: "deleted_at",
      },
    },
    {
      sequelize,
      modelName: "user",
      tableName: "users",
      underscored: true,
      paranoid: true,
      hooks: {
        beforeValidate: (user, options) => {
          if (user.username !== undefined) {
            user.username = user.username.trim();
          }
        },
      },
    }
  );
  return User;
};
