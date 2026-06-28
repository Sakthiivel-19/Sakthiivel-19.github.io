/* =========================================================
   Sakthivel R — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;

  /* ---------- Theme toggle (persisted + respects system) ---------- */
  const themeToggle = document.getElementById("themeToggle");
  // Default theme is light (set on <html>). We intentionally do NOT auto-switch
  // to the visitor's system dark preference — the portfolio opens in light mode.
  // A visitor's manual toggle choice is still remembered across visits.
  const saved = localStorage.getItem("theme");
  if (saved) {
    root.setAttribute("data-theme", saved);
  }
  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Resume button (graceful if the PDF isn't uploaded yet) ---------- */
  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", function (e) {
      const href = resumeBtn.getAttribute("href");
      // Check the file exists before letting the download proceed.
      fetch(href, { method: "HEAD" })
        .then(function (res) {
          if (!res.ok) throw new Error("missing");
          // File exists — trigger the download manually (we cancelled the default).
          const a = document.createElement("a");
          a.href = href;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
        })
        .catch(function () {
          const old = resumeBtn.textContent;
          resumeBtn.textContent = "📄 Resume coming soon!";
          setTimeout(function () { resumeBtn.textContent = old; }, 2500);
        });
      e.preventDefault();
    });
  }

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

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    const action = form.getAttribute("action") || "";

    const SENT_MSG = "✅ Thank you for reaching out! Your message has been sent — I'll get back to you soon. Best regards, Sakthivel R.";

    // Fallback: hand off to the visitor's email app (used if Formspree can't be
    // reached — e.g. opened as a local file, an ad-blocker, or no network).
    function mailFallback() {
      const subject = encodeURIComponent("Portfolio contact from " + form.name.value);
      const body = encodeURIComponent(form.message.value + "\n\n— " + form.name.value + " (" + form.email.value + ")");
      window.location.href =
        "mailto:contact.sakthii19@gmail.com?subject=" + subject + "&body=" + body;
      form.reset();
      status.textContent = SENT_MSG;
      status.className = "form-status ok";
    }

    e.preventDefault();

    // If Formspree isn't configured, go straight to the email fallback.
    if (action.indexOf("YOUR_FORM_ID") !== -1 || action.indexOf("formspree.io") === -1) {
      mailFallback();
      return;
    }

    // Real Formspree submission via fetch (no page reload, no email app).
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
          status.textContent = SENT_MSG;
          status.className = "form-status ok";
        } else {
          // Formspree reachable but rejected (e.g. not yet activated) — hand off to email.
          mailFallback();
        }
      })
      .catch(function () {
        // Network blocked (local file / ad-blocker / offline) — hand off to email.
        mailFallback();
      });
  });
})();
