/**
 * Interactividad mínima (sin bundler): menú móvil del header.
 */
(function () {
  var toggle = document.getElementById("navToggle");
  var panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  setOpen(false);

  toggle.addEventListener("click", function () {
    setOpen(panel.hidden);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();
