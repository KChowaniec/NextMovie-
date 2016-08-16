(function ($, location) {

    var clearPlaylist = $(".clear-list button");
    var removeMovie = $(".delete");
    var addReview = $(".review");
    var checkOffMovie = $(".check-off");
    var newReviewForm = $(".new-item-form");
    var updateTitle = $(".update-title");
    var newTitleBox = $(".update-title-box");
    var updateListTitle = $("#update-title");
    var saveTitle = $(".save-title");
    var playlistTitle = $("#playlist-title");
    var currentTitle = playlistTitle.text();
    var updateReview = $(".update-review");

    newReviewForm.hide();
    updateListTitle.hide();

    newReviewForm.submit(function (event) {
        event.preventDefault();
        let movieId = this.id;
        let rating = $("#" + movieId + ".new-rating").val();
        let review = $("#" + movieId + ".new-review").val();

        if (rating && review) {
            var date = new Date();
            //reformat date in MM/DD/YYYY format
            var formatDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            var requestConfig = {
                method: "POST",
                url: "/playlist/reviews/" + movieId,
                contentType: 'application/json',
                data: JSON.stringify({
                    rating: rating,
                    comment: review,
                    date: formatDate
                })
            };

            $.ajax(requestConfig).then(function (response) {
                if (response.success == true) {
                    window.location.reload(true);
                }
            });
        }

    });

    updateTitle.click(function () {
        let playlistId = this.id;
        playlistTitle.hide();
        updateTitle.hide();
        updateListTitle.show();
        newTitleBox.val(currentTitle);
    });

    saveTitle.click(function () {
        let playlistId = this.id;
        let newTitle = newTitleBox.val();
        var requestConfig = {
            method: "PUT",
            url: "/playlist/title/" + playlistId,
            contentType: 'application/json',
            data: JSON.stringify({
                title: newTitle
            })
        };

        $.ajax(requestConfig).then(function (response) {
            if (response.success == true) {
                updateListTitle.hide();
                updateTitle.show();
                playlistTitle.html(newTitle);
                playlistTitle.show();
            }
        });

    });

    //remove existing review
    $(".remove-review").click(function () {
        let reviewId = this.id;
        let movieId = $(".movie-item").attr('id');
        var removeReview = {
            method: "DELETE",
            url: "/playlist/movie/" + movieId + "/reviews/" + reviewId,
            contentType: 'application/json',
        };

        $.ajax(removeReview).then(function (response) {
            if (response.success == true) {
                window.location.reload(true);
            }
        });

    });

    updateReview.click(function () {
        let movieId = this.id;
        let form = $("#" + movieId + ".new-item-form");
        let userRating = $(".user-rating").html().split(',');
        let rating = parseFloat(userRating[0]);
        let comment = userRating[1].replace(/"/g, '');

        let ratingBox = $("#" + movieId + ".new-rating");
        let commentBox = $("#" + movieId + ".new-review");
        ratingBox.val(rating);
        commentBox.val(comment);
        form.toggle();
    });

    addReview.click(function () {
        //display review text box
        let movieId = this.id;
        let form = $("#" + movieId + ".new-item-form");
        form.toggle();
    });

    checkOffMovie.click(function () {
        let movieId = this.id;

        var flagMovie = {
            method: "PUT",
            url: '/playlist/movie/' + movieId,
        };

        $.ajax(flagMovie).then(function (response) {
            if (response.success == true) {
                window.location.reload(true);
            }
        });
    });

    clearPlaylist.click(function () {
        let playlistId = this.id;
        let verify = confirm("Are you sure you want to remove all movies from your playlist?")
        if (verify) { //clicked Ok
            var clearList = {
                method: "DELETE",
                url: '/playlist/' + playlistId,
            };

            $.ajax(clearList).then(function (response) {
                if (response.success == true) {
                    window.location.reload(true);
                }
            });
        }
    });

    removeMovie.click(function () {
        let movieId = this.id;

        var removeMovie = {
            method: "DELETE",
            url: '/playlist/movie/' + movieId,
        };

        $.ajax(removeMovie).then(function (response) {
            if (response.success == true) {

                // var movie = $("#" + movieId + ".movie-item");
                // console.log(movie);
                // movie.remove();
                window.location.reload(true);
            }
        });
    });
})(jQuery, window.location);