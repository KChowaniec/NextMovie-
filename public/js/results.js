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
    // queryString = queryString.replace("?", "");

    //dynamically set number of pages
    if (pages > 0) {
        var pageString = "";
        var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
        if (!max) {
            max = Math.ceil(currentPage / 10) * 10;
        }
        if (max > pages) {
            max = pages;
        }
        if (!min) {
            min = Math.floor(currentPage / 10) * 10;
        }
        if (min > 1) {
            pageString += "<li><a href=''>«</a></li>";
        }
        else {
            min = 1;
        }
        for (var i = min; i <= max; i++) {
            // if (i <= max) {
            if (currentPage == i) {
                pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
            }
            else {
                pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
            }
            //   }
        }
        if (max < pages) {
            pageString += "<li><a href=''>»</a></li>";
        }
        pageul.append(pageString);
    }

    $(".pagination li").click(function (event) {
        var page = $(this).text();
        if (page == "»") {
            event.preventDefault();
            pageul.empty();
            oldMax = max;
            oldMin = min;
            if (max + 10 <= pages) {
                max = max + 10;
            }
            else {
                max = pages;
            }
            var pageString = "";
            var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
            min = Math.floor((max - 1) / 10) * 10;
            min = min + 1;
            if (min > 1) {
                pageString += "<li><a href=''>«</a></li>";
            }
            else {
                min = 1;
            }

            for (var i = min; i <= max; i++) {
                //  if (i <= max) {
                if (currentPage == i) {
                    pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
                else {
                    pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
                //  }
            }
            if (max < pages) {
                pageString += "<li><a href=''>»</a></li>";
            }

            pageul.append(pageString);
        }
        else if (page == "«") {
            event.preventDefault();
            pageul.empty();
            oldMin = min;
            if (min - 10 > 1) {
                min = min - 10;
            }
            else {
                min = 1;
            }
            var pageString = "";
            var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
            if (min > 1) {
                pageString += "<li><a href=''>«</a></li>";
            }

            for (var i = oldMax + 1; i <= max; i++) {
                //  if (i <= max) {
                if (currentPage == i) {
                    pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
                else {
                    pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
                //  }
            }
            if (max < pages) {
                pageString += "<li><a href=''>»</a></li>";
            }

            pageul.append(pageString);
        }

    });



    // function locationHashChanged() {
    //     var hash = window.location.hash;
    //     var newHash = hash.replace("#", "");
    //     newHash = parseInt(newHash);
    //     console.log(newHash);
    //     var requestConfig = {
    //         method: "POST",
    //         url: '/search/results',
    //         contentType: 'application/json',
    //         data: JSON.stringify({
    //             hashPage: newHash
    //         })
    //     };

    //     $.ajax(requestConfig).then(function (response) {
    //         window.location.reload(true);
    //     });
    // }

    // //call locationHashChanged function on window.onhashchange event
    // window.onhashchange = locationHashChanged;


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