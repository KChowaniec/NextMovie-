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
        let movieId = parseInt(this.id.split("form")[1]);
        let rating = $("#rating" + movieId + ".new-rating").val();
        let review = $("#review" + movieId + ".new-review").val();

        if (rating && review) {
            var date = new Date();
            //reformat date in MM/DD/YYYY format
            var formatDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
            var requestConfig = {
                method: "POST",
                url: "/playlist/reviews/" + movieId,
                contentType: 'application/json',
                data: JSON.stringify({
                    rating: parseFloat(rating),
                    comment: review.trim(),
                    date: formatDate
                })
            };

            $.ajax(requestConfig).then(function (response) {
                if (response.success == true) {
                     window.location.reload(true);
                    // let reviewSection = $("#user-rating" + movieId + ".user-rating");
                    // reviewSection.hide();
                    // let rating = parseFloat(response.result.rating);
                    // let review = response.result.comment;
                    // reviewSection.html("<strong>Your Review:</strong><br>" + rating + '/5, "' + review + '"');
                    // reviewSection.show();
                    // //console.log(reviewSection);
                    // $("#add" + movieId + ".review").hide();
                    // $("#form" + movieId + ".new-item-form").hide();
                    // $("#update" + movieId + ".update-review").show();
                    // $("#" + response.id + ".remove-review").show();
                }
            });
        }

    });

    updateTitle.click(function () {
        let playlistId = this.id.split("update")[1];
        playlistTitle.hide();
        updateTitle.hide();
        updateListTitle.show();
        newTitleBox.val(currentTitle);
    });

    saveTitle.click(function () {
        let playlistId = this.id.split("save")[1];
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
                // $("#form" + movieId + ".new-item-form").hide();
                // $("#update" + movieId + ".update-review").hide();
                // $("#" + reviewId + ".remove-review").hide();
                // let reviewSection = $("#user-rating" + movieId + ".user-rating").hide();
                // $("#add" + movieId + ".review").add();
                 window.location.reload(true);
            }
        });

    });

    updateReview.click(function () {
        let movieId = parseInt(this.id.split("update")[1]);
        let form = $("#form" + movieId + ".new-item-form");
        let userRating = $("#user-rating" + movieId + ".user-rating").html().split(',');
        let rating = parseFloat(userRating[0]);
        let comment = userRating[1].replace(/"/g, '');

        let ratingBox = $("#rating" + movieId + ".new-rating");
        let commentBox = $("#review" + movieId + ".new-review");
        ratingBox.val(rating);
        commentBox.val(comment);
        form.toggle();
    });

    addReview.click(function () {
        //display review text box
        let movieId = parseInt(this.id.split("add")[1]);
        let form = $("#form" + movieId + ".new-item-form");
        form.toggle();
    });

    checkOffMovie.click(function () {
        let movieId = parseInt(this.id.split("check")[1]);
        console.log(movieId);
        var flagMovie = {
            method: "PUT",
            url: '/playlist/movie/' + movieId,
        };

        $.ajax(flagMovie).then(function (response) {
            if (response.success == true) {
                window.location.reload(true);
                // let checkedOff = $("#" + movieId + ".movie-item");
                // if ($("ul.not_viewed > li").length == 1) {
                //     $("#unviewed").remove();
                // }
                // else {
                //     checkedOff.remove();
                // }
                // let viewed = $("ul.viewed");
                // viewed.append(checkedOff);
                // $(".viewed").show();
                // let movieToWatch = $("ul.not_viewed > li #" + movieId);
                // console.log(movieToWatch);
                // movieToWatch.hide();
                // let watchedMovie = $(".viewed");
                // console.log(watchedMovie);
                //   let newElement = "<li>"
                // watchedMovie.append(newElement);
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
        let movieId = parseInt(this.id.split("remove")[1]);
        var removeMovie = {
            method: "DELETE",
            url: '/playlist/movie/' + movieId,
        };

        $.ajax(removeMovie).then(function (response) {
            if (response.success == true) {
                if ($("ul.not_viewed > li").length == 1) { //last movie in playlist
                    $("#unviewed").remove();
                    $(".clear").remove();
                    $(".row").append("<h4>No movies are currently in your playlist</h4>");

                }
                else {
                    $("#" + movieId + ".movie-item").remove();
                }
                // window.location.reload(true);
            }
        });
    });
})(jQuery, window.location);