const cfg = window.NISCHAYAA_CONFIG || {};
let client = null;

const $ = id => document.getElementById(id);
const loginPanel = $("loginPanel");
const dashboard = $("dashboard");
const logoutBtn = $("logoutBtn");

function setupClient() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    $("loginMessage").textContent = "Supabase is not configured yet. Add the values in config.js.";
    return null;
  }
  if (!client) client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  return client;
}

async function init() {
  const c = setupClient();
  if (!c) return;
  const { data } = await c.auth.getSession();
  if (data.session) showDashboard();
  c.auth.onAuthStateChange((_event, session) => session ? showDashboard() : showLogin());
}

function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  loadVideos();
}
function showLogin() {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  logoutBtn.classList.add("hidden");
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const c = setupClient();
  if (!c) return;
  $("loginMessage").textContent = "Signing in…";
  const { error } = await c.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });
  $("loginMessage").textContent = error ? error.message : "";
});

logoutBtn.addEventListener("click", async () => {
  if (client) await client.auth.signOut();
});

$("uploadForm").addEventListener("submit", async e => {
  e.preventDefault();
  const c = setupClient();
  if (!c) return;
  const file = $("videoFile").files[0];
  if (!file) return;
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    $("uploadMessage").textContent = "For the free setup, keep videos under 100 MB.";
    return;
  }

  const btn = $("uploadBtn");
  btn.disabled = true;
  $("uploadMessage").textContent = "Uploading…";

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${crypto.randomUUID()}-${safeName}`;

    const { error: storageError } = await c.storage.from("videos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });
    if (storageError) throw storageError;

    const { data: publicData } = c.storage.from("videos").getPublicUrl(path);
    const { error: dbError } = await c.from("videos").insert({
      title: $("title").value.trim(),
      description: $("description").value.trim(),
      video_url: publicData.publicUrl,
      published: $("published").checked
    });
    if (dbError) throw dbError;

    $("uploadForm").reset();
    $("published").checked = true;
    $("uploadMessage").textContent = "Video uploaded successfully.";
    await loadVideos();
  } catch (err) {
    console.error(err);
    $("uploadMessage").textContent = err.message || "Upload failed.";
  } finally {
    btn.disabled = false;
  }
});

async function loadVideos() {
  const c = setupClient();
  if (!c) return;
  const list = $("videoList");
  list.innerHTML = "<p>Loading…</p>";

  const { data, error } = await c.from("videos")
    .select("id,title,description,video_url,published,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    list.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    list.innerHTML = "<p>No videos uploaded yet.</p>";
    return;
  }

  list.innerHTML = data.map(v => `
    <div class="video-row">
      <video controls preload="metadata"><source src="${escapeHtml(v.video_url)}"></video>
      <div class="video-meta">
        <strong>${escapeHtml(v.title)}</strong>
        <small>${escapeHtml(v.description || "")}</small>
        <div><span class="status">${v.published ? "PUBLISHED" : "HIDDEN"}</span></div>
      </div>
      <button class="ghost danger" data-delete="${v.id}" data-url="${encodeURIComponent(v.video_url)}">Delete</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteVideo(btn.dataset.delete, decodeURIComponent(btn.dataset.url)));
  });
}

async function deleteVideo(id, url) {
  if (!confirm("Delete this video from the website?")) return;
  const c = setupClient();
  try {
    const filePath = url.split("/videos/").pop();
    if (filePath) await c.storage.from("videos").remove([decodeURIComponent(filePath)]);
    const { error } = await c.from("videos").delete().eq("id", id);
    if (error) throw error;
    await loadVideos();
  } catch (err) {
    alert(err.message || "Delete failed.");
  }
}

$("refreshBtn").addEventListener("click", loadVideos);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

init();
