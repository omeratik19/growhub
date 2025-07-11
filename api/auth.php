<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    case 'register':
        // Kullanıcıdan gelen verileri al
        $data = json_decode(file_get_contents('php://input'), true);
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Temel kontroller
        if (!$username || !$email || !$password) {
            echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
            exit;
        }

        // E-posta format kontrolü
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['error' => 'Geçersiz e-posta adresi.']);
            exit;
        }

        // Kullanıcı adı veya e-posta daha önce alınmış mı?
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'Kullanıcı adı veya e-posta zaten kullanılıyor.']);
            exit;
        }

        // Şifreyi güvenli şekilde hashle
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Kullanıcıyı ekle
        $stmt = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        $success = $stmt->execute([$username, $email, $passwordHash]);

        if ($success) {
            echo json_encode(['success' => 'Kayıt başarılı!']);
        } else {
            echo json_encode(['error' => 'Kayıt sırasında bir hata oluştu.']);
        }
        exit;
    case 'login':
        // Kullanıcıdan gelen verileri al
        $data = json_decode(file_get_contents('php://input'), true);
        $usernameOrEmail = trim($data['usernameOrEmail'] ?? '');
        $password = $data['password'] ?? '';

        // Temel kontroller
        if (!$usernameOrEmail || !$password) {
            echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
            exit;
        }

        // Kullanıcıyı bul (kullanıcı adı veya e-posta ile)
        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$usernameOrEmail, $usernameOrEmail]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['error' => 'Kullanıcı bulunamadı.']);
            exit;
        }

        // Şifreyi kontrol et
        if (!password_verify($password, $user['password'])) {
            echo json_encode(['error' => 'Şifre yanlış.']);
            exit;
        }

        // Giriş başarılı, kullanıcı bilgilerini döndür (şifre hariç)
        unset($user['password']);
        echo json_encode(['success' => 'Giriş başarılı!', 'user' => $user]);
        exit;
    default:
        echo json_encode(['error' => 'Geçersiz istek.']);
        exit;
}
