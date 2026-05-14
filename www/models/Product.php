<?php
/**
 * Productos (tabla `products` en db/schema.sql).
 * Columnas: id, name, description, price, stock, image_url, category_slug, seller_name, rating, review_count
 */
declare(strict_types=1);

final class Product
{
    /**
     * @return list<array<string,mixed>>
     */
    public static function byCategorySlug(PDO $pdo, string $slug, int $limit = 24): array
    {
        $sql = 'SELECT id, name, description, price, stock, image_url AS image, category_slug AS category,
                       seller_name AS seller, rating, review_count AS reviews
                FROM products
                WHERE category_slug = :slug
                ORDER BY name ASC
                LIMIT ' . max(1, min(100, $limit));

        $st = $pdo->prepare($sql);
        $st->execute(['slug' => $slug]);
        return $st->fetchAll();
    }

    /**
     * @return list<array<string,mixed>>
     */
    public static function featured(PDO $pdo, int $limit = 12): array
    {
        $lim = max(1, min(100, $limit));
        $sql = "SELECT id, name, description, price, stock, image_url AS image, category_slug AS category,
                       seller_name AS seller, rating, review_count AS reviews
                FROM products
                ORDER BY created_at DESC
                LIMIT {$lim}";

        $st = $pdo->query($sql);
        if ($st === false) {
            return [];
        }
        return $st->fetchAll();
    }

    /**
     * @return array<string,mixed>|null
     */
    public static function findById(PDO $pdo, string $id): ?array
    {
        $st = $pdo->prepare(
            'SELECT id, name, description, price, stock, image_url AS image, category_slug AS category,
                    seller_name AS seller, rating, review_count AS reviews
             FROM products WHERE id = :id LIMIT 1',
        );
        $st->execute(['id' => $id]);
        $row = $st->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Listado con filtros opcionales (búsqueda por nombre/descripcion, categoría).
     *
     * @return list<array<string,mixed>>
     */
    public static function search(PDO $pdo, ?string $q, ?string $cat, int $limit = 120): array
    {
        $lim = max(1, min(500, $limit));
        $sql = 'SELECT id, name, description, price, stock, image_url AS image, category_slug AS category,
                       seller_name AS seller, rating, review_count AS reviews
                FROM products WHERE 1=1';
        $params = [];
        if ($cat !== null && $cat !== '') {
            $sql .= ' AND category_slug = :cat';
            $params['cat'] = $cat;
        }
        if ($q !== null && $q !== '') {
            $sql .= ' AND (name LIKE :q OR description LIKE :q2)';
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $q) . '%';
            $params['q'] = $like;
            $params['q2'] = $like;
        }
        $sql .= ' ORDER BY name ASC LIMIT ' . $lim;
        $st = $pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    }

    /**
     * Primer producto de una categoría (imagen en tarjetas rápidas).
     *
     * @return array<string,mixed>|null
     */
    public static function firstInCategory(PDO $pdo, string $slug): ?array
    {
        $rows = self::byCategorySlug($pdo, $slug, 1);
        return $rows[0] ?? null;
    }
}
