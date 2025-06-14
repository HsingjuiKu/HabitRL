<?php

if (isset($_POST['data_dir']) == true)
{
    $data_dir = $_POST['data_dir']; // data directory
}

if (isset($_POST['file_name']) == true)
{
    $file_name = $_POST['file_name']; // mturk_id
}

// temporary names for debugging
// $data_dir = 'data';
// $file_name = 'RLEM_c2_subj3_2021-5-27_18_21.csv';

$url = 'https://upload.box.com/api/2.0/files/content';
$json = json_encode(array(
'name' => $file_name, // file name to be created on the box -- should be $file_name like mailer.php
'parent' => array('id' => 319426353072) // demo task folder -- REPLACE WITH YOUR FOLDER ID
));
$params = array(
'attributes' => $json,

'file'=>new \CurlFile($data_dir.'/'.$file_name, // name (+ directory) of file to be uploaded
                     'text/csv', // MIME type of file, text/csv or application/JSON
                     $file_name // name of file in upload data
                    )
);

$headers = array("Authorization: Bearer BOX_ACCESS_TOKEN");

// leave section below alone

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
$response = curl_exec($ch);
echo $response;
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo $responseCode;
$errNo = curl_errno($ch);
$errStr = curl_error($ch);
curl_close($ch);

// Box API for looking at folder contents
//curl -i -X GET "https://api.box.com/2.0/folders/0/items" -H "Authorization: Bearer XXKRqMHHSaqu9seQ8W2egTQRmpaC19I8"
//curl -i -X GET "https://api.box.com/2.0/folders/124070411640/items" -H "Authorization: Bearer XXKRqMHHSaqu9seQ8W2egTQRmpaC19I8"


?>
