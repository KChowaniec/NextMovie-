/*Program Title: js/jquery-register.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the jquery for user registration
*/

(function ($) {

    //registration
    var registerForm = $("#register"),
        usernameInput = $("#inputUsername"),
        nameInput = $("#name"),
        passwordInput = $("#inputPassword"),
        passwordConfirmInput = $("#inputPasswordConfirm"),
        emailInput = $("#inputEmail");

    passwordConfirmInput.blur(function () {
        if (passwordInput.val() != passwordConfirmInput.val()) {

            $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = "The password is not consistent!";
            $("#error-container")[0].classList.remove("hidden");
        } else {
            $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = "";
            $("#error-container")[0].classList.add("hidden");

        }
    });

    //submit registration form
    registerForm.submit(function (event) {
        event.preventDefault();
        $("#error-container")[0].classList.add("hidden");
        var username = usernameInput.val();
        var password = passwordInput.val();
        var name = nameInput.val();
        var email = emailInput.val();
        var confirm = passwordConfirmInput.val();

        var requestConfig = {
            method: "POST",
            url: "/user/register",
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password,
                name: name,
                email: email,
                confirm: confirm
            })
        };

        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.success) { //if successful registration
                window.location.replace("user"); //redirect to user profile page
            } else { //if not, display appropriate error message
                $("#error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                $("#error-container")[0].classList.remove("hidden");
            }
        });

    });
})(window.jQuery);