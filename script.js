(() => {
  const story = document.querySelector(".horizontal-story");
  const track = document.querySelector(".horizontal-track");
  const panels = Array.from(document.querySelectorAll(".story-panel"));
  const progressBar = document.querySelector(".horizontal-progress-bar");
  const navLinks = Array.from(document.querySelectorAll("[data-panel-link]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let maxTranslate = 0, storyStart = 0, activeIndex = 0, isReady = false;

  function fallbackSvgFor(caption) {
    const safeCaption = (caption || "Imagen pendiente de generar").slice(0, 70);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop stop-color="#11141b" offset="0"/><stop stop-color="#050609" offset="1"/>
          </linearGradient>
          <radialGradient id="r" cx="28%" cy="30%" r="70%"><stop stop-color="#e3222c" stop-opacity=".2" offset="0"/><stop stop-color="#e3222c" stop-opacity="0" offset="1"/></radialGradient>
          <radialGradient id="b" cx="76%" cy="46%" r="70%"><stop stop-color="#126dff" stop-opacity=".2" offset="0"/><stop stop-color="#126dff" stop-opacity="0" offset="1"/></radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#g)"/>
        <rect width="1600" height="900" fill="url(#r)"/>
        <rect width="1600" height="900" fill="url(#b)"/>
        <text x="50%" y="46%" text-anchor="middle" fill="#d8b66a" font-family="Arial, sans-serif" font-size="26" letter-spacing="6">IMAGEN PENDIENTE</text>
        <text x="50%" y="54%" text-anchor="middle" fill="#f8f8fb" font-family="Arial, sans-serif" font-size="22">${safeCaption}</text>
      </svg>`;
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  }

  function setImageFallbacks() {
    document.querySelectorAll("img[data-caption]").forEach((img) => {
      img.addEventListener("error", () => {
        img.src = fallbackSvgFor(img.dataset.caption);
        img.classList.add("fallback-img");
      }, { once: true });
      // Force a load attempt against a nonexistent asset path to trigger the placeholder immediately.
      if (!img.complete || img.naturalWidth === 0) {
        const test = new Image();
        test.onerror = () => { img.src = fallbackSvgFor(img.dataset.caption); img.classList.add("fallback-img"); };
        test.src = img.getAttribute("src");
      }
    });
  }

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function parseAttr(panel, name, fallback) {
    const raw = panel.dataset[name];
    if (raw === undefined) return fallback;
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function setNavState(index) {
    navLinks.forEach((link) => link.classList.toggle("is-active", Number(link.dataset.panelLink) === index));
  }

  function getMostVisiblePanelIndex(x) {
    const panelWidth = window.innerWidth || 1;
    let selectedIndex = 0, bestVisibleWidth = -1;
    panels.forEach((_, index) => {
      const panelLeft = index * panelWidth - x;
      const panelRight = panelLeft + panelWidth;
      const visibleLeft = Math.max(panelLeft, 0);
      const visibleRight = Math.min(panelRight, panelWidth);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      if (visibleWidth > bestVisibleWidth) { bestVisibleWidth = visibleWidth; selectedIndex = index; }
    });
    return selectedIndex;
  }

  function getSectionProgress(panelIndex, x) {
    const panelWidth = window.innerWidth || 1;
    const panelLeft = panelIndex * panelWidth - x;
    return ((panelWidth - panelLeft) / (panelWidth * 2)) * 1.2;
  }

  function setPanelStates(x = 0) {
    activeIndex = getMostVisiblePanelIndex(x);
    setNavState(activeIndex);
    panels.forEach((panel, index) => {
      const enterAt = parseAttr(panel, "enter", 0.08);
      const leaveAt = parseAttr(panel, "leave", 1.1);
      const sectionProgress = getSectionProgress(index, x);
      const isPanelNearViewport = sectionProgress >= 0 && sectionProgress <= 1.2;
      const isTextVisible = sectionProgress >= enterAt && sectionProgress <= leaveAt;
      const leavingStart = Math.max(enterAt, leaveAt - 0.16);
      const isTextLeaving = isTextVisible && sectionProgress >= leavingStart;
      panel.classList.toggle("is-active-panel", index === activeIndex || isPanelNearViewport);
      panel.classList.toggle("is-text-visible", isTextVisible);
      panel.classList.toggle("is-text-leaving", isTextLeaving);
    });
  }

  function setupHorizontalScroll() {
    if (!story || !track || panels.length === 0) return;
    if (reducedMotion) {
      story.style.height = "auto";
      track.style.transform = "none";
      panels.forEach((panel) => { panel.classList.add("is-active-panel", "is-text-visible"); panel.classList.remove("is-text-leaving"); });
      isReady = true;
      return;
    }
    track.style.transform = "translate3d(0, 0, 0)";
    story.style.height = "auto";
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    maxTranslate = Math.max(0, trackWidth - viewportWidth);
    const storyHeight = maxTranslate + window.innerHeight;
    story.style.height = `${storyHeight}px`;
    storyStart = story.offsetTop;
    isReady = true;
    updateHorizontalScroll();
  }

  function updateHorizontalScroll() {
    if (!isReady || !story || !track || reducedMotion) return;
    const raw = window.scrollY - storyStart;
    const progress = maxTranslate === 0 ? 0 : clamp(raw / maxTranslate, 0, 1);
    const x = progress * maxTranslate;
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    setPanelStates(x);
  }

  function scrollToPanel(panelIndex) {
    if (!story || reducedMotion) { panels[panelIndex]?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const targetX = clamp(panelIndex, 0, panels.length - 1) * window.innerWidth;
    window.scrollTo({ top: storyStart + targetX, behavior: "smooth" });
  }

  function setupNav() {
    navLinks.forEach((link) => link.addEventListener("click", (e) => { e.preventDefault(); scrollToPanel(Number(link.dataset.panelLink)); }));
  }

  function setupExpandToggle() {
    const restoreFab = document.querySelector(".restore-fab");
    let maximizedPanel = null;

    function maximize(panel) {
      maximizedPanel?.classList.remove("is-maximized");
      maximizedPanel = panel;
      panel.classList.add("is-maximized");
      restoreFab?.classList.add("is-visible");
      document.body.classList.add("has-maximized");
    }

    function restore() {
      maximizedPanel?.classList.remove("is-maximized");
      maximizedPanel = null;
      restoreFab?.classList.remove("is-visible");
      document.body.classList.remove("has-maximized");
    }

    document.querySelectorAll(".expand-embed").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = button.closest(".split-panel");
        if (panel) maximize(panel);
      });
    });

    restoreFab?.addEventListener("click", restore);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") restore(); });
  }

  function respectReducedMotionVideos() {
    if (!reducedMotion) return;
    document.querySelectorAll(".panel-media video").forEach((video) => {
      video.pause();
      video.removeAttribute("autoplay");
      video.removeAttribute("loop");
    });
  }

  function init() {
    setImageFallbacks();
    respectReducedMotionVideos();
    setupNav();
    setupExpandToggle();
    window.addEventListener("resize", setupHorizontalScroll);
    window.addEventListener("orientationchange", setupHorizontalScroll);
    window.addEventListener("scroll", updateHorizontalScroll, { passive: true });
    setupHorizontalScroll();
    setPanelStates(0);
  }

  window.addEventListener("load", init);
})();
