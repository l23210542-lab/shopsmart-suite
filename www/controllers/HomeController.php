<?php
/**
 * Página de inicio — equivalente a src/routes/index.tsx (hero, categorías, confianza, carruseles).
 */
declare(strict_types=1);

final class HomeController
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function index(): void
    {
        $categories = Category::all($this->pdo);

        /** @var array<string, list<array<string,mixed>>> $productsByCategory */
        $productsByCategory = [];
        foreach ($categories as $cat) {
            $slug = $cat['slug'];
            $productsByCategory[$slug] = Product::byCategorySlug($this->pdo, $slug, 12);
        }

        $featured = Product::featured($this->pdo, 12);

        /** Muestra 4 primeras categorías con imagen de muestra */
        $quickCategories = array_slice($categories, 0, 4);
        $quickSamples = [];
        foreach ($quickCategories as $c) {
            $quickSamples[$c['slug']] = Product::firstInCategory($this->pdo, $c['slug']);
        }

        require APP_ROOT . '/views/home.php';
    }
}
