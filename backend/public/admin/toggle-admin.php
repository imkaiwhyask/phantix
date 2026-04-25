<?php
session_start();
require_once __DIR__ . '/../../config/db.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(403);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

$stmt = $pdo->prepare("UPDATE users SET is_admin = NOT is_admin WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["status" => "success"]);
