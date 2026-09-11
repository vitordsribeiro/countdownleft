(function () {
  "use strict";

  const btn = document.getElementById("snapBtn");
  const sceneEl = document.getElementById("scene");
  if (!btn || !sceneEl) return;

  const HTML2CANVAS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

  function isMobileDevice() {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const hasTouch = navigator.maxTouchPoints > 0;
    const narrowScreen = window.matchMedia("(max-width: 768px)").matches;
    return (coarsePointer || hasTouch) && narrowScreen;
  }

  function updateVisibility() {
    document.body.classList.toggle("is-mobile-device", isMobileDevice());
  }

  updateVisibility();
  window.addEventListener("resize", updateVisibility);

  let html2canvasPromise = null;
  function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve();
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = HTML2CANVAS_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Falha ao carregar html2canvas"));
      document.head.appendChild(script);
    });
    return html2canvasPromise;
  }

  function fileName() {
    const now = new Date();
    const stamp = now
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    return `contagem-${stamp}.png`;
  }

  function downloadCanvas(canvas) {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleClick() {
    if (btn.classList.contains("is-busy")) return;
    btn.classList.add("is-busy");

    try {
      await loadHtml2Canvas();

      const canvas = await window.html2canvas(sceneEl, {
        backgroundColor: null,
        useCORS: true,
        scale: Math.min(window.devicePixelRatio || 2, 3)
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          downloadCanvas(canvas);
          btn.classList.remove("is-busy");
          return;
        }

        const file = new File([blob], fileName(), { type: "image/png" });
        const canShareFile = !!(navigator.canShare && navigator.canShare({ files: [file] }));

        if (canShareFile) {
          try {
            await navigator.share({ files: [file], title: "Contagem regressiva" });
            btn.classList.remove("is-busy");
            return;
          } catch (shareErr) {
            // usuário cancelou o compartilhamento, ou o navegador recusou;
            // cai no download abaixo.
          }
        }

        downloadCanvas(canvas);
        btn.classList.remove("is-busy");
      }, "image/png");
    } catch (err) {
      console.error("Não foi possível gerar a captura:", err);
      btn.classList.remove("is-busy");
    }
  }

  btn.addEventListener("click", handleClick);
})();
