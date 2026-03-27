(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setFooterYear() {
    const yearEl = $("#nsYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function setupGameModal() {
    const modalNameEl = $("#nsGameModalName");
    const modalTitleEl = $("#nsGameModalTitle");
    const modalEl = $("#nsGameModal");
    if (!modalEl || !modalNameEl || !modalTitleEl) return;

    $$("#nsGameModal .modal-body").forEach(() => {});

    // Oyun butonlarına tıklanınca modal içeriğini güncelle
    $$("button[data-ns-game]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-ns-game") || "—";
        modalTitleEl.textContent = "Oyun Detayı";
        modalNameEl.textContent = name;
      });
    });
  }

  function setupActiveNavOnScroll() {
    const navLinks = $$(".ns-nav .nav-link[href^='#']");
    if (!navLinks.length) return;

    const sectionIds = navLinks
      .map((l) => l.getAttribute("href")?.slice(1))
      .filter(Boolean);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const setActive = () => {
      const topOffset = 90; // navbar yüksekliği
      const y = window.scrollY + topOffset;

      let currentId = sections[0]?.id || null;
      for (const sec of sections) {
        if (sec.offsetTop <= y) currentId = sec.id;
      }

      navLinks.forEach((a) => {
        const hrefId = a.getAttribute("href")?.slice(1);
        a.classList.toggle("active", hrefId === currentId);
      });
    };

    setActive();
    window.addEventListener("scroll", setActive, { passive: true });
  }

  function setupSmoothScroll() {
    // data-ns-scroll kullanan linkler için ekstra davranış
    $$("a[data-ns-scroll]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const topOffset = 85;
        const rect = target.getBoundingClientRect();
        const y = window.scrollY + rect.top - topOffset;
        window.scrollTo({ top: y, behavior: "smooth" });

        // mobil navbar açık ise kapat
        const collapse = $("#nsNavbar");
        if (collapse && collapse.classList.contains("show")) {
          collapse.classList.remove("show");
        }
      });
    });
  }

  function setupContactFormToast() {
    const form = $("#nsContactForm");
    if (!form) return;

    const toastContainer = document.querySelector(".toast-container");
    if (!toastContainer || typeof bootstrap === "undefined") return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = ($("#nsName")?.value || "").trim();
      const email = ($("#nsEmail")?.value || "").trim();

      const toastId = "nsToast";
      let toastEl = document.getElementById(toastId);

      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.id = toastId;
        toastEl.className = "toast";
        toastEl.setAttribute("role", "status");
        toastEl.setAttribute("aria-live", "polite");
        toastEl.setAttribute("aria-atomic", "true");

        toastEl.innerHTML = `
          <div class="toast-header border-0">
            <strong class="me-auto">NeonStrike</strong>
            <small class="text-muted">Şimdi</small>
            <button type="button" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Kapat"></button>
          </div>
          <div class="toast-body">
            Teşekkürler${name ? `, ${name}` : ""}! Mesajınız alındı.
            ${email ? `(${email})` : ""} Kısa süre içinde geri dönüş yapacağız.
          </div>
        `.trim();

        toastContainer.appendChild(toastEl);
      }

      const toast = new bootstrap.Toast(toastEl, { delay: 4500 });
      toast.show();

      form.reset();
    });
  }

  function setupFormResetOnReload() {
    const form = $("#nsContactForm");
    if (!form) return;

    // Yenileme/back-forward sonrası alanlar dolu kalmasın
    const clearForm = () => {
      form.reset();
      ["nsName", "nsEmail", "nsMessage"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    };

    clearForm();
    window.addEventListener("pageshow", clearForm);
  }

  function setupScrollTop() {
    const btn = $("#nsScrollTop");
    const footer = document.querySelector(".ns-footer");
    if (!btn) return;

    const onScroll = () => {
      const show = window.scrollY > 450;
      btn.classList.toggle("show", show);

      // Footer üzerine binmemesi için butonu dinamik yukarı al
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const overlap = Math.max(0, window.innerHeight - rect.top);
        const offset = overlap > 0 ? overlap + 18 : 16;
        btn.style.bottom = `${offset}px`;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", () => {
      const topEl = document.getElementById("top");
      btn.classList.add("ns-scrolltop-pulse");
      window.setTimeout(() => btn.classList.remove("ns-scrolltop-pulse"), 700);
      if (topEl && typeof topEl.scrollIntoView === "function") {
        topEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function setupPageLoader() {
    const loader = $("#nsLoader");
    if (!loader) return;

    document.body.classList.add("ns-loader-active");

    const minMs = 900;
    const maxMs = 4500;
    const t0 = performance.now();
    let finished = false;

    const hide = () => {
      if (finished) return;
      finished = true;
      loader.classList.add("is-hidden");
      document.body.classList.remove("ns-loader-active");
      loader.setAttribute("aria-busy", "false");
      window.setTimeout(() => {
        loader.remove();
      }, 600);
    };

    const tryHide = () => {
      const elapsed = performance.now() - t0;
      const wait = Math.max(0, minMs - elapsed);
      window.setTimeout(hide, wait);
    };

    if (document.readyState === "complete") {
      tryHide();
    } else {
      window.addEventListener("load", tryHide, { once: true });
    }

    window.setTimeout(() => {
      if (!finished) hide();
    }, maxMs);
  }

  function setupRevealOnScroll() {
    // Sayfadaki ana blokları otomatik olarak reveal animasyonuna dahil et
    const autoRevealTargets = $$(
      ".ns-hero .row > div, .ns-section .row > div, .ns-card, .ns-service, .ns-team-card, .ns-feature, .ns-contact-box, .ns-form-card, .ns-founder-wrap"
    );

    autoRevealTargets.forEach((el, index) => {
      if (!el.classList.contains("ns-reveal")) {
        el.classList.add("ns-reveal");
      }
      // küçük gecikme ile daha akıcı açılış hissi
      const delay = Math.min((index % 8) * 70, 420);
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const revealEls = $$(".ns-reveal");
    if (!revealEls.length) return;

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: [0, 0.12, 0.25],
        rootMargin: "0px 0px -6% 0px",
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  function setupAudioExperience() {
    const audio = $("#nsAudioPreview");
    const state = $("#nsAudioState");
    const eq = $(".ns-eq");
    const toggleBtn = $("#nsAudioToggle");
    const backBtn = $("#nsAudioBack");
    const fwdBtn = $("#nsAudioForward");
    const seek = $("#nsAudioSeek");
    const currentEl = $("#nsAudioCurrent");
    const durationEl = $("#nsAudioDuration");
    if (!audio || !state || !eq || !toggleBtn || !backBtn || !fwdBtn || !seek || !currentEl || !durationEl) return;

    const setState = (label) => {
      state.textContent = label;
    };

    const fmt = (sec) => {
      if (!Number.isFinite(sec)) return "00:00";
      const s = Math.floor(sec % 60).toString().padStart(2, "0");
      const m = Math.floor(sec / 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const updateTime = () => {
      currentEl.textContent = fmt(audio.currentTime);
      durationEl.textContent = fmt(audio.duration);
      const p = Number.isFinite(audio.duration) && audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100
        : 0;
      seek.value = String(p);
    };

    toggleBtn.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch (_) {
          setState("Tarayıcı oynatmayı engelledi");
        }
      } else {
        audio.pause();
      }
    });

    backBtn.addEventListener("click", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      updateTime();
    });

    fwdBtn.addEventListener("click", () => {
      const max = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + 10;
      audio.currentTime = Math.min(max, audio.currentTime + 10);
      updateTime();
    });

    seek.addEventListener("input", () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const target = (Number(seek.value) / 100) * audio.duration;
      audio.currentTime = target;
      updateTime();
    });

    audio.addEventListener("play", () => {
      setState("Çalıyor");
      eq.classList.add("is-playing");
      toggleBtn.textContent = "Duraklat";
    });

    audio.addEventListener("pause", () => {
      setState("Duraklatıldı");
      eq.classList.remove("is-playing");
      toggleBtn.textContent = "Oynat";
    });

    audio.addEventListener("ended", () => {
      setState("Bitti");
      eq.classList.remove("is-playing");
      toggleBtn.textContent = "Tekrar Oynat";
      updateTime();
    });

    audio.addEventListener("waiting", () => {
      setState("Yükleniyor...");
    });

    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("timeupdate", updateTime);
    updateTime();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupPageLoader();
    setFooterYear();
    setupGameModal();
    setupActiveNavOnScroll();
    setupSmoothScroll();
    setupContactFormToast();
    setupFormResetOnReload();
    setupScrollTop();
    setupRevealOnScroll();
    setupAudioExperience();
  });
})();

