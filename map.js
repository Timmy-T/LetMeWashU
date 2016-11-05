var map;
var infowindow;
var pos;

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
  var service = new google.maps.places.PlacesService(map);
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
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}