<?php
require_once '../vendor/autoload.php';
require_once '../auth.php';
require_once '../db/config.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

header('Content-Type: application/json');

// Autenticação
$id_usuario = verificar_token();
if (!$id_usuario) {
    http_response_code(401);
    echo json_encode(["erro" => "Token inválido"]);
    exit;
}

// Buscar recaídas
$stmt = $pdo->prepare("SELECT id, data, descricao, quantidade, tempo FROM recaidas WHERE id_usuario = ? ORDER BY data ASC");
$stmt->execute([$id_usuario]);
$recaidas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Buscar quase recaídas
$stmt = $pdo->prepare("SELECT data, hora, texto FROM quase_recaidas WHERE id_usuario = ? ORDER BY data ASC");
$stmt->execute([$id_usuario]);
$quase_recaidas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Agrupar eventos
$eventos = [];

foreach ($recaidas as $r) {
    $data = substr($r['data'], 0, 10);
    $hora = substr($r['data'], 11, 5);
    $eventos[$data][] = [
        'id' => $r['id'],
        'tipo' => 'recaida',
        'data' => $r['data'],
        'hora' => $hora,
        'descricao' => $r['descricao'],
        'quantidade' => $r['quantidade'],
        'tempo' => $r['tempo']
    ];
}

foreach ($quase_recaidas as $q) {
    $data = $q['data'];
    $hora = $q['hora'] ? substr($q['hora'], 0, 5) : '';
    $eventos[$data][] = [
        'tipo' => 'quase_recaida',
        'data' => $data,
        'hora' => $hora,
        'texto' => $q['texto']
    ];
}

// Calcular estatísticas
$datas_recaidas = array_unique(array_map(fn($r) => substr($r['data'], 0, 10), $recaidas));
sort($datas_recaidas);

$hoje = new DateTime();
$dias_sem_recaida = 0;
$recorde = 0;

// Calcular recorde entre recaídas
$ult_data = null;
foreach ($datas_recaidas as $data) {
    $data_atual = new DateTime($data);
    if ($ult_data) {
        $dias = $ult_data->diff($data_atual)->days;
        if ($dias > $recorde) {
            $recorde = $dias;
        }
    }
    $ult_data = $data_atual;
}

// Dias desde a última recaída
if (!empty($datas_recaidas)) {
    $ultima_recaida = new DateTime(end($datas_recaidas));
    $dias_sem_recaida = $ultima_recaida->diff($hoje)->days;
    if ($dias_sem_recaida > $recorde) $recorde = $dias_sem_recaida;
}

// Somar tempo perdido
$total_minutos = 0;
foreach ($recaidas as $r) {
    if ($r['tempo']) {
        $partes = explode(':', $r['tempo']);
        if (count($partes) >= 2) {
            $horas = (int)$partes[0];
            $minutos = (int)$partes[1];
            $total_minutos += ($horas * 60) + $minutos;
        }
    }
}

$horas_total = floor($total_minutos / 60);
$minutos_restantes = $total_minutos % 60;

$tempo_formatado = sprintf("%02dh %02dmin", $horas_total, $minutos_restantes);

echo json_encode([
    'estatisticas' => [
        'dias_sem_recaida' => $dias_sem_recaida,
        'recorde' => $recorde,
        'dias_para_bater_recorde' => max(0, $recorde - $dias_sem_recaida),
        'tempo_total_perdido' => $tempo_formatado
    ],
    'eventos' => $eventos
]);
