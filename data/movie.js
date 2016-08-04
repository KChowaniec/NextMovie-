
mongoCollections = require("../config/mongoCollections");
Movie = mongoCollections.movie;
var uuid = require('node-uuid');

var https = require("https");
var pathTail = "?api_key=4b9df4187f2ee368c196c4a4247fc1aa";
var restHost = "https://api.themoviedb.org/3";

var exportedMethods = {
    getAllMovie() {
        return Movie().then((movieCollection) => {
            return movieCollection.find({}).toArray();
        });
    },
    // This is a fun new syntax that was brought forth in ES6, where we can define
    // methods on an object with this shorthand!
    getMovieById(id) {
        return Movie().then((movieCollection) => {
            return movieCollection.findOne({_id:id}).then((movieObj) => {
                if (!movieObj) throw "Movie not found";
                return movieObj;
            }).catch((error)=>{
				throw error;
			});
        });
    },
	
	addMovie(obj) {
        return Movie().then((movieCollection) => {
            obj["_id"]=uuid.v4();
            return movieCollection.insertOne(obj).then((movieObj) => {
               return movieObj.insertedId;
            }).then(newId=>{
				return this.getMovieById(newId);
			});
        });
    },
	
	deleteMovieById(id){
		return Movie().then((movieCollection) => {
            return movieCollection.deleteOne({ _id: id }).then(function(deletionInfo) {
            	if(deletionInfo.deletedCount === 0) throw "Could not find the document with this id to delete";
				return true;
        	});
        }).catch((error)=>{
			return error;
		})
	},
	  
    updateMovieById(id,obj){
		return Movie().then((movieCollection) => {
            return movieCollection.update({ _id: id },{$set:obj}).then(function() {
				//console.log(typeof this.getRecipeById(id));
            	return id;
        	});
        }).then(id=>{
			return this.getMovieById(id);
		}).catch((error)=>{
			return error;
		})
	},

    addReviewToMovie(id,obj) {   //add review to the allreviews array by providing movie id and the review object.Note: the review id should be added in the obj first
        return Movie().then((movieCollection) => {
            return movieCollection.update({ _id: id },{$addToSet:{ "allReviews": obj } }).then(function() {
                return id;
            }).then(id=>{
                return this.getMovieById(id);
            }).catch((error)=>{
                return {error:error};
            });
        });
    },

    getReviewByReviewId(mid,rid){     //get the review from the Movie by providing the specified movie id and the review id
        return Movie().then((movieCollection)=>{
            return movieCollection.findOne({_id:mid}).then((movieObj)=>{
                if(!movieObj) throw "Movie with id "+mid+" doesn't exist!";
                var reviewlist=movieObj.allReviews;
                for(var i=0;i<reviewlist.length;i++){
                    if(reviewlist[i]._id==rid) return reviewlist[i];
                }
                return "not find";
            }).catch((error)=>{
                return {error:error};
            });
        }).catch((error)=>{
                return {error:error};
        });

    },

    removeReviewByReviewId(mId,rId){   //delete specified review in the allReviews array by providing movie id and the review id
        return Movie().then((movieCollection)=>{
            return movieCollection.update({ _id: mId }, { $pull: { "allReviews": { _id: rId } } }).then(function() {
                return mId;
            }).then(id=>{
                return this.getMovieById(id);
            });
        }).catch((error)=>{
                return {error:error};
        });
    },

    updateReviewByReviewId(mid,rid,obj){   //delete specified review in the allReviews array by providing movie id and the review id
        return Movie().then((movieCollection)=>{
            return movieCollection.update({ _id: mid,allReviews:{$elemMatch: {_id:rid }}}, { $set: { "allReviews.$": obj } }).then(function() {
                return mid;
            }).then((pid)=>{
                return this.getReviewByReviewId(mid,rid).then((reviewObj)=>{
                    return reviewObj;
                });
            }).catch((error)=>{
                return {error:error};
            });
        }).catch((error)=>{
                return {error:error};
        });
    },

    getMovieByMultiParams(paramObj){
        let queryStr = "";
        for (var key in paramObj){
            if (paramObj[key] != null && paramObj[key] != "" && paramObj[key] != undefined){
                queryStr += "&with_" + key + "=" + paramObj[key];
            }
        }
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/discover/movie" + pathTail + queryStr, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    fulfill(rs);
                });
            });
        });
    },
    
    getKeywordsByMovieId(id){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/keywords" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).keywords;
                    fulfill(rs);
                });
            });
        });
    },
    
    getReviewsByMovieId(id){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/reviews" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    fulfill(rs);
                });
            });
        });
    },
    
    getCreditsByMovieId(id){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + id + "/credits" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data);
                    fulfill(rs);
                });
            });
        });
    },
    
    getPopularMovies(){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/popular" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    fulfill(rs);
                });
            });
        });
    },
    
    getUpcomingMovies(){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/upcoming" + pathTail, (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    fulfill(rs);
                });
            });
        });
    },
    
    getMovieDetailsById(movie){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + movie.id + pathTail + "&append_to_response=keywords,credits,release_dates", (res) => {
                res.setEncoding('utf8');
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                res.on('end', () => {
                    var rs = JSON.parse(_data);
                    movie.title = rs.title;
                    movie.description = rs.overview;
                    movie.releaseDate = rs.release_date;
                    movie.averageRating = rs.vote_average;
                    movie.poster_path = rs.poster_path;
                    
                    var keywordVal = [];
                    for (var i = 0; i < rs.keywords.keywords.length; i++){
                        keywordVal.push(rs.keywords.keywords[i].name);
                    }
                    movie.keywords = keywordVal;
                    
                    var genreVal = [];
                    for (var i = 0; i < rs.genres.length; i++){
                        genreVal.push(rs.genres[i].name);
                    }
                    movie.genre = genreVal;
                    movie.runtime = rs.runtime;
                    
                     var castVal = [];
                    for (var i = 0; i < rs.credits.cast.length; i++){
                        castVal.push(rs.credits.cast[i].name);
                    }
                    movie.cast = castVal;
                    
                    for (var i = 0; i < rs.credits.crew.length; i++){
                        if (rs.credits.crew[i].job == "Director"){
                            movie.director = rs.credits.crew[i].name;
                        }
                    }
                    
                    for (var i = 0; i < rs.release_dates.results.length; i++){
                        if (rs.release_dates.results[i].iso_3166_1 == "US"){
                            movie.rated = rs.release_dates.results[i].release_dates[0].certification;
                        }
                    }
                    
                    fulfill(movie);
                });
            }); 
        });
    }
}

module.exports = exportedMethods;
