// Kayıt formu işlemleri
const registerForm = document.getElementById("register-form");
registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch("api/auth.php?action=register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const result = await response.json();
  document.getElementById("register-result").innerText =
    result.success || result.error;
  if (result.success) {
    // Kayıt başarılıysa otomatik giriş yap
    const loginResponse = await fetch("api/auth.php?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: email, password }),
    });
    const loginResult = await loginResponse.json();
    if (loginResult.success) {
      localStorage.setItem("growhub_user", JSON.stringify(loginResult.user));
      window.location.href = "dashboard.html";
    }
  }
});

// Giriş formu işlemleri
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const usernameOrEmail = document.getElementById(
    "login-usernameOrEmail"
  ).value;
  const password = document.getElementById("login-password").value;

  const response = await fetch("api/auth.php?action=login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  const result = await response.json();
  if (result.success) {
    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem("growhub_user", JSON.stringify(result.user));
    // Ana sayfaya yönlendir
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("login-result").innerText = result.error;
  }
});
