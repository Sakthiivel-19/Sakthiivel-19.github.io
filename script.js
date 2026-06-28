/* =========================================================
   Sakthivel R — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;

  /* ---------- Theme toggle (persisted + respects system) ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved) {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Navbar shadow on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = function () {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  menuBtn.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // small stagger for groups
            setTimeout(function () { entry.target.classList.add("in"); }, (i % 6) * 70);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Active nav link highlighting ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const linkMap = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            Object.values(linkMap).forEach(function (a) { a.classList.remove("active"); });
            const active = linkMap[entry.target.id];
            if (active) active.classList.add("active");
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Live GitHub projects ---------- */
  /* Auto-loads your public repos so new projects appear without editing the site.
     Keeps the static fallback cards if the API can't be reached. */
  (function loadGitHubProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    const user = grid.getAttribute("data-github-user");
    if (!user) return;

    const GH_ICON =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/></svg>';
    const LINK_ICON =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';

    // Map languages / topics to a Devicon class (else fall back to an emoji).
    const ICONS = {
      python: "devicon-python-plain colored", javascript: "devicon-javascript-plain colored",
      typescript: "devicon-typescript-plain colored", html: "devicon-html5-plain colored",
      css: "devicon-css3-plain colored", "c++": "devicon-cplusplus-plain colored",
      c: "devicon-c-plain colored", java: "devicon-java-plain colored",
      jupyter: "devicon-jupyter-plain colored", "jupyter notebook": "devicon-jupyter-plain colored",
      go: "devicon-go-original-wordmark colored", rust: "devicon-rust-original colored",
      php: "devicon-php-plain colored", ruby: "devicon-ruby-plain colored", dart: "devicon-dart-plain colored",
    };
    const EMOJI = ["🧠", "🤖", "⚙️", "🔬", "📊", "🚀", "🧩", "💡", "🛠️", "📦"];

    function esc(s) {
      const d = document.createElement("div");
      d.textContent = s == null ? "" : String(s);
      return d.innerHTML;
    }

    function iconFor(repo, idx) {
      const key = (repo.language || "").toLowerCase();
      if (ICONS[key]) return '<i class="' + ICONS[key] + '"></i>';
      return '<span>' + EMOJI[idx % EMOJI.length] + "</span>";
    }

    function tagsFor(repo) {
      const tags = [];
      if (Array.isArray(repo.topics)) tags.push.apply(tags, repo.topics.slice(0, 4));
      if (!tags.length && repo.language) tags.push(repo.language);
      return tags.slice(0, 5).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    }

    function prettyName(name) {
      return name.replace(/[-_]/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function cardFor(repo, idx) {
      const demo = repo.homepage && repo.homepage.trim()
        ? '<a href="' + esc(repo.homepage) + '" target="_blank" rel="noopener" aria-label="Live demo" title="Live demo">' + LINK_ICON + "</a>"
        : "";
      const stars = repo.stargazers_count
        ? '<span class="project-stars" title="Stars">★ ' + repo.stargazers_count + "</span>"
        : "";
      const desc = repo.description ? esc(repo.description) : "A project from my GitHub — click through for details.";
      return (
        '<article class="project-card reveal in">' +
          '<div class="project-top">' +
            '<span class="project-icon">' + iconFor(repo, idx) + "</span>" +
            '<div class="project-links">' + stars + demo +
              '<a href="' + esc(repo.html_url) + '" target="_blank" rel="noopener" aria-label="Source code" title="Source code">' + GH_ICON + "</a>" +
            "</div>" +
          "</div>" +
          '<h3 class="project-name">' + esc(prettyName(repo.name)) + "</h3>" +
          '<p class="project-desc">' + desc + "</p>" +
          '<ul class="chips chips-sm">' + tagsFor(repo) + "</ul>" +
        "</article>"
      );
    }

    const api = "https://api.github.com/users/" + encodeURIComponent(user) +
      "/repos?per_page=100&sort=updated";

    fetch(api, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (repos) {
        if (!Array.isArray(repos) || !repos.length) return; // keep fallback cards
        const visible = repos
          .filter(function (r) { return !r.fork && !r.archived && r.name.toLowerCase() !== user.toLowerCase(); })
          .sort(function (a, b) {
            if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
            return new Date(b.pushed_at) - new Date(a.pushed_at);
          });
        if (!visible.length) return;
        grid.innerHTML = visible.map(cardFor).join("");
      })
      .catch(function (err) {
        // Network error / rate limit (60 req/hr unauthenticated) — keep the static cards.
        if (window.console) console.info("Projects: using fallback cards (" + err.message + ")");
      });
  })();

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    const action = form.getAttribute("action") || "";

    // If Formspree isn't configured yet, fall back to the user's mail client.
    if (action.indexOf("YOUR_FORM_ID") !== -1) {
      e.preventDefault();
      const name = encodeURIComponent(form.name.value);
      const body = encodeURIComponent(form.message.value + "\n\n— " + form.name.value + " (" + form.email.value + ")");
      window.location.href =
        "mailto:contact.sakthii19@gmail.com?subject=" +
        encodeURIComponent("Portfolio contact from " + decodeURIComponent(name)) +
        "&body=" + body;
      status.textContent = "✅ Thank you for reaching out! Your message has been sent — I'll get back to you soon. Best regards, Sakthivel R.";
      status.className = "form-status ok";
      return;
    }

    // Real Formspree submission via fetch (no page reload).
    e.preventDefault();
    status.textContent = "Sending…";
    status.className = "form-status";

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          status.textContent = "✅ Thanks! Your message has been sent.";
          status.className = "form-status ok";
        } else {
          status.textContent = "Something went wrong. Please email me directly.";
          status.className = "form-status err";
        }
      })
      .catch(function () {
        status.textContent = "Network error. Please email me directly.";
        status.className = "form-status err";
      });
  });
})();
