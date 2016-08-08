
(function ($, location) {

    //get preferences and populate them
    var requestConfig = {
        method: "GET",
        url: "search/preferences",
        contentType: 'application/json',
    };

    $.ajax(requestConfig).then(function (response) {
        if (response.success == true) {
            //pre-populate form using preferences

        }
    });

    //clear search criteria inputs
    $("#clear-form").click(function () {
        //clear all input values
        $("#actors").val('');
        $("#genre").val('');
        $("#crew").val('');
        $("#releaseYear").val('');
        $("#keywords").val('');
        $("#title").val('');

    });


})(jQuery, window.location);