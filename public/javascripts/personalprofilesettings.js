var updatedUser;

$('#submit-button').click(function(event){
    event.preventDefault();
    updatedUser = {
        name:$('input[name=name]').val(),
        photo:$('input[name=photourl]').val(),
        zipcode:$('input[name=zipcode]').val(),
        city:$('input[name=city]').val(),
        state:$('input[name=state]').val(),
        newpassword:$('input[name=newpassword]').val(),
        password:$('input[name=password]').val(),
    }
    var check = parseInt(updatedUser.zipcode);
    console.log(Number.isInteger(check));
    if (Number.isInteger(check)){
        $.ajax({
            url:"/users/update-personal",
            data:updatedUser,
            type:"POST"
        }).done(function(json){
            console.log(json);
            if (json != "INCORRECT PASSWORD"){
                window.location.replace("/personal");
            }else{
                alert('Incorrect Password');
            }
        });
    }else{
        alert("Zipcode must be integer values only");
    }
});