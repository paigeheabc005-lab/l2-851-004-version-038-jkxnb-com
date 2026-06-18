(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getSearchTarget(form) {
    var action = form.getAttribute('action') || 'search.html';
    var input = qs('input[name="q"]', form);
    var value = input ? input.value.trim() : '';
    if (!value) {
      return action;
    }
    return action + '?q=' + encodeURIComponent(value);
  }

  qsa('.js-site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      window.location.href = getSearchTarget(form);
    });
  });

  var toggle = qs('[data-mobile-toggle]');
  var nav = qs('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  qsa('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  qsa('[data-scroll-player]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var player = qs('[data-player]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  var panel = qs('[data-filter-panel]');
  if (!panel) {
    return;
  }

  var keywordInput = qs('[data-filter-keyword]', panel);
  var regionSelect = qs('[data-filter-region]', panel);
  var yearSelect = qs('[data-filter-year]', panel);
  var typeSelect = qs('[data-filter-type]', panel);
  var count = qs('[data-filter-count]', panel);
  var cards = qsa('[data-card]');

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && keywordInput) {
    keywordInput.value = query;
  }

  function applyFilters() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var match = true;

      if (keyword && search.indexOf(keyword) === -1) {
        match = false;
      }
      if (region && cardRegion !== region) {
        match = false;
      }
      if (year && cardYear !== year) {
        match = false;
      }
      if (type && cardType !== type) {
        match = false;
      }

      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
    }
  }

  [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (input) {
    if (input) {
      input.addEventListener('input', applyFilters);
      input.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
}());
