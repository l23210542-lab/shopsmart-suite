<?php
/**
 * Carrito en sesión (sin React). POST: action=add & product_id & qty
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');
    if ($action === 'add') {
        $pid = trim((string) ($_POST['product_id'] ?? ''));
        $qty = max(1, (int) ($_POST['qty'] ?? 1));
        if ($pid !== '') {
            $_SESSION['cart'] = $_SESSION['cart'] ?? [];
            $found = false;
            foreach ($_SESSION['cart'] as &$line) {
                if ($line['id'] === $pid) {
                    $line['qty'] += $qty;
                    $found = true;
                    break;
                }
            }
            unset($line);
            if (!$found) {
                $_SESSION['cart'][] = ['id' => $pid, 'qty' => $qty];
            }
        }
    } elseif ($action === 'remove') {
        $pid = trim((string) ($_POST['product_id'] ?? ''));
        $_SESSION['cart'] = array_values(array_filter(
            $_SESSION['cart'] ?? [],
            static fn ($l) => ($l['id'] ?? '') !== $pid,
        ));
    }

    $sum = 0;
    foreach ($_SESSION['cart'] ?? [] as $l) {
        $sum += (int) ($l['qty'] ?? 0);
    }
    $_SESSION['cart_count'] = $sum;

    header('Location: cart.php');
    exit;
}

$lines = [];
$subtotal = 0.0;
foreach ($_SESSION['cart'] ?? [] as $line) {
    $p = Product::findById($pdo, (string) $line['id']);
    if ($p === null) {
        continue;
    }
    $qty = (int) $line['qty'];
    $lineTotal = (float) $p['price'] * $qty;
    $subtotal += $lineTotal;
    $lines[] = ['product' => $p, 'qty' => $qty, 'line' => $lineTotal];
}

$title = 'Carrito';
require APP_ROOT . '/components/header.php';
?>

<div class="container">
  <h1 class="page-title">Carrito de compras</h1>

  <?php if (count($lines) === 0): ?>
    <p class="muted">Tu carrito está vacío. <a href="products.php">Ver productos</a></p>
  <?php else: ?>
    <div class="cart-table card">
      <?php foreach ($lines as $row): ?>
        <?php $p = $row['product']; ?>
        <div class="cart-row">
          <img src="<?= e((string) $p['image']) ?>" alt="" width="80" height="80" class="cart-thumb">
          <div>
            <a href="product.php?id=<?= e(urlencode((string) $p['id'])) ?>"><?= e((string) $p['name']) ?></a>
            <div class="muted small">Cantidad: <?= (int) $row['qty'] ?></div>
          </div>
          <div class="cart-row__price">S/ <?= e(number_format($row['line'], 2)) ?></div>
          <form method="post" action="cart.php">
            <input type="hidden" name="action" value="remove">
            <input type="hidden" name="product_id" value="<?= e((string) $p['id']) ?>">
            <button type="submit" class="btn btn-ghost">Quitar</button>
          </form>
        </div>
      <?php endforeach; ?>
      <div class="cart-total">
        <strong>Subtotal: S/ <?= e(number_format($subtotal, 2)) ?></strong>
        <a class="btn btn-primary" href="checkout.php">Ir a checkout</a>
      </div>
    </div>
  <?php endif; ?>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
