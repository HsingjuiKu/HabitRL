<?php
// WARNING: the below config can cause a serious security issue.
// Please read https://portswigger.net/web-security/cors/access-control-allow-origin
// Once you are done testing, you should limit the access
// header('Access-Control-Allow-Origin: *'); // this allows access from anywhere
header('Access-Control-Allow-Origin: https://experiments-ccn.berkeley.edu'); // change this to the website that will be calling save_data.php

// NOTE: the below code expects three fields and will NOT work if any of these is missing.
// - data_dir: specify the server directory to store data
// - file_name: specify the filename of the data being saved, which can include subject id
// - exp_data: contain the full json/csv data to be saved

if (!isset($_POST['exp_data'], $_POST['data_dir'], $_POST['file_name'])) {
    exit;
}
$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

$data_dir = $_POST['data_dir'];
$file_name = $_POST['file_name'];
$exp_data = $_POST['exp_data'];
$file_path = $data_dir . '/' . $file_name;

// append to file if it exists, otherwise create and write
file_put_contents($file_path, $exp_data . "\n", FILE_APPEND | LOCK_EX);
echo "data saved"
exit;

?>