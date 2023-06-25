"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "dietary_preferences",
      [
        {
          preference: "gluten_free",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          preference: "halal",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          preference: "kosher",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          preference: "vegan",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          preference: "vegetarian",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("dietary_preferences", null, {});
  },
};
