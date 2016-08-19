/*Program Title: js/jquery-login.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the jquery for user login
*/

(function ($) {
    $("#site_nav").remove();

    var loginForm = $("#login"),
        usernameInput = $("#inputUsername"),
        passwordInput = $("#inputPassword");
    var register = $("#register");

    register.click(function (event) {
        event.preventDefault();
        window.location.href = "/register";
    });

    //user tried to login
    loginForm.submit(function (event) {
        event.preventDefault();
        $("#error-container")[0].classList.add("hidden");
        var username = usernameInput.val();
        var password = passwordInput.val();

        if (username && password) {
            var requestConfig = {
                method: "POST",
                url: "/user/login",
                contentType: 'application/json',
                data: JSON.stringify({
                    username: username,
                    password: password
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if (responseMessage.success) {
                    window.location.replace("user"); //if successful login, redirect to user profile
                } else { //if not, display appropriate error message
                    $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                    $("#error-container")[0].classList.remove("hidden");
                }
            });
        }
    });
})(window.jQuery);