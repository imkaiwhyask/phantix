<?php
require_once __DIR__ . '/../config/db.php';

$sender_id = $_GET['sender_id'] ?? 0;
$receiver_id = $_GET['receiver_id'] ?? 0;

if (!$sender_id || !$receiver_id) {
    echo json_encode(["status" => "error", "message" => "Missing IDs"]);
    exit;
}

// Mark messages as read when opened
$update = $pdo->prepare("
  UPDATE messages 
  SET is_read = 1 
  WHERE sender_id = ? 
    AND receiver_id = ? 
    AND is_read = 0
");
$update->execute([$receiver_id, $sender_id]);

// Get conversation messages
$stmt = $pdo->prepare("
  SELECT *
  FROM messages
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
