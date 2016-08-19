/*Program Title: js/populate-preferences.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the jquery for the movie search form page
*/


(function ($, location) {

    //get preferences and populate them
    var requestConfig = {
        method: "GET",
        url: "search/preferences",
        contentType: 'application/json',
    };


    $.ajax(requestConfig).then(function (response) {
        if (response.success == true) {
            //pre-populate form using preferences
            if (response.preferences.preferences.Actor) {
                let actors = [];
                for (var i = 0; i < response.preferences.preferences.Actor.length; i++) {
                    actors.push(response.preferences.preferences.Actor[i]);
                }
                $("#actors").val(actors.join(','));
            }
            if (response.preferences.preferences.Crew) {
                let crew = [];
                for (var i = 0; i < response.preferences.preferences.Crew.length; i++) {
                    crew.push(response.preferences.preferences.Crew[i]);
                }
                $("#crew").val(crew.join(','));
            }
            if (response.preferences.preferences.Genre) {
                let genres = [];
                for (var i = 0; i < response.preferences.preferences.Genre.length; i++) {
                    $("#genre").find("option:contains(" + response.preferences.preferences.Genre[i] + ")").attr('selected', 'selected');
                }
            }
            if (response.preferences.preferences.ageRating) {
                if (response.preferences.preferences.ageRating.length == 1) { //only 1 rating selected
                    $("#rating").val(response.preferences.preferences.ageRating).attr('selected', 'selected');
                }
                else if (response.preferences.preferences.ageRating.length > 1) {
                    //pick highest rating preference and set option to less than or equal to
                    let ratings = ["NR", "G", "PG", "PG-13", "R", "NC-17"];
                    let max = 0;
                    for (var i = 0; i < response.preferences.preferences.ageRating.length; i++) {
                        if (ratings.indexOf(response.preferences.preferences.ageRating[i]) > max) {
                            max = ratings.indexOf(response.preferences.preferences.ageRating[i]);
                        }
                    }
                    $("#evaluation").val("lte").attr('selected', 'selected');
                    $("#rating").val(ratings[max]).attr('selected', 'selected');
                }
            }
            if (response.preferences.preferences.keywords) {
                let keywords = [];
                for (var i = 0; i < response.preferences.preferences.keywords.length; i++) {
                    keywords.push(response.preferences.preferences.keywords[i]);
                }
                $("#keywords").val(keywords.join(','));
            }
            if (response.preferences.preferences.releaseYear) {
                $("#releaseYear").val(response.preferences.preferences.releaseYear);
            }
        }
    });

    //form submitted - validations
    $("#search").click(function (event) {
        event.preventDefault();
        //validate release year
        let year = parseInt($("#releaseYear").val());
        if (year) {
            let today = new Date();
            if (year < 1900 || year > today.getFullYear()) {
                $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = "Release Year is invalid";
                $("#error-container")[0].classList.remove("hidden");
                return;
            }
        }
        //get all entered values
        let title = $("#title").val();
        let actors = $("#actors").val();
        let genres = $("#genre").val();
        let crew = $("#crew").val();
        let rating = $("#rating").val()
        let evaluation = $("#evaluation").val()
        let keywords = $("#keywords").val();

        var parseActors = [];
        let parseWords = [];
        let parseGenre = [];
        let parseCrew = [];

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
            if (parseActors.length == 0) {
                parseActors.push(actors);
            }
        }

        if (crew) {
            parseCrew = crew.split(',');
            if (parseCrew.length == 0) {
                parseCrew.push(crew);
            }
        }

        if (keywords) {
            parseWords = keywords.split(',');
            if (parseWords.length == 0) {
                parseWords.push(keywords);
            }
        }

        //post to search route
        var requestConfig = {
            method: "POST",
            url: "search/",
            contentType: 'application/json',
            data: JSON.stringify({
                parseActors: parseActors,
                parseGenre: parseGenre,
                parseWords: parseWords,
                title: title,
                parseCrew: parseCrew,
                rating: rating,
                evaluation: evaluation,
                releaseYear: year
            })
        };


        $.ajax(requestConfig).then(function (response) {
            if (response.success == true) {//redirect to search results page
                window.location = "/search/results/1?" + response.query;
            }
            else if (response.success == false) { //display error
                $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = response.error;
                $("#error-container")[0].classList.remove("hidden");
            }
        });

    });


    //clear search criteria inputs
    $("#clear-form").click(function () {
        //clear/reset all input values
        $("#actors").val('');
        $("#genre").val('');
        $("#crew").val('');
        $("#rating").val("PG-13").attr('selected', 'selected');
        $("#evaluation").val("equal").attr('selected', 'selected');
        $("#releaseYear").val('');
        $("#keywords").val('');
        $("#title").val('');
        $("#error-container")[0].classList.add("hidden");
    });


})(jQuery, window.location);