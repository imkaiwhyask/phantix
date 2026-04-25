<?php
session_start();
require_once __DIR__ . '/../../config/db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password']) && $user['is_admin'] == 1) {
    $_SESSION['admin_id'] = $user['id'];
    $_SESSION['admin_name'] = $user['name'];
    header("Location: dashboard.php");
    exit;
}

header("Location: index.php?error=1");
exit;
