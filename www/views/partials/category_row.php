<?php
/** @var string $title */
/** @var string $slug */
/** @var list<array<string,mixed>> $items */
$items = $items ?? [];
$catHref = $slug !== '' ? 'products.php?cat=' . rawurlencode($slug) : 'products.php';
?>
<section class="category-row">
  <div class="category-row__head">
    <h2><?= e($title) ?></h2>
    <a href="<?= e($catHref) ?>" class="link-more">Ver todo →</a>
  </div>
  <div class="category-row__track" tabindex="0">
    <?php foreach ($items as $p): ?>
      <?php $compact = true;
      require __DIR__ . '/product_card.php'; ?>
    <?php endforeach; ?>
  </div>
</section>
