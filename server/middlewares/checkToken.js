const User = require("../models/User");
const jwt  = require('jsonwebtoken')
const mongoose = require("mongoose");
const { ObjectId } = require('bson-objectid');

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]

  try {
    if(!token) {
      return res.status(401).json({ msg: 'Acesso negado!' })
    }

    const secret = process.env.SECRET

    jwt.verify(token, secret)

    next()
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: 'Token inválido!' })
  }
}


async function checkGoogleToken(req, res, next) {
  const googleToken = req.body.googleToken; // ou o local adequado para obter o token do Google

  try {
    if (!googleToken) {
      return res.status(401).json({ msg: 'Sem token - Acesso negado!' });
    }

    // Exemplo com a biblioteca "google-auth-library":
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();      

      // Encontre o usuário no banco de dados com base no ID ou email
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        // Crie um novo usuário se não existir no banco de dados
        user = new User({
          email: payload.email,
          name: payload.name,
          socialLogin: true,
          token: ' ',
          password: ' ',
          // outras informações do usuário que desejar
        });
        await user.save();
      }

      // Defina o usuário encontrado ou criado no objeto `req.user`
      req.user = user;

      next();
    }

    verify().catch((error) => {
      console.error(error);
      res.status(500).json({ msg: 'Token do Google inválido!' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Token do Google inválido!' });
  }
}

module.exports = { checkToken, checkGoogleToken };