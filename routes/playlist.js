/*Program Title: routes/playlist.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles all /playlist routes
*/

var express = require('express');
var router = express.Router();
var data = require("../data");
var api = data.api;
var playlist = data.playlist;
var users = data.users;
var xss = require('xss');
var movie = data.movie;

//GET PLAYLIST
router.get("/", (req, res) => {
    //get playlist information
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            var info = playlist.getPlaylistById(playlistInfo._id);
            info.then((result) => {
                var viewed = [];
                var unviewed = [];
                for (var i = 0; i < result.playlistMovies.length; i++) {
                    if (result.playlistMovies[i].viewed == true) {
                        viewed.push(result.playlistMovies[i]);
                    }
                    else {
                        unviewed.push(result.playlistMovies[i]);
                    }
                }
                res.render("playlist/page", {
                    playlist: result,
                    movies: result.playlistMovies,
                    viewed: viewed,
                    unviewed: unviewed,
                    partial: "playlist-script"
                });
            });
        });
    });
});


//CLEAR PLAYLIST
router.delete("/:playlistId", (req, res) => {
    //method to clear out playlist
    var playlistId = req.params.playlistId;
    var clearList = playlist.clearPlaylist(playlistId);
    clearList.then((emptyList) => {
        res.json({ success: true });
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});

//CHECK-OFF MOVIE FROM PLAYLIST
router.put("/movie/:movieId", (req, res) => {
    var movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            var markMovie = playlist.checkOffMovie(playlistInfo._id, movieId);
            markMovie.then((result) => {
                res.json({ success: true });
            }).catch((error) => {
                res.json({ success: false, error: error });
            });
        });
    });
});

//ADD REVIEW TO MOVIE IN PLAYLIST
router.post("/reviews/:movieId", (req, res) => {
    var movieId = req.params.movieId;
    var reviewData = req.body;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            reviewData.poster = user.profile;
            //check if review exists
            let movies = playlistInfo.playlistMovies;
            var currentMovie = movies.filter(function (e) { return e._id === movieId });
            if (currentMovie[0].review) { //review already exists
                //update process
                reviewData._id = currentMovie[0].review._id;
                var updateReview = playlist.updateMovieReviewToPlaylistAndMovie(playlistInfo._id, movieId, reviewData);
                updateReview.then((movieInfo) => {
                    res.json({ success: true, result: xss(movieInfo) });
                });
            }
            else {
                var postReview = playlist.addMovieReviewToPlaylistAndMovie(playlistInfo._id, movieId, reviewData);
                postReview.then((reviewInfo) => {
                    res.json({ success: true, result: xss(reviewInfo) });
                });
            }
        }).catch((error) => {
            res.json({ success: false, error: error });
        });
    });
});

//REMOVE REVIEW FROM MOVIE IN PLAYLIST
router.delete("/movie/:movieId/reviews/:reviewId", (req, res) => {
    var reviewId = req.params.reviewId;
    var movieId = req.params.movieId;
    //method to delete review from playlist and movie collections
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            var removeReview = playlist.removeReviewFromPlaylist(playlistInfo._id, reviewId);
            removeReview.then((result) => {
                //remove corresponding review from movies collection
                movie.removeReviewByReviewId(movieId, reviewId).then((movie) => {
                    res.json({ success: true, movie: movieId });
                });
            }).catch((error) => {
                res.json({ success: false, error: error });
            });
        });
    });
});

//UPDATE PLAYLIST TITLE
router.put("/title/:playlistId", (req, res) => {
    //method to clear out playlist
    var playlistId = req.params.playlistId;
    var newTitle = req.body.title;
    var setTitle = playlist.setNewTitle(playlistId, newTitle);
    setTitle.then((result) => {
        res.json({ success: true });
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});


//REMOVE MOVIE FROM PLAYLIST
router.delete("/movie/:movieId", (req, res) => {
    var movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            var removeMovie = playlist.removeMovieByMovieId(playlistInfo._id, movieId);
            removeMovie.then((result) => {
                res.json({ success: true });
            }).catch((error) => {
                res.json({ succes: false, error: error });
            });
        });
    });
});

//ADD MOVIE TO PLAYLIST
router.post("/:movieId", (req, res) => {
    var movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        //check limit of playlist
        var playlistInfo = playlist.getPlaylistByUserId(user._id);
        playlistInfo.then((userPlaylist) => {
            //check if movie already exists in playlist
            var currentMovies = userPlaylist.playlistMovies;
            var index = currentMovies.map(function (e) { return e._id; }).indexOf(movieId);
            if (index == -1) { //movie not in playlist
                if (userPlaylist.playlistMovies.length == 10) {
                    res.json({ success: false, error: "You have reached the maximum of 10 movies in your playlist" });
                }
                else {
                    //check if movie exists in collection
                    var movieInfo = "";
                    movie.getMovieById(movieId).then((details) => {
                        if (!details) { //get details using api
                            var newMovie = api.getMovieDetails(movieId).then((info) => {
                                //insert movie into movie collection
                                movie.addMovie(info._id, info.title, info.description, info.genre, info.rated, info.releaseDate, info.runtime, info.director, info.cast, info.averageRating, info.keywords);
                                return info;
                            }).catch((error) => {
                                res.json({ success: false, error: error });
                            });
                        }
                        Promise.all([newMovie]).then(values => {
                            if (values[0]) {
                                movieInfo = values[0];
                            }
                            else {
                                movieInfo = details;
                            }
                            var userId = user._id;
                            var title = movieInfo.title;
                            var overview;
                            if (movieInfo.description) {
                                overview = movieInfo.description;
                            }
                            else {
                                overview = movieInfo.overview;
                            }
                            //insert movie into playlist collection
                            var newList = playlist.addMovieToPlaylist(userPlaylist._id, movieId, title, overview);
                            newList.then((addedMovie) => {
                                res.json({ success: true });
                            });

                        }).catch((error) => {
                            res.json({ success: false, error: error });
                        });
                    });
                }
            }
            else { //movie is already in playlist
                res.json({ success: false, error: "This movie is already in your playlist" });
            }
        });
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});

module.exports = router;

