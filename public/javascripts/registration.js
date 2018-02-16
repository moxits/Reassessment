var newUser;
$('#register-button').click(function(){
    newUser = {    
        type:$('input[type=radio]:checked').val(),
        name:$('input[name=name]').val(),
        email:$('input[name=email]').val(),
        password:$('input[name=password]').val()
    };
    if (newUser.name != '' && newUser.email != '' && newUser.password != ''){
        $.ajax({
            url:"/users/register",
            data: newUser,
            type:"POST",
        }).done(function(json){
            if (newUser.type == 'personal'){
                if (json !== "TAKEN"){
                    window.location.replace("/personal-profile");
                }else{
                    alert('Email is already registered');
                }
            }else{
                if (json != "TAKEN"){
                    window.location.replace("/business-profile");
                }else{
                    alert('Email is already registered');
                }
            }
        })
    }else{
        alert('All fields are required');
    }
});