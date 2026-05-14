<?php
/**
 * Vista: inicio (equivalente React Index).
 *
 * @var list<array{slug:string,name:string}> $categories
 * @var array<string, list<array<string,mixed>>> $productsByCategory
 * @var list<array<string,mixed>> $featured
 * @var list<array{slug:string,name:string}> $quickCategories
 * @var array<string, array<string,mixed>|null> $quickSamples
 */
$title = 'Inicio';
require APP_ROOT . '/components/header.php';
?>

<div class="container">
  <section class="hero">
    <div class="hero__pattern" aria-hidden="true"></div>
    <div class="hero__content">
      <p class="hero__badge">Corre en Raspberry Pi 4 con Apache + PHP + MariaDB</p>
      <h1 class="hero__title">
        Compra todo. <span class="text-primary">En cualquier lugar.</span>
      </h1>
      <p class="hero__lead">
        Marketplace ligero estilo Amazon: PHP 8, MariaDB y sin Node en producción.
      </p>
      <div class="hero__actions">
        <a class="btn btn-primary btn-lg" href="products.php">Explorar catálogo</a>
        <a class="btn btn-outline-light btn-lg" href="seller.php">Vender en <?= e(APP_NAME) ?></a>
      </div>
    </div>
  </section>

  <section class="grid grid-cols-2 lg-grid-4 gap-md mt-lg">
    <?php foreach ($quickCategories as $c): ?>
      <?php $sample = $quickSamples[$c['slug']] ?? null; ?>
      <a class="card card-hover" href="products.php?cat=<?= e(urlencode($c['slug'])) ?>">
        <h3 class="card__title"><?= e($c['name']) ?></h3>
        <div class="card__media">
          <?php if ($sample && !empty($sample['image'])): ?>
            <img src="<?= e((string) $sample['image']) ?>" alt="" loading="lazy">
          <?php endif; ?>
        </div>
        <span class="card__cta">Comprar ahora →</span>
      </a>
    <?php endforeach; ?>
  </section>

  <section class="trust-bar mt-lg">
    <div class="trust-item">
      <div class="trust-icon" aria-hidden="true">🚚</div>
      <div>
        <div class="trust-title">Envío local rápido</div>
        <div class="muted small">Desde tu propio servidor</div>
      </div>
    </div>
    <div class="trust-item">
      <div class="trust-icon" aria-hidden="true">🛡</div>
      <div>
        <div class="trust-title">Compra protegida</div>
        <div class="muted small">Devoluciones 30 días (demo)</div>
      </div>
    </div>
    <div class="trust-item">
      <div class="trust-icon" aria-hidden="true">π</div>
      <div>
        <div class="trust-title">Hecho con Pi</div>
        <div class="muted small">PHP + MariaDB</div>
      </div>
    </div>
  </section>

  <?php foreach ($categories as $cat): ?>
    <?php
    $title = $cat['name'];
    $slug = $cat['slug'];
    $items = $productsByCategory[$slug] ?? [];
    require APP_ROOT . '/views/partials/category_row.php';
    ?>
  <?php endforeach; ?>

  <div class="spacer"></div>

  <?php
  $title = 'Productos destacados';
  $slug = '';
  $items = $featured;
  require APP_ROOT . '/views/partials/category_row.php';
  ?>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
