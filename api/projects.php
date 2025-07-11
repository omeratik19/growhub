<?php
// projects.php - Proje ekleme ve listeleme API'si
// Bu dosyada: Proje ekleme (add), proje listeleme (list) işlemleri olacak

// Veritabanı bağlantısı
$host = 'localhost';
$db   = 'growhub';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage()]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add':
        // Proje ekleme işlemi
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = intval($data['user_id'] ?? 0);
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');

        if (!$user_id || !$title) {
            echo json_encode(['error' => 'Kullanıcı ve başlık zorunludur.']);
            exit;
        }

        $stmt = $pdo->prepare('INSERT INTO projects (user_id, title, description) VALUES (?, ?, ?)');
        $success = $stmt->execute([$user_id, $title, $description]);

        if ($success) {
            echo json_encode(['success' => 'Proje başarıyla eklendi!']);
        } else {
            echo json_encode(['error' => 'Proje eklenirken hata oluştu.']);
        }
        exit;
    case 'list':
        // Proje listeleme işlemi (isteğe bağlı user_id ile filtrelenebilir)
        $user_id = intval($_GET['user_id'] ?? 0);
        if ($user_id) {
            $stmt = $pdo->prepare('SELECT projects.*, users.username, users.avatar FROM projects JOIN users ON projects.user_id = users.id WHERE user_id = ? ORDER BY projects.created_at DESC');
            $stmt->execute([$user_id]);
        } else {
            $stmt = $pdo->query('SELECT projects.*, users.username, users.avatar FROM projects JOIN users ON projects.user_id = users.id ORDER BY projects.created_at DESC');
        }
        $projects = $stmt->fetchAll();
        echo json_encode(['projects' => $projects]);
        exit;
    default:
        echo json_encode(['error' => 'Geçersiz istek.']);
        break;
}

