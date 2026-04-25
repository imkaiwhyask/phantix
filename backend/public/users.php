<?php
require_once __DIR__ . '/../config/db.php';

$currentUserId = $_GET['user_id'] ?? 0;

// get users + unread count
$stmt = $pdo->prepare("
  SELECT u.id, u.name, u.nickname, u.email, u.avatar,
  (
    SELECT COUNT(*) 
    FROM messages m 
    WHERE m.sender_id = u.id 
      AND m.receiver_id = ? 
      AND m.is_read = 0
  ) AS unread_count
  FROM users u
");

$stmt->execute([$currentUserId]);

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// use nickname if available
foreach ($users as &$u) {
  if (!empty($u['nickname'])) {
    $u['name'] = $u['nickname'];
  }
}

echo json_encode([
  "status" => "success",
  "users" => $users
]);