document.addEventListener("DOMContentLoaded", function () {
  // Giriş kontrolü
  const user = JSON.parse(localStorage.getItem("growhub_user"));
  if (!user) {
    window.location.href = "index.html";
  }

  // Navbar'da kullanıcı adını göster (örnek)
  const navbar = document.getElementById("navbar");
  if (navbar && user) {
    const userInfo = document.createElement("div");
    userInfo.className = "user-info";
    userInfo.innerHTML = `<span style="color:#7f1fff;font-weight:600;">${user.username}</span>`;
    navbar.appendChild(userInfo);
  }

  // Çıkış yap butonu
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("growhub_user");
      window.location.href = "index.html";
    });
  }

  // Profil butonu
  const profileBtn = document.getElementById("profile-btn");
  if (profileBtn && user) {
    profileBtn.addEventListener("click", function () {
      window.location.href = `profile.html`;
    });
  }

  // Akış sekmeleri ve filtreleme
  const feedTabs = document.querySelectorAll(".tab");
  feedTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      feedTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      loadFeed(this.dataset.tab);
    });
  });

  // Akış (feed) yükleme
  async function loadFeed(tab = "all") {
    document.getElementById("feed-content").innerHTML =
      '<div class="loader">İçerik yükleniyor...</div>';
    let posts = [],
      projects = [];
    if (tab === "all" || tab === "posts") {
      const res = await fetch("api/posts.php?action=list");
      const data = await res.json();
      posts = data.posts || [];
    }
    if (tab === "all" || tab === "projects") {
      const res = await fetch("api/projects.php?action=list");
      const data = await res.json();
      projects = data.projects || [];
    }
    let items = [];
    if (tab === "all") {
      // Projeler ve gönderileri tarihe göre birleştir
      items = [
        ...projects.map((p) => ({ ...p, _type: "project" })),
        ...posts.map((p) => ({ ...p, _type: "post" })),
      ];
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (tab === "projects") {
      items = projects.map((p) => ({ ...p, _type: "project" }));
    } else {
      items = posts.map((p) => ({ ...p, _type: "post" }));
    }
    if (items.length === 0) {
      document.getElementById("feed-content").innerHTML =
        "<i>Henüz paylaşım yok.</i>";
      return;
    }
    document.getElementById("feed-content").innerHTML = items
      .map((item) => {
        if (item._type === "project") {
          const avatar = item.avatar
            ? item.avatar
            : "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(item.username);
          return `<div class="project-item">
                <div class="project-header">
                    <img class="project-avatar" src="${avatar}" alt="avatar">
                    <span class="project-user">${item.username}</span>
                    <span class="project-date">${item.created_at}</span>
                </div>
                <div class="project-title">${item.title}</div>
                <div class="project-desc">${item.description || ""}</div>
            </div>`;
        } else {
          const avatar = item.avatar
            ? item.avatar
            : "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(item.username);
          return `<div class="project-item">
                <div class="project-header">
                    <img class="project-avatar" src="${avatar}" alt="avatar">
                    <span class="project-user">${item.username}</span>
                    <span class="project-date">${item.created_at}</span>
                </div>
                <div class="project-desc">${item.content}</div>
            </div>`;
        }
      })
      .join("");
  }
  loadFeed();

  // Proje Ekle modal aç/kapat
  const addProjectBtn = document.getElementById("add-project-btn");
  const projectModal = document.getElementById("project-modal");
  const closeProjectModal = document.getElementById("close-project-modal");

  if (addProjectBtn && projectModal) {
    addProjectBtn.addEventListener("click", function () {
      projectModal.style.display = "block";
      console.log("Proje Ekle modalı açıldı");
    });
  }
  if (closeProjectModal && projectModal) {
    closeProjectModal.addEventListener("click", function () {
      projectModal.style.display = "none";
      console.log("Proje Ekle modalı kapatıldı (X)");
    });
  }
  // Modal dışına tıklayınca kapansın
  window.addEventListener("click", function (event) {
    if (event.target === projectModal) {
      projectModal.style.display = "none";
      console.log("Proje Ekle modalı kapatıldı (dış)");
    }
  });

  // Görsel seçilince önizleme göster
  const imageInput = document.getElementById("project-image-file");
  const imagePreview = document.getElementById("project-image-preview");
  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(this.files[0]);
      } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
      }
    });
  }

  // Proje Ekle modal form submit (görsel yükleme ile)
  const projectForm = document.getElementById("project-form");
  if (projectForm) {
    projectForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem("growhub_user"));
      if (!user) {
        document.getElementById("project-form-result").innerText =
          "Oturum bulunamadı.";
        return;
      }
      // Form verilerini al
      const title = document.getElementById("project-title").value.trim();
      const description = document.getElementById("project-desc").value.trim();
      const category = document.getElementById("project-category").value;
      const techs = document.getElementById("project-techs").value.trim();
      const demo_url = document.getElementById("project-demo").value.trim();
      const github_url = document.getElementById("project-github").value.trim();
      let image_url = "";
      // Görsel seçildiyse önce upload et
      if (imageInput && imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);
        const uploadRes = await fetch("api/upload.php", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          image_url = uploadData.url;
        } else {
          document.getElementById("project-form-result").innerText =
            uploadData.error || "Görsel yüklenemedi.";
          return;
        }
      }
      // API'ye gönder
      const response = await fetch("api/projects.php?action=add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title,
          description,
          category,
          techs,
          demo_url,
          github_url,
          image_url,
        }),
      });
      const result = await response.json();
      const resultDiv = document.getElementById("project-form-result");
      if (result.success) {
        resultDiv.style.color = "#27ae60";
        resultDiv.innerText = "Proje başarıyla eklendi!";
        projectForm.reset();
        imagePreview.src = "";
        imagePreview.style.display = "none";
        setTimeout(() => {
          document.getElementById("project-modal").style.display = "none";
          resultDiv.innerText = "";
        }, 900);
        // Feed'i güncelle
        loadFeed();
      } else {
        resultDiv.style.color = "#e74c3c";
        resultDiv.innerText = result.error || "Bir hata oluştu.";
      }
    });
  }
});
