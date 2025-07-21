<?php
// WARNING: the below config can cause a serious security issue.
// Please read https://portswigger.net/web-security/cors/access-control-allow-origin
// Once you are done testing, you should limit the access
// REPLACE with your website url
header('Access-Control-Allow-Origin: https://experiments-ccn.berkeley.edu');
header('Content-Type: application/json');

// NOTE: the below code expects three fields and will NOT work if any of these is missing.
// - data_dir: specify the server directory to store data
// - file_name: specify the filename of the data being saved, which can include subject id
// - exp_data: contain the full json/csv data to be saved

$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
if (empty($_POST['exp_data']) || empty($_POST['data_dir']) || empty($_POST['file_name'])) {
    http_response_code(400);
    echo json_encode(['status'=>'error','msg'=>'Missing exp_data, data_dir or file_name']);
    exit;
}
$exp_data  = $_POST['exp_data'];

/* prevent XSS:  */
$_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

$data_dir  = __DIR__ . '/' . trim($_POST['data_dir'], '/');
$file_name = basename($_POST['file_name']);
// write the file to disk
// NOTE: you must make the data directory accessible by all users
// For example, by running `chmod 772` to give a write access to EVERYONE
if (!is_dir($data_dir) || !is_writable($data_dir)) {
    http_response_code(500);
    echo json_encode(['status'=>'error','msg'=>'Data dir not writable']);
    exit;
}

file_put_contents("$data_dir/$file_name", $exp_data);
echo json_encode(['status'=>'ok','file'=>"$data_dir/$file_name"]);
exit;
?>
