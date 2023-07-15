const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    items: {
      type: [String],
      //required: [true, "items are required."],
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
