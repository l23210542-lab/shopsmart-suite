<?php
/**
 * Panel mínimo post-login (extensible a admin/seller).
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = User::current();
if ($user === null) {
    header('Location: login.php');
    exit;
}

$title = 'Panel';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Hola, <?= e($user['name']) ?></h1>
    <p class="muted">Email: <?= e($user['email']) ?> · Rol: <strong><?= e($user['role']) ?></strong></p>
    <ul class="stack-links">
      <li><a href="products.php">Ir al catálogo</a></li>
      <?php if ($user['role'] === 'admin'): ?>
        <li><a href="admin.php">Administración</a> (pendiente migración CRUD)</li>
      <?php endif; ?>
      <?php if ($user['role'] === 'seller' || $user['role'] === 'admin'): ?>
        <li><a href="seller.php">Panel vendedor</a> — incluye <a href="seller-ai-assistant.php">Asistente IA</a> (demo)</li>
      <?php endif; ?>
    </ul>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
