Array.prototype.remove = function(val) { 
    var index = this.indexOf(val); 
    if (index > -1) { 
        this.splice(index, 1); 
    } 
};

var genre = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Foreign", "History", "Horror", "Music",
            "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"];
var age_rating = ["NR", "G", "PG", "PG-13", "R", "NC-17"];

(function ($) {
    var genre_val = [];
    $("#Genre li a").each(function(){
        genre_val.push($(this).attr("value"));
    });
    filterAttr(genre, genre_val);
    var genre_rest_dom = "<h7>Options:</h7><ul class='nav nav-pills' role='tablist' id='genre_rest_table'>";
    for (var i = 0; i < genre.length; i++){
        genre_rest_dom += "<li role='presentation'><a value='" + genre[i] + "'>" + genre[i] + "<span class='glyphicon glyphicon-plus' aria-hidden='true'></span></a></li>";
    }
    genre_rest_dom += "</ul>";
    $("#Genre").append(genre_rest_dom);
    
    var age_rating_val = [];
    $("#ageRating li a").each(function(){
        age_rating_val.push($(this).attr("value"));
    });
    filterAttr(age_rating, age_rating_val);
    var age_rating_rest_dom = "<h7>Options:</h7><ul class='nav nav-pills' role='tablist' id='age_rating_rest_table'>";
    for (var i = 0; i < age_rating.length; i++){
        age_rating_rest_dom += "<li role='presentation'><a value=" + age_rating[i] + ">" + age_rating[i] + "<span class='glyphicon glyphicon-plus' aria-hidden='true'></span></a></li>";
    }
    age_rating_rest_dom += "</ul>";
    $("#ageRating").append(age_rating_rest_dom);
    
    bindDelectBtn();
    bindAddBtn();
    
    $("#preferences button.search_attr").each(function(){
        var that = this;
        $(that).bind("click", function(){
            var search_val = $(this).parent().prev().val();
            var attr_key = $(this).parent().parent().parent().parent().attr("id");
            $("#" + attr_key + "_rest_table").children().remove();
            
            var url = "/search/" + attr_key + "?value=" + search_val;
            var requestConfig = {
                method: "GET",
                url: url,
                contentType: 'application/json'
            };
            
             $.ajax(requestConfig).then(function (responseMessage) {
                if (responseMessage.success){
                    var rs = responseMessage.results;
                    var options_dom = "";
                    
                    for (var i = 0; i < rs.length; i++){
                        options_dom += "<li role='presentation'><a value='" + rs[i].name + "'>" + rs[i].name + "<span class='glyphicon glyphicon-plus' aria-hidden='true'></span></a></li>";
                    }
                    $("#" + attr_key + "_rest_table").append(options_dom);
                    bindDelectBtn();
                    bindAddBtn();
                } else {
                       
                }
            });
        });
    });
    
    $("#email_btn").bind("click", function(){
        $("#email-error-container")[0].classList.add("hidden");
        
        if ($("#email").val() == $("#email").attr("value")){
            $("#email-error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = "There is no change about email!";
            $("#email-error-container")[0].classList.remove("hidden");
            return;
        }
        
        var requestConfig = {
            method: "POST",
            url: "/user/update_email",
            contentType: 'application/json',
            data: JSON.stringify({
                email: $("#email").val()
            })
        };
        
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.success){
                $("#email").attr("value", responseMessage.email);
                $("#email-result-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                $("#email-result-container")[0].classList.remove("hidden");    
            } else {
                $("#email-error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                $("#email-error-container")[0].classList.remove("hidden");   
            }
        });
    });
    
    $("#password_btn").bind("click", function(){
        $("#password-error-container")[0].classList.add("hidden");
        
        if ($("#new_password").val() != $("#confirm_new_password").val()){
            $("#password-error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = "Please entry the same password!";
            $("#password-error-container")[0].classList.remove("hidden");
            return;
        }
        
        var requestConfig = {
            method: "POST",
            url: "/user/update_password",
            contentType: 'application/json',
            data: JSON.stringify({
                oldPassword: $("#password").val(),
                newPassword: $("#new_password").val(),
                confirmPassword: $("#confirm_new_password").val()
            })
        };
        
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.success){
                $("#password-result-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                $("#password-result-container")[0].classList.remove("hidden");
            } else {
                $("#password-error-container")[0].getElementsByClassName("text-goes-here")[0].textContent = responseMessage.message;
                $("#password-error-container")[0].classList.remove("hidden");
            }
        });
    });
    
})(window.jQuery);

function filterAttr(dataSet, valStr){ 
    for (var i= 0 ; i < valStr.length; i++){
        dataSet.remove(valStr[i]);
    }
}

function bindDelectBtn(){
    $("#preferences button.close").each(function(){
        var that = this;
        $(that).unbind("click");
        
        $(that).bind("click", function(){
            var btnDom = $(this);
            var delete_val = $(this).parent().attr("value");
            var attr_key = $(this).parent().parent().parent().parent().attr("id");
            
            var url = "/user/delete_";
            var tableId = "";
            var restTableId = "";
            if (attr_key == "Genre"){
                url += "genre";
                restTableId = "genre_";
            } else if (attr_key == "ageRating"){
                url += attr_key;
                restTableId = "age_rating_";
            } else if (attr_key == "releaseYear"){
                url += attr_key;
            }
            restTableId += "rest_table";
            
            var requestConfig = {
                method: "POST",
                url: url,
                contentType: 'application/json',
                data: JSON.stringify({
                    value: delete_val
                })
            };
            
             $.ajax(requestConfig).then(function (responseMessage) {
                 if (responseMessage.success){
                     btnDom.parent().parent().remove();
                     var newDom = "<li role='presentation'><a value=" + delete_val + ">" + delete_val + "<span class='glyphicon glyphicon-plus' aria-hidden='true'></span></a></li>";
                     $("#" + restTableId).append(newDom);
                     
                     bindDelectBtn();
                     bindAddBtn();
                 } else {
                     
                 }
             });
        });
    });
}

function bindAddBtn(){
    $("#preferences .glyphicon-plus").each(function(){
        var that = this;
        $(that).unbind("click");
        
        $(that).bind("click", function(){
            var btnDom = $(this);
            var add_val = $(this).parent().attr("value");
            var attr_key = $(this).parent().parent().parent().parent().attr("id");
            
            var url = "/user/add_";
            var tableId = "";
            if (attr_key == "Genre"){
                url += "genre";
                tableId = "genre_";
            } else if (attr_key == "ageRating"){
                url += attr_key;
                tableId = "age_rating_";
            } else if (attr_key == "releaseYear"){
                url += attr_key;
            } else if (attr_key == "keywords"){
                url += attr_key;
                tableId = "keywords_";
            }
            tableId += "table";
            
            var requestConfig = {
                method: "POST",
                url: url,
                contentType: 'application/json',
                data: JSON.stringify({
                    value: add_val
                })
            };
            
             $.ajax(requestConfig).then(function (responseMessage) {
                 if (responseMessage.success){
                     btnDom.parent().parent().remove();
                     var newDom = "<li role='presentation'><a value='" + add_val + "'>" + add_val + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button></a></li>";
                     $("#" + tableId).append(newDom);
                     
                     bindDelectBtn();
                     bindAddBtn();
                 } else {
                     
                 }
             });
        });
    });
}