<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function gerar_token($id, $email) {
    $payload = [
        'sub' => $id,
        'email' => $email,
        'exp' => time() + ($_ENV['ACCESS_TOKEN_EXPIRE_MINUTES'] * 60)
    ];
    return JWT::encode($payload, $_ENV['SECRET_KEY'], 'HS256');
}

function verificar_token() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Token não enviado']));
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    try {
        $decoded = JWT::decode($token, new Key($_ENV['SECRET_KEY'], 'HS256'));
        return $decoded->sub;
    } catch (Exception $e) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Token inválido: ' . $e->getMessage()]));
    }
}
?>