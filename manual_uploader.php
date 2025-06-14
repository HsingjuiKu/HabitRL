<?php

$data_dir = 'data';
$file_name = ''; // replace as needed

$url = 'https://upload.box.com/api/2.0/files/content';
$json = json_encode(array(
'name' => $file_name, // file name to be created on the box -- should be $file_name like mailer.php
'parent' => array('id' => 319426353072) // folder ID - copy from uploader.php
));
$params = array(
'attributes' => $json,

'file'=>new \CurlFile($data_dir.'/'.$file_name, // name (+ directory) of file to be uploaded
                     'text/csv', // MIME type of file - change according to file being uploaded
                     $file_name // name of file in upload data
                    )
);
// $headers = array("Authorization: Bearer Q8HhJDk3JnRhBQPeYnoNP7vgcx4AEjlW"); primary access token
$headers = array("Authorization: Bearer XXKRqMHHSaqu9seQ8W2egTQRmpaC19I8");

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
