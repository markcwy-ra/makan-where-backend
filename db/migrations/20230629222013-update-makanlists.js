"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("makanlists", "location_id");
    await queryInterface.changeColumn("makanlists", "photo_url", {
      allowNull: true,
      type: Sequelize.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("makanlists", "photo_url", {
      allowNull: false,
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("makanlists", "location_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "locations",
        key: "id",
      },
    });
  },
};
