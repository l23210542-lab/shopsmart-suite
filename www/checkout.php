<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$title = 'Checkout';
require APP_ROOT . '/components/header.php';
?>

<div class="container narrow">
  <div class="card card-pad">
    <h1 class="page-title">Checkout</h1>
    <p class="muted">Pendiente: formulario de envío y creación de pedido en MariaDB (tablas <code>orders</code> y <code>order_items</code>).</p>
    <p><a href="cart.php">Volver al carrito</a></p>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
