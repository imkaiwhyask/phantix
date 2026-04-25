<?php session_start(); ?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phantix Admin</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container min-vh-100 d-flex justify-content-center align-items-center">
  <div class="card shadow-sm border-0" style="width: 380px; border-radius: 18px;">
    <div class="card-body p-4">
      <h3 class="text-center mb-1">Phantix Admin</h3>
      <p class="text-center text-muted mb-4">Admin access only</p>

      <form method="POST" action="login.php">
        <input class="form-control mb-3" type="email" name="email" placeholder="Email" required>
        <input class="form-control mb-3" type="password" name="password" placeholder="Password" required>
        <button class="btn btn-dark w-100" type="submit">Login</button>
      </form>
    </div>
  </div>
</div>

<?php if (isset($_GET['error'])): ?>
<div class="modal fade show" style="display:block; background:rgba(0,0,0,.5);">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow">
      <div class="modal-header">
        <h5 class="modal-title">Access Denied</h5>
      </div>
      <div class="modal-body">
        Admin account is required to access this dashboard.
      </div>
      <div class="modal-footer">
        <a href="index.php" class="btn btn-dark">Okay</a>
      </div>
    </div>
  </div>
</div>
<?php endif; ?>

</body>
</html>
