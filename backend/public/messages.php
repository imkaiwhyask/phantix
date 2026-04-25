<?php
require_once __DIR__ . '/../config/db.php';

$sender_id = $_GET['sender_id'] ?? '';
$receiver_id = $_GET['receiver_id'] ?? '';

if (!$sender_id || !$receiver_id) {
    echo json_encode(["status" => "error", "message" => "Missing IDs"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
");

$stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id]);

$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "messages" => $messages
]);
