(function ($) {

    var mainElement = $("main");
    var addToPlaylist = $(".add");
    var readReviews = $(".reviews");
    var moreDetails = $(".details");
    var userId = $(".results").attr('id');
    var pages = $(".pagination").attr('id');
    var pageul = $(".pagination");
    var queryString = location.search;
    var max, min;

    //dynamically set number of pages
    if (pages > 0) {
        var pageString = "";
        var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
        max = Math.ceil(currentPage / 10) * 10;
        if (max > pages) {
            max = pages;
        }
        min = (Math.floor(currentPage / 10) * 10) + 1;

        if (min > 1) {
            let nextPage = min - 10;
            pageString += "<li><a href='/search/results/" + nextPage + queryString + "'>«</a></li>";
        }
        else {
            min = 1;
        }
        for (var i = min; i <= max; i++) {
            if (currentPage == i) {
                pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
            }
            else {
                pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
            }
        }
        if (max < pages) {
            let nextPage = max + 1;
            pageString += "<li><a href='/search/results/" + nextPage + queryString + "'>»</a></li>";
        }
        pageul.append(pageString);
    }

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