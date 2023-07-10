const Title = require("../models/Title");
const FavoriteTitle = require("../models/FavoriteTitle");
const Watched = require("../models/Watched")
const mongoose = require("mongoose");
const titleController = {};

// Função para criar um título
titleController.create = async (req, res) => {
  try {
    const { name, type, genre, overview, image, episodes, userId, status } = req.body;

    const title = new Title({
      name,
      type,
      genres: genre,
      overview,
      image,
      episodes,
      userId,
      status,
    });

    const titleNameLowerCase = title.name.toLocaleLowerCase().split(" ");

    for (let i = 0; i < titleNameLowerCase.length; i++) {
      titleNameLowerCase[i] =
        titleNameLowerCase[i][0].toLocaleUpperCase() +
        titleNameLowerCase[i].substr(1);
    }

    const formattedTitle = titleNameLowerCase.join(" ");

    const existingName = await Title.findOne({ name: formattedTitle });

    if (existingName) {
      return res
        .status(403)
        .json({ msg: "Título já cadastrado", existingName });
    }

    await title.save();
    res.status(201).json({ msg: "Título criado com sucesso!", title });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao criar titulo!" });
  }
};

// Função para listar todos os títulos
titleController.list = async (req, res) => {
  try {
    const titles = await Title.find().sort("name");
    res.status(200).json({ titles });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao listar os titulos!" });
  }
};

// Função para listar todos os titulos favoritos com base nos Ids
titleController.listById = async (req, res) => {
  try {
    const { ids } = req.query;

    const titles = await Title.find({ _id: { $in: ids } }).sort("name");
    res.status(200).json({ titles });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao listar os titulos!" });
  }
};

// Função mostrar os detalhes do filme/serie
titleController.details = async (req, res) => {
  try {
    const id = req.params.id;
    const title = await Title.findById(id);
    res.status(200).json(title);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro buscar detalhes do título!" });
  }
};

// Função para adicionar um título ao favorito
titleController.addToFavorites = async (req, res) => {
  try {
    const { titleId, userId } = req.body;

    const favoriteExisting = await FavoriteTitle.findOne({ titleId, userId });

    if(favoriteExisting) {
      return 
    }
    
    const favoriteTitle = new FavoriteTitle({
      userId,
      titleId,
    });

    await favoriteTitle.save();

    res.status(200).json({ msg: 'Título marcado como favorito com sucesso' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Erro ao marcar título como favorito' });
  }
};

// Função para retornar os titulos favoritos do usuário 
titleController.getFavorites = async (req, res) => {
  try {
    const userId  = req.query.userId;

    const titlesFavorites = await FavoriteTitle.find({ userId }).sort("name");

    if (titlesFavorites) {
      return res.status(200).json({ titlesFavorites });
    } else {
      return res.status(404).json({ msg: 'Nenhum título favoritado no momento!' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Erro listar os títulos favoritados!' });
  }
}

// Função para remover um titulo dos favoritos do usuário 
titleController.removeOneFavorite = async (req, res) => {
  try {
    const { userId, titleId } = req.body;
    let removedItems 

    await FavoriteTitle.deleteMany({ userId, titleId })
      .then((result) => {
        if (result.deletedCount === 0) {
          // Nenhum título encontrado para remoção
          removedItems = "";
        } else {
          // Documentos removidos
          removedItems = `${result.deletedCount} títulos removidos`;
        }
      })
      .catch((error) => {
        // Ocorreu um erro durante a remoção
        console.error("Erro ao remover títulos:", error);
      });

    if (removedItems) {
      return res.status(200).json({ removedItems });
    } else {
      return res.status(404).json({ msg: 'Nenhum título encontrado para remoção!' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Erro listar os títulos favoritados!' });
  }
}

// Função para marcar como assistido
titleController.watched = async (req, res) => {
  try {
    const { userId, titleId, watched, type } = req.body;

    if (type === 'Filme') {
      if (!watched) {
        await Watched.findOneAndDelete({ userId, titleId });
      } else {
        const existingWatchedTitle = await Watched.findOne({ userId, titleId });
        
        if (existingWatchedTitle) {
          existingWatchedTitle.watchedMovie = watched;
          await existingWatchedTitle.save();
        } else {
          const watchedTitle = new Watched({
            userId,
            titleId,
            watchedMovie: watched
          });
          await watchedTitle.save();
        }
      }
    } else if (type === 'Serie') {
      const existingWatchedTitle = await Watched.findOne({ userId, titleId });

      if (existingWatchedTitle) {
        const episodeIndex = existingWatchedTitle.watchedEpisodes.indexOf(watched);
        if (episodeIndex !== -1) {
          existingWatchedTitle.watchedEpisodes.splice(episodeIndex, 1);
          if(existingWatchedTitle.watchedEpisodes.length === 0){
            await Watched.findOneAndDelete({ userId, titleId });
          } else {
            await existingWatchedTitle.save();
          }
        } else if (!existingWatchedTitle.watchedEpisodes.includes(watched)) {
          existingWatchedTitle.watchedEpisodes.push(watched);
          await existingWatchedTitle.save();
        }
      }else {
        const watchedTitle = new Watched({
          userId,
          titleId,
          watchedEpisodes: watched
        });
        await watchedTitle.save();
      }
    }
    res.status(200).json({ msg: 'Título e/ou episódio marcado como visto!' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao tentar marcar como visto!' });
  }
}

// Função para retornar os titulos assistidos do usuário 
titleController.getWatcheds = async (req, res) => {
  try {
    const userId  = req.query.userId;

    const titlesWatcheds = await Watched.find({ userId }).sort("name");

    if (titlesWatcheds) {
      return res.status(200).json({ titlesWatcheds });
    } else {
      return res.status(404).json({ msg: 'Nenhum título assistido/assistindo no momento!' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Erro listar os títulos que está assistindo ou assistiu!' });
  }
}

// Função para atualizar um título
titleController.update = async (req, res) => {
  try {
    const { name, type, genre, image, episodes, status } = req.body;

    // verificar se o id do título que querem alterar existe
    const existingUserId = await Title.findById(req.params.id);
    if (!existingUserId) {
      return res.status(404).json({ msg: "Título não encontrado!" });
    }

    // Trabalhar com o titulo que inseriram para formatar ele
    const titleNameLowerCase = name.toLocaleLowerCase().split(" ");

    for (let i = 0; i < titleNameLowerCase.length; i++) {
      titleNameLowerCase[i] =
        titleNameLowerCase[i][0].toLocaleUpperCase() +
        titleNameLowerCase[i].substr(1);
    }

    const formattedTitle = titleNameLowerCase.join(" ");

    const title = await Title.findByIdAndUpdate(
      req.params.id,
      { name: formattedTitle, type, genre, image, episodes, status },
      { new: true }
    );
    res.json({ msg: "Alteração realizada com sucesso!", title });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao tentar alterar titulo!" });
  }
};

// Função para deletar um título
titleController.delete = async (req, res) => {
  try {
    // validar o ID antes de prosseguir
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ msg: "ID do título inválido!" });
    }
    // verificar se o id do título que querem deletar existe
    const existingTitleId = await Title.findById(req.params.id);
    if (!existingTitleId) {
      return res.status(404).json({ msg: "Título não encontrado!" });
    }

    await Title.findByIdAndRemove(req.params.id);
    res.json({ msg: "Titulo deletado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Falha em deletar o titulo!" });
  }
};

module.exports = titleController;
