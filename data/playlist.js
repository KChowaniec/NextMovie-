/*Program Title: data/playlist.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the playlist collection
*/


mongoCollections = require("../config/mongoCollections");
Playlist = mongoCollections.playlist;
var movies = require('./movie');
var uuid = require('node-uuid');

var exportedMethods = {
    //get all playlists
    getAllPlaylist() {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.find({}).toArray();
        });
    },
    //get playlist by playlist id
    getPlaylistById(id) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.findOne({ _id: id }).then((playlistObj) => {
                if (!playlistObj) throw "Playlist not found";
                return playlistObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    //add general playlist object
    addPlaylistGeneral(obj) {
        return Playlist().then((playlistCollection) => {
            obj["_id"] = uuid.v4();
            return playlistCollection.insertOne(obj).then((playlistObj) => {
                return playlistObj.insertedId;
            }).then(newId => {
                return this.getPlaylistById(newId);
            });
        });
    },

    //add playlist using specific parameters
    addPlaylist(title, user) {
        return Playlist().then((playlistCollection) => {
            var playlistId = uuid.v4();
            var obj = {
                _id: playlistId,
                title: title,
                user: user,
                playlistMovies: []
            };
            return playlistCollection.insertOne(obj).then((playlistObj) => {
                return playlistObj.insertedId;
            }).then((newId) => {
                return this.getPlaylistById(newId);
            });
        });
    },

    //get playlist by user id
    getPlaylistByUserId(userId) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.findOne({ "user._id": userId }).then((playlist) => {
                if (!playlist) throw "User has no playlist";
                return playlist;
            }).catch((error) => {
                return error;
            });
        });

    },

    //delete playlist
    deletePlaylistById(id) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.deleteOne({ _id: id }).then(function (deletionInfo) {
                if (deletionInfo.deletedCount === 0) throw "Could not find the document with this id to delete";
                return true;
            });
        }).catch((error) => {
            return error;
        })
    },

    //clear movies in playlist
    clearPlaylist(id) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.update({ _id: id }, { $pull: { "playlistMovies": {} } }).then(function () {
                return id;
            }).then(id => {
                return this.getPlaylistById(id);
            });
        }).catch((error) => {
            return { error: error };
        });
    },

    //update playlist
    updatePlaylistById(id, obj) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.update({ _id: id }, { $set: obj }).then(function () {
                //console.log(typeof this.getRecipeById(id));
                return id;
            });
        }).then(id => {
            return this.getPlaylistById(id);
        }).catch((error) => {
            return error;
        })
    },


    //operations related to movies
    addMovieToPlaylist(playlistId, movieId, title, overview) {   //add movie to the playlistMovies array by providing playlist id and the movie object.Node:the review id in the movie should be added first
        return Playlist().then((playlistCollection) => {
            var obj = {
                _id: movieId,
                title: title,
                overview: overview,
                viewed: false
            };
            return playlistCollection.update({ _id: playlistId }, { $addToSet: { "playlistMovies": obj } }).then(function () {
                return playlistId;
            }).then((id) => {
                return this.getPlaylistById(id);
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    //Cascading method:add movie to the playlistMovies array and the movie collection by providing playlist id and the movie object.
    //Note:the movieObj should  be same as the movie collection and when you invoke this cascade method, you need to create this obj
    //in the client side and make sure that this movie doesn't exist in the movie collection
    //the movieObj should contain: _id,title,description,genre,rated,releaseDate,runtime,director,cast,averageRating,keywords,and empty allreviews
    //this method will return movieObj inserted into the movie collection
    addMovieToPlaylistAndMovie(playlistId, movieObj) {
        return Playlist().then((playlistCollection) => {
            var obj = {
                _id: movieObj._id,
                title: movieObj.title,
                overview: movieObj.description,
                viewed: false
            };
            return playlistCollection.update({ _id: playlistId }, { $addToSet: { "playlistMovies": obj } }).then(function () {
                return movieObj;
            }).then((movieObj) => {
                return movies.addMovieGeneral(movieObj).then((Movie) => {
                    return Movie;
                });
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    addMovieToPlaylistGeneral(id, obj) {   //add movie to the playlistMovies array by providing playlist id and the movie object.Node:the review id in the movie should be added first
        return Playlist().then((playlistCollection) => {
            //obj["review"]["_id"]=uuid.v4();
            return playlistCollection.update({ _id: id }, { $addToSet: { "playlistMovies": obj } }).then(function () {
                return id;
            }).then(id => {
                return this.getPlaylistById(id);
            }).catch((error) => {
                return { error: error };
            });
        });
    },

    getMovieByMovieId(pid, mid) {     //get the movie from the playlist by providing the specified playlist id and the movie id
        return Playlist().then((playlistCollection) => {
            return playlistCollection.findOne({ _id: pid }).then((playlistObj) => {
                if (!playlistObj) throw "Playlist with id " + pid + " doesn't exist!";
                var movielist = playlistObj.playlistMovies;
                for (var i = 0; i < movielist.length; i++) {
                    if (movielist[i]._id == mid) return movielist[i];
                }
                return "not find";
            }).catch((error) => {
                return { error: error };
            });
        }).catch((error) => {
            return { error: error };
        });

    },

    removeMovieByMovieId(pId, mId) {   //delete specified movie in the playlistMovies array by providing playlist id and the movie id
        return Playlist().then((playlistCollection) => {
            return playlistCollection.update({ _id: pId }, { $pull: { "playlistMovies": { _id: mId } } }).then(function () {
                return pId;
            }).then(id => {
                return this.getPlaylistById(id);
            });
        }).catch((error) => {
            return { error: error };
        });
    },

    updateMovieByMovieId(pid, mid, obj) {   //delete specified movie in the playlistMovies array by providing playlist id and the movie id
        return Playlist().then((playlistCollection) => {
            return playlistCollection.update({ _id: pid, playlistMovies: { $elemMatch: { _id: mid } } }, { $set: { "playlistMovies.$": obj } }).then(function () {
                return pid;
            }).then((pid) => {
                return this.getMovieByMovieId(pid, mid).then((movieObj) => {
                    return movieObj;
                });
            }).catch((error) => {
                return { error: error };
            });
        }).catch((error) => {
            return { error: error };
        });
    },


    //other operations
    //update playlist title
    setNewTitle(playlistId, newTitle) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.updateOne({ _id: playlistId }, { $set: { "title": newTitle } }).then(function () {
                return playlistId;
            }).then(id => {
                return this.getPlaylistById(id);
            });
        }).catch((error) => {
            return { error: error };
        });

    },

    //check-off movie as 'viewed'
    checkOffMovie(playlistId, movieId) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.update({ _id: playlistId, playlistMovies: { $elemMatch: { _id: movieId } } }, { $set: { "playlistMovies.$.viewed": true } }).then(function () {
                return playlistId;
            });
        }).then(id => {
            return this.getPlaylistById(id);
        }).catch((error) => {
            return error;
        })
    },

    //add review to movie in playlist
    addMovieReviewToPlaylist(playlistId, movieId, review) {
        return Playlist().then((playlistCollection) => {
            var reviewId = uuid.v4();
            var obj = {
                _id: reviewId,
                rating: review.rating,
                date: review.date,
                comment: review.review
            };
            return playlistCollection.update({ _id: playlistId, "playlistMovies._id": movieId }, { $set: { "playlistMovies.$.review": obj } }).then(function () {
                return reviewId;
            }).then((id) => {
                return this.getMovieReview(playlistId, id);
            }).catch((error) => {
                console.log("error");
                return { error: error };
            });
        });

    },

    //this is a cascading method which can add the review to both the movie in the playlist and the movie in the movie collection
    //In order to invoke this method, you need to provide the playlist id, movie id and the completed view with out review id(the review id will be created by this function)
    //the review should contain: rating,date,poster and comment and these attribues should be create by client who invokes this method 
    addMovieReviewToPlaylistAndMovie(playlistId, movieId, review) {
        return Playlist().then((playlistCollection) => {
            var reviewId = uuid.v4();
            var obj = {
                _id: reviewId,
                rating: review.rating,
                date: review.date,
                comment: review.comment
            };
            return playlistCollection.update({ _id: playlistId, "playlistMovies._id": movieId }, { $set: { "playlistMovies.$.review": obj } }).then(function () {
                return obj;
            }).then((obj) => {
                obj["poster"] = review.poster;
                return movies.addReviewToMovieGeneral(movieId, obj).then((movieInfo) => {
                    return movieInfo;
                }).catch((error) => {
                    return { error: error };
                })
            }).catch((error) => {
                return { error: error };
            });
        });

    },


    //cascading method to update movie review in playlist and movie collections
    updateMovieReviewToPlaylistAndMovie(playlistId, movieId, review) {
        return Playlist().then((playlistCollection) => {
            var obj = {
                _id: review._id,
                rating: review.rating,
                date: review.date,
                comment: review.comment
            };
            return playlistCollection.update({ _id: playlistId, "playlistMovies._id": movieId }, { $set: { "playlistMovies.$.review": obj } }).then(function () {
                return obj;
            }).then((obj) => {
                obj["poster"] = review.poster;
                return movies.updateReviewByReviewId(movieId, review._id, obj).then((reviewObj) => {
                    return reviewObj;
                });
            }).catch((error) => {
                console.log("error");
                return { error: error };
            });
        });

    },

    //remove review from playlist
    removeReviewFromPlaylist(playlistId, reviewId) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.updateOne({ _id: playlistId, "playlistMovies.review._id": reviewId }, {
                //unset review object
                $unset: { "playlistMovies.$.review": "" }
            }).then((result) => {
                if (result.modifiedCount == 0) throw "Could not remove review with id of " + reviewId;
            }).catch((error) => {
                console.log("error");
                return { error: error };

            });
        });
    },

    //get movie review
    getMovieReview(playlistId, reviewId) {
        return Playlist().then((playlistCollection) => {
            return playlistCollection.findOne({ _id: playlistId, "playlistMovies.review._id": reviewId }, { "playlistMovies.review": 1 }).then(function (result) {
                if (!result) throw "Review with id " + reviewId + " doesn't exist!";
                return result.playlistMovies[0].review;
            }).catch((error) => {
                return { error: error };

            });
        });
    }


}

module.exports = exportedMethods;