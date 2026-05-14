<?php
/** @var array<string,mixed> $product */
/** @var list<array<string,mixed>> $related */
require APP_ROOT . '/components/header.php';
?>

<div class="container product-detail">
  <nav class="breadcrumb" aria-label="Migas">
    <a href="index.php">Inicio</a>
    <span aria-hidden="true"> · </span>
    <a href="products.php?cat=<?= e(rawurlencode((string) $product['category'])) ?>"><?= e((string) $product['category']) ?></a>
    <span aria-hidden="true"> · </span>
    <span><?= e((string) $product['name']) ?></span>
  </nav>

  <div class="product-detail__grid">
    <div class="product-detail__media card">
      <img src="<?= e((string) $product['image']) ?>" alt="<?= e((string) $product['name']) ?>">
    </div>
    <div>
      <h1 class="page-title"><?= e((string) $product['name']) ?></h1>
      <p class="muted">Vendido por <?= e((string) $product['seller']) ?></p>
      <p class="product-detail__price">
        <span class="currency">S/</span> <?= e(number_format((float) $product['price'], 2)) ?>
      </p>
      <p><?= nl2br(e((string) $product['description'])) ?></p>
      <p class="muted">Stock: <?= (int) $product['stock'] ?> unidades</p>
      <form method="post" action="cart.php" class="stack">
        <input type="hidden" name="action" value="add">
        <input type="hidden" name="product_id" value="<?= e((string) $product['id']) ?>">
        <label>Cantidad
          <input type="number" name="qty" value="1" min="1" max="<?= (int) min((int) $product['stock'], 10) ?>">
        </label>
        <button type="submit" class="btn btn-primary">Añadir al carrito</button>
      </form>
    </div>
  </div>

  <?php if (count($related) > 0): ?>
    <section class="mt-lg">
      <h2>Relacionados</h2>
      <div class="product-grid">
        <?php foreach ($related as $p): ?>
          <?php $compact = true;
          require APP_ROOT . '/views/partials/product_card.php'; ?>
        <?php endforeach; ?>
      </div>
    </section>
  <?php endif; ?>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
