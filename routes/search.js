const express = require('express');
const router = express.Router();
const data = require("../data");
const form = data.form;
const api = data.api;
const user = data.users;
const url = require('url');

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
    //get user preferences (if any)
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
    let title = req.body.title;
    let actors = req.body.actors;
    let genres = req.body.genre;
    let crew = req.body.crew;
    let rating = req.body.rating;
    let evaluation = req.body.evaluation;
    let year = parseInt(req.body.releaseYear);
    let keywords = req.body.keywords;

    let parseActors = [];
    let parseWords = [];
    let parseGenre = [];
    let aIds = [];
    let kIds = [];

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

    if (actors) {
        parseActors = actors.split(',');
        if (parseActors.length == 0) { //only one actor entered
            parseActors.push(actors);
        }

        var actorIds = form.getActorIds(parseActors);

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
        // console.log(parseWords);
        var keywordIds = form.getKeywordIds(parseWords);
    }

    Promise.all([crewName, actorIds, keywordIds]).then(values => {
        let crewId, actorId, keywordId;
        if (values[0]) {
            crewId = values[0].results[0].id;
        }
        //let actorIds = values[0].results[1];
        //console.log(actorIds);

        //SEARCH BY MOVIE TITLE
        if (title) {
            let criteriaString = "title=" + title;
            //redirect to new URL
            res.redirect("/search/results?" + criteriaString);
        }

        //SEARCH BY CRITERIA
        else {
            let criteriaString = form.createQueryString(aIds, parseGenre, crewId, rating, evaluation, year, kIds);
            //redirect to new URL
            res.redirect("/search/results?" + criteriaString);
        }
    });
});

router.get("/results", (req, res) => { //call search methods using criteria passed in
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
        let result = api.searchByTitle(title);
        result.then((movies) => {
            let movielist = form.formatReleaseDate(movies.results);
            let total = movies.total_results;
            res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
        }).catch((e) => {
            res.render("search/form", {
                title: title, actors: actors, genres: genre, crew: crew,
                evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
            });
        });
    }
    else { //search by criteria
        let result = api.searchByCriteria(queryString);
        result.then((movies) => {
            let movielist = form.formatReleaseDate(movies.results);
            let total = movies.total_results;
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