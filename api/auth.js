const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("../supabase-config");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  try {
    switch (action) {
      case "register":
        await handleRegister(req, res);
        break;
      case "login":
        await handleLogin(req, res);
        break;
      default:
        res.status(400).json({ error: "Geçersiz istek." });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + error.message });
  }
};

async function handleRegister(req, res) {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Geçersiz e-posta adresi." });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Insert user profile data
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        username,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          username
        )}&background=7f1fff&color=fff`,
      },
    ]);

    if (profileError) {
      return res
        .status(500)
        .json({ error: "Profil oluşturulurken hata oluştu." });
    }

    res.json({ success: "Kayıt başarılı!" });
  } catch (error) {
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
  }
}

async function handleLogin(req, res) {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur." });
  }

  try {
    // Try to sign in with email
    let { data, error } = await supabase.auth.signInWithPassword({
      email: usernameOrEmail,
      password,
    });

    if (error) {
      // If email login fails, try with username
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("username", usernameOrEmail)
        .single();

      if (!userData) {
        return res.status(400).json({ error: "Kullanıcı bulunamadı." });
      }

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: userData.email,
          password,
        });

      if (loginError) {
        return res.status(400).json({ error: "Şifre yanlış." });
      }

      data = loginData;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({
      success: "Giriş başarılı!",
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        created_at: profile.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu." });
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
