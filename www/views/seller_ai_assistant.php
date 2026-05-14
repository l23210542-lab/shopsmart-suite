<?php
/** @var string $prompt */
/** @var array<string,mixed>|null $ai */
require APP_ROOT . '/components/header.php';
?>

<div class="container">
  <p class="ai-demo-banner" role="status">
    <strong>Modo demo:</strong> no se llama a ninguna API externa. Las sugerencias son plantillas fijas activadas por palabras clave en tu texto.
  </p>

  <div class="ai-assistant-grid">
    <section class="card card-pad ai-assistant-form">
      <h1 class="page-title">Asistente para vendedores</h1>
      <p class="muted">
        Describe en una frase lo que quieres vender. El asistente sugerirá título, descripción, precio orientativo y categoría.
      </p>
      <form method="post" action="seller-ai-assistant.php" class="form-stack">
        <label for="prompt">Tu idea</label>
        <textarea id="prompt" name="prompt" rows="4" required maxlength="500"
          placeholder="Ej.: Zapatos negros deportivos"><?= e($prompt) ?></textarea>
        <button type="submit" class="btn btn-primary">Generar sugerencias</button>
      </form>
      <p class="muted small mt-md"><a href="seller.php">← Volver al panel vendedor</a></p>
    </section>

    <?php if ($ai !== null): ?>
      <section class="card card-pad ai-assistant-results" aria-live="polite">
        <header class="ai-results-head">
          <h2 class="ai-results-title">Sugerencias</h2>
          <span class="ai-scenario-pill"><?= e((string) $ai['scenario_label']) ?></span>
        </header>

        <dl class="ai-result-dl">
          <div>
            <dt>Título sugerido</dt>
            <dd><?= e((string) $ai['title']) ?></dd>
          </div>
          <div>
            <dt>Descripción mejorada</dt>
            <dd class="ai-desc"><?= nl2br(e((string) $ai['description'])) ?></dd>
          </div>
          <div>
            <dt>Precio recomendado (S/)</dt>
            <dd class="ai-price"><?= (float) $ai['price'] > 0 ? e(number_format((float) $ai['price'], 2)) : '—' ?></dd>
          </div>
          <div>
            <dt>Categoría sugerida</dt>
            <dd>
              <span class="ai-cat-name"><?= e((string) $ai['category_label']) ?></span>
              <span class="muted small">(<code><?= e((string) $ai['category_slug']) ?></code>)</span>
            </dd>
          </div>
        </dl>
        <p class="muted small">
          Copia y pega en tu ficha de producto cuando exista el formulario de alta. El CRUD en PHP está pendiente.
        </p>
      </section>
    <?php else: ?>
      <section class="card card-pad ai-assistant-placeholder muted">
        <p>Las sugerencias aparecerán aquí tras pulsar «Generar sugerencias».</p>
      </section>
    <?php endif; ?>
  </div>
</div>

<?php require APP_ROOT . '/components/footer.php'; ?>
