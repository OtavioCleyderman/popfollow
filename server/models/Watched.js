const mongoose = require("mongoose");

const WatchedSchema = new mongoose.Schema(
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
    watchedMovie: {
      type: String
    },
    watchedEpisodes: {
      type: [Number]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Watched", WatchedSchema);