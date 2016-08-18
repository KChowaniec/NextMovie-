var ids = [];
var api = require("./api");
var directorId;

var exportedMethods = {

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
        else if (!year) {
            let currentDate = new Date();
            let formatDate = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
            query = query + "&primary_release_date.lte=" + formatDate;
        }

        query = query + "&sort_by=primary_release_date.desc"; //sort results by most recent movies
        return query;
    },

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
    },

    getKeywordIds(keywords) {
        var ids = [];
        for (var i = 0; i < keywords.length; i++) {
            var wordId = this.getKeywordIdByName(keywords[i]);
            wordId.then((keywordId) => {
                if (keywordId.total_results > 0) {
                    ids.push(keywordId.results[0].id);
                }
            });
        }
        return ids;
    },
    getActorIds(actors) {

        var ids = [];
        for (var i = 0; i < actors.length; i++) {
            var id = api.getPersonIdByName(actors[i]);
            id.then((newId) => {
                ids.push(newId);
            });
        }
        Promise.all([id]).then(values => {
            //  console.log(values);
            return values;
        });
    }
}
module.exports = exportedMethods; //export methods