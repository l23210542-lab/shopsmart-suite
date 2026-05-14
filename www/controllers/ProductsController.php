<?php
/**
 * Listado de productos (filtros GET q, cat).
 */
declare(strict_types=1);

final class ProductsController
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function index(): void
    {
        $q = isset($_GET['q']) ? trim((string) $_GET['q']) : null;
        $cat = isset($_GET['cat']) ? trim((string) $_GET['cat']) : null;
        if ($q === '') {
            $q = null;
        }
        if ($cat === '') {
            $cat = null;
        }

        $categories = Category::all($this->pdo);
        $products = Product::search($this->pdo, $q, $cat, 200);

        require APP_ROOT . '/views/products_list.php';
    }
}
