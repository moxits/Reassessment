var review;
$('#submit-button').click(function(){
    review = {
        content:$('#description').val(),
        rating:$('#rating').val(),
        businessid:$('#id-tag').val()
    }
    console.log(review);
});
