// Work-around for missing JQuery.postJSON
jQuery.postJSON = function(url,data,callback) {
  "use strict";
  
  jQuery.ajax({
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
  
  $("#youtubeID").keypress(function(e) {
    if(e.which == 13 && this.value.length > 0) {
      $.postJSON("/api/queue", {id: this.value}, function() {
        $("#youtubeID")[0].value = "";
      });
    }
  });
});