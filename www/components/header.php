<?php
/** @var string $title Título de la pestaña (opcional) */
$title = $title ?? APP_NAME;
$user = User::current();
$cartCount = (int) ($_SESSION['cart_count'] ?? 0);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> — <?= e(APP_NAME) ?></title>
  <link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="index.php" class="logo">
      <span class="logo-mark">C</span>
      <span class="logo-text">Cenít <span class="logo-accent">Pi</span></span>
    </a>

    <form class="search-bar" action="products.php" method="get" role="search">
      <input type="search" name="q" placeholder="Buscar productos…" aria-label="Buscar">
      <button type="submit">Buscar</button>
    </form>

    <nav class="header-nav" aria-label="Principal">
      <a href="products.php">Productos</a>
      <?php if ($user): ?>
        <span class="nav-user"><?= e($user['name']) ?></span>
        <a href="dashboard.php">Panel</a>
        <a href="logout.php">Salir</a>
      <?php else: ?>
        <a href="login.php">Iniciar sesión</a>
      <?php endif; ?>
      <a href="cart.php" class="cart-link">Carrito (<?= (int) $cartCount ?>)</a>
    </nav>

    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" id="navToggle">
      Menú
    </button>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <a href="index.php">Inicio</a>
    <a href="products.php">Productos</a>
    <?php if ($user): ?>
      <a href="dashboard.php">Panel</a>
      <a href="logout.php">Salir</a>
    <?php else: ?>
      <a href="login.php">Iniciar sesión</a>
    <?php endif; ?>
    <a href="cart.php">Carrito</a>
  </div>
</header>
<main class="site-main">
