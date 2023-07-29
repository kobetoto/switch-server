const express = require("express");

const mongoose = require("mongoose");

const router = express.Router();

//middleware JWT🛡️
const { isAuthenticated } = require("../middleware/jwt.middleware");

const Item = require("../models/Item.model");

//CREATE   (C) 🛡️
router.post("/items", isAuthenticated, function (req, res, next) {
  console.log("req.payload====>", req.payload);
  // req.body{ name: "Maillot basket",ville: "Paris"...}
  Item.create({
    user: req.payload._id, // id du user connecte
    name: req.body.name,
    ville: req.body.ville,
    description: req.body.description,
    image: req.body.image,
  })
    .then(function (itemFromDB) {
      res.status(201).json(itemFromDB);
    })
    .catch((err) => next(err));
});

//LISTING   (R)
router.get("/items", function (req, res, next) {
  Item.find()
    .populate("user")
    .then(function (allItems) {
      res.status(200).json(allItems);
    })
    .catch((err) => next(err));
});

//SHOW one object  (R)
router.get("/items/:id", function (req, res, next) {
  //const { projectId } = req.params; "ca ne marche pas" 🧩debog: console.log(projectId)🧩

  const itemId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  console.log("itemId ===>", itemId);

  Item.findById(itemId)
    .then(function (itemFromDB) {
      console.log("itemFromDB ===>", itemFromDB);
      res.status(200).json(itemFromDB);
    })
    .catch((err) => next(err));
});

// UPDATE   (U) 🛡️ + Owneur
router.patch("/items/:id", isAuthenticated, (req, res, next) => {
  const itemId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Item.findById(itemId).then((item) => {
    console.log("req.payload._id===>", req.payload._id);
    console.log("item.user===>", item.user);

    if (req.payload._id === item.user.toString()) {
      Item.findByIdAndUpdate(itemId, req.body, { new: true })
        .then((updatedItem) => {
          res.json(updatedItem);
        })
        .catch((error) => next(error)); // res.status(412).json({message: "doh!"})
    } else {
      res.status(401).json({ message: "Unautorized" });
    }
  });
});

//PROPOSE    (U) 🛡️
router.patch("/items/:id/propose", isAuthenticated, (req, res, next) => {
  const itemId = req.params.id;
  Item.findByIdAndUpdate(
    itemId,
    {
      $push: { proposedItems: req.body.item }, // rajouter a quel proposedItem le maillot ou la montre
    },
    { new: true }
  )
    .then((updatedItem) => res.status(204).json(updatedItem))
    .catch((error) => next(err));
});

//DELETE   (D)🛡️ + Owneur
router.delete("/items/:id", isAuthenticated, function (req, res, next) {
  const itemId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Item.findById(itemId).then((item) => {
    if (req.payload._id === item.user.toString()) {
      Item.findByIdAndRemove(itemId)
        .then(function () {
          res
            .status(204)
            .json({ message: `l'objet (id:${itemId}) est supprimeé ✅` });
        })
        .catch((err) => next(err));
    } else {
      res.status(401).json({ message: "Unautorized" });
    }
  });
});

module.exports = router;
