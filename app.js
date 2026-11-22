/* Lush Locks Salon & Barbershop — style deck, naira ticket, drawer and bar */

(function () {
  "use strict";

  var CFG = {
    wa: "2348146023918",
    phone: "+2348146023918",
    services: {
      fade:   { name: "Skin Fade & Beard",     price: 8000 },
      braids: { name: "Knotless Braids",       price: 25000 },
      silk:   { name: "Silk Press & Steam",    price: 22000 },
      mani:   { name: "Gel Mani & Pedi",       price: 15000 },
      home:   { name: "Home Service",          price: 30000 }
    }
  };

  var order = ["fade", "braids", "silk", "mani", "home"];

  var state = {
    picked: { fade: true },
    front: "fade"
  };

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function naira(n) {
    return "\u20a6" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function pickedList() {
    return order.filter(function (id) { return state.picked[id]; });
  }

  function total() {
    return pickedList().reduce(function (sum, id) { return sum + CFG.services[id].price; }, 0);
  }

  function waHref() {
    var ids = pickedList();
    var lines = ids.map(function (id) {
      return "- " + CFG.services[id].name + " (" + naira(CFG.services[id].price) + ")";
    });
    var body = "Hello Lush Locks \u2014 I'd like to book:\n" + (lines.length ? lines.join("\n") : "- (no service picked yet)") +
      "\nTotal: " + naira(total()) + "\nPreferred day and time: ";
    return "https://wa.me/" + CFG.wa + "?text=" + encodeURIComponent(body);
  }

  var popTimer = null;
  function pop(el) {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    clearTimeout(popTimer);
    popTimer = setTimeout(function () { el.classList.remove("pop"); }, 240);
  }

  function lineHTML(id) {
    var s = CFG.services[id];
    return "<li><span>" + s.name + "</span><b>" + naira(s.price) + "</b></li>";
  }

  function render() {
    var ids = pickedList();
    var sum = total();

    /* deck */
    var deck = $("#deck");
    if (deck) deck.setAttribute("data-front", state.front);
    $$(".dcard").forEach(function (card) {
      var on = card.getAttribute("data-style") === state.front;
      card.classList.toggle("is-front", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
    });

    /* rows */
    $$("#rows .row").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var on = !!state.picked[id];
      row.classList.toggle("is-on", on);
      var btn = row.querySelector(".row__toggle");
      if (btn) {
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        var span = btn.querySelector("span");
        if (span) span.textContent = on ? "Added" : "Add";
      }
    });

    /* ticket */
    var lines = $("#ticketLines");
    if (lines) {
      lines.innerHTML = ids.length
        ? ids.map(lineHTML).join("")
        : "<li class=\"empty\">No service picked yet.</li>";
    }
    var totalEl = $("#ticketTotal");
    if (totalEl && totalEl.textContent !== naira(sum)) {
      totalEl.textContent = naira(sum);
      pop(totalEl);
    }

    /* drawer */
    var dList = $("#drawerList");
    if (dList) {
      dList.innerHTML = ids.length
        ? ids.map(lineHTML).join("")
        : "<li class=\"empty\">No service picked yet.</li>";
    }
    var dTotal = $("#drawerTotal");
    if (dTotal) dTotal.textContent = naira(sum);

    /* bar */
    var bTotal = $("#barTotal");
    if (bTotal) bTotal.textContent = naira(sum);

    /* links */
    var href = waHref();
    ["#ticketCta", "#drawerWa", "#barWa"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.setAttribute("href", href);
    });
  }

  function scrollToTicket() {
    if (window.matchMedia("(max-width: 1080px)").matches) {
      var t = $(".ticket");
      if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggle(id) {
    if (!CFG.services[id]) return;
    state.picked[id] = !state.picked[id];
    render();
  }

  function front(id) {
    if (!CFG.services[id]) return;
    state.front = id;
    if (!state.picked[id]) state.picked[id] = true;
    render();
    scrollToTicket();
  }

  function openDrawer() {
    var d = $("#drawer");
    var s = $("#scrim");
    if (!d) return;
    if (s) { s.hidden = false; void s.offsetWidth; s.classList.add("is-open"); }
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    var d = $("#drawer");
    var s = $("#scrim");
    if (!d) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    if (s) {
      s.classList.remove("is-open");
      setTimeout(function () { s.hidden = true; }, 350);
    }
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    var el = e.target;

    var card = el.closest ? el.closest(".dcard") : null;
    if (card) { front(card.getAttribute("data-style")); return; }

    var btn = el.closest ? el.closest(".row__toggle") : null;
    if (btn) {
      var row = btn.closest(".row");
      if (row) toggle(row.getAttribute("data-id"));
      return;
    }

    if (el.closest && el.closest("#barOpen")) { openDrawer(); return; }
    if (el.closest && el.closest("#drawerClose")) { closeDrawer(); return; }
    if (el.closest && el.closest("#scrim")) { closeDrawer(); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
    var a = document.activeElement;
    if ((e.key === "Enter" || e.key === " ") && a && a.classList && a.classList.contains("dcard")) {
      e.preventDefault();
      front(a.getAttribute("data-style"));
    }
  });

  var boot = document.querySelector(".boot");
  if (boot) {
    setTimeout(function () {
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }, 2500);
  }

  render();
})();
