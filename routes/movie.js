/**
 * @author warri
 */
var express = require('express');
var movies = require('../data/movie')
var uuid = require('node-uuid');
var api = require('../data/api');
var router = express.Router();

router.get('/', function (req, res) {
  	 var list = movies.getAllMovie().then((Movielist) => {
		if (Movielist) {
			res.status(200).send(Movielist);
		} else {
			res.sendStatus(404);
		}
	});
}),

	router.get('/detail/:id', function (req, res) {
		//check movie collection for this movie
		movies.getMovieByOriginId(req.params.id).then((MovieObj) => {
			if (MovieObj) {
				res.render("movie/detail", {
					movie: MovieObj,
					partial: "jquery-detail-scripts"
				});
			}
			else {
				//search using api
				api.getMovieDetails(req.params.id).then((movie) => {
					if (movie) {
						movies.addMovieGeneral(movie).then((obj) => {
							res.render("movie/detail", {
								movie: movie,
								partial: "jquery-detail-scripts"
							});
						});
					}
				}).catch((error) => {
					res.sendStatus(404);
				});
			}
		});
	}),

	router.post('/', function (req, res) {
		var obj = req.body;
		movies.addMovie(obj).then((MovieObj) => {
			if (MovieObj) {
				res.status(200).send(MovieObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

	router.put('/:id', function (req, res) {
		movies.updateMovieById(req.params.id, req.body).then((MovieObj) => {
			if (MovieObj) {
				//console.log(MovieObj);
				res.status(200).send(MovieObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

	router.delete('/:id', function (req, res) {
		movies.deleteMovieById(req.params.id).then((MovieObj) => {
			if (MovieObj) {
				res.status(200).send(MovieObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

    router.post('/review/:id', function (req, res) {
		var reviewObj = req.body;
		reviewObj._id = uuid.v4();
		movies.addReviewToMovieGeneral(req.params.id, reviewObj).then((movieObj) => {
			if (movieObj) {
				//console.log(PlaylistObj);
				res.status(200).send(movieObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

	router.get('/review/:mid/:rid', function (req, res) {
		movies.getReviewByReviewId(req.params.mid, req.params.rid).then((reviewObj) => {
			if (reviewObj) {
				//console.log(PlaylistObj);
				res.status(200).send(reviewObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

	router.delete('/review/:mid/:rid', function (req, res) {
		movies.removeReviewByReviewId(req.params.mid, req.params.rid).then((movieObj) => {
			if (movieObj) {
				//console.log(PlaylistObj);
				res.status(200).send(movieObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),

	router.put('/review/:mid/:rid', function (req, res) {
		movies.updateReviewByReviewId(req.params.mid, req.params.rid, req.body).then((reviewObj) => {
			if (reviewObj) {
				//console.log(PlaylistObj);
				res.status(200).send(reviewObj);
			} else {
				res.sendStatus(404);
			}
		});
	}),



	module.exports = router;
