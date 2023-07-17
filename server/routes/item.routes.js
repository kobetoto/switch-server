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
    images: req.body.images,
  })
    .then(function (itemFromDB) {
      res.status(201).json(itemFromDB);
    })
    .catch((err) => next(err));
});

//LISTING   (R)
router.get("/items", function (req, res, next) {
  Item.find()
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

// UPDATE   (U) 🛡️
router.patch("/items/:id", isAuthenticated, (req, res, next) => {
  const itemId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Item.findByIdAndUpdate(itemId, req.body, { new: true })
    .then((updatedItem) => res.json(updatedItem))
    .catch((error) => next(err)); // res.status(412).json({message: "doh!"})
});

//PROPOSE
router.put("items/:id/propose", isAuthenticated, (req, res, next) => {
  const itemId = req.params.id;
  Item.findByIdAndUpdate(itemId, req.body.proposedItems, { new: true })
    .then((updatedItem) => res.json(updatedItem))
    .catch((error) => next(err));
});

//DELETE   (D)🛡️
router.delete("/items/:id", isAuthenticated, function (req, res, next) {
  const itemId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Item.findByIdAndRemove(itemId)
    .then(function () {
      res
        .status(204)
        .json({ message: `l'objet (id:${itemId}) est supprimeé ✅` });
    })
    .catch((err) => next(err));
});

module.exports = router;
