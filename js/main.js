/* Elite Air Systems — shared scripts */
(function () {
  document.documentElement.classList.remove('no-js');
  document.body.classList.add('js');

  // Sticky header
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu
  var menu = document.getElementById('mobileMenu');
  var openBtn = document.getElementById('openMenu');
  var closeBtn = document.getElementById('closeMenu');
  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener('click', function () { menu.classList.add('open'); });
    closeBtn.addEventListener('click', function () { menu.classList.remove('open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Contact form -> compose an email (no backend required)
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name: (form.name && form.name.value || '').trim(),
        email: (form.email && form.email.value || '').trim(),
        phone: (form.phone && form.phone.value || '').trim(),
        service: (form.service && form.service.value || '').trim(),
        message: (form.message && form.message.value || '').trim()
      };
      var subject = 'Website enquiry — ' + (data.service || 'General') + (data.name ? ' (' + data.name + ')' : '');
      var body =
        'Name: ' + data.name + '\n' +
        'Email: ' + data.email + '\n' +
        'Phone: ' + data.phone + '\n' +
        'Service needed: ' + data.service + '\n\n' +
        'Message:\n' + data.message + '\n';
      var status = document.getElementById('formStatus');
      if (status) {
        status.textContent = 'Opening your email app to send this enquiry…';
        status.style.color = 'var(--ice)';
      }
      window.location.href = 'mailto:info@eliteairsystems.com.au'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  }

  // ---------------------------------------------------------------
  // HVAC sizing calculator (rough estimate — Melbourne temperate)
  // ---------------------------------------------------------------
  var calc = document.getElementById('hvacCalc');
  if (calc) {
    var val = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
    var num = function (id) { var n = parseFloat(val(id)); return isNaN(n) ? 0 : n; };

    var heightF = { standard: 1.0, high: 1.15 };
    var insF = { good: 0.90, average: 1.0, poor: 1.18 };
    var sunF = { low: 0.92, medium: 1.0, high: 1.15 };
    var typeF = { bedroom: 0.90, living: 1.0, kitchen: 1.15, open: 1.05, whole: 1.0 };

    var setText = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
    var fmt = function (kw) { return (Math.round(kw * 10) / 10).toFixed(1); };

    var suggest = function (area, type) {
      if (type === 'whole' || area > 75) return ['Ducted reverse-cycle', 'A single ducted system with zoning gives even comfort across the whole home from one hidden unit.'];
      if (area > 45 || type === 'open') return ['Multi-split or small ducted', 'Cover a few rooms or an open-plan zone efficiently with a multi-head or compact ducted setup.'];
      return ['Split system', 'A single wall-mounted split system is the most cost-effective choice for a room this size.'];
    };

    var compute = function () {
      var area = num('c_area');
      var result = document.getElementById('calcResult');
      var placeholder = document.getElementById('calcPlaceholder');
      if (!area || area <= 0) {
        if (result) result.hidden = true;
        if (placeholder) placeholder.hidden = false;
        return;
      }
      var f = heightF[val('c_height')] * insF[val('c_ins')] * sunF[val('c_sun')] * typeF[val('c_type')];
      var occ = Math.max(0, num('c_people') - 2) * 0.12;
      var cooling = area * 0.14 * f + occ;
      var heating = cooling * 1.15;
      var s = suggest(area, val('c_type'));

      setText('r_cool_lo', fmt(cooling * 0.92));
      setText('r_cool_hi', fmt(cooling * 1.08));
      setText('r_heat_lo', fmt(heating * 0.92));
      setText('r_heat_hi', fmt(heating * 1.08));
      setText('r_system', s[0]);
      setText('r_system_note', s[1]);
      setText('r_area', area + ' m²');

      if (placeholder) placeholder.hidden = true;
      if (result) result.hidden = false;
    };

    calc.addEventListener('input', compute);
    calc.addEventListener('change', compute);
    calc.addEventListener('submit', function (e) { e.preventDefault(); compute(); });
    compute();
  }
})();
