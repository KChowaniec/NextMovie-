/*Program Title: routes/search.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles all /search routes
*/


var express = require('express');
var router = express.Router();
var data = require("../data");
var form = data.form;
var api = data.api;
var user = data.users;
var url = require('url');
var xss = require('xss');

router.get("/", (req, res) => {
    //render search form and user preferences (if any)
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

//post search criteria
router.post("/", (req, res) => {
    let title = req.body.title;
    let parseActors = req.body.parseActors;
    let parseGenre = req.body.parseGenre;
    let parseCrew = req.body.parseCrew;
    let rating = req.body.rating;
    let evaluation = req.body.evaluation;
    let year = req.body.releaseYear;
    let parseWords = req.body.parseWords;

//helper functions
    var fn = function getId(name) { 
        return new Promise((fulfill, reject) => {
            return api.getPersonIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };

//helper functions
    var wordLookup = function getKeywordId(name) {
        return new Promise((fulfill, reject) => {
            return api.getKeywordIdByName(name).then((newId) => {
                fulfill(parseInt(newId.results[0].id));
            });
        });
    };

//get all actor ids
    if (parseActors) {
        var actorId = parseActors.map(fn);
        var actorIds = Promise.all(actorId);
    }

//get all crew ids
    if (parseCrew) {
        var crewId = parseCrew.map(fn);
        var crewIds = Promise.all(crewId);
    }

    //get all keyword ids
    if (parseWords) {
        var keywordId = parseWords.map(wordLookup);
        var wordIds = Promise.all(keywordId);
    }

//wait until all values are retrieved
    Promise.all([crewIds, actorIds, wordIds]).then(values => {
        let crewList, actorList = [], keywordList = [];
        if (values[0]) {
            crewList = values[0];
        }
        if (values[1]) {
            actorList = values[1];
        }

        if (values[2]) {
            keywordList = values[2];
        }

        //SEARCH BY MOVIE TITLE
        if (title) {
            let criteriaString = "title=" + title;
            //redirect to new URL
            res.json({ success: true, query: criteriaString });
        }

        //SEARCH BY CRITERIA
        else {
            let criteriaString = form.createQueryString(actorList, parseGenre, crewList, rating, evaluation, year, keywordList);
            res.json({ success: true, query: criteriaString });
        }
    }).catch((error) => {
        res.json({ success: false, error: error });
    });
});

//call search methods using criteria passed in
router.get("/results/:pageId", (req, res) => { 
    var page = req.params.pageId;
    let queryData = (url.parse(xss(req.url), true).query);
    let queryString = "";
    let title;
    //determine search criteria string
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

//get keywords
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

//get person
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