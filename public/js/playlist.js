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
                    rating: rating,
                    comment: review,
                    date: formatDate
                })
            };

            $.ajax(requestConfig).then(function (response) {
                if (response.success == true) {
                    console.log(response);
                    // window.location.reload(true);
                    // response.result
                    let reviewSection = $("#user-rating" + movieId + ".user-rating");
                    //  reviewSection.html(
                    //  console.log(reviewSection.html());
                    console.log(response.result);
                    reviewSection[0] = response.result;
                    reviewSection[1] = response.result;
                    $("#add" + movieId + ".review").hide();
                    $("#update" + movieId + ".update-review").show();
                    $("#" + response.result._id + ".remove-review").show();
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
                console.log("Success");
                window.location.reload(true);
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
                window.location.reload(true);
            }
        });
    });
})(jQuery, window.location);