/*Program Title: js/jquery-detail.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script responds to the 'add to playlist' button and calls the server method to add a movie to a user's playlist
*/

(function ($) {
    var addToPlaylist = $(".add");
    //add to playlist button clicked
    addToPlaylist.click(function () {
        var movieId = this.id;
        var addMovie = {
            method: "POST",
            url: '/playlist/' + movieId,
        };

        $.ajax(addMovie).then(function (response) {
            if (response.success == true) {
                alert("Movie has been added to your playlist")
            }
            else if (response.error) {
                alert(response.error);
            }
        });
    });

})(jQuery);