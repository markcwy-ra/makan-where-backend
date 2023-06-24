"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("restaurant_cuisines", {
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
      cuisine_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "cuisines",
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
    await queryInterface.dropTable("restaurant_cuisines");
  },
};
