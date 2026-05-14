<?php
/**
 * Asistente IA vendedor (demo con respuestas simuladas).
 * Acceso: rol seller o admin.
 */
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$user = User::current();
if ($user === null || $user['role'] === 'customer') {
    header('Location: login.php');
    exit;
}

$pdo = db();
$prompt = '';
/** @var array<string,mixed>|null $ai */
$ai = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $prompt = trim((string) ($_POST['prompt'] ?? ''));
    $ai = SellerAssistantSimulator::simulate($pdo, $prompt);
}

$title = 'Asistente IA vendedor';
require APP_ROOT . '/views/seller_ai_assistant.php';
