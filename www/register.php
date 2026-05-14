<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$title = 'Registro';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Crear cuenta</h1>
    <p class="muted">Pendiente: insertar usuario con <code>password_hash</code> en tabla <code>users</code> (ver <code>db/schema.sql</code>).</p>
    <p><a href="login.php">Ya tengo cuenta</a></p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
