(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var sections = document.querySelectorAll("[data-filter-section]");
    sections.forEach(function (section) {
      var keyword = section.querySelector("[data-filter-keyword]");
      var region = section.querySelector("[data-filter-region]");
      var type = section.querySelector("[data-filter-type]");
      var year = section.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var empty = section.querySelector(".filter-empty");

      function runFilter() {
        var key = normalize(keyword && keyword.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var ok = true;
          if (key && text.indexOf(key) === -1) {
            ok = false;
          }
          if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
            ok = false;
          }
          if (selectedType && normalize(card.dataset.type) !== selectedType) {
            ok = false;
          }
          if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, region, type, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (keyword && q) {
        keyword.value = q;
        runFilter();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
  });
})();
