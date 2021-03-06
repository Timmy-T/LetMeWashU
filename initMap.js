      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
      var map;
      var infowindow;
      var pos;
      var service;
      var userRad = null;

      function initialize() {
          var address = (document.getElementById('my-address'));
          //   map.controls[google.maps.ControlPosition.TOP_LEFT].push(address);

          var autocomplete = new google.maps.places.Autocomplete(address);
          autocomplete.bindTo('bounds', map);

          var infowindow = new google.maps.InfoWindow();

          autocomplete.bindTo('my-address', map);
          autocomplete.setTypes(['geocode']);

          autocomplete.addListener('place_changed', function() {
              infowindow.close();
              marker.setVisible(false);
              var place = autocomplete.getPlace();
              if (!place.geometry) {
                  // User entered the name of a Place that was not suggested and
                  // pressed the Enter key, or the Place Details request failed.
                  window.alert("No details available for input: '" + place.name + "'");
                  return;
              }

              // If the place has a geometry, then present it on a map.
              if (place.geometry.viewport) {
                  map.fitBounds(place.geometry.viewport);
              } else {
                  map.setCenter(place.geometry.location);
                  map.setZoom(10); // Why 17? Because it looks good.
              }
              marker.setIcon( /** @type {google.maps.Icon} */ ({
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(35, 35)
              }));
              marker.setPosition(place.geometry.location);
              marker.setVisible(true);

              var address = '';
              if (place.address_components) {
                  address = [
                      (place.address_components[0] && place.address_components[0].short_name || ''),
                      (place.address_components[1] && place.address_components[1].short_name || ''),
                      (place.address_components[2] && place.address_components[2].short_name || '')
                  ].join(' ');
              }

              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
              infowindow.open(map, marker);
          });
      }

      function codeAddress() {
          geocoder = new google.maps.Geocoder();
          var address = document.getElementById("my-address").value;
          geocoder.geocode({
              'address': address
          }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                  pos = {
                      lat: results[0].geometry.location.lat(),
                      lng: results[0].geometry.location.lng()
                  };
                  makeMap(true);
              } else {
                  alert("Geocode was not successful for the following reason: " + status);
              }
          });
      }

      function createCookie(name, value, days) {
          if (days) {
              var date = new Date();
              date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
              var expires = "; expires=" + date.toGMTString();
          } else var expires = "";
          document.cookie = name + "=" + value + expires + "; path=/";
      }


      function readCookie(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
              var c = ca[i];
              while (c.charAt(0) == ' ') c = c.substring(1, c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
          }
          return null;
      }

      function eraseCookie(name) {
          createCookie(name, "", -1);
      }

      function makeMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: pos,
          zoom: 15
        });

        if (document.getElementById('dist1').checked) {
          userRad = document.getElementById('dist1').value;
        }
        else if (document.getElementById('dist2').checked) {
          userRad = document.getElementById('dist2').value;
        }
        else {
          userRad = document.getElementById('dist3').value;
        }

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pos,
          radius: userRad,
          maxPriceLevel: 1,
          type: ['restaurant']
        }, callback);

      }

      function showLocation(position) {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;

          pos = {
              lat: latitude,
              lng: longitude
          };

          makeMap();
          initialize();
      }

      function errorHandler(err) {
          if (err.code == 1) {
              alert("Error: Access is denied!");
          } else if (err.code == 2) {
              alert("Error: Position is unavailable!");
          }
      }

      function initMap() {
          //var pos = {lat: latitude, lng: longitude};

          if (navigator.geolocation) {
              // timeout at 60000 milliseconds (60 seconds)
              var options = {
                  timeout: 60000
              };
              navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
          }
      }

      function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {
                  createMarker(results[i]);

              }
          }
      }

      function createMarker(place) {
          var placeLoc = place.geometry.location;
          var placeID = place.place_id;

          service.getDetails({
              placeId: placeID
          }, function(place, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                  var marker = new google.maps.Marker({
                      map: map,
                      position: place.geometry.location
                  });

                  placeLoc = place.geometry.location; //supposedly a latlng object

                  posLoc = new google.maps.LatLng({
                      lat: pos.lat,
                      lng: pos.lng
                  });

                  var distance = google.maps.geometry.spherical.computeDistanceBetween(posLoc, placeLoc);

                  var calories = (distance/1609.34) * 88.9;

                  var directionsUrl = "https://www.google.com/maps/dir/" + place.name + "," + place.formatted_address;

                  google.maps.event.addListener(marker, 'click', function() {
                      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                          'Distance: ' + distance.toFixed(2) + 'm <br> Calories burned walking: ' + calories.toFixed(2) + ' cal* <br>' + place.formatted_address + '<br><a target="_blank" href="' + directionsUrl + '"><b>Get Directions!</b></a></div>');

                      console.log(place.name);
                      $.post("phpFoodQuery.php", {
                              Restaurant: place.name
                          })
                          .done(function(data) {
                              console.log(data);

                              var div = document.getElementById('foodList')
                              div.innerHTML = data;
                              $('table tr:not(.fooditem)').hide();
                              $('.fooditem').click(function()
                              {
                                $(this).nextUntil('tr.fooditem').slideToggle(300);
                              });
                              var menuHeader = document.getElementById('menuHeader');
                               
                          });

                      infowindow.open(map, this);
                  });
              }
          });

          document.getElementById("my-address")
              .addEventListener("keyup", function(event) {
                  event.preventDefault();
                  if (event.keyCode == 13) {
                      document.getElementById("addressBtn").click();
                  }
              });

      }