// Giriş kontrolü
const currentUser = JSON.parse(localStorage.getItem("growhub_user"));
if (!currentUser) {
  window.location.href = "index.html";
}

// URL'den user_id al (ör: profile.html?user_id=2)
const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get("user_id") || currentUser.id;

// Profil bilgilerini yükle
async function loadProfile() {
  // Kullanıcı bilgisi
  const res = await fetch(`api/profile.php?user_id=${profileUserId}`);
  const data = await res.json();
  if (data.error) {
    document.getElementById(
      "profile-container"
    ).innerHTML = `<div class='loader'>${data.error}</div>`;
    return;
  }
  const user = data.user;
  document.getElementById("profile-avatar").src =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
  document.getElementById("profile-username").textContent = user.username;
  document.getElementById("profile-bio").textContent = user.bio || "";
  document.getElementById(
    "profile-followers"
  ).textContent = `${data.followers} Takipçi`;
  document.getElementById(
    "profile-following"
  ).textContent = `${data.following} Takip`;

  // Kendi profilin mi?
  if (currentUser.id == user.id) {
    document.getElementById("edit-profile").style.display = "";
    document.getElementById("follow-btn").style.display = "none";
  } else {
    document.getElementById("edit-profile").style.display = "none";
    document.getElementById("follow-btn").style.display = "";
    document.getElementById("follow-btn").textContent = data.is_following
      ? "Takipten Çık"
      : "Takip Et";
  }
}

// Sekmeler
const tabs = document.querySelectorAll("#profile-tabs .tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    tabs.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    loadProfileContent(this.dataset.tab);
  });
});

// İçerik yükle (projeler/gönderiler)
async function loadProfileContent(tab = "projects") {
  document.getElementById("profile-content").innerHTML =
    '<div class="loader">İçerik yükleniyor...</div>';
  let items = [];
  if (tab === "projects") {
    const res = await fetch(
      `api/projects.php?action=list&user_id=${profileUserId}`
    );
    const data = await res.json();
    items = data.projects || [];
    if (items.length === 0) {
      document.getElementById("profile-content").innerHTML =
        "<i>Henüz proje yok.</i>";
      return;
    }
    document.getElementById("profile-content").innerHTML = items
      .map(
        (project) => `
            <div class="project-item">
                <div class="project-title">${project.title}</div>
                <div class="project-desc">${project.description || ""}</div>
                <div class="project-date">${project.created_at}</div>
            </div>
        `
      )
      .join("");
  } else {
    const res = await fetch(
      `api/posts.php?action=list&user_id=${profileUserId}`
    );
    const data = await res.json();
    items = data.posts || [];
    if (items.length === 0) {
      document.getElementById("profile-content").innerHTML =
        "<i>Henüz gönderi yok.</i>";
      return;
    }
    document.getElementById("profile-content").innerHTML = items
      .map(
        (post) => `
            <div class="post-item">
                <div class="post-content">${post.content}</div>
                <div class="project-date">${post.created_at}</div>
            </div>
        `
      )
      .join("");
  }
}

// Çıkış yap
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("growhub_user");
    window.location.href = "index.html";
  });
}

// Sayfa yüklenince başlat
loadProfile();
loadProfileContent("projects");
