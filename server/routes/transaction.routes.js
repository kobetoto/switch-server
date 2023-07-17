const express = require("express");

const router = express.Router();

const Transaction = require("../models/Transaction.model");

//CREATE
router.post("/transactions", function (req, res, next) {
  // req.body{ items:["001","789"] }
  Transaction.create({
    items: req.body.items,
  })
    .then(function (transactionFromDB) {
      res.status(201).json(transactionFromDB);
    })
    .catch((err) => next(err));
});

module.exports = router;
