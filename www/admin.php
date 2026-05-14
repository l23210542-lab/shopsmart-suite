<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = User::current();
if ($user === null || $user['role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo 'Acceso denegado.';
    exit;
}

$title = 'Admin';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Panel administrativo</h1>
    <p class="muted">Migración pendiente desde <code>src/routes/admin.tsx</code>.</p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
