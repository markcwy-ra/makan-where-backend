class BaseController {
  constructor(model) {
    this.model = model;
  }

  getAll = async (req, res) => {
    console.log(this.model);
    try {
      const output = await this.model.findAll();
      return res.json(output);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  };
}

module.exports = BaseController;
