"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("restaurants", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      location_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "locations",
          key: "id",
        },
      },
      description: {
        type: Sequelize.TEXT,
      },
      photo_url: {
        type: Sequelize.STRING,
      },
      google_maps_url: {
        type: Sequelize.STRING,
      },
      average_rating: {
        type: Sequelize.FLOAT,
      },
      price_range_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "price_ranges",
          key: "id",
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("restaurants");
  },
};
