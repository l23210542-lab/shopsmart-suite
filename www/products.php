<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    (new ProductsController(db()))->index();
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error al cargar productos.';
}
