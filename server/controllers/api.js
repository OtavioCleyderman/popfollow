const axios = require("axios");
const Titles = require("../models/Title");
require("dotenv").config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Função para obter os títulos populares da API do TheMovieDB
exports.getPopularMovies = async (req, res) => {
  try {
    let page = 1;
    let totalPages = 60;
    let filteredMovies  = [];
 
    while (page <= totalPages) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );

       const movies = response.data.results;
      

      for (let i = 0; i < movies.length; i++) {
        const { title, id, overview, poster_path, backdrop_path } = movies[i];

         // Consultar informações adicionais de cada série
         const moviesInfoResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );

        const { genres, runtime } = moviesInfoResponse.data;
        // Extrair apenas os nomes dos gêneros
        const genreNames = genres.map((genre) => genre.name);

        const filteredMoviesInfo = {
          title,
          id,
          overview,
          poster_path,
          backdrop_path,
          genres: genreNames,
          runtime,
        };

        // Verificar se o filme já existe no banco de dados por ID ou nome
        const existingMovie = await Titles.findOne({
          $or: [{ idTmdb: id }, { name: title }],
        });


        if (existingMovie) {
          // Verificar se houve alteração nos dados
          if (
            existingMovie.genres.toString() !== genreNames.toString() ||
            existingMovie.duration !== runtime || existingMovie.overview !== overview
          ) {
            // Atualizar os dados no banco de dados
            existingMovie.genres = genreNames;
            existingMovie.duration = runtime;
            existingMovie.overview = overview;
            await existingMovie.save();
            
          } 
        } else {
          // O filme não existe no banco de dados, salvar no banco
          const movie = new Titles({
            name: title,
            idTmdb: id,
            type: 'Filme',
            overview,
            image: poster_path,
            backgroundImg: backdrop_path,
            status: 'TMDB',
            genres: genreNames,
            duration: runtime,
          });

          await movie.save();
        }

        filteredMovies.push(filteredMoviesInfo);
    }

      page++;
    }


    res.json(filteredMovies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter os títulos populares" });
  }
};


// Função para obter os títulos de séries populares da API do TheMovieDB
exports.getPopularSeries = async (req, res) => {
  try {
    let page = 1;
    let totalPages = 60;
    let filteredSeries = [];
    
    while (page <= totalPages) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );

        const series = response.data.results;
      

      for (let i = 0; i < series.length; i++) {
        const { name, id, overview, poster_path, backdrop_path } = series[i];
         // Consultar informações adicionais de cada série
         const seriesInfoResponse = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`
        );
        const { genres, number_of_episodes  } = seriesInfoResponse.data;
        // Extrair apenas os nomes dos gêneros
        const genreNames = genres.map((genre) => genre.name);

        const filteredSeriesInfo = {
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          genres: genreNames,
          episodes: number_of_episodes,
        };
        
        // Verificar se o filme já existe no banco de dados por ID ou nome
        const existingSerie = await Titles.findOne({
          $or: [{ idTmdb: id }, { name }],
        });

        if (existingSerie) {
          // Verificar se houve alteração nos dados
          if (
            existingSerie.genres.toString() !== genreNames.toString() ||
            existingSerie.episodes !== number_of_episodes || existingSerie.overview !== overview
          ) {
            // Atualizar os dados no banco de dados
            existingSerie.genres = genreNames;
            existingSerie.episodes = number_of_episodes;
            existingSerie.overview = overview;
            await existingSerie.save();
          }
        } else {
          // A serie não existe no banco de dados, salvar no banco
          const serie = new Titles({
            name,
            idTmdb: id,
            type: 'Serie',
            overview,
            image: poster_path,
            backgroundImg: backdrop_path,
            status: 'TMDB',
            genres: genreNames,
            episodes: number_of_episodes,
          });

          await serie.save();
        }

        filteredSeries.push(filteredSeriesInfo);      
      }
      page++;
    }
    res.json(filteredSeries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao obter os títulos populares" });
  }
};



