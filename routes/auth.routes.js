const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { Schema, model } = require("mongoose");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const fileUploader = require("../config/cloudinary.config");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

/* POST /api/users  
SIGNUP- Creates a new user in the database */
router.post("/users", fileUploader.single("imageUrl"), (req, res, next) => {
  const { email, password, name } = req.body;
  console.log("REQ.BODY ===>", req.body);

  // Si champs vide
  if (email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // REGEX email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // REGEX password
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({
        email,
        password: hashedPassword,
        name,
      });
    })
    .then((createdUser) => {
      // CreatedUser ==> data que nous retourne  la promise User.create()
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, name, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, name, _id };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch((err) => {
      console.log("err sign up: ", err);
      res.status(500).json({ message: "error creation user" });
    });
});

/* POST  /api/login     
LOGIN Verifies email and password and returns a JWT*/
router.post("/sessions", (req, res, next) => {
  const { email, password } = req.body;

  // Si champs vide
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare les 2mots de passe comparSync return TRUE (or FALSE)
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "12h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// PATCH  /api/users/:id   (U) 🛡️ + Owneur
router.patch("/users/:id", (req, res, next) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  User.findByIdAndUpdate(userId, req.body, { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch((error) => next(error));
});

//SHOW one user (R)
router.get("/users/:id", function (req, res, next) {
  //const { projectId } = req.params; "ca ne marche pas" 🧩debog: console.log(projectId)🧩

  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  console.log("userId ===>", userId);

  User.findById(userId)
    .then(function (userFromDB) {
      console.log("userFromDB ===>", userFromDB);
      res.status(200).json(userFromDB);
    })
    .catch((err) => next(err));
});

/* GET  /api/verify 🛡️   
Used to verify JWT stored on the client
utilise le middlewear isAuthenticated pour renvoyer les infos dans la payload
*/
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  console.log(`req.payload`, req.payload);
  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

/*DELETE ?????*/

module.exports = router;
