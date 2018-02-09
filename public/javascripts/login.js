var User;
$('#login-button').click(function(){
    User = {    
        email:$('input[name=email]').val(),
        password:$('input[name=password]').val()
    };
        $.ajax({
            url:"/users/login",
            data: User,
            type:"POST",
        }).done(function(json){
            console.log(json);
            if (json=="INCORRECT PASSWORD"){
                alert('Incorrect Password');
            }
            else if (json == "NOT FOUND"){
                alert('Email does not exist');
            }
            else{
                window.location.replace("/personal-profile");
            }
        })
});         