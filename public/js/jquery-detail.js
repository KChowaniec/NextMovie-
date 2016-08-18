(function ($) {
    var addToPlaylist = $(".add");

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