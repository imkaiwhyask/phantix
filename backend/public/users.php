<?php
require_once __DIR__ . '/../config/db.php';

$stmt = $pdo->query("SELECT id, name, email FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "users" => $users
]);
