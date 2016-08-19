/*Program Title: js/playlist.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the jquery for the playlist page
*/

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

    //submit new review for movie
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
                }
            });
        }

    });

    //update playlist title
    updateTitle.click(function () {
        let playlistId = this.id.split("update")[1];
        playlistTitle.hide();
        updateTitle.hide();
        updateListTitle.show();
        newTitleBox.val(currentTitle);
    });

    //save new playlist title
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
        let review = this.id.split(',');
        let movieId = parseInt(review[0]);
        let reviewId = review[1];

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

    //update an existing review
    updateReview.click(function () {
        let movieId = parseInt(this.id.split("update")[1]);
        let form = $("#form" + movieId + ".new-item-form");
        let userRating = $("#user-rating" + movieId + ".user-rating").html().split('/5,');
        let ratingSelect = userRating[0].split('<br>');
        let rating = parseFloat(ratingSelect[1]);
        let comment = userRating[1].replace(/"/g, '');

        let ratingBox = $("#rating" + movieId + ".new-rating");
        let commentBox = $("#review" + movieId + ".new-review");
        ratingBox.val(rating);
        commentBox.val(comment);
        form.toggle();
    });

    //add a new review toggle
    addReview.click(function () {
        //display review text box
        let movieId = parseInt(this.id.split("add")[1]);
        let form = $("#form" + movieId + ".new-item-form");
        form.toggle();
    });

    //check a movie off
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
            }
        });
    });

    //clear the playlist
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
                    $("#unviewed").remove();
                    $("#viewed").remove();
                    $(".clear").remove();
                    $(".row").append("<h4>No movies are currently in your playlist</h4>");
                }
            });
        }
    });

    //remove a movie
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
                    if (("ul.viewed > li").length == 0) {
                        $(".clear").remove();
                        $(".row").append("<h4>No movies are currently in your playlist</h4>");
                    }
                }
                else {
                    $("#" + movieId + ".movie-item").remove();
                }
            }
        });
    });
})(jQuery, window.location);