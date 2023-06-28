const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8000;
const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

// Import middlewares
const verifyToken = require("./middlewares/verifyToken");

// Import routers
const UsersRouter = require("./routers/usersRouter");
const AuthRouter = require("./routers/authRouter");
const RestaurantsRouter = require("./routers/restaurantsRouter");
const FollowsRouter = require("./routers/followsRouter");

// Import controllers
const UsersController = require("./controllers/usersController");
const AuthController = require("./controllers/authController");
const RestaurantsController = require("./controllers/restaurantsController");
const FollowsController = require("./controllers/followsController");

// Import db
const db = require("./db/models/index");
const {
  user,
  refreshtoken,
  passwordresettoken,
  restaurant,
  location,
  openinghour,
  pricerange,
  restaurantstatus,
} = db;

// Initialise controllers
const usersController = new UsersController(user, refreshtoken);
const authController = new AuthController(
  user,
  refreshtoken,
  passwordresettoken
);
const restaurantsController = new RestaurantsController(
  restaurant,
  location,
  openinghour,
  pricerange,
  restaurantstatus,
  user
);
const followsController = new FollowsController(user);

// Initialise routers
const usersRouter = new UsersRouter(usersController, verifyToken).routes();
const authRouter = new AuthRouter(authController, verifyToken).routes();
const restaurantsRouter = new RestaurantsRouter(
  restaurantsController,
  verifyToken
).routes();
const followsRouter = new FollowsRouter(
  followsController,
  verifyToken
).routes();

// Enable CORS
app.use(cors(corsOptions));

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use routers
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/follows", followsRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
