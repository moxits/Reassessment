$('#header-search-submit').click(function(e){
    e.preventDefault();
    var searchterm = $('#searchterm').val();
    var citystate = $('#citystate').val();
    if (searchterm != ""){
        if (citystate != ""){
          
          window.location.replace(`/search/${searchterm}/${citystate}`)

        }else{
            window.location.replace(`/search/${searchterm}`)
        
        }
    }
})