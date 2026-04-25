<?php
require_once __DIR__ . '/../config/db.php';

$user_id = $_GET['user_id'] ?? 0;
$other_user_id = $_GET['other_user_id'] ?? 0;

$stmt = $pdo->prepare("
  SELECT is_typing, updated_at
  FROM typing_status
  WHERE user_id = ?
    AND receiver_id = ?
");

$stmt->execute([$other_user_id, $user_id]);
$status = $stmt->fetch(PDO::FETCH_ASSOC);

$isTyping = false;

if ($status && $status['is_typing'] == 1) {
    $updated = strtotime($status['updated_at']);
    $now = time();

    if (($now - $updated) <= 3) {
        $isTyping = true;
    }
}

echo json_encode([
  "status" => "success",
  "is_typing" => $isTyping
]);
