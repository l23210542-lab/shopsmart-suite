<?php
/**
 * Demo: respuestas de “IA vendedor” sin llamadas externas.
 * Coincidencia por palabras clave + plantillas; precio estable por entrada (crc32).
 */
declare(strict_types=1);

final class SellerAssistantSimulator
{
    /**
     * @return array{
     *   title: string,
     *   description: string,
     *   price: float,
     *   category_slug: string,
     *   category_label: string,
     *   scenario_key: string,
     *   scenario_label: string,
     * }
     */
    public static function simulate(PDO $pdo, string $rawInput): array
    {
        $n = self::lower(trim($rawInput));
        if ($n === '') {
            return self::fallback($pdo, $rawInput, 'empty', 'Vacío', 'Escribe una idea breve para generar sugerencias de demo.');
        }

        // Orden: reglas más específicas primero.
        if (self::match($n, ['zapato', 'zapatilla', 'calzado', 'sneaker', 'deportiv', 'running', 'tenis', 'air'])) {
            return self::withCategory(
                $pdo,
                'footwear_sport',
                'Calzado deportivo / urbano',
                'UrbanStride Air — edición negra',
                'Calzado versátil con amortiguación ligera, ideal para running y uso diario. Exterior resistente, plantilla transpirable y suela antideslizante. Combina con jeans o ropa deportiva; pensado para quienes priorizan confort y estilo urbano sin complicaciones.',
                189.99,
                'deportes',
            );
        }

        if (self::match($n, ['libro', 'novela', 'lectura', 'guía', 'manual'])) {
            return self::withCategory(
                $pdo,
                'books',
                'Libros',
                'Guía esencial — edición revisada 2026',
                'Formato claro con ejemplos prácticos, capítulos cortos y checklist al final de cada sección. Ideal para autodidactas y equipos pequeños. Incluye referencias actualizadas y recursos descargables (demo).',
                64.90,
                'libros',
            );
        }

        if (self::match($n, ['laptop', 'portátil', 'notebook', 'monitor', 'auricular', 'cargador', 'usb', 'tablet', 'smartphone', 'móvil', 'teléfono', 'electr'])) {
            return self::withCategory(
                $pdo,
                'electronics',
                'Electrónica',
                'NexHub ProDesk — kit productividad',
                'Conjunto pensado para teletrabajo: buena relación calidad-precio, compatibilidad amplia y diseño sobrio. Incluye recomendaciones de uso y garantía estándar (texto de demo). Revisa compatibilidad con tus dispositivos antes de publicar.',
                1299.00,
                'electronica',
            );
        }

        if (self::match($n, ['café', 'cafe', 'arroz', 'aceite', 'snack', 'super', 'comida', 'organic'])) {
            return self::withCategory(
                $pdo,
                'grocery',
                'Supermercado',
                'Selección premium — pack degustación',
                'Productos seleccionados para una experiencia de compra repetible: origen transparente, etiquetado claro y formato práctico para hogar. Texto orientado a SEO local y confianza (demo).',
                42.50,
                'supermercado',
            );
        }

        if (self::match($n, ['sartén', 'olla', 'cocina', 'horno', 'microondas', 'hogar', 'decor'])) {
            return self::withCategory(
                $pdo,
                'home',
                'Hogar y cocina',
                'Cocina práctica — línea hogar confort',
                'Diseño funcional para el día a día: fácil de limpiar, materiales pensados para durabilidad moderada y estética neutra. Encaja en cocinas compactas; descripción lista para afinar con tus medidas reales.',
                156.00,
                'hogar',
            );
        }

        if (self::match($n, ['camisa', 'pantalón', 'pantalon', 'vestido', 'moda', 'ropa', 'chaqueta'])) {
            return self::withCategory(
                $pdo,
                'fashion',
                'Moda',
                'Línea urbana — corte contemporáneo',
                'Prenda versátil para temporada media: tejido transpirable, costuras reforzadas y silueta actual. Sugerimos indicar tallas y composición exacta al publicar el producto real.',
                89.90,
                'moda',
            );
        }

        // Genérico: título a partir de la frase del usuario + precio pseudo-aleatorio estable.
        $snippet = self::len($rawInput) > 48 ? self::slice($rawInput, 0, 45) . '…' : $rawInput;
        $title = 'Propuesta: ' . self::titleCase($snippet);
        $hash = crc32($n);
        $price = 29.90 + ($hash % 17000) / 100; // 29.90 .. 199.89
        $price = round($price, 2);
        $slug = self::guessCategorySlug($n);
        $desc = 'Descripción sugerida (demo): resalta beneficios claros, materiales, tallas/medidas y política de envío. '
            . 'Tu idea original fue: «' . $snippet . '». Añade pruebas sociales (reseñas) y palabras clave naturales para mejorar conversión.';

        return self::withCategory($pdo, 'generic', 'Genérico', $title, $desc, $price, $slug);
    }

