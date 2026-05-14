<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$title = 'Órdenes';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Mis órdenes</h1>
    <p class="muted">Pendiente: listar desde tabla <code>orders</code> filtrando por <code>user_id</code>.</p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
