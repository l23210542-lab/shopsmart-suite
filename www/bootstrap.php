<?php
/**
 * Arranque único: constantes, sesión, autocarga de clases MVC.
 * Todas las páginas .php deben hacer: require_once __DIR__ . '/bootstrap.php';
 */
declare(strict_types=1);

// Raíz lógica de la app PHP (carpeta www/)
define('APP_ROOT', __DIR__);

// Config (constantes DB, nombre app…)
require_once APP_ROOT . '/config/app.php';

// Conexión PDO (MariaDB)
require_once APP_ROOT . '/config/db.php';

// Sesión HTTP para auth (login/register/dashboard)
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
}

/**
 * Autocarga simple: models/Foo.php → class Foo, controllers/BarController.php → class BarController
 */
spl_autoload_register(static function (string $class): void {
    $paths = [
        APP_ROOT . '/models/' . $class . '.php',
        APP_ROOT . '/controllers/' . $class . '.php',
    ];
    foreach ($paths as $path) {
        if (is_file($path)) {
            require_once $path;
            return;
        }
    }
});
