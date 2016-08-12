(function ($) {

    var mainElement = $("main");
    var addToPlaylist = $(".add");
    var readReviews = $(".reviews");
    var moreDetails = $(".details");
    var userId = $(".results").attr('id');
    var pages = $(".pagination").attr('id');
    var pageul = $(".pagination");
    var queryString = location.search;
    var max;
    // queryString = queryString.replace("?", "");

    //dynamically set number of pages
    if (pages > 0) {
        var pageString = "";
        var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
        pageString += "<li><a href=''>«</a></li>";
        console.log(max);
        if (!max) {
            max = 10;
        }
        for (var i = 1; i <= pages; i++) {
            if (i <= max) {
                if (currentPage == i) {
                    pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
                else {
                    pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
                }
            }
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
            max = max + 10;
            var pageString = "";
            var currentPage = location.pathname.substring((location.pathname.lastIndexOf('/') + 1));
            pageString += "<li><a href=''>«</a></li>";

            for (var i = oldMax + 1; i <= pages; i++) {
                if (i <= max) {
                    if (currentPage == i) {
                        pageString += "<li><a class='active' href='search/results/" + i + queryString + "'>" + i + "</a></li>";
                    }
                    else {
                        pageString += "<li><a href='/search/results/" + i + queryString + "'>" + i + "</a></li>";
                    }
                }
            }
            if (max < pages) {
                pageString += "<li><a href=''>»</a></li>";
            }

            pageul.append(pageString);
        }
        else if (page == "«") {
            event.preventDefault();
        }
        // var requestConfig = {
        //     method: "GET",
        //     url: '/search/results/' + pageNum + queryString,
        //     contentType: 'application/json'
        // };

        // $.ajax(requestConfig).then(function (response) {
        //     //  window.location.reload(true);
        // });

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