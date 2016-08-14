/**
 * @author warri
 */
var express = require('express');
var users = require('../data/users');
var movie = require('../data/movie');
var playlist = require('../data/playlist');
var api = require("../data/api");
var router = express.Router();
var xss = require('xss');
var crypto = require('crypto');

router.get('/users', function (req, res) {
  	 var list = users.getAllUser().then((userlist) => {
		if (userlist) {
			res.status(200).send(userlist);
		} else {
			res.sendStatus(404);
		}
	});
});

router.get('/login', function (req, res) {
	if (req.cookies.next_movie != undefined || req.cookies.next_movie != "" || req.cookies.next_movie != null) {
		users.deleteSessionIdBySessionId(req.cookies.next_movie).then((info) => {
			res.cookie("next_movie", "", { expires: new Date(Date.now()), httpOnly: true });
			res.render("layouts/login", {
				partial: "jquery-login-scripts"
			});
		});
	} else {
		res.render("layouts/login", {
			partial: "jquery-login-scripts"
		});
	}
});

router.get('/register',function(req,res){
	res.render("layouts/register", {
		partial: "jquery-register-scripts"
	});
}),

router.post('/user/register', function (req, res) {
	var username=req.body.username;
	var hash=crypto.createHash("sha1");
	var pass=req.body.password;
	var confirm=req.body.confirm;
	if(pass!=confirm)res.json({ success: false, message: "Registration is failed because the two passwords entered are not consistent" });
	hash.update(req.body.password);
	var password=hash.digest("hex");
	var name=req.body.name;
	var email=req.body.email;
	users.checkUserExist(username).then(result=>{
		if(result===false){
			  users.checkEmailExist(email).then(result=>{
					if(result===false){
						    users.addUser(username,password,name,email).then((user) => {
								if (user != "failed") {
								//res.cookie("next_movie", user.sessionId, { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true });
										var playlistObj = {};
										playlistObj.title = "My Playlist";
										playlistObj.user = user.profile;
										playlistObj.playlistMovies = [];
										playlist.addPlaylistGeneral(playlistObj).then((obj) => {
											return obj;
										}).then(() => {
											user.password = user.hashedPassword;
											user.username = user.profile.username;
											users.verifyUser(user).then((userObj) => {
												res.cookie("next_movie", userObj.sessionId, { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true });
												res.json({ success: true });
												return;
											});
										});
								} else {
									res.json({ success: false, message: "Registration is failed" });
								}
							});
	
					} else{
						res.json({ success: false, message: "Registration is failed because the email has already existed" });
						throw "email alreay exists!"
					}
			   })
		} else{
			res.json({ success: false, message: "Registration is failed because the username has already existed" });
			throw "username already exists!"
		}
	})
		

}),

router.get('/user', function (req, res) {
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		if (userObj != "Users not found") {
			res.render("user/index", {
				user: userObj,
				partial: "jquery-user-index-scripts"
			});
		} else {
			res.sendStatus(404);
		}
	});
});

router.post('/users/playlist/:title', function (req, res) {
	var obj = req.body;
	users.addUsersAndPlaylist(req.params.title, obj).then((userObj) => {
		//obj["_id"]=uuid.v4();
		//obj["profile"]["_id"]= obj["_id"];
		users.addUsers(obj).then((userObj) => {
			if (userObj) {
				res.status(200).send(userObj);
			} else {
				res.sendStatus(404);
			}
		});
	});
});

router.put('/users/:id', function (req, res) {
	users.updateUserById(req.params.id, req.body).then((userObj) => {
		if (userObj) {
			//console.log(userObj);
			res.status(200).send(userObj);
		} else {
			res.sendStatus(404);
		}
	});
});

router.delete('/users/:id', function (req, res) {
	users.deleteUserById(req.params.id).then((userObj) => {
		if (userObj) {
			res.status(200).send(userObj);
		} else {
			res.sendStatus(404);
		}
	});
});

router.post('/user/login', function (req, res) {
	var userObj = {};
	userObj.username = req.body.username;
	
	var hash=crypto.createHash("sha1");
	hash.update(req.body.password);
	var password=hash.digest("hex");
	userObj.password = password;
	
	users.verifyUser(userObj).then((user) => {
		if (user != "Users not found") {
			res.cookie("next_movie", user.sessionId, { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true });
			res.json({ success: true });
			return;
		} else {
			res.json({ success: false, message: "username or password is invalid" });
		}
	});
});

