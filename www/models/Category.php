<?php
/**
 * Categorías (tabla `categories` en db/schema.sql).
 */
declare(strict_types=1);

final class Category
{
    /**
     * @return list<array{slug:string,name:string}>
     */
    public static function all(PDO $pdo): array
    {
        $sql = 'SELECT slug, name FROM categories ORDER BY name ASC';
        $st = $pdo->query($sql);
        if ($st === false) {
            return [];
        }
        /** @var list<array{slug:string,name:string}> */
        return $st->fetchAll();
    }
}
