<?php
# Our API Key
$API_KEY      = "eo1roJnZn9Y7tLU5dd6BfvSHNr75qtqzb2Hj83tr";
# Restaurant Name
$NumOfResults = 10;
# List of nutrients
$NutrientList = "nutrients=205&nutrients=204&nutrients=208&nutrients=269&nutrients=601&nutrients=307";
if (isset($_POST['Restaurant'])) {
    $Restaurant = $_POST['Restaurant'];
    foodQuery($Restaurant);
    exit();
}

class foodObj{
    public $cholestrerol;
    public $sugar;
    public $fat;
    public $salt;
    public $carbs;
    public $energy;
    public $name;
}

function foodQuery($localRestaurant)
{
    queryUSDA($localRestaurant);
}
# Gets all of the food with the given API Url
function queryUSDA($Restaurant)
{
    global $NumOfResults;
    global $API_KEY;
    # API Call for the USDA
    $RestaurantSearch = "http://api.nal.usda.gov/ndb/search/?format=json&q=$Restaurant&sort=n&max=$NumOfResults&offset=0&api_key=$API_KEY";
    $url              = preg_replace("/ /", "%20", $RestaurantSearch);
    $result           = file_get_contents($url);
    $json             = json_decode($result);
    
    if (isset($json->list)) {
        $data = $json->list->item;

        $dummy = new foodObj;
        $foodStack = array();
        foreach ($data as $obj) {
            $foodID = $obj->ndbno;
            $foodContainer =  getUSDANutrients($foodID);

            if ($dummy != $foodContainer){
                $foodContainer->name = $obj->name;

                array_push($foodStack, $foodContainer);
                #echo "<tr><td>".$foodContainer->name."</td><td>".$foodContainer->energy."</td></tr>";
            }
        }

        usort($foodStack, "cmp");
        foreach($foodStack as $item){
<<<<<<< HEAD
            echo "<tr class=\"fooditem\"><td><button class='btn' style='background-color: transparent;'>".$item->name." <span class='caret'></span></button></td><td>".$item->energy."</td></tr>";
            echo "<tr> <td>"."Cholestrerol(g): ".$item->cholesterol."<br> Sugar(g): ".$item->sugar."<br> Fat(g): ".$item->fat."<br> Salt(mg): ".$item->salt."<br> Carbs(g): ".$item->carbs." </td></tr>";
=======
            echo "<tr class=\"fooditem\"><td>".$item->name."</td><td>".$item->energy."</td></tr>";
            echo "<table padding: 15px>
                <tr> <td> <t>Cholestrerol(g): </td><td>".$item->cholesterol."</td></tr>
                <tr> <td> <t>Sugar(g): </td><td>".$item->sugar."</td></tr>
                <tr> <td> <t>Fat(g): </td><td>".$item->fat."</td></tr>
                <tr> <td> <t>Salt(mg): </td><td>".$item->salt."</td></tr>
                <tr> <td> <t>Carbs(g): </td><td>".$item->carbs." </td></tr> </table>";
>>>>>>> origin/master
            }
    }
    else{
        echo "No Results For Restaurant";
    }
}


function cmp($food1, $food2){
    return $food1->energy > $food2->energy;
}

# Gets the nutrients for each individual food ID
# Requries food ID as a parameter
function getUSDANutrients($foodID)
{
    global $API_KEY;
    global $NutrientList;
    $NutrientSearch = "http://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=$API_KEY&$NutrientList&ndbno=";
    $foodResult     = file_get_contents($NutrientSearch . $foodID);
    $foodJson       = json_decode($foodResult);

    if(isset($foodJson->report->foods[0]->nutrients)){
        $foodData = $foodJson->report->foods[0]->nutrients;

        $food = new foodObj;

        $food->cholesterol = $foodData[0]->value;
        $food->sugar = $foodData[1]->value;
        $food->fat = $foodData[2]->value;
        $food->salt = $foodData[3]->value;
        $food->carbs = $foodData[4]->value;
        $food->energy = $foodData[5]->value;

        return $food;
    }
    return new foodObj;
}

# Query and prints Nutrix data
function queryNutrix()
{
    global $API_KEY;
    
    $NutrixRestaurantSearch = "https://api.nutritionix.com/v1_1/search/$Restaurant?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_sugars%2Cnf_sodium%2Cnf_total_fat&appId=5aa1aa3d&appKey=28bbe7eaef2ea7e16caa9614014e16bf";
    global $NutrixRestaurantSearch;
    global $Restaurant;
    $result = file_get_contents($NutrixRestaurantSearch);
    $json   = json_decode($result);
    $data   = $json->hits;
    foreach ($data as $obj) {
        $nutrient = $obj->fields;
        if (stripWhiteSpace($nutrient->brand_name) == stripWhiteSpace($Restaurant)) {
            echo $nutrient->item_name . "<br>";
            echo "Calories:" . $nutrient->nf_calories . "<br>";
            echo "Total Fat:" . $nutrient->item_name . "<br>";
            echo "Sodium:" . $nutrient->nf_sodium . "<br>";
            echo "Sugars:" . $nutrient->nf_sugars . "<br>";
            echo "<br><br>";
        }
        # code...
    }
}

function stripWhiteSpace($str)
{
    $cleanedstr = preg_replace("/(\t|\n|\v|\f|\r| |\xC2\x85|\xc2\xa0|\xe1\xa0\x8e|\xe2\x80[\x80-\x8D]|\xe2\x80\xa8|\xe2\x80\xa9|\xe2\x80\xaF|\xe2\x81\x9f|\xe2\x81\xa0|\xe3\x80\x80|\xef\xbb\xbf)+/", "_", $str);
    return $cleanedstr;
}