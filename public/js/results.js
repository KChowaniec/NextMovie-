(function ($) {

    var mainElement = $("main");
    var addToPlaylist = $(".add");
    var readReviews = $(".reviews");
    var moreDetails = $(".details");
    var userId = $(".results").attr('id');

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

    moreDetails.click(function () {
        var movieId = this.id;
        window.location = "/movies/detail/" + movieId;
    });
})(jQuery);