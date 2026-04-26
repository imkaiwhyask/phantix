<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

$user_id = $_POST['user_id'] ?? 0;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

if (!isset($_FILES['avatar'])) {
    echo json_encode(["status" => "error", "message" => "No avatar file received"]);
    exit;
}

$file = $_FILES['avatar'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "status" => "error",
        "message" => "Upload error code: " . $file['error']
    ]);
    exit;
}

$targetDir = __DIR__ . "/uploads/avatars/";

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (!is_writable($targetDir)) {
    echo json_encode([
        "status" => "error",
        "message" => "Upload folder is not writable"
    ]);
    exit;
}

$filename = "avatar_" . $user_id . "_" . time() . ".png";
$target = $targetDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to move uploaded file"
    ]);
    exit;
}

$stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
$stmt->execute([$filename, $user_id]);

echo json_encode([
    "status" => "success",
    "avatar" => $filename
]);
