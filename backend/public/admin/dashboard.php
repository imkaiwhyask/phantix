<?php
session_start();
require_once __DIR__ . '/../../config/db.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phantix Admin</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

<div class="container py-4">

  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3>Phantix Admin</h3>
    <div>
      <span class="me-3 text-muted">Welcome, <?= $_SESSION['admin_name'] ?></span>
      <a href="logout.php" class="btn btn-sm btn-outline-dark">Logout</a>
    </div>
  </div>

  <div class="card shadow-sm border-0">
    <div class="card-body">

      <div class="d-flex justify-content-between mb-3">
        <h5 class="mb-0">Users</h5>
        <button class="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target="#createModal">
          + Add User
        </button>
      </div>

      <table class="table align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <?php foreach ($users as $u): ?>
          <tr>
            <td><?= $u['id'] ?></td>
            <td><?= htmlspecialchars($u['name']) ?></td>
            <td><?= htmlspecialchars($u['email']) ?></td>
            <td>
              <span class="badge <?= $u['is_admin'] ? 'bg-success' : 'bg-secondary' ?>">
                <?= $u['is_admin'] ? 'Admin' : 'User' ?>
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary"
                onclick="openEdit(<?= $u['id'] ?>,'<?= $u['name'] ?>','<?= $u['email'] ?>')">
                Edit
              </button>

              <button class="btn btn-sm btn-outline-danger"
                onclick="deleteUser(<?= $u['id'] ?>)">
                Delete
              </button>

              <button class="btn btn-sm btn-outline-warning"
                onclick="toggleAdmin(<?= $u['id'] ?>)">
                Toggle
              </button>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>

      </table>
    </div>
  </div>
</div>

<!-- CREATE MODAL -->
<div class="modal fade" id="createModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header"><h5>Add User</h5></div>

      <div class="modal-body">
        <input id="c_name" class="form-control mb-2" placeholder="Name">
        <input id="c_email" class="form-control mb-2" placeholder="Email">
        <input id="c_pass" class="form-control" placeholder="Password">
      </div>

      <div class="modal-footer">
        <button class="btn btn-dark" onclick="createUser()">Create</button>
      </div>
    </div>
  </div>
</div>

<!-- EDIT MODAL -->
<div class="modal fade" id="editModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header"><h5>Edit User</h5></div>

      <div class="modal-body">
        <input type="hidden" id="e_id">
        <input id="e_name" class="form-control mb-2">
        <input id="e_email" class="form-control">
      </div>

      <div class="modal-footer">
        <button class="btn btn-dark" onclick="updateUser()">Save</button>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>

async function createUser() {
  await fetch("create-user.php", {
    method: "POST",
    body: JSON.stringify({
      name: document.getElementById("c_name").value,
      email: document.getElementById("c_email").value,
      password: document.getElementById("c_pass").value
    })
  });

  location.reload();
}

function openEdit(id,name,email) {
  document.getElementById("e_id").value = id;
  document.getElementById("e_name").value = name;
  document.getElementById("e_email").value = email;

  new bootstrap.Modal(document.getElementById("editModal")).show();
}

async function updateUser() {
  await fetch("update-user.php", {
    method: "POST",
    body: JSON.stringify({
      id: document.getElementById("e_id").value,
      name: document.getElementById("e_name").value,
      email: document.getElementById("e_email").value
    })
  });

  location.reload();
}

async function deleteUser(id) {
  if (!confirm("Delete user?")) return;

  await fetch("delete-user.php", {
    method: "POST",
    body: JSON.stringify({ id })
  });

  location.reload();
}

async function toggleAdmin(id) {
  await fetch("toggle-admin.php", {
    method: "POST",
    body: JSON.stringify({ id })
  });

  location.reload();
}

</script>

</body>
</html>
