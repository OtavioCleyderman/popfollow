const express = require("express");
const session = require('express-session');
const app = express();
const routes = require("./routes");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

// Configurar o middleware express-session
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false
  })
);

// Configurar o express para leitura de json
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Configuração da conexão com o banco de dados
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const MONGODB_URI = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.soshuae.mongodb.net/?retryWrites=true&w=majority`;
const db = mongoose.connection;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB database!");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rotas
  app.use("/", routes);

  // Iniciar o servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
  });
});
