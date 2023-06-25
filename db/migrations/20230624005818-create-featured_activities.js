"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("featured_activities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      target_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      target_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      score: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      user_activity_count: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("featured_activities");
  },
};
