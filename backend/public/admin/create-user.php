<?php
session_start();
require_once __DIR__ . '/../../config/db.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(403);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$name || !$email || !$password) {
    echo json_encode(["status" => "error"]);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->execute([$name, $email, $hashed]);

echo json_encode(["status" => "success"]);
