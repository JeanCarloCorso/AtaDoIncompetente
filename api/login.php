<?php
require_once '../db/config.php';
require_once '../auth.php';

use Firebase\JWT\JWT;

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$senha = $input['senha'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($senha, $user['senha'])) {
    $token = gerar_token($user['id'], $user['email']);
    echo json_encode(['token' => $token]);
} else {
    http_response_code(401);
    echo json_encode(['erro' => 'Credenciais inválidas']);
}
?>