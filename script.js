
$(document).ready(function () {



  getLocation()
  var searchValue;
  var latt;
  var long;
  function getLocation() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("broken");
    }
  }

  function showPosition(position) {
    latt = position.coords.latitude.toFixed(2);
    long = position.coords.longitude.toFixed(2);
    getGeolocation()
  }

  function getGeolocation() {
    $.ajax({
      type: "GET",
      url: "https:api.openweathermap.org/data/2.5/weather?lat=" + latt + "&lon=" + long + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c",
      dataType: "json",
      success: function (data) {
        console.log("made it")
        searchValue = data.name;
        console.log(data)
        searchWeather(data.name);
      }
    });
  }












































  $("#search-button").on("click", function () {
    //after inputitng text and clicking, the text is set to this var statement
    var searchValue = $("#search-value").val();

    //this clears out the text after the click
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  //creates a click listener on the list 
  $(".history").on("click", "li", function () {
    //this is calling a funtion to be ran after it recieves textcontent

    searchWeather($(this).text());
  });


  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action shadow-sm font-weight-bold text-uppercase mb-2").text(text);
    $(".history").append(li);
  }
  //this says its not going to run till it has been given a search value
  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c&units=imperial",
      dataType: "json",
      success: function (data) {

        // create history link for this search
        //if my search value is not in history
        if (history.indexOf(searchValue) === -1) {

          history.push(searchValue);
          //in localstorage set the array name as history and string history
          window.localStorage.setItem("history", JSON.stringify(history));
          //this calls the funtion makeRow with the the var which is the city we input
          makeRow(searchValue);
        }
        //clears card with weather info
        $("#today").empty();


        // create html (content) for current weather

        var title = $("<h3>").addClass("card-title text-center").text(data.name + "   " + new Date().toLocaleDateString());
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c&units=imperial",
      dataType: "json",
      success: function (data) {

        console.log(data.list[2].dt_txt)
        console.log(data.list[1].dt_txt)
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class= \"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=7ba67ac190f85fdba2e2dc6b9d32e93c&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});


//Bonus, use location API to add the user's current location to the initial landing page.

// getLocation()
// var searchValue;
// var latt;
// var long;
// function getLocation() {

//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(showPosition);
//   } else {
//     console.log("broken");
//   }
// }


// function showPosition(position) {
//   latt = position.coords.latitude.toFixed(2);
//   long = position.coords.longitude.toFixed(2);
// getGeolocation()
// }

// function getGeolocation() {
//   $.ajax({
//     type: "GET",
//     url: "https:api.openweathermap.org/data/2.5/weather?lat=" + latt + "&lon=" + long + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c",
//     dataType: "json",
//     success: function(data) {
//       console.log("made it")
//       searchValue = data.name;
//       console.log(data)
//       console.log(searchValue + " done")
//       searchWeather()

//     }
//   });
// }

