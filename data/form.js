let ids = [];
const api = require("./api");
var directorId;

let exportedMethods = {

    createQueryString(actors, genre, crew, rating, evaluation, year, keywords) {
        let query = "";
        if (rating) query = query + "certification_country=US";
        if (evaluation === "equal") query = query + "&certification=" + rating;
        else if (evaluation === "lte") query = query + "&certification.lte=" + rating;
        if (year) query = query + "&primary_release_year=" + year;
        if (genre.length > 0) query = query + "&with_genres=" + genre.join('|');
        if (keywords.length > 0) query = query + "&with_keywords=" + keywords.join('|');
        if (actors.length > 0) query = query + "&with_cast=" + actors.join('|');
        if (crew) query = query + "&with_crew=" + crew;

        query = query + "&sort_by=vote_average.desc"; //sort results by movies with highest rating
        return query;
    },

    formatReleaseDate(movielist) {
        for (var i = 0; i < movielist.length; i++) {
            if (!movielist[i].release_date == '') {
                let parsedDate = Date.parse(movielist[i].release_date);
                let newDate = new Date(parsedDate);
                let formatDate = (newDate.getMonth() + 1) + "/" + newDate.getDay() + "/" + newDate.getFullYear();
                movielist[i].release_date = formatDate;
            }
        }
        return movielist;
    },

    getKeywordIds(keywords) {
        let ids = [];
        for (var i = 0; i < keywords.length; i++) {
            let wordId = this.getKeywordIdByName(keywords[i]);
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