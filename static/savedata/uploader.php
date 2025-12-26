<?php

set_time_limit(0);
ini_set('memory_limit','512M');


// temporary names for debugging
$data_dir  = __DIR__ . '/' . ($_POST['data_dir']  ?? '');
$file_name =             $_POST['file_name'] ?? '';

header('Content-Type: application/json');
if (!is_file("$data_dir/$file_name")) {
  http_response_code(404);
  echo json_encode(['status'=>'error','msg'=>"File not found: $data_dir/$file_name"]);
  exit;
}

$folder_id = '329840044741';
$access_token = 'YOUR_LONG_LIVED_TOKEN';

$url = 'https://upload.box.com/api/2.0/files/content';
$json = json_encode([
  'name'   => $file_name,
  'parent' => ['id' => $folder_id]
]);
$params = [
  'attributes' => $json,
  'file'       => new \CurlFile("$data_dir/$file_name", 'text/csv', $file_name)
];
$headers = [
  "Authorization: Bearer $access_token"
];

// leave section below alone

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);

$response     = curl_exec($ch);
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$errNo        = curl_errno($ch);
$errStr       = curl_error($ch);
curl_close($ch);

// Box API for looking at folder contents
//curl -i -X GET "https://api.box.com/2.0/folders/0/items" -H "Authorization: Bearer XXKRqMHHSaqu9seQ8W2egTQRmpaC19I8"
//curl -i -X GET "https://api.box.com/2.0/folders/124070411640/items" -H "Authorization: Bearer XXKRqMHHSaqu9seQ8W2egTQRmpaC19I8"

if ($responseCode >= 200 && $responseCode < 300) {
  echo json_encode([
    'status'   => 'ok',
    'box_code' => $responseCode,
    'response' => json_decode($response, true)
  ]);
} else {
  http_response_code(500);
  echo json_encode([
    'status'  => 'error',
    'code'    => $responseCode,
    'message' => $errStr ?: $response
  ]);

?>
