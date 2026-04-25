<?php
require_once __DIR__ . '/../config/db.php';

$currentUserId = $_GET['user_id'] ?? 0;

$stmt = $pdo->prepare("
  SELECT sender_id, COUNT(*) AS unread_count
  FROM messages
  WHERE receiver_id = ?
    AND is_read = 0
  GROUP BY sender_id
");

$stmt->execute([$currentUserId]);

echo json_encode([
  "status" => "success",
  "counts" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);