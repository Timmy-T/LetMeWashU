<?php


    # Our API Key
    $API_KEY = "1VnhpNN1j4Ts4VZVigKj0VVRfACrn8YS8Zhoy3Yu";
    # Restaurant Name
    $NumOfResults = 1;
    # List of nutrients
    $NutrientList   = "nutrients=205&nutrients=204&nutrients=208&nutrients=269";

   if(isset($_POST['Restaurant'])){
    $Restaurant = $_POST['Restaurant'];

    foodQuery($Restaurant);
    exit();
   }

    function foodQuery($localRestaurant){
      queryUSDA($localRestaurant);
    }

    # Gets all of the food with the given API Url
    function queryUSDA($Restaurant){  
        global $NumOfResults;
        global $API_KEY;
        # API Call for the USDA
        $RestaurantSearch = "http://api.nal.usda.gov/ndb/search/?format=json&q=$Restaurant&sort=n&max=$NumOfResults&offset=0&api_key=$API_KEY";
        $url = preg_replace("/ /", "%20", $RestaurantSearch);
        $result = file_get_contents($url);
        $json = json_decode($result);
        
        if (isset($json->list)){
        
            $data = $json->list->item;

            foreach($data as $obj){
                $foodID = $obj->ndbno;
                echo "<b>".$obj ->name."</b><br>";

                getUSDANutrients($foodID);
            }
        }
        else{
            echo "No Results";
        }      
    }

    

    # Query and prints Nutrix data
    function queryNutrix(){
        global $API_KEY;
   
        $NutrixRestaurantSearch = "https://api.nutritionix.com/v1_1/search/$Restaurant?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_sugars%2Cnf_sodium%2Cnf_total_fat&appId=5aa1aa3d&appKey=28bbe7eaef2ea7e16caa9614014e16bf";

        global $NutrixRestaurantSearch;
        global $Restaurant;
        $result = file_get_contents($NutrixRestaurantSearch);
        $json = json_decode($result);
        $data = $json->hits;

        foreach ($data as $obj) {
            $nutrient = $obj->fields;
            if (stripWhiteSpace($nutrient->brand_name) == stripWhiteSpace($Restaurant))
            {
                echo $nutrient->item_name."<br>";
                echo "Calories:".$nutrient->nf_calories."<br>";
                echo "Total Fat:".$nutrient->item_name."<br>";
                echo "Sodium:".$nutrient->nf_sodium."<br>";
                echo "Sugars:".$nutrient->nf_sugars."<br>";
                echo "<br><br>";
            }
            # code...
        }
    }


    # Gets the nutrients for each individual food ID
    # Requries food ID as a parameter
    function getUSDANutrients($foodID){
        global $API_KEY;
        global $NutrientList;

        $NutrientSearch = "http://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=$API_KEY&$NutrientList&ndbno=";

        $foodResult = file_get_contents($NutrientSearch.$foodID);
        $foodJson = json_decode($foodResult);
        $foodData = $foodJson->report->foods[0]->nutrients;

        foreach($foodData as $piece){
            echo $piece->nutrient.": ".$piece->value." ".$piece->unit."<br>";
        }
    }



    function stripWhiteSpace($str){
        $cleanedstr = preg_replace(
        "/(\t|\n|\v|\f|\r| |\xC2\x85|\xc2\xa0|\xe1\xa0\x8e|\xe2\x80[\x80-\x8D]|\xe2\x80\xa8|\xe2\x80\xa9|\xe2\x80\xaF|\xe2\x81\x9f|\xe2\x81\xa0|\xe3\x80\x80|\xef\xbb\xbf)+/",
        "_",
        $str
        );
        return $cleanedstr;
    }



?>