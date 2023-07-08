const mongoose = require("mongoose");

const FavoriteTitleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FavoriteTitle", FavoriteTitleSchema);