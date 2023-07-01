/* eslint-disable no-unused-vars */
const { sequelize } = require("../db/models");
const BaseController = require("./baseController");

class FeaturedActivitiesController extends BaseController {
  constructor(model) {
    super(model);
  }
}

module.exports = FeaturedActivitiesController;
