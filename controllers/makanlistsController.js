/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");

class MakanlistsController extends BaseController {
  constructor(model, restaurantModel, userModel) {
    super(model);
    this.restaurantModel = restaurantModel;
    this.userModel = userModel;
  }
}

module.exports = MakanlistsController;
