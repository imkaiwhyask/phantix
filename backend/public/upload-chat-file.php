<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$sender_id = $_POST['sender_id'] ?? 0;
$receiver_id = $_POST['receiver_id'] ?? 0;

if (!$sender_id || !$receiver_id || !isset($_FILES['file'])) {
    echo json_encode(["status" => "error", "message" => "Missing data"]);
    exit;
}

$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "Upload failed"]);
    exit;
}

$allowed = ['jpg','jpeg','png','gif','webp','pdf','docx','xlsx','txt','zip'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    echo json_encode(["status" => "error", "message" => "File type not allowed"]);
    exit;
}

$originalName = basename($file['name']);
$fileName = "chat_" . time() . "_" . rand(1000,9999) . "." . $ext;

$targetDir = __DIR__ . "/uploads/chat/";
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$target = $targetDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode(["status" => "error", "message" => "Failed to save file"]);
    exit;
}

$imageTypes = ['jpg','jpeg','png','gif','webp'];
$messageType = in_array($ext, $imageTypes) ? 'image' : 'file';

$stmt = $pdo->prepare("
    INSERT INTO messages 
    (sender_id, receiver_id, message, message_type, file_name, file_path, original_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $sender_id,
    $receiver_id,
    '',
    $messageType,
    $fileName,
    'uploads/chat/' . $fileName,
    $originalName
]);

echo json_encode([
    "status" => "success",
    "message_type" => $messageType,
    "file_name" => $fileName,
    "file_path" => 'uploads/chat/' . $fileName,
    "original_name" => $originalName
]);
