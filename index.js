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
const ReviewsRouter = require("./routers/reviewsRouter");
const MakanlistsRouter = require("./routers/makanlistsRouter");
const UserActivitiesRouter = require("./routers/userActivitiesRouter");
const FeaturedActivitiesRouter = require("./routers/featuredActivitiesRouter");

// Import controllers
const UsersController = require("./controllers/usersController");
const AuthController = require("./controllers/authController");
const RestaurantsController = require("./controllers/restaurantsController");
const FollowsController = require("./controllers/followsController");
const ReviewsController = require("./controllers/reviewsController");
const MakanlistsController = require("./controllers/makanlistsController");
const UserActivitiesController = require("./controllers/userActivitiesController");
const FeaturedActivitiesController = require("./controllers/featuredActivitiesController");

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
  review,
  makanlist,
  useractivity,
  featuredactivity,
} = db;

// Initialise controllers
const usersController = new UsersController(user, refreshtoken);
const authController = new AuthController(
  user,
  refreshtoken,
  passwordresettoken
);
const featuredActivitiesController = new FeaturedActivitiesController(
  featuredactivity,
  restaurant,
  review,
  makanlist,
  useractivity
);
const userActivitiesController = new UserActivitiesController(
  useractivity,
  user,
  restaurant,
  review,
  makanlist
);
const restaurantsController = new RestaurantsController(
  restaurant,
  location,
  openinghour,
  pricerange,
  restaurantstatus,
  user,
  useractivity
);
const followsController = new FollowsController(user, useractivity);
const reviewsController = new ReviewsController(
  review,
  restaurant,
  user,
  useractivity
);
const makanlistsController = new MakanlistsController(
  makanlist,
  restaurant,
  user,
  useractivity
);

// Initialise routers
const usersRouter = new UsersRouter(usersController, verifyToken).routes();
const authRouter = new AuthRouter(authController, verifyToken).routes();
const featuredActivitiesRouter = new FeaturedActivitiesRouter(
  featuredActivitiesController,
  verifyToken
).routes();
const userActivitiesRouter = new UserActivitiesRouter(
  userActivitiesController,
  verifyToken
).routes();
const restaurantsRouter = new RestaurantsRouter(
  restaurantsController,
  verifyToken
).routes();
const followsRouter = new FollowsRouter(
  followsController,
  verifyToken
).routes();
const reviewsRouter = new ReviewsRouter(
  reviewsController,
  verifyToken
).routes();
const makanlistsRouter = new MakanlistsRouter(
  makanlistsController,
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
app.use("/feed/featured", featuredActivitiesRouter);
app.use("/feed/user", userActivitiesRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/follows", followsRouter);
app.use("/reviews", reviewsRouter);
app.use("/makanlists", makanlistsRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
