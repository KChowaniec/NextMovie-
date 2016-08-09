/**
 * @author warri
 */
var express = require('express');
var users = require('../data/users')
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
	res.render("layouts/login", {
		partial: "jquery-login-scripts"
	});
});

router.get('/register',function(req,res){
	res.render("layouts/register", {
		partial: "jquery-register-scripts"
	});
}),

router.post('/user/register', function (req, res) {
	var username=req.body.username;
	console.log(req.body.password);
	var hash=crypto.createHash("sha1");
	hash.update(req.body.password);
	var password=hash.digest("hex");
	var name=req.body.name;
	var email=req.body.email;
	//When to fire the session?
	users.addUser(username,password,name,email).then((user) => {
		
		if (user != "failed") {
			//res.cookie("next_movie", user.sessionId, { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true });
			res.json({ success: true });
			return;
		} else {
			res.json({ success: false, message: "Registration is failed" });
		}
	});
}),

router.get('/user', function (req, res) {
	if (req.cookies.next_movie == undefined || (new Date(req.cookies.next_movie.expires) < new Date(Date.now()))) {
		res.redirect("/login");
		return;
	}

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
		userObj.profile.email = req.body.email;
		users.updateUserById(userObj._id, userObj).then((newUser) => {
			if (newUser){
				res.json({ success: true , email: newUser.profile.email});
			} 
		}).catch((error) => {
            res.json({ success: false, message: error });
        });
	});
});

module.exports = router;
