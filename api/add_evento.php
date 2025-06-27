<?php
require_once '../db/config.php';
require_once '../auth.php';

$id_usuario = verificar_token();
$data = json_decode(file_get_contents('php://input'), true);

$tipo = $data['tipo'];

if ($tipo === 'recaida') {
    $stmt = $pdo->prepare("INSERT INTO recaidas (id_usuario, data, descricao, quantidade, tempo) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id_usuario, $data['data'], $data['descricao'], $data['quantidade'], $data['tempo']]);
} elseif ($tipo === 'quase') {
    $datetime = new DateTime($data['data']);
    $data_only = $datetime->format('Y-m-d');
    $hora_only = $datetime->format('H:i:s');
    $stmt = $pdo->prepare("INSERT INTO quase_recaidas (id_usuario, data, hora, texto) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id_usuario, $data_only, $hora_only, $data['texto']]);
}

echo json_encode(['status' => 'ok']);
?>