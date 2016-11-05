      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

      var map;
      var infowindow;
      var pos;
      var service;

      function showLocation(position) {
      	var latitude = position.coords.latitude;
      	var longitude = position.coords.longitude;
      	pos = {lat: latitude, lng: longitude};
      	//alert("Latitude : " + latitude + " Longitude: " + longitude);
      	//return pos;
      	map = new google.maps.Map(document.getElementById('map'), {
          center: pos,
          zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pos,
          radius: 500,
          type: ['restaurant']
        }, callback);

      }

      function errorHandler(err) {
      	 if(err.code == 1) {
               alert("Error: Access is denied!");
            }
            
            else if( err.code == 2) {
               alert("Error: Position is unavailable!");
            }
      }

      function initMap() {
        //var pos = {lat: latitude, lng: longitude};

        if(navigator.geolocation){
               // timeout at 60000 milliseconds (60 seconds)
               var options = {timeout:60000};
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
            
            posLoc = new google.maps.LatLng({lat: pos.lat, lng: pos.lng}); 

            var distance = google.maps.geometry.spherical.computeDistanceBetween(posLoc, placeLoc);

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Distance: ' + distance.toFixed(2) + 'm <br>' +
                place.formatted_address + '</div>');
              infowindow.open(map, this);
            });
          }
        });
        /**
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Place ID: ' + place.place_id + '<br>' +
                place.formatted_address + '</div>');
          infowindow.open(map, this);
        });
        **/
      }