    private static function match(string $normalized, array $needles): bool
    {
        foreach ($needles as $w) {
            if (str_contains($normalized, self::lower($w))) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return array{title: string, description: string, price: float, category_slug: string, category_label: string, scenario_key: string, scenario_label: string}
     */
    private static function withCategory(
        PDO $pdo,
        string $scenarioKey,
        string $scenarioLabel,
        string $title,
        string $description,
        float $price,
        string $preferredSlug,
    ): array {
        [$slug, $label] = self::resolveCategory($pdo, $preferredSlug);

        return [
            'title' => $title,
            'description' => $description,
            'price' => $price,
            'category_slug' => $slug,
            'category_label' => $label,
            'scenario_key' => $scenarioKey,
            'scenario_label' => $scenarioLabel,
        ];
    }

    /**
     * @return array{0:string,1:string}
     */
    private static function resolveCategory(PDO $pdo, string $preferredSlug): array
    {
        $cats = Category::all($pdo);
        foreach ($cats as $c) {
            if ($c['slug'] === $preferredSlug) {
                return [$c['slug'], $c['name']];
            }
        }
        $first = $cats[0] ?? null;
        if ($first !== null) {
            return [$first['slug'], $first['name']];
        }

        return [$preferredSlug, $preferredSlug];
    }

    private static function guessCategorySlug(string $n): string
    {
        if (self::match($n, ['deporte', 'gym', 'yoga', 'fitness'])) {
            return 'deportes';
        }
        if (self::match($n, ['libro'])) {
            return 'libros';
        }
        if (self::match($n, ['cocina', 'hogar'])) {
            return 'hogar';
        }
        if (self::match($n, ['comida', 'café', 'cafe'])) {
            return 'supermercado';
        }
        if (self::match($n, ['usb', 'cable', 'pantalla'])) {
            return 'electronica';
        }

        return 'moda';
    }

    /**
     * @return array{title: string, description: string, price: float, category_slug: string, category_label: string, scenario_key: string, scenario_label: string}
     */
    private static function fallback(PDO $pdo, string $raw, string $key, string $label, string $msg): array
    {
        [$slug, $name] = self::resolveCategory($pdo, 'moda');

        return [
            'title' => '—',
            'description' => $msg,
            'price' => 0.0,
            'category_slug' => $slug,
            'category_label' => $name,
            'scenario_key' => $key,
            'scenario_label' => $label,
        ];
    }

    private static function titleCase(string $s): string
    {
        $s = trim($s);
        if ($s === '') {
            return 'Producto';
        }
        if (function_exists('mb_convert_case')) {
            return mb_convert_case($s, MB_CASE_TITLE, 'UTF-8');
        }

        return ucwords(self::lower($s));
    }

    private static function lower(string $s): string
    {
        return function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s);
    }

    private static function len(string $s): int
    {
        return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
    }

    private static function slice(string $s, int $start, int $length): string
    {
        return function_exists('mb_substr') ? mb_substr($s, $start, $length, 'UTF-8') : substr($s, $start, $length);
    }
}
