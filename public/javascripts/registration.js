var newUser;
$('#register-button').click(function(){
    var type = $('input[type=radio]:checked').val(),
    newUser = {    
        name:$('input[name=name]').val(),
        email:$('input[name=email]').val(),
        password:$('input[name=password]').val()
    };
    if (type == 'Personal'){
        $.ajax({
            url:"/users/registerPersonal",
            data: newUser,
            type:"POST",
        });}
    else{
        $.ajax({
            url:"/users/registerBusiness",
            data:newUser,
            type:"POST"
        });
    }
});