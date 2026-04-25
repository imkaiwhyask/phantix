<?php
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? 0;
$receiver_id = $data['receiver_id'] ?? 0;
$is_typing = $data['is_typing'] ?? 0;

if (!$user_id || !$receiver_id) {
    echo json_encode(["status" => "error"]);
    exit;
}

$stmt = $pdo->prepare("
  INSERT INTO typing_status (user_id, receiver_id, is_typing)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE 
    is_typing = VALUES(is_typing),
    updated_at = CURRENT_TIMESTAMP
");

$stmt->execute([$user_id, $receiver_id, $is_typing]);

echo json_encode(["status" => "success"]);
