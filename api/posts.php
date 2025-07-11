<?php
// posts.php - Gönderi ekleme ve listeleme API'si
// Bu dosyada: Gönderi ekleme (add), gönderi listeleme (list) işlemleri olacak

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
        // Gönderi ekleme işlemi
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = intval($data['user_id'] ?? 0);
        $content = trim($data['content'] ?? '');

        if (!$user_id || !$content) {
            echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
            exit;
        }

        $stmt = $pdo->prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)');
        $success = $stmt->execute([$user_id, $content]);

        if ($success) {
            echo json_encode(['success' => 'Gönderi başarıyla eklendi!']);
        } else {
            echo json_encode(['error' => 'Gönderi eklenirken hata oluştu.']);
        }
        exit;
    case 'list':
        // Gönderi listeleme işlemi (isteğe bağlı user_id ile filtrelenebilir)
        $user_id = intval($_GET['user_id'] ?? 0);
        if ($user_id) {
            $stmt = $pdo->prepare('SELECT posts.*, users.username, users.avatar FROM posts JOIN users ON posts.user_id = users.id WHERE user_id = ? ORDER BY posts.created_at DESC');
            $stmt->execute([$user_id]);
        } else {
            $stmt = $pdo->query('SELECT posts.*, users.username, users.avatar FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC');
        }
        $posts = $stmt->fetchAll();
        echo json_encode(['posts' => $posts]);
        exit;
    default:
        echo json_encode(['error' => 'Geçersiz istek.']);
        break;
}

