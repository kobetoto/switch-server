const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    items: [
      {
        type: { type: Schema.Types.ObjectId, ref: "Item" }, // referencing
        //required: [true, "items are required."],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
