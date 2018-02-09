var newUser;
$('#register-button').click(function(){
    newUser = {    
        type:$('input[type=radio]:checked').val(),
        name:$('input[name=name]').val(),
        email:$('input[name=email]').val(),
        password:$('input[name=password]').val()
    };
        $.ajax({
            url:"/users/register",
            data: newUser,
            type:"POST",
        }).done(function(json){
            if (newUser.type == 'Personal'){
                window.location.replace("/personal-profile");}
            else{
                window.location.replace("/");
            }
        })
});