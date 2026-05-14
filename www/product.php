<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '') {
    header('Location: products.php');
    exit;
}

try {
    (new ProductDetailController(db()))->show($id);
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Error al cargar el producto.';
}
