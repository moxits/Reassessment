var updatedUser;

$('#submit-button').click(function(event){
    event.preventDefault();
    updatedUser = {
        name:$('input[name=name]').val(),
       
        zipcode:$('input[name=zipcode]').val(),
        city:$('input[name=city]').val(),
        state:$('input[name=state]').val(),
        newpassword:$('input[name=newpassword]').val(),
        password:$('input[name=password]').val(),
    }
    $.ajax({
        url:"/users/update-personal",
        data:updatedUser,
        type:"POST"
    }).done(function(json){
        if (json != "INCORRECT PASSWORD"){
            window.location.replace("/personal");
        }else{
            alert('Incorrect Password');
        }
    });
});