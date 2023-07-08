const mongoose = require("mongoose");

const TitleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    idTmdb: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "Anime",
        "Documentário",
        "Dorama",
        "Filme",
        "Novela",
        "Reality show",
        "Serie",
      ],
      required: true,
    },
    genres: {
      type: [String],
      default: ["Não informado"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    overview: {
      type: String,
      default: "Não informado",
    },
    image: {
      type: String,
      default: "Não informado",
    },
    backgroundImg: {
      type: String,
      default: "Não informado",
    },
    episodes: {
      type: Number,
    },
    duration:{
      type: Number,
    },
    status: {
      type: String,
      default: "Em revisão...",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Title", TitleSchema);
