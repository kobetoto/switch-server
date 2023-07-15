const { Schema, model } = require("mongoose");

const itemSchema = new Schema(
  {
    user: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    ville: {
      type: String,
      enum: [
        "Paris",
        "Clamart",
        "Issy-les-moulineaux",
        "Creteil",
        "Boulogne-billancourt",
      ],
    },
    description: {
      type: String,
    },
    image: {
      type: [String],
      //required: [true, "Images are required."],
    },
    grade: { type: Number },
    proposedItems: { type: [String] },
    switched: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;
