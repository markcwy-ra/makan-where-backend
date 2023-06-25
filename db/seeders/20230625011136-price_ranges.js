"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "price_ranges",
      [
        {
          price_range: "$",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          price_range: "$$",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          price_range: "$$$",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          price_range: "$$$$",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("price_ranges", null, {});
  },
};
