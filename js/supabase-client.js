// Supabase Client for Frontend
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
const auth = {
  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Sign up
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
    return { data, error };
  },

  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helper functions
const db = {
  // Get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  // Get projects
  getProjects: async (userId = null) => {
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

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Add project
  addProject: async (projectData) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([projectData])
      .select();
    return { data, error };
  },

  // Get posts
  getPosts: async (userId = null) => {
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

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Add post
  addPost: async (postData) => {
    const { data, error } = await supabase
      .from("posts")
      .insert([postData])
      .select();
    return { data, error };
  },

  // Get user stats
  getUserStats: async (userId) => {
    const [followers, following, projects, posts] = await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    return {
      followers: followers.count || 0,
      following: following.count || 0,
      projects: projects.count || 0,
      posts: posts.count || 0,
    };
  },

  // Follow user
  followUser: async (followerId, followingId) => {
    const { data, error } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select();
    return { data, error };
  },

  // Unfollow user
  unfollowUser: async (followerId, followingId) => {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    return { error };
  },
};

// Storage helper functions
const storage = {
  // Upload image
  uploadImage: async (file, path) => {
    const { data, error } = await supabase.storage
      .from("project-images")
      .upload(path, file);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (path) => {
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    return data.publicUrl;
  },
};

// Export everything
window.GrowhubSupabase = {
  supabase,
  auth,
  db,
  storage,
};
