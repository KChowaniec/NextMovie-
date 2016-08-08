let ids = [];
const api = require("./api");
var directorId;

let exportedMethods = {

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