var express = require('express');
var router = express.Router();
var data = require("../data");
var form = data.form;
var api = data.api;
var user = data.users;
var url = require('url');

router.get("/", (req, res) => {
    //check for user preferences (if any)
    user.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
        user.getUserPreferences(userObj._id).then((preferences) => {
            if (Object.keys(preferences).length > 0) { //preferences defined
                res.render("search/form", {
                    partial: "populate-preferences-script"
                });
            }
            else { //no preferences defined
                res.render("search/form", {
                    partial: "form-validation"
                });
            }
        });
    });
});

router.get("/preferences", (req, res) => {
    //get user preferences (if any)f
    user.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
        user.getUserPreferences(userObj._id).then((preferences) => {
            preferences.actor = 'Brad Pitt';
            if (Object.keys(preferences).length > 0) { //preferences defined
                res.json({ success: true, preferences: preferences });
            }
        }).catch((error) => {
            res.json({ success: false, error: error });
        });
    });
});


router.post("/", (req, res) => {
    var title = req.body.title;
    var actors = req.body.actors;
    var genres = req.body.genre;
    var crew = req.body.crew;
    var rating = req.body.rating;
    var evaluation = req.body.evaluation;
    var year = parseInt(req.body.releaseYear);
    var keywords = req.body.keywords;

    var parseActors = [];
    var parseWords = [];
    var parseGenre = [];

    if (genres) {
        if (typeof genres === "object") { //multiple genres selected
            for (var i = 0; i < genres.length; i++) {
                parseGenre.push(parseInt(genres[i]));
            }
        }
        else { //just one genre selected
            parseGenre.push(parseInt(genres));
        }
    }

    var fn = function getId(name) { // sample async action
        return new Promise((fulfill, reject) => {
            return api.getPersonIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };

    var wordLookup = function getKeywordId(name) {
        return new Promise((fulfill, reject) => {
            return api.getKeywordIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };

    if (actors) {
        parseActors = actors.split(',');
        if (parseActors.length == 0) {
            parseActors.push(actors);
        }

        var actorId = parseActors.map(fn);
        var actorIds = Promise.all(actorId);
    }

    if (crew) {
        var crewName = api.getPersonIdByName(crew);
        crewName.then((crewId) => {
            var personId = crewId.results[0].id;
        });
    }
    if (keywords) {
        parseWords = keywords.split(',');
        if (parseWords.length == 0) {
            parseWords.push(keywords);
        }
        var keywordId = parseWords.map(wordLookup);
        var wordIds = Promise.all(keywordId);
    }

    Promise.all([crewName, actorIds, wordIds]).then(values => {
        var crewId, actorList = [], keywordList = [];
        if (values[0]) {
            crewId = values[0].results[0].id;
        }
        if (values[1]) {
            actorList = values[1];
        }

        if (values[2]) {
            keywordList = values[2];
            console.log(keywordList);
        }

        //SEARCH BY MOVIE TITLE
        if (title) {
            var criteriaString = "title=" + title;
            //redirect to new URL
            res.redirect("/search/results?" + criteriaString);
        }

        //SEARCH BY CRITERIA
        else {
            var criteriaString = form.createQueryString(actorList, parseGenre, crewId, rating, evaluation, year, keywordList);
            //redirect to new URL
            res.redirect("/search/results?" + criteriaString);
        }
    });
});

router.get("/results/:pageId", (req, res) => { //call search methods using criteria passed in
    var page = req.params.pageId;
    let queryData = url.parse(req.url, true).query;
    console.log(queryData);
    let queryString = "";
    let title;

    Object.keys(queryData).forEach(function (key, index) {
        if (key == "title") {
            title = queryData[key];
        }
        else {
            queryString = queryString + "&" + key + "=" + queryData[key];
        }
    });
    if (title !== undefined) { //search by title
        var result = api.searchByTitle(title);
        result.then((movies) => {
            var movielist = form.formatReleaseDate(movies.results);
            var total = movies.total_results;
            res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
        }).catch((e) => {
            res.render("search/form", {
                title: title, actors: actors, genres: genre, crew: crew,
                evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
            });
        });
    }
    else { //search by criteria
        var result = api.searchByCriteria(queryString);
        result.then((movies) => {
            var movielist = form.formatReleaseDate(movies.results);
            var total = movies.total_results;
            res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
        }).catch((e) => {
            res.render("search/form", {
                title: title, actors: actors, genres: genre, crew: crew,
                evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
            });
        });
    }
});

router.get("/keywords", (req, res) => {
    api.searchKeywordsByName(req.query.value).then((result) => {
        if (result){
            res.json({ success: true, results: result});
        } else {
            res.json({ success: false, message: "Keywords not found"});
        }
    }).catch((error) => {
        res.json({ success: false, message: error });
    });
});

router.get("/person", (req, res) => {
    api.searchPersonByName(req.query.value).then((result) => {
        if (result.length > 0){
            res.json({ success: true, results: result});
        } else {
            res.json({ success: false, message: "Person not found"});
        }
    }).catch((error) => {
        res.json({ success: false, message: error });
    });
});

module.exports = router;