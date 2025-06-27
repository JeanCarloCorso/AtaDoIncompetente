<?php
require_once '../auth.php';
require_once '../db/config.php';
header('Content-Type: application/json');

$id_usuario = verificar_token();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['tipo'], $data['data'], $data['id'])) {
    echo json_encode(["success" => false, "erro" => "Dados incompletos"]);
    exit;
}

$tipo = $data['tipo'];
$id = $data['id'];

try {
    if ($tipo === 'recaida') {
        $stmt = $pdo->prepare("UPDATE recaidas SET data = ?, descricao = ?, quantidade = ?, tempo = ? WHERE id = ? AND id_usuario = ?");
        $stmt->execute([
            $data['data'], $data['descricao'], $data['quantidade'], $data['tempo'], $id, $id_usuario
        ]);
    } elseif ($tipo === 'quase') {
        $stmt = $pdo->prepare("UPDATE quase_recaidas SET data = ?, hora = ?, texto = ? WHERE id = ? AND id_usuario = ?");
        $hora = substr($data['data'], 11, 5) ?? null;
        $stmt->execute([
            substr($data['data'], 0, 10), $hora, $data['texto'], $id, $id_usuario
        ]);
    } else {
        throw new Exception("Tipo inválido.");
    }

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "erro" => $e->getMessage()]);
}