router.post('/user/update_email', function (req, res) {
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		userObj.profile.email = req.body.email;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!", email: newUser.profile.email});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/update_password', function (req, res) {
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
	if ((newPassword != confirmPassword) || newPassword == null || newPassword == undefined || newPassword == ""){
		res.json({ success: false, message: "Please entry valid and same new password and confirm password!"});
		return;
	}
	
	users.getUserBySessionIdAndPassword(req.cookies.next_movie, req.body.oldPassword).then((userObj) => {
		var hash=crypto.createHash("sha1");
		hash.update(newPassword);
		var password=hash.digest("hex");
		
		userObj.hashedPassword = password;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/delete_genre', function (req, res) {
	var deleteVal = req.body.value;
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var genreArr = userObj.preferences.Genre;
		var newGenArr = [];
		for (var i = 0; i < genreArr.length; i++){
			if (genreArr[i] != deleteVal){
				newGenArr.push(genreArr[i]);
			}
		}
		
		userObj.preferences.Genre = newGenArr;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/add_genre', function (req, res) {
	var addVal = req.body.value;
	
	movie.getAllGenre().then((genreList) => {
		var flag = true;
		for (var i = 0; i < genreList.length; i++){
			if (addVal == genreList[i]){
				flag = false;
				break;
			}
		}
		
		if (flag){
			res.json({ success: false, message: "This genre value is not valid!" });
			return;
		} 
		
		users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
			var genreArr = userObj.preferences.Genre;
			var flag = true;
			for (var i = 0; i < genreArr.length; i++){
				if (genreArr[i] == addVal){
					flag = false;
					break;
				}
			}
			
			if (!flag){
				res.json({ success: false, message: "This genre value has been added!" });
				return;
			}
			
			genreArr.push(addVal);
			userObj.preferences.Genre = genreArr;
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , message: "Update success!"});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/delete_ageRating', function (req, res) {
	var deleteVal = req.body.value;
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var ageArr = userObj.preferences.ageRating;
		var newAgeArr = [];
		for (var i = 0; i < ageArr.length; i++){
			if (ageArr[i] != deleteVal){
				newAgeArr.push(ageArr[i]);
			}
		}
		
		userObj.preferences.ageRating = newAgeArr;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/add_ageRating', function (req, res) {
	var addVal = req.body.value;
	
	movie.getAllAgeRating().then((ageRatingList) => {
		var flag = true;
		for (var i = 0; i < ageRatingList.length; i++){
			if (addVal == ageRatingList[i]){
				flag = false;
				break;
			}
		}
		
		if (flag){
			res.json({ success: false, message: "This age rating value is not valid!" });
			return;
		} 
		
		users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
			var ageArr = userObj.preferences.ageRating;
			var flag = true;
			for (var i = 0; i < ageArr.length; i++){
				if (ageArr[i] == addVal){
					flag = false;
					break;
				}
			}
			
			if (!flag){
				res.json({ success: false, message: "This age rating value has been added!" });
				return;
			}
			
			ageArr.push(addVal);
			userObj.preferences.ageRating = ageArr;
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , message: "Update success!"});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/delete_keywords', function (req, res) {
	var deleteVal = req.body.value;
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var keywordArr = userObj.preferences.keywords;
		var newKeywordArr = [];
		var flag = true;
		for (var i = 0; i < keywordArr.length; i++){
			if (keywordArr[i] == deleteVal){
				flag = false;
			} else {
				newKeywordArr.push(keywordArr[i]);
			}
		}
		if (flag){
			res.json({ success: false, message: "This keyword value has not been added!" });
			return;
		}
		
		userObj.preferences.keywords = newKeywordArr;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/add_keywords', function (req, res) {
	var addVal = req.body.value;
	
	api.getKeywordIdByName(addVal).then((keyword) => {
		if (keyword){
			users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
				var keywordArr = userObj.preferences.keywords;
				var flag = true;
				for (var i = 0; i < keywordArr.length; i++){
					if (keywordArr[i] == addVal){
						flag = false;
						break;
					}
				}
				if (!flag){
					res.json({ success: false, message: "This keyword value has been added!" });
					return;
				}
				
				keywordArr.push(addVal);
				users.updateUserById(userObj._id, userObj).then((newUser) => {
					if (newUser){
						res.json({ success: true , message: "Update success!"});
					} 
				}).catch((error) => {
					res.json({ success: false, message: error });
				});
			});
		} else {
			res.json({ success: false, message: "Keyword not found!" });
		}
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/add_releaseYear', function (req, res) {
	var year = req.body.year;
	var now = new Date();
	
	if (year < 1900 || year > now.getFullYear){
		res.json({ success: false, message: "Year is not valid!" });
		return;
	}
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var releaseYear = userObj.preferences.releaseYear;
		var newReleaseYear = [];
		var flag = true;
		for (var i = 0; i < releaseYear.length; i++){
			if (releaseYear[i] == year){
				flag = false;
			} else {
				newReleaseYear.push(releaseYear[i]);
			}
		}
		
		if (!flag){
			res.json({ success: false, message: "The year has been added!" });
			return;
		}
		
		newReleaseYear.push(year);
		userObj.preferences.releaseYear = newReleaseYear;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/delete_releaseYear', function (req, res) {
	var year = req.body.value;
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var releaseYear = userObj.preferences.releaseYear;
		var newReleaseYear = [];
		var flag = true;
		for (var i = 0; i < releaseYear.length; i++){
			if (releaseYear[i] == year){
				flag = false;
			} else {
				newReleaseYear.push(releaseYear[i]);
			}
		}
		
		if (flag){
			res.json({ success: false, message: "You did not add this year!" });
			return;
		}
		
		userObj.preferences.releaseYear = newReleaseYear;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/add_person', function (req, res) {
	var addVal = req.body.value;
	
	api.getCreditByPersonId(addVal).then((person) => {
		if (person.id == null || person.id == undefined){
			res.json({ success: false, message: "Person doesn't existed!" });
			return;
		}
		
		addVal = person.name;
		users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
			var actorArr = userObj.preferences.Actor;
			var newActorArr = [];
			var crewArr = userObj.preferences.Crew;
			var newCrewArr = [];
			var flag = true;
			var mark = "";
			if (person.movie_credits.cast.length > 0){
				mark = "actor";
				for (var i = 0; i < actorArr.length; i++){
					if (actorArr[i] == addVal){
						flag = false;
					} else {
						newActorArr.push(actorArr[i]);
					}
				}
				if (!flag){
					res.json({ success: false, message: "The actor has been added!" });
					return;
				}
				
				newActorArr.push(addVal);
				userObj.preferences.Actor = newActorArr;
			} else if (person.movie_credits.crew.length > 0){
				/*
				for (var i = 0; i < person.movie_credits.crew.length; i++){
					if (person.movie_credits.crew[i].job == "Director"){
						flag = false;
						break;
					}
				}
				
				if (flag){
					res.json({ success: false, message: "The person is not Actor or Director!" });
					return;
				}
				*/
				
				flag = true;
				mark = "crew";
				for (var i = 0; i < crewArr.length; i++){
					if (crewArr[i] == addVal){
						flag = false;
					} else {
						newCrewArr.push(crewArr[i]);
					}
				}
				if (!flag){
					res.json({ success: false, message: "The crew has been added!" });
					return;
				}
				
				newCrewArr.push(addVal);
				userObj.preferences.Crew = newCrewArr;
			} else {
				res.json({ success: false, message: "The person is not Actor or Crew!" });
				return;
			}
			
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , mark: mark, name: addVal, message: "Update success!"});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		});
	});
});

