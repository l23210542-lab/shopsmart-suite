<?php
/**
 * Página de inicio — migración completa desde React src/routes/index.tsx
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $controller = new HomeController(db());
    $controller->index();
} catch (Throwable $e) {
    http_response_code(500);
    echo '<!DOCTYPE html><html><body><h1>Error</h1><p>No se pudo conectar a la base de datos o falló la consulta.</p>';
    echo '<p><small>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</small></p></body></html>';
}
