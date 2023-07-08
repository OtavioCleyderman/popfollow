const express = require("express");
const router = express.Router();
const User = require("./models/User");
const {checkToken, checkGoogleToken} = require("./middlewares/checkToken");
const checkPermission = require("./middlewares/checkPermission");

// Importar os controladores necessários
const userController = require("./controllers/userController");
const titleController = require("./controllers/titleController");
const apiController = require("./controllers/api");


// Rota inicial publica
router.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

// Rota de autenticação com o Google
router.post("/auth/google", checkGoogleToken, (req, res) => {
  try {
    // O usuário foi autenticado com sucesso
    const user = req.user;
    
    const token = req.user.generateAuthToken(); // Gere o token JWT para o usuário

    // Armazene o token no usuário autenticado
    req.user.token = token;
    req.user.save();

    // Envie o token e outros dados relevantes para o frontend
    res.json({
      token,
      user,
    });
    // console.log(token)
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro durante a autenticação" });
  }
});

// Rota de callback para redirecionamento após autenticação do Google
router.get("/auth/google/callback", checkGoogleToken, (req, res) => {
  // O usuário foi autenticado com sucesso, você pode redirecioná-lo para a página desejada
  res.redirect("/");
});

// Rotas de teste privada
router.get("/user/:id", checkToken, userController.getUser);

// Rotas para os usuários
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.get("/users", checkToken, userController.list);
router.put("/user/:id", checkToken, userController.update);
router.delete("/user/:id", checkToken, userController.delete); 

// Rotas para os títulos
router.post("/titles", checkToken, titleController.create);
router.get("/titles", checkToken, titleController.list);
router.post("/title/favorite", checkToken, titleController.addToFavorites);
router.get("/title/favorite", checkToken, titleController.getFavorites);
router.get("/title/list-by-id", checkToken, titleController.listById);
router.delete("/title/favorite", checkToken, titleController.removeOneFavorite);
router.put("/title/watched/:id", checkToken, titleController.watched);
router.get("/title/watcheds", checkToken, titleController.getWatcheds);
router.get("/title/:id", checkToken, titleController.details);
router.put("/title/:id", checkPermission, checkToken, titleController.update);
router.delete(
  "/title/:id",
  checkPermission,
  checkToken,
  titleController.delete
);

// Rotas para a API The MovieDB
router.get("/titles/movies/popular", apiController.getPopularMovies);
router.get("/titles/series/popular", apiController.getPopularSeries);


module.exports = router;
