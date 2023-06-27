"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "meal_types",
      [
        {
          meal: "breakfast",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          meal: "brunch",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          meal: "lunch",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          meal: "dinner",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("meal_types", null, {});
  },
};
