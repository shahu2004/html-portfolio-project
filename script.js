(() => {
  const root = document.documentElement;
  root.classList.add("has-js");

  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 680) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
      }
    });
  }

  const progressBar = document.getElementById("reading-progress-bar");
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Download cross-origin PDF files through a CORS-enabled fetch and a Blob URL.
  // This avoids opening Edge's built-in PDF viewer, which may be disabled by the user.
  document.querySelectorAll("a.pdf-download").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      if (link.getAttribute("aria-busy") === "true") return;

      const originalLabel = link.innerHTML;
      const filename = link.dataset.downloadFilename || "document.pdf";
      const status = document.getElementById("pdf-download-status");

      link.setAttribute("aria-busy", "true");
      link.innerHTML = "Preparing download…";

      try {
        const response = await fetch(link.href, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          cache: "no-cache"
        });
        if (!response.ok) throw new Error("PDF download failed (" + response.status + ").");

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("pdf")) {
          throw new Error("The file returned was not a PDF document.");
        }

        const pdfBlob = await response.blob();
        if (!pdfBlob.size) throw new Error("The PDF file is empty.");

        const objectUrl = URL.createObjectURL(
          new Blob([pdfBlob], { type: "application/pdf" })
        );
        const downloadLink = document.createElement("a");
        downloadLink.href = objectUrl;
        downloadLink.download = filename;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

        if (status) status.textContent = filename + " download started. Check your browser downloads.";
      } catch (error) {
        console.error("PDF download error:", error);
        if (status) {
          status.textContent = "Automatic download was blocked. Right-click the PDF button and choose “Save link as…”, or allow downloads for this site in Edge.";
        }
      } finally {
        link.setAttribute("aria-busy", "false");
        link.innerHTML = originalLabel;
      }
    });
  });

})();