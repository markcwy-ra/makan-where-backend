"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("opening_hours", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      restaurant_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "restaurants",
          key: "id",
        },
      },
      day: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      opening_time: {
        type: Sequelize.TIME,
      },
      closing_time: {
        type: Sequelize.TIME,
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
    await queryInterface.dropTable("opening_hours");
  },
};
