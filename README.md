# 🌱 Growhub - Modern Developer Portfolio Platform

Growhub, geliştiricilerin projelerini paylaşabileceği, birbirlerini takip edebileceği ve portföylerini sergileyebileceği modern bir platform.

## 🚀 Özellikler

- **🔐 Modern Authentication** - Supabase Auth ile güvenli giriş/kayıt
- **📱 Responsive Design** - Tüm cihazlarda mükemmel görünüm
- **🎨 Modern UI/UX** - Neon mor ve beyaz ağırlıklı modern tasarım
- **📊 Dinamik Dashboard** - Gerçek zamanlı proje ve gönderi paylaşımı
- **👥 Sosyal Özellikler** - Kullanıcı takip sistemi
- **🖼️ Görsel Yükleme** - Proje görselleri için Supabase Storage
- **⚡ Hızlı Performans** - Vercel CDN ile optimize edilmiş

## 🛠️ Teknoloji Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - ES6+ features
- **Supabase Client** - Real-time database operations

### Backend

- **Vercel Functions** - Serverless API endpoints
- **Supabase** - PostgreSQL database + Auth + Storage
- **Node.js** - Runtime environment

### Deployment

- **Vercel** - Hosting & CDN
- **Supabase** - Database & Authentication

## 📦 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/growhub.git
cd growhub
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Kurulumu

#### 3.1 Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Proje URL ve API anahtarını not edin

#### 3.2 Veritabanı Şemasını Kurun

1. Supabase Dashboard'da SQL Editor'ü açın
2. `supabase-schema.sql` dosyasındaki SQL'i çalıştırın

#### 3.3 Storage Bucket Oluşturun

```sql
-- Project images için storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
```

### 4. Environment Variables

#### 4.1 Supabase Config

`supabase-config.js` dosyasını güncelleyin:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

#### 4.2 Frontend Config

`js/supabase-client.js` dosyasını güncelleyin:

```javascript
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
```

### 5. Vercel Deployment

#### 5.1 Vercel CLI Kurulumu

```bash
npm install -g vercel
```

#### 5.2 Environment Variables (Vercel)

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

#### 5.3 Deploy

```bash
vercel --prod
```

## 🏗️ Proje Yapısı

```
growhub/
├── api/                    # Vercel Functions
│   ├── auth.js            # Authentication API
│   ├── projects.js        # Projects API
│   ├── posts.js           # Posts API
│   └── profile.js         # Profile API
├── css/                   # Stylesheets
│   ├── dashboard.css      # Dashboard styles
│   └── auth.css          # Auth pages styles
├── js/                    # JavaScript files
│   ├── auth.js           # Auth logic
│   ├── dashboard.js      # Dashboard logic
│   └── supabase-client.js # Supabase client
├── uploads/               # File uploads (legacy)
├── index.html            # Login/Register page
├── dashboard.html        # Main dashboard
├── profile.html          # User profile page
├── package.json          # Dependencies
├── vercel.json           # Vercel config
├── supabase-config.js    # Supabase config
├── supabase-schema.sql   # Database schema
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth?action=register` - Kullanıcı kaydı
- `POST /api/auth?action=login` - Kullanıcı girişi

### Projects

- `POST /api/projects?action=add` - Proje ekleme
- `GET /api/projects?action=list` - Proje listesi
- `GET /api/projects?action=list&user_id=UUID` - Kullanıcı projeleri

### Posts

- `POST /api/posts?action=add` - Gönderi ekleme
- `GET /api/posts?action=list` - Gönderi listesi

### Profile

- `GET /api/profile?action=get&user_id=UUID` - Kullanıcı profili
- `POST /api/profile?action=follow` - Kullanıcı takip etme
- `POST /api/profile?action=unfollow` - Takibi bırakma

## 🎨 Tasarım Sistemi

### Renkler

- **Primary**: `#7f1fff` (Neon Mor)
- **Secondary**: `#ffffff` (Beyaz)
- **Background**: `#0a0a0a` (Koyu)
- **Surface**: `#1a1a1a` (Orta Koyu)

### Typography

- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Headings**: Bold weights
- **Body**: Regular weights

### Components

- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Modals**: Backdrop blur, smooth animations

## 🚀 Performance Optimizations

- **CDN**: Vercel Edge Network
- **Images**: Optimized loading with lazy loading
- **Database**: Indexed queries, efficient joins
- **Caching**: Browser caching, API response caching

## 🔒 Güvenlik

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **Input Validation**: Server-side validation
- **CORS**: Properly configured for production
- **HTTPS**: Automatic SSL certificates

## 📱 Responsive Design

- **Mobile First**: 320px+ breakpoints
- **Tablet**: 768px+ breakpoints
- **Desktop**: 1024px+ breakpoints
- **Large Screens**: 1440px+ breakpoints

## 🔄 Real-time Features

- **Live Updates**: Supabase real-time subscriptions
- **Instant Feedback**: Optimistic UI updates
- **Offline Support**: Service worker caching

## 🧪 Testing

```bash
# Unit tests (future)
npm test

# E2E tests (future)
npm run test:e2e
```

## 📈 Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Analytics**: Database query performance
- **Custom Events**: User interaction tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service
- **Vercel** for the seamless deployment experience
- **UI Avatars** for the beautiful avatar generation
- **Community** for feedback and contributions

## 📞 Support

- **Email**: support@growhub.com
- **Discord**: [Growhub Community](https://discord.gg/growhub)
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/growhub/issues)

---

**Made with ❤️ by the Growhub Team**
