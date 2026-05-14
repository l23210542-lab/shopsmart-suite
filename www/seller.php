<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = User::current();
if ($user === null || $user['role'] === 'customer') {
    header('Location: login.php');
    exit;
}

$title = 'Vendedor';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Panel del vendedor</h1>
    <p class="muted">Esta sección se migrará desde <code>src/routes/seller.tsx</code> (listados, CRUD productos).</p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
