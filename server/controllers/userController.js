const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userController = {};

userController.getUser = async (req, res) => {
  const id = req.params.id;

  try {
    // validar o ID antes de fazer a consulta
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de usuário inválido!" });
    }
    // Checar se o usuário existe
    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    res.status(200).json({ msg: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Ops! Estamos com um problema, tente novamente mais tarde!",
    });
  }
};

userController.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validações
    if (!email) {
      return res.status(422).json({ msg: "O email é obrigatório!" });
    }
    if (!name) {
      return res.status(422).json({ msg: "O nome é obrigatório!" });
    }
    if (!password) {
      return res.status(422).json({ msg: "Defina uma senha!" });
    }
    if (password !== confirmPassword) {
      return res
        .status(422)
        .json({ msg: "Senha e confirmação de senha precisam ser iguais!" });
    }

    // Verificar se já existe o email cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email já cadastrado!" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    return res.status(201).json("Usuário criado com sucesso!");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Ops! Aconteceu um erro no servidor, tente mais tarde",
    });
  }
};

userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email) {
      return res.status(422).json({ msg: "O email é obrigatório!" });
    }
    if (!password) {
      return res.status(422).json({ msg: "Insira a senha!" });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(422).json({ msg: "Senha incorreta!" });
    }

    const userLogin = await User.findById(user.id, "-password");
    const secret = process.env.SECRET;
    

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    return res
      .status(200)
      .json({ msg: `Autenticação realizada com sucesso!`, token, userLogin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Ops! Ocorreu um erro no servidor, tente novamente mais tarde!",
      error,
    });
  }
};

// Função para listar todos os usuários
userController.list = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro ao listar usuários" });
  }
};

// Função para atualizar um usuário
userController.update = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    if (
      (!user.administrator && req.body.id !== user.id) ||
      (!user.administrator && req.body.administrator)
    ) {
      return res.status(403).json({ msg: "Permissão negada!" });
    }

    if (!req.body.id) {
      const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      return res
        .status(200)
        .json({ msg: "Usuário atualizado com sucesso!", updateUser });
    }

    const updateUser = await User.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ msg: "Usuário atualizado com sucesso!", updateUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao atualizar usuário" });
  }
};

// Função para deletar um usuário
userController.delete = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // verificar se o id de usuário que querem deletar existe
    const existingUserId = await User.findById(req.body.id);
    if (!existingUserId) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    if (req.params.id == req.body.id) {
      await User.findByIdAndDelete(req.body.id);
      return res.json({ msg: "Usuário deletado com sucesso!" });
      // aplicar o logoff depois
    }

    if (req.params.id !== req.body.id && !user?.administrator) {
      return res.status(403).json({ msg: "Permissão negada!" });
    }

    // Se não parar em nenhum condição acima, será deletado o usuário
    await User.findByIdAndDelete(req.body.id);
    res.json({ msg: "Usuário deletado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro ao deletar usuário!" });
  }
};

module.exports = userController;
