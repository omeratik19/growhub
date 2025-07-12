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

  const { action, user_id } = req.query;

  try {
    switch (action) {
      case "get":
        await handleGetProfile(req, res);
        break;
      case "follow":
        await handleFollowUser(req, res);
        break;
      case "unfollow":
        await handleUnfollowUser(req, res);
        break;
      default:
        res.status(400).json({ error: "Geçersiz istek." });
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Sunucu hatası: " + error.message });
  }
};

async function handleGetProfile(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Kullanıcı ID gerekli." });
  }

  try {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Get follower count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user_id);

    // Get following count
    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user_id);

    // Get user's projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    // Get user's posts
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at,
      },
      stats: {
        followers: followersCount || 0,
        following: followingCount || 0,
        projects: projects?.length || 0,
        posts: posts?.length || 0,
      },
      projects: projects || [],
      posts: posts || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Profil bilgileri yüklenirken hata oluştu." });
  }
}

async function handleFollowUser(req, res) {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res
      .status(400)
      .json({ error: "Takip eden ve takip edilen kullanıcı ID gerekli." });
  }

  if (follower_id === following_id) {
    return res.status(400).json({ error: "Kendinizi takip edemezsiniz." });
  }

  try {
    const { data, error } = await supabase
      .from("follows")
      .insert([
        {
          follower_id,
          following_id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return res
          .status(400)
          .json({ error: "Bu kullanıcıyı zaten takip ediyorsunuz." });
      }
      return res
        .status(500)
        .json({ error: "Takip işlemi başarısız: " + error.message });
    }

    res.json({ success: "Kullanıcı takip edildi!", follow: data[0] });
  } catch (error) {
    res.status(500).json({ error: "Takip işlemi sırasında hata oluştu." });
  }
}

async function handleUnfollowUser(req, res) {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res
      .status(400)
      .json({ error: "Takip eden ve takip edilen kullanıcı ID gerekli." });
  }

  try {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", follower_id)
      .eq("following_id", following_id);

    if (error) {
      return res
        .status(500)
        .json({ error: "Takibi bırakma işlemi başarısız: " + error.message });
    }

    res.json({ success: "Takip bırakıldı!" });
  } catch (error) {
    res.status(500).json({ error: "Takibi bırakma sırasında hata oluştu." });
  }
}
