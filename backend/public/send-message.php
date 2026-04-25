<?php
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$sender_id = $data['sender_id'] ?? '';
$receiver_id = $data['receiver_id'] ?? '';
$message = $data['message'] ?? '';

if (!$sender_id || !$receiver_id || !$message) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
$stmt->execute([$sender_id, $receiver_id, $message]);

echo json_encode(["status" => "success"]);
