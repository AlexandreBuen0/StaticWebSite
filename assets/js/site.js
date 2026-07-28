/* Alexandre Bueno — external so the CSP can stay at script-src 'self'. */

(function () {
  "use strict";

  /* ---- Products: filter by press type ---- */
  var bar = document.getElementById("filters");

  if (bar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("#grid [data-use]"));
    var count = document.getElementById("count");

    var apply = function (want) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = want === "all" || card.dataset.use.split(" ").indexOf(want) > -1;
        card.classList.toggle("d-none", !match);
        if (match) shown++;
      });
      if (count) {
        count.textContent = shown + (shown === 1 ? " ink" : " inks") + " shown";
      }
    };

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      bar.querySelectorAll("[data-filter]").forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      apply(btn.dataset.filter);
    });
  }

  /* ---- Contacts: validate, then hand the note to the visitor's mail app ---- */
  var form = document.getElementById("orderForm");

  if (form) {
    var msg = document.getElementById("formMsg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.add("was-validated");
      if (msg) msg.textContent = "";

      if (!form.checkValidity()) return;

      var body = [
        "Name: " + form.elements.name.value.trim(),
        "Email: " + form.elements.email.value.trim(),
        "Press: " + form.elements.press.value,
        "",
        form.elements.note.value.trim()
      ].join("\n");

      window.location.href = "mailto:press@alexandrebueno.com"
        + "?subject=" + encodeURIComponent("Order note \u2014 " + form.elements.name.value.trim())
        + "&body=" + encodeURIComponent(body);

      if (msg) msg.textContent = "Opening your mail app\u2026";
    });
  }
})();
