<?php
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$nickname = $data['nickname'] ?? '';
$department = $data['department'] ?? '';
$status = $data['status'] ?? 'online';

$stmt = $pdo->prepare("
  UPDATE users 
  SET nickname = ?, department = ?, status = ?
  WHERE id = ?
");

$stmt->execute([$nickname, $department, $status, $id]);

echo json_encode(["status" => "success"]);