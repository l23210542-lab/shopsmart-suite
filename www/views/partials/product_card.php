<?php
/** @var array<string,mixed> $p */
$p = $p ?? [];
$id = (string) ($p['id'] ?? '');
$name = (string) ($p['name'] ?? '');
$image = (string) ($p['image'] ?? '');
$price = isset($p['price']) ? (float) $p['price'] : 0.0;
$rating = isset($p['rating']) ? (float) $p['rating'] : 0.0;
$reviews = (int) ($p['reviews'] ?? 0);
$compact = !empty($compact);
?>
<article class="product-card<?= $compact ? ' product-card--compact' : '' ?>">
  <a href="product.php?id=<?= e(urlencode($id)) ?>" class="product-card__media">
    <img src="<?= e($image) ?>" alt="<?= e($name) ?>" loading="lazy" width="300" height="300">
  </a>
  <div class="product-card__body">
    <a href="product.php?id=<?= e(urlencode($id)) ?>" class="product-card__title"><?= e($name) ?></a>
    <div class="product-card__meta">
      <span class="stars" aria-label="Valoración <?= e((string) $rating) ?> de 5">★ <?= e(number_format($rating, 1)) ?></span>
      <span class="muted">(<?= (int) $reviews ?>)</span>
    </div>
    <div class="product-card__price">
      <span class="currency">S/</span> <?= e(number_format($price, 2)) ?>
    </div>
    <?php if (!$compact): ?>
      <form method="post" action="cart.php" class="product-card__form">
        <input type="hidden" name="action" value="add">
        <input type="hidden" name="product_id" value="<?= e($id) ?>">
        <button type="submit" class="btn btn-primary">Añadir al carrito</button>
      </form>
    <?php endif; ?>
  </div>
</article>
