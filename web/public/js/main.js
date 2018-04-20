// Work-around for missing JQuery.postJSON
jQuery.postJSON = function(url,data,callback) {
  "use strict";
  
  return jQuery.ajax({
    url:url,
    type:"POST",
    data:JSON.stringify(data),
    contentType:"application/json",
    dataType:"json",
    success: callback
  });
};

$(function() {
  "use strict";
  
  // $("#youtubeID").keypress(function(e) {
  //   if(e.which == 13 && this.value.length > 0) {
  //     $.postJSON("/api/v1/queue", {id: this.value}, function() {
  //       $("#youtubeID")[0].value = "";
  //     });
  //   }
  // });
  
  $("#search").keypress(function(e) {
    if(e.which == 13 && this.value.length > 0) {
      clearSearchResults(true);
      
      $.getJSON("/api/v1/search", {q: this.value}, function(res) {
        if (!res.success) {
          console.error(res.error);
          return;
        }
        
        console.dir(res);
        console.log(res.data);
        
        clearSearchResults(false);
        $.each(res.data, addSearchResult);
      }).fail(function(jqXHR, textStatus, errorThrown) {
        console.dir(arguments);
      });
    }
  });
  
  function clearSearchResults(showSpinner) {
    $("#search_results").html("");
    if (showSpinner) {
      // TODO
    }
  }
  
  function addSearchResult(index, item) {
    let button = $("<button>");
    button.text("+");
    button.click(function() {
      $.postJSON("/api/v1/queue", {serviceName: item.serviceName, id: item.id}, function(err, msg) {
        console.log(err, msg);
      }).fail(function(jqXHR) {
        console.error(jqXHR.responseJSON.error);
      });
    });
    
    let sp = $("<span>");
    sp.text("(" + item.serviceName + ") " + item.title);
    
    let li = $("<li>");
    li.append(button, sp);
    $("#search_results").append(li);
  }
});