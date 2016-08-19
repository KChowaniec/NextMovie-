/*Program Title: data/users.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the user collection
*/

mongoCollections = require("../config/mongoCollections");
Users = mongoCollections.users;
var playlist = require('./playlist');
var uuid = require('node-uuid');

var exportedMethods = {
    //get all users
    getAllUser() {
        return Users().then((userCollection) => {
            return userCollection.find({}).toArray();
        });
    },
    // get user by user id
    getUserById(id) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ _id: id }).then((userObj) => {
                if (!userObj) throw "Users not found";
                return userObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    //get user's preferences
    getUserPreferences(userId) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ _id: userId }, { preferences: 1, _id: 0 }).then((userObj) => {
                if (!userObj) throw "User not found";
                return userObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    //add general user object
    addUsersGeneral(obj) {
        return Users().then((userCollection) => {
            obj["_id"] = uuid.v4();
            obj["profile"]["_id"] = obj["_id"];
            return userCollection.insertOne(obj).then((userObj) => {
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            });
        });
    },

    //get user by session id
    getUserBySessionId(id) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ sessionId: id }).then((userObj) => {
                if (!userObj) throw "Users not found";
                return userObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    //add user using speciifc parameters
    addUsers(sessionId, hashedPassword, profile, preferences) {
        var userid = uuid.v4();
        profile["_id"] = userid;
        var obj = {
            _id: userid,
            sessionId: sessionId,
            hashedPassword: hashedPassword,
            profile: profile,
            preferences: preferences
        };
        return Users().then((userCollection) => {
            return userCollection.insertOne(obj).then((userObj) => {
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            });
        });
    },


    //This is a cascading method which can create user and the user's playlist
    //please note that: the title is the title for playlist and the userObj contains:sessionId,hashedPassword,profile,preferences
    //the profile attribute doesn't contain the _id and the _id will be created by this function
    addUsersAndPlaylist(title, userObj) {
        var userid = uuid.v4();
        userObj.profile["_id"] = userid;
        var obj = {
            _id: userid,
            sessionId: userObj.sessionId,
            hashedPassword: userObj.hashedPassword,
            profile: userObj.profile,
            preferences: userObj.preferences
        };
        return Users().then((userCollection) => {
            return userCollection.insertOne(obj).then((userObj) => {
                return obj;
            }).then(obj => {
                var user = {
                    _id: obj._id,
                    username: obj.profile.username,
                    name: obj.profile.name,
                    email: obj.profile.name
                }
                return playlist.addPlaylist(title, user).then((playlistObj) => {
                    return playlistObj;
                });
            });
        });
    },

    //delete user
    deleteUserById(id) {
        return Users().then((userCollection) => {
            return userCollection.deleteOne({ _id: id }).then(function (deletionInfo) {
                if (deletionInfo.deletedCount === 0) throw "Could not find the document with this id to delete";
                return true;
            });
        }).catch((error) => {
            return error;
        })
    },

    //update user
    updateUserById(id, obj) {
        return Users().then((userCollection) => {
            return userCollection.update({ _id: id }, { $set: obj }).then(function () {
                //console.log(typeof this.getRecipeById(id));
                return id;
            });
        }).then(id => {
            return this.getUserById(id);
        }).catch((error) => {
            return error;
        })
    },

    //add user without preferences
    addUser(username, pwd, name, email) {
        return Users().then((userCollection) => {
            console.log("Adding user");
            var userId = uuid.v4();
            var obj = {
                _id: userId,
                hashedPassword: pwd,
                profile: {
                    _id: userId,
                    username: username,
                    name: name,
                    email: email
                },
                preferences: {
                    Actor: [],
                    Genre: [],
                    Crew: [],
                    releaseYear: [],
                    ageRating: [],
                    keywords: []
                }
            };
            return userCollection.insertOne(obj).then((userObj) => {
                if (!userObj) throw "failed";
                return userObj.insertedId;
            }).then(newId => {
                return this.getUserById(newId);
            }).catch((error) => {
                return error;
            });
        });
    },

    //verify user
    verifyUser(obj) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ $and: [{ "profile.username": obj.username }, { hashedPassword: obj.password }] }).then((userObj) => {
                if (!userObj) throw "Users not found";

                userObj.sessionId = uuid.v4();
                return this.updateUserById(userObj._id, userObj);;
            }).catch((error) => {
                return error;
            });

        });
    },

    //check if user exists
    checkUserExist(username) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ "profile.username": username }).then((userObj) => {
                if (!userObj) return false;
                return true;
            }).catch((error) => {
                return error;
            });

        });
    },

    //check if email exists
    checkEmailExist(email) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ "profile.email": email }).then((userObj) => {
                if (!userObj) return false;
                return true;
            }).catch((error) => {
                return error;
            });

        });
    },

    //get user by session id and password
    getUserBySessionIdAndPassword(sessionId, password) {
        return Users().then((userCollection) => {
            return userCollection.findOne({ $and: [{ sessionId: sessionId }, { hashedPassword: password }] }).then((userObj) => {
                if (!userObj) throw "Users not found";
                return userObj;
            }).catch((error) => {
                return error;
            });
        });
    },

    //delete user's session id
    deleteSessionIdBySessionId(id) {
        return Users().then((userCollection) => {
            return userCollection.update({ sessionId: id }, { $unset: { "sessionId": "" } });
        });
    }
}

module.exports = exportedMethods;