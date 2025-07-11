-- Kullanıcılar tablosu
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Kullanıcı ID
    username VARCHAR(50) NOT NULL UNIQUE, -- Kullanıcı adı
    email VARCHAR(100) NOT NULL UNIQUE, -- E-posta
    password VARCHAR(255) NOT NULL, -- Şifre (hashlenmiş)
    avatar VARCHAR(255), -- Profil fotoğrafı yolu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Kayıt tarihi
);

-- Gönderiler tablosu
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Gönderi ID
    user_id INT NOT NULL, -- Gönderiyi paylaşan kullanıcı
    content TEXT NOT NULL, -- Gönderi içeriği
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Paylaşım tarihi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projeler tablosu
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Proje ID
    user_id INT NOT NULL, -- Projeyi paylaşan kullanıcı
    title VARCHAR(100) NOT NULL, -- Proje başlığı
    description TEXT, -- Proje açıklaması
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Paylaşım tarihi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Takipler tablosu
CREATE TABLE follows (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Takip ID
    follower_id INT NOT NULL, -- Takip eden kullanıcı
    following_id INT NOT NULL, -- Takip edilen kullanıcı
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Takip tarihi
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id) -- Aynı kişiyi iki kez takip edemesin
);


