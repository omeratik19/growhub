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
        await handleAddPost(req, res);
        break;
      case "list":
        await handleListPosts(req, res);
        break;
      default:
        res.status(400).json({ error: "Geçersiz istek." });
    }
  } catch (error) {
    console.error("Posts error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + error.message });
  }
};

async function handleAddPost(req, res) {
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Kullanıcı ve içerik zorunludur." });
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id,
          content,
        },
      ])
      .select();

    if (error) {
      return res
        .status(500)
        .json({ error: "Gönderi eklenirken hata oluştu: " + error.message });
    }

    res.json({ success: "Gönderi başarıyla eklendi!", post: data[0] });
  } catch (error) {
    res.status(500).json({ error: "Gönderi eklenirken hata oluştu." });
  }
}

async function handleListPosts(req, res) {
  const { user_id } = req.query;

  try {
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        users!posts_user_id_fkey (
          username,
          avatar
        )
      `
      )
      .order("created_at", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: posts, error } = await query;

    if (error) {
      return res
        .status(500)
        .json({
          error: "Gönderiler yüklenirken hata oluştu: " + error.message,
        });
    }

    // Format the response to match the expected structure
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      created_at: post.created_at,
      username: post.users?.username,
      avatar: post.users?.avatar,
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ error: "Gönderiler yüklenirken hata oluştu." });
  }
}
