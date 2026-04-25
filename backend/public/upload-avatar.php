<?php
require_once __DIR__ . '/../config/db.php';

$user_id = $_POST['user_id'] ?? 0;

if (!$user_id || !isset($_FILES['avatar'])) {
    echo json_encode(["status" => "error"]);
    exit;
}

$file = $_FILES['avatar'];

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = "avatar_" . $user_id . "_" . time() . "." . $ext;

$target = __DIR__ . "/uploads/avatars/" . $filename;

move_uploaded_file($file['tmp_name'], $target);

// save to DB
$stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
$stmt->execute([$filename, $user_id]);

echo json_encode([
  "status" => "success",
  "avatar" => $filename
]);
