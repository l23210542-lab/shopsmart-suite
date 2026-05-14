<?php
/**
 * Usuario para login (tabla `users` en db/schema.sql).
 */
declare(strict_types=1);

final class User
{
    /**
     * @return array<string,mixed>|null
     */
    public static function findByEmail(PDO $pdo, string $email): ?array
    {
        $st = $pdo->prepare(
            'SELECT id, email, name, role, password_hash FROM users WHERE email = :email LIMIT 1',
        );
        $st->execute(['email' => strtolower(trim($email))]);
        $row = $st->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Intenta login: establece $_SESSION['user'] si credenciales OK.
     *
     * @return array{ok:bool,message:string}
     */
    public static function attemptLogin(PDO $pdo, string $email, string $password): array
    {
        $user = self::findByEmail($pdo, $email);
        if ($user === null) {
            return ['ok' => false, 'message' => 'Credenciales incorrectas.'];
        }

        $hash = $user['password_hash'] ?? null;
        if (!is_string($hash) || $hash === '') {
            return ['ok' => false, 'message' => 'Cuenta sin contraseña configurada.'];
        }

        if (!password_verify($password, $hash)) {
            return ['ok' => false, 'message' => 'Credenciales incorrectas.'];
        }

        $_SESSION['user'] = [
            'id' => (int) $user['id'],
            'email' => (string) $user['email'],
            'name' => (string) $user['name'],
            'role' => (string) $user['role'],
        ];

        return ['ok' => true, 'message' => 'Bienvenido.'];
    }

    public static function logout(): void
    {
        $_SESSION['user'] = null;
        unset($_SESSION['user']);
    }

    /**
     * @return array{id:int,email:string,name:string,role:string}|null
     */
    public static function current(): ?array
    {
        $u = $_SESSION['user'] ?? null;
        if (!is_array($u) || !isset($u['id'], $u['email'], $u['name'], $u['role'])) {
            return null;
        }
        return [
            'id' => (int) $u['id'],
            'email' => (string) $u['email'],
            'name' => (string) $u['name'],
            'role' => (string) $u['role'],
        ];
    }
}
