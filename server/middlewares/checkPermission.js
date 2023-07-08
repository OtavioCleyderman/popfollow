const User = require("../models/User");

const checkPermission = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    if (!user?.administrator) {
      return res.status(403).json({ msg: "Permissão negada!" });
    }

    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Ops! Ocorreu um erro ao verificar permissão!" });
  }
};

module.exports = checkPermission;
