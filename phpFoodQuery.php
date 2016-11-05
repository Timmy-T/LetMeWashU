<?php

# Our API Key
$API_KEY = "1VnhpNN1j4Ts4VZVigKj0VVRfACrn8YS8Zhoy3Yu";
# Restaurant Name
$Restraurant = "BurgerKing";
$NumOfResults = 10;
$NutrientList   = "nutrients=205&nutrients=204&nutrients=208&nutrients=269";
# API Call for the restaurant
$RestaurantSearch = "http://api.nal.usda.gov/ndb/search/?format=json&q=$Restraurant&sort=n&max=$NumOfResults&offset=0&api_key=$API_KEY";
$NutrientSearch = "http://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=$API_KEY&$NutrientList&ndbno=";


# Gets all of the food with the given API Url
function getFood($url){   
    $result = file_get_contents($url);
    $json = json_decode($result);
    
    $data = $json->list->item;

    foreach($data as $obj){
        $foodID = $obj->ndbno;
        echo "<b>".$obj ->name."</b><br>";

        getNutrients($foodID);
    }
}



# Gets the nutrients for each individual food ID
function getNutrients($foodID){
    global $API_KEY;
    global $NutrientList;

    global $NutrientSearch;

    $foodResult = file_get_contents($NutrientSearch.$foodID);
    $foodJson = json_decode($foodResult);
    $foodData = $foodJson->report->foods[0]->nutrients;

    foreach($foodData as $piece){
        echo "Nutrient:".$piece->nutrient."<br>";
        echo "Unit:".$piece->unit."<br>";
        echo "Value".$piece->value."<br>";
        echo "GM:".$piece->gm."<br>";
        echo "<br><br>";
    }
}

getFood($RestaurantSearch);

?>