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
      case "add":
        await handleAddProject(req, res);
        break;
      case "list":
        await handleListProjects(req, res);
        break;
      default:
        res.status(400).json({ error: "Geçersiz istek." });
    }
  } catch (error) {
    console.error("Projects error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + error.message });
  }
};

async function handleAddProject(req, res) {
  const {
    user_id,
    title,
    description,
    category,
    techs,
    demo_url,
    github_url,
    image_url,
  } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: "Kullanıcı ve başlık zorunludur." });
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id,
          title,
          description: description || "",
          category: category || "Diğer",
          techs: techs || "",
          demo_url: demo_url || "",
          github_url: github_url || "",
          image_url: image_url || "",
        },
      ])
      .select();

    if (error) {
      return res
        .status(500)
        .json({ error: "Proje eklenirken hata oluştu: " + error.message });
    }

    res.json({ success: "Proje başarıyla eklendi!", project: data[0] });
  } catch (error) {
    res.status(500).json({ error: "Proje eklenirken hata oluştu." });
  }
}

async function handleListProjects(req, res) {
  const { user_id } = req.query;

  try {
    let query = supabase
      .from("projects")
      .select(
        `
        *,
        users!projects_user_id_fkey (
          username,
          avatar
        )
      `
      )
      .order("created_at", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: projects, error } = await query;

    if (error) {
      return res
        .status(500)
        .json({ error: "Projeler yüklenirken hata oluştu: " + error.message });
    }

    // Format the response to match the expected structure
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      user_id: project.user_id,
      title: project.title,
      description: project.description,
      category: project.category,
      techs: project.techs,
      demo_url: project.demo_url,
      github_url: project.github_url,
      image_url: project.image_url,
      created_at: project.created_at,
      username: project.users?.username,
      avatar: project.users?.avatar,
    }));

    res.json({ projects: formattedProjects });
  } catch (error) {
    res.status(500).json({ error: "Projeler yüklenirken hata oluştu." });
  }
}
