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
      // }).fail(function(jqXHR, textStatus, errorThrown) {
      }).fail(function() {
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
      $.postJSON("/api/v1/queue", item, function(err, msg) {
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
  
  
  
  function updateQueue() {
    $.getJSON("/api/v1/queue", function(res) {
      if (!res.success) {
        console.error(res.error);
        return;
      }
      
      // console.dir(res);
      // console.log(res.data);
      
      clearQueue();
      addQueueItem(-2, res.data.playing);
      addQueueItem(-1, res.data.prepping);
      $.each(res.data.queue, addQueueItem);
    // }).fail(function(jqXHR, textStatus, errorThrown) {
    }).fail(function() {
      console.dir(arguments);
    });
  }
  
  function clearQueue() {
    $("#queue").html("");
  }
  
  function addQueueItem(index, item) {
    let sp = $("<span>");
    console.log(item);
    
    if (index === -2) {
      // Currently playing item
      if (item == null) {
        sp.text("Playing: nothing");
      } else {
        sp.text("Playing: (" + item.serviceName + ") " + item.title);
      }
    } else if (index === -1) {
      // Prepping item
      if (item == null) {
        sp.text("Prepping: nothing");
      } else {
        sp.text("Prepping: (" + item.serviceName + ") " + item.title);
      }
    } else {
      sp.text("(" + item.serviceName + ") " + item.title);
    }
    
    let li = $("<li>");
    li.append(sp);
    $("#queue").append(li);
  }
  
  // Update the queue every second.
  setInterval(updateQueue, 1000);
});