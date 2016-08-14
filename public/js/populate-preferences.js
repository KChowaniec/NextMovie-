
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
            if (response.preferences.preferences.Director) {
                $("#crew").val(response.preferences.preferences.Director);
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
                else {
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

    //clear search criteria inputs
    $("#clear-form").click(function () {
        //clear/reset all input values
        $("#actors").val('');
        $("#genre").val('');
        $("#crew").val('');
        $("#rating").val("PG-13").attr('selected', 'selected');
        $("evaluation").val("equal").attr('selected', 'selected');
        $("#releaseYear").val('');
        $("#keywords").val('');
        $("#title").val('');

    });


})(jQuery, window.location);