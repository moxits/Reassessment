var updatedUser;

$('#submit-button').click(function(event){
    event.preventDefault();
    updatedUser = {
        name:$('input[name=name]').val(),
        email:$('input[name=email]').val(),
        website:$('input[name=website]').val(),
        phone:$('input[name=phone]').val(),
        address:$('input[name=street-address]').val(),
        description:$("#description").val(),
        zipcode:$('input[name=zipcode]').val(),
        city:$('input[name=city]').val(),
        state:$('input[name=state]').val(),
        newpassword:$('input[name=newpassword]').val(),
        password:$('input[name=password]').val(),

    }
    console.log(updatedUser.address);
    $.ajax({
        url:"/users/update-business",
        data:updatedUser,
        type:"POST"
    }).done(function(json){
        window.location.replace("/business");
     }) ;
});