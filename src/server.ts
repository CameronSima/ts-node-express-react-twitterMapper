/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo"; // (session)
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import expressValidator = require("express-validator");

import { default as ProcessManager } from './utils/processManager';

let processManager = ProcessManager.getInstance();

import Miner from './utils/miner';

const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Controllers 
 */

import * as miningController from "./controllers/miner";
import * as dataController from "./controllers/data";

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";

/**
 * Create Express server
 */
const app = express();

/**
 * Connect to MongoDB.
 */
(<any>mongoose).Promise = Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);

mongoose.connection.on("error", () => {
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3030);
// app.set("views", path.join(__dirname, "../views"));
// app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET,
//   store: new MongoStore({
//     url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
//     autoReconnect: true
//   })
// }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//       req.path !== "/login" &&
//       req.path !== "/signup" &&
//       !req.path.match(/^\/auth/) &&
//       !req.path.match(/\./)) {
//     req.session.returnTo = req.path;
//   } else if (req.user &&
//       req.path == "/account") {
//     req.session.returnTo = req.path;
//   }
//   next();
// });

// serve static ReactJS build 
app.use(express.static(path.join(__dirname, "../../react-client/public"), { maxAge: 31557600000 }));

// Allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'content-type');
    next();
})


// Primary app routes.


// Serve the ReactJS index.html and bundle.js files 
// from the client project folder
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../react-client/index.html'))
});

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(req.session.returnTo || "/");
});

// return the mapbox access token
app.get("/get_mapbox_token", dataController.getMapBoxToken);

app.get("/activate_miner", miningController.getTurnOn);
app.get("/deactivate_miner", miningController.getTurnOff);

// poll this endpoint to get realtime data on the twitter miner
app.get("/mining_status", miningController.getMiningData);

app.get("/tweet_data", dataController.getAll);
app.get("/console", dataController.getConsole);


/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;