router.post('/user/delete_actor', function (req, res) {
	var actor = req.body.value;
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var actorArr = userObj.preferences.Actor;
		var newActorArr = [];
		var flag = true;
		for (var i = 0; i < actorArr.length; i++){
			if (actorArr[i] == actor){
				flag = false;
			} else {
				newActorArr.push(actorArr[i]);
			}
		}
		if (flag){
			res.json({ success: false, message: "You did not add this actor!" });
			return;
		}
		
		userObj.preferences.Actor = newActorArr;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/delete_crew', function (req, res) {
	var crew = req.body.value;
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		var crewArr = userObj.preferences.Crew;
		var newCrewArr = [];
		var flag = true;
		for (var i = 0; i < crewArr.length; i++){
			if (crewArr[i] == crew){
				flag = false;
			} else {
				newCrewArr.push(crewArr[i]);
			}
		}
		if (flag){
			res.json({ success: false, message: "You did not add this crew!" });
			return;
		}
		
		userObj.preferences.Crew = newCrewArr;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/clear_preferences', function (req, res) {
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		userObj.preferences.Actor = [];
		userObj.preferences.Genre = [];
		userObj.preferences.Crew = [];
		userObj.preferences.releaseYear = [];
		userObj.preferences.ageRating = [];
		userObj.preferences.keywords = [];
		
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , message: "Update success!"});
			} 
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

module.exports = router;
