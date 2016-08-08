const express = require('express');
const router = express.Router();
const data = require("../data");
const api = data.api;
const playlist = data.playlist;
const users = data.users;
//const search = data.search;
const movie = data.movie;

//GET PLAYLIST
router.get("/", (req, res) => {
    //get playlist information
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            // let playlistId = req.params.playlistId;
            let info = playlist.getPlaylistById(playlistInfo._id);//playlist.getPlaylistById(playlistId);
            info.then((result) => {
                let viewed = [];
                let unviewed = [];
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
    let playlistId = req.params.playlistId;
    let clearList = playlist.clearPlaylist(playlistId);
    clearList.then((emptyList) => {
        res.json({ success: true });
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});

//CHECK-OFF MOVIE FROM PLAYLIST
router.put("/movie/:movieId", (req, res) => {
    let movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            let markMovie = playlist.checkOffMovie(playlistInfo._id, movieId);
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
    let movieId = req.params.movieId;
    let reviewData = req.body;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            reviewData.poster = user.profile;
            let postReview = playlist.addMovieReviewToPlaylistAndMovie(playlistInfo._id, movieId, reviewData);
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
    let reviewId = req.params.reviewId;
    let movieId = req.params.movieId;
    //method to delete review from playlist and movie collections
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            let removeReview = playlist.removeReviewFromPlaylist(playlistInfo._id, reviewId);
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
    let playlistId = req.params.playlistId;
    let newTitle = req.body.title;
    let setTitle = playlist.setNewTitle(playlistId, newTitle);
    setTitle.then((result) => {
        res.json({ success: true });
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});


//REMOVE MOVIE FROM PLAYLIST
router.delete("/movie/:movieId", (req, res) => {
    let movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        playlist.getPlaylistByUserId(user._id).then((playlistInfo) => {
            let removeMovie = playlist.removeMovieByMovieId(playlistInfo._id, movieId);
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
    let movieId = req.params.movieId;
    users.getUserBySessionId(req.cookies.next_movie).then((user) => {
        //check limit of playlist
        let playlistInfo = playlist.getPlaylistByUserId(user._id);
        playlistInfo.then((userPlaylist) => {
            //check if movie already exists in playlist
            let currentMovies = userPlaylist.playlistMovies;
            var index = currentMovies.map(function (e) { return e._id; }).indexOf(movieId);
            if (index == -1) { //movie not in playlist
                if (userPlaylist.playlistMovies.length == 10) {
                    res.json({ success: false, error: "You have reached the maximum of 10 movies in your playlist" });
                }
                else {
                    //check if movie exists in collection
                    let movieInfo = "";
                    movie.getMovieById(movieId).then((details) => {
                        if (!details) { //get details using api
                            api.getMovieDetails(movieId).then((info) => {
                                movieInfo = info;
                                //insert movie into movie collection
                                let addedMovie = movie.addMovie(info._id, info.title, info.description, info.genre, info.rated, info.releaseDate, info.runtime, info.director, info.cast, info.averageRating, info.keywords);
                                addedMovie.then((result) => {
                                });
                            }).catch((error) => {
                                res.json({ success: false, error: error });
                            });
                        }
                        else {
                            movieInfo = details;
                        }
                        let userId = user._id;
                        let title = movieInfo.title;
                        let overview;
                        if (movieInfo.description) {
                            overview = movieInfo.description;
                        }
                        else {
                            overview = movieInfo.overview;
                        }
                        let newList = playlist.addMovieToPlaylist(userPlaylist._id, movieId, title, overview);
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

