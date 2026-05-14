<?php
/**
 * Ajustes globales. En producción usa variables de entorno de Apache
 * (SetEnv) o un archivo .env cargado fuera del repositorio.
 */
declare(strict_types=1);

// Nombre comercial (antes Cenít Pi en el front React)
define('APP_NAME', getenv('APP_NAME') ?: 'Cenít Pi');

// Base URL pública (sin barra final) — útil para redirects y assets
define('BASE_URL', rtrim((string) (getenv('BASE_URL') ?: ''), '/') ?: '');

/**
 * Escape HTML (evita XSS en salidas PHP).
 */
function e(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
