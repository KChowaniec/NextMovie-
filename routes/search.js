var express = require('express');
var router = express.Router();
var data = require("../data");
var form = data.form;
var api = data.api;
var user = data.users;
var url = require('url');

router.get("/", (req, res) => {
    //check for user preferences (if any)
    res.render("search/form", {
        partial: "populate-preferences-script"
    });
});

router.get("/preferences", (req, res) => {
    //get user preferences (if any)
    user.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
        user.getUserPreferences(userObj._id).then((preferences) => {
            if (Object.keys(preferences).length > 0) { //preferences defined
                res.json({ success: true, preferences: preferences });
            }
        }).catch((error) => {
            res.json({ success: false, error: error });
        });
    });
});


router.post("/", (req, res) => {
    let title = req.body.title;
    let actors = req.body.actors;
    let genres = req.body.genre;
    let crew = req.body.crew;
    let rating = req.body.rating;
    let evaluation = req.body.evaluation;
    let year = parseInt(req.body.releaseYear);
    let keywords = req.body.keywords;

    var parseActors = [];
    let parseWords = [];
    let parseGenre = [];

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
        let crewId, actorList = [], keywordList = [];
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
            let criteriaString = "title=" + title;
            //redirect to new URL
            res.redirect("/search/results/1?" + criteriaString);
        }

        //SEARCH BY CRITERIA
        else {
            let criteriaString = form.createQueryString(actorList, parseGenre, crewId, rating, evaluation, year, keywordList);
            //redirect to new URL
            res.redirect("/search/results/1?" + criteriaString);
        }
    });
});

router.get("/results/:pageId", (req, res) => { //call search methods using criteria passed in
    var page = req.params.pageId;
    let queryData = url.parse(req.url, true).query;
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
        let result = api.searchByTitle(title, page);
        result.then((movies) => {
            let movielist = form.formatReleaseDate(movies.results);
            let total = movies.total_results;
            let pages = movies.total_pages;
            res.render("results/movielist", { pages: pages, movies: movielist, total: total, partial: "results-script" });
        }).catch((e) => {
            res.render("search/form", {
                title: title, actors: actors, genres: genre, crew: crew,
                evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
            });
        });
    }
    else { //search by criteria
        let result = api.searchByCriteria(queryString, page);
        result.then((movies) => {
            let pages = movies.total_pages;
            let movielist = form.formatReleaseDate(movies.results);
            let total = movies.total_results;
            res.render("results/movielist", { pages: pages, movies: movielist, total: total, partial: "results-script" });
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
        if (result) {
            res.json({ success: true, results: result });
        } else {
            res.json({ success: false, message: "Keywords not found" });
        }
    }).catch((error) => {
        res.json({ success: false, message: error });
    });
});

router.get("/person", (req, res) => {
    api.searchPersonByName(req.query.value).then((result) => {
        if (result.length > 0) {
            res.json({ success: true, results: result });
        } else {
            res.json({ success: false, message: "Person not found" });
        }
    }).catch((error) => {
        res.json({ success: false, message: error });
    });
});

module.exports = router;