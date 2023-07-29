const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const Transaction = require("../models/Transaction.model");

//middleware JWT🛡️
const { isAuthenticated } = require("../middleware/jwt.middleware");

//CREATE

// POST /transactions
// {
//   user: "9876", // A ENLEVER
//   items: ["1234", "2345"] // (1er = le mien, 2e = celui que j'accepte)
// }

router.post("/transactions", isAuthenticated, function (req, res, next) {
  // ⚠️
  // 0. findByIid l'item, "1234"
  // 1. que le user connecte possede l'item "1234": que tu check que son .user EST le user connecte
  // 2. que "2345" fait parti des objets proposes: .proposedItems

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
