/*Program Title: data/form.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the search form
*/

var api = require("./api");

var exportedMethods = {

    //create query string using search criteria entered
    createQueryString(actors, genre, crew, rating, evaluation, year, keywords) {
        var query = "";
        if (rating) query = query + "certification_country=US";
        if (evaluation === "equal") query = query + "&certification=" + rating;
        if (evaluation === "lte") query = query + "&certification.lte=" + rating;
        if (actors && actors.length > 0) query = query + "&with_cast=" + actors.join('|');
        if (genre && genre.length > 0) query = query + "&with_genres=" + genre.join('|');
        if (keywords && keywords.length > 0) query = query + "&with_keywords=" + keywords.join('|');
        if (crew && crew.length > 0) query = query + "&with_crew=" + crew.join('|');
        if (year) {
            query = query + "&primary_release_year=" + year;
        }
        else if (!year) { //reformat release date
            let currentDate = new Date();
            let formatDate = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
            query = query + "&primary_release_date.lte=" + formatDate;
        }

        query = query + "&sort_by=primary_release_date.desc"; //sort results by most recent movies
        return query;
    },

    //format release date as mm-dd-yyyy
    formatReleaseDate(movielist) {
        for (var i = 0; i < movielist.length; i++) {
            if (!movielist[i].release_date == '') {
                var parsedDate = Date.parse(movielist[i].release_date);
                var newDate = new Date(parsedDate);
                var formatDate = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + newDate.getFullYear();
                movielist[i].release_date = formatDate;
            }
        }
        return movielist;
    }

}
module.exports = exportedMethods; //export methods