<?php
/**
 * Login con sesión PHP + comprobación de contraseña (password_hash en BD).
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = (string) ($_POST['email'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    try {
        $result = User::attemptLogin(db(), $email, $password);
        if ($result['ok']) {
            header('Location: index.php');
            exit;
        }
        $error = $result['message'];
    } catch (Throwable $e) {
        $error = 'Error del servidor. Revisa la configuración de MariaDB.';
    }
}

$title = 'Iniciar sesión';
require APP_ROOT . '/views/login.php';
