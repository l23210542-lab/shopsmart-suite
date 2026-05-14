<?php
/** @var list<array{slug:string,name:string}> $categories */
/** @var list<array<string,mixed>> $products */
/** @var string|null $q */
/** @var string|null $cat */
$title = 'Productos';
require APP_ROOT . '/components/header.php';
?>

<div class="container">
  <div class="layout-sidebar">
    <aside class="sidebar card">
      <h3 class="sidebar__title">Categorías</h3>
      <ul class="sidebar__list">
        <li><a href="products.php" class="<?= $cat === null || $cat === '' ? 'is-active' : '' ?>">Todas</a></li>
        <?php foreach ($categories as $c): ?>
          <li>
            <a href="products.php?cat=<?= e(rawurlencode($c['slug'])) ?>"
               class="<?= ($cat !== null && $cat === $c['slug']) ? 'is-active' : '' ?>">
              <?= e($c['name']) ?>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </aside>

    <section>
      <form class="search-inline" method="get" action="products.php">
        <?php if ($cat): ?>
          <input type="hidden" name="cat" value="<?= e($cat) ?>">
        <?php endif; ?>
        <input type="search" name="q" value="<?= e($q ?? '') ?>" placeholder="Buscar en esta vista…">
        <button type="submit" class="btn btn-primary">Buscar</button>
      </form>

      <h1 class="page-title">
        <?php
        $catLabel = $cat;
        if ($cat) {
            foreach ($categories as $c) {
                if ($c['slug'] === $cat) {
                    $catLabel = $c['name'];
                    break;
                }
            }
        }
        ?>
        <?php if ($q): ?>
          Resultados para “<?= e($q) ?>”
        <?php elseif ($cat): ?>
          <?= e((string) $catLabel) ?>
        <?php else: ?>
          Todos los productos
        <?php endif; ?>
      </h1>
      <p class="muted"><?= count($products) ?> productos</p>

      <div class="product-grid">
        <?php foreach ($products as $p): ?>
          <?php $compact = false;
          require APP_ROOT . '/views/partials/product_card.php'; ?>
        <?php endforeach; ?>
      </div>

      <?php if (count($products) === 0): ?>
        <p class="muted">No hay resultados. <a href="products.php">Limpiar filtros</a></p>
      <?php endif; ?>
    </section>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
