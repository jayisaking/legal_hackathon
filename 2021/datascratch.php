<?php
header('Access-Control-Allow-Origin: *');
$temp=array();
$temp[]=1;
$temp[]=2;
echo $_GET['callback']."(".json_encode($temp).");";
// $link = mysqli_connect("localhost", "root", "huigre;ao") or die("Connect Wrong");
// $query_key="民事";
// $judgement_json=array();
// mysqli_select_db($link, "hackathon2021") or die("Connect database Wrong");
// $sql_insert="SELECT full_judgement FROM judgement WHERE MATCH(judgement,keywords) AGAINST('$query_key')";
// mysqli_query("set names utf8");
// $result = mysqli_query($link, $sql_insert);
// $count=0;
// while ($row = mysqli_fetch_assoc($result)) {
//     $judgement_json[]=$row['full_judgement'];
//     //echo $row['full_judgement'];
// }
// echo $_GET['callback']."(".json_encode($judgement_json).");";
?>
