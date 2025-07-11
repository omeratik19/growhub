<?php
// profile.php - Kullanıcı profil bilgisi, takipçi/takip edilen ve takip durumu API
header('Content-Type: application/json; charset=utf-8');

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

$user_id = intval($_GET['user_id'] ?? 0);
if (!$user_id) {
    echo json_encode(['error' => 'Geçersiz kullanıcı.']);
    exit;
}

// Kullanıcı bilgisi
$stmt = $pdo->prepare('SELECT id, username, email, avatar, bio FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();
if (!$user) {
    echo json_encode(['error' => 'Kullanıcı bulunamadı.']);
    exit;
}

// Takipçi sayısı
$stmt = $pdo->prepare('SELECT COUNT(*) FROM follows WHERE following_id = ?');
$stmt->execute([$user_id]);
$followers = $stmt->fetchColumn();

// Takip edilen sayısı
$stmt = $pdo->prepare('SELECT COUNT(*) FROM follows WHERE follower_id = ?');
$stmt->execute([$user_id]);
$following = $stmt->fetchColumn();

// Giriş yapan kullanıcı kim? (localStorage'dan alınan id ile fetch yapılabilir, şimdilik yok sayıyoruz)
$is_following = false;
if (isset($_GET['current_id'])) {
    $current_id = intval($_GET['current_id']);
    if ($current_id && $current_id !== $user_id) {
        $stmt = $pdo->prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?');
        $stmt->execute([$current_id, $user_id]);
        $is_following = $stmt->fetch() ? true : false;
    }
}

echo json_encode([
    'user' => $user,
    'followers' => intval($followers),
    'following' => intval($following),
    'is_following' => $is_following
]); 