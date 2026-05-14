<?php
/** @var string $error */
$error = $error ?? '';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Iniciar sesión</h1>
    <?php if ($error !== ''): ?>
      <p class="alert" role="alert"><?= e($error) ?></p>
    <?php endif; ?>
    <form method="post" action="login.php" class="stack">
      <label>Email
        <input type="email" name="email" required autocomplete="username">
      </label>
      <label>Contraseña
        <input type="password" name="password" required autocomplete="current-password">
      </label>
      <button type="submit" class="btn btn-primary">Entrar</button>
    </form>
    <p class="muted small mt-md">¿No tienes cuenta? <a href="register.php">Registrarse</a> (pendiente en PHP).</p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
