/**
 * @author warri
 */
var express = require('express');
var users = require('../data/users');
var movie = require('../data/movie');
var router = express.Router();
const xss = require('xss');

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
	res.render("layouts/login", {
		partial: "jquery-login-scripts"
	});
});

router.get('/user', function (req, res) {
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		if (userObj) {
			res.render("user/index", {
				user: userObj,
				partial: "jquery-user-index-scripts"
			});
		} else {
			res.sendStatus(404);
		}
	});
});

router.post('/users', function (req, res) {
	var obj = req.body;
	users.addUsersGeneral(obj).then((userObj) => {
		if (userObj) {
			var playlistObj = {};
			playlistObj.title = "My Playlist";
			playlistObj.user = userObj.profile;
			playlistObj.playlistMovies = [];
			playlist.addPlaylistGeneral(playlistObj).then((obj) => {
				res.status(200).send(userObj);
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
	userObj.password = req.body.password;
	//When to fire the session?
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
		if (userObj != "Users not found"){
			userObj.profile.email = req.body.email;
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , message: "Update success!", email: newUser.profile.email});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		} else {
			res.json({ success: false, message: "User not found!" });
		}
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
		if (userObj != "Users not found"){
			userObj.hashedPassword = newPassword;
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , message: "Update success!"});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		} else {
			res.json({ success: false, message: "User not found!" });
		}
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/delete_genre', function (req, res) {
	var deleteVal = req.body.value;
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		if (userObj != "Users not found"){
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
		} else {
			res.json({ success: false, message: "User not found!" });
		}
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
			if (userObj != "Users not found"){
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
			} else {
				res.json({ success: false, message: "User not found!" });
			}
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

router.post('/user/delete_ageRating', function (req, res) {
	var deleteVal = req.body.value;
	
	users.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
		if (userObj != "Users not found"){
			var ageArr = userObj.preferences.ageRating;
			var newAgeArr = [];
			for (var i = 0; i < ageArr.length; i++){
				if (ageArr[i] != deleteVal){
					newAgeArr.push(ageArr[i]);
				}
			}
			
			userObj.preferences.Genre = newAgeArr;
			users.updateUserById(userObj._id, userObj).then((newUser) => {
				if (newUser){
					res.json({ success: true , message: "Update success!"});
				} 
			}).catch((error) => {
				res.json({ success: false, message: error });
			});
		} else {
			res.json({ success: false, message: "User not found!" });
		}
	}).catch((error) => {
		res.json({ success: false, message: error });
	});
});

router.post('/user/add_ageRating', function (req, res) {
	var addVal = req.body.value;
	
	movie.getAllAgeRating().then((ageRatingList) => {
		console.log(ageRatingList);
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
			if (userObj != "Users not found"){
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
			} else {
				res.json({ success: false, message: "User not found!" });
			}
		}).catch((error) => {
			res.json({ success: false, message: error });
		});
	});
});

module.exports = router;
