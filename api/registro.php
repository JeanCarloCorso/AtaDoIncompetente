<?php
require '../db/config.php';
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $senha = $data['senha'] ?? '';

    if (!$email || !$senha) {
        http_response_code(400);
        echo json_encode(["sucesso" => false, "erro" => "Campos obrigatórios."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["sucesso" => false, "erro" => "E-mail inválido."]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["sucesso" => false, "erro" => "Usuário já existe."]);
        exit;
    }

    $hash = password_hash($senha, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (email, senha) VALUES (?, ?)");
    $ok = $stmt->execute([$email, $hash]);

    if ($ok) {
        http_response_code(201);
        echo json_encode(["sucesso" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["sucesso" => false, "erro" => "Erro ao registrar."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "erro" => "Erro inesperado."]);
}
