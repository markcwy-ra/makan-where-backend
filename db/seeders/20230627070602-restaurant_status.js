"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "restaurant_status",
      [
        {
          status: "operational",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          status: "closed_temporarily",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          status: "closed_permanently",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("restaurant_status", null, {});
  },
};
