// Supabase client ve auth fonksiyonlarını içe aktar
const { auth } = window.GrowhubSupabase;

// Kayıt formu işlemleri
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const { data, error } = await auth.signUp(email, password, username);
  const resultDiv = document.getElementById("register-result");
  if (error) {
    resultDiv.innerText = error.message;
    return;
  }
  resultDiv.innerText = "Kayıt başarılı! Lütfen e-postanı kontrol et.";
  // Kayıttan sonra otomatik giriş yapılmaz, kullanıcı e-posta doğrulaması yapmalı
});

// Giriş formu işlemleri
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const usernameOrEmail = document.getElementById(
    "login-usernameOrEmail"
  ).value;
  const password = document.getElementById("login-password").value;

  // Sadece e-posta ile giriş destekleniyor
  const { data, error } = await auth.signIn(usernameOrEmail, password);
  const resultDiv = document.getElementById("login-result");
  if (error) {
    resultDiv.innerText = error.message;
    return;
  }
  // Kullanıcı bilgilerini localStorage'a kaydet (isteğe bağlı)
  localStorage.setItem("growhub_user", JSON.stringify(data.user));
  // Ana sayfaya yönlendir
  window.location.href = "dashboard.html";
});
