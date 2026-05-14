<?php
/**
 * Detalle de un producto.
 */
declare(strict_types=1);

final class ProductDetailController
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function show(string $id): void
    {
        $product = Product::findById($this->pdo, $id);
        if ($product === null) {
            http_response_code(404);
            $title = 'No encontrado';
            require APP_ROOT . '/components/header.php';
            echo '<div class="container"><p>Producto no encontrado.</p><p><a href="products.php">Volver al catálogo</a></p></div>';
            require APP_ROOT . '/components/footer.php';
            return;
        }

        $related = Product::byCategorySlug($this->pdo, (string) $product['category'], 6);
        $related = array_values(array_filter($related, static fn ($row) => ($row['id'] ?? '') !== $id));

        $title = (string) $product['name'];
        require APP_ROOT . '/views/product_detail.php';
    }
}
