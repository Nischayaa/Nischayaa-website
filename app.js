const cfg = window.NISCHAYAA_CONFIG || {};
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

async function loadVideos() {
  const grid = document.getElementById("videoGrid");
  const empty = document.getElementById("emptyVideos");

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  try {
    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data, error } = await client
      .from("videos")
      .select("id,title,description,video_url,thumbnail_url,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    grid.innerHTML = data.map(video => {
      const url = escapeHtml(video.video_url || "");
      const title = escapeHtml(video.title || "Nischayaa video");
      const description = escapeHtml(video.description || "");
      const thumbnail = escapeHtml(video.thumbnail_url || "");
      return `
        <article class="video-card">
          <video controls preload="metadata" ${thumbnail ? `poster="${thumbnail}"` : ""}>
            <source src="${url}">
            Your browser does not support video playback.
          </video>
          <div class="video-info">
            <h3>${title}</h3>
            ${description ? `<p>${description}</p>` : ""}
          </div>
        </article>`;
    }).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

loadVideos();
