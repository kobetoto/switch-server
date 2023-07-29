const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const Transaction = require("../models/Transaction.model");

//middleware JWT🛡️
const { isAuthenticated } = require("../middleware/jwt.middleware");

//CREATE
router.post("/transactions", isAuthenticated, function (req, res, next) {
  // ⚠️
  // - registered! OK ====> isAuthenticated
  // - l'objet t'appartient   ???   ======> {req.payload(=user _id) === req.body.items.user(=user _id)}

  if (req.payload._id === req.body.user) {
    Transaction.create({
      items: req.body.items,
    })
      .then(function (transactionFromDB) {
        res.status(201).json(transactionFromDB);
      })
      .catch((err) => next(err));
  } else {
    res.status(401).json({ message: "Unautorized" });
  }
});

//READ
router.get("/transactions/:id", function (req, res, next) {
  const transactionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  console.log("transactionId ===>", transactionId);

  Transaction.findById(transactionId)
    .then(function (transactionFromDB) {
      console.log("transactionFromDB ===>", transactionFromDB);
      res.status(200).json(transactionFromDB);
    })
    .catch((err) => next(err));
});

module.exports = router;
