var express = require('express');
var router = express.Router();
var data = require("../data");
var api = data.api;
var playlist = data.playlist;
var users = data.users;
//const search = data.search;
var movie = data.movie;

//GET PLAYLIST
router.get("/", (req, res) => {
    //get playlist information
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            // let playlistId = req.params.playlistId;
            var info = playlist.getPlaylistById(playlistInfo._id);//playlist.getPlaylistById(playlistId);
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
            var postReview = playlist.addMovieReviewToPlaylistAndMovie(playlistInfo._id, movieId, reviewData);
            postReview.then((result) => {
                res.json({ success: true, result: result });
            });
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
                    res.json({ success: true });
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
                            api.getMovieDetails(movieId).then((info) => {
                                movieInfo = info;
                                //insert movie into movie collection
                                var addedMovie = movie.addMovie(info._id, info.title, info.description, info.genre, info.rated, info.releaseDate, info.runtime, info.director, info.cast, info.averageRating, info.keywords);
                                addedMovie.then((result) => {
                                });
                            }).catch((error) => {
                                res.json({ success: false, error: error });
                            });
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
                        var newList = playlist.addMovieToPlaylist(userPlaylist._id, movieId, title, overview);
                        newList.then((addedMovie) => {
                            res.json({ success: true });
                        });

                    }).catch((error) => {
                        res.json({ success: false, error: error });
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

