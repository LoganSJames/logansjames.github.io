/* ============================================
   Logan S. James — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Navbar Scroll Shrink ---
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // --- Active Navigation Highlighting ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Photo Gallery Lightbox ---
  var lightbox = document.getElementById('gallery-lightbox');

  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
    var lightboxClose = lightbox.querySelector('.gallery-lightbox-close');

    function openLightbox(imgSrc, imgAlt, captionText) {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = imgAlt;
      lightboxCaption.textContent = captionText || '';
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('img');
        var caption = item.querySelector('.gallery-caption');
        openLightbox(img.src, img.alt, caption ? caption.textContent : '');
      });
    });

    document.querySelectorAll('.research-fig').forEach(function (fig) {
      fig.addEventListener('click', function () {
        var img = fig.querySelector('img');
        var caption = fig.querySelector('figcaption');
        openLightbox(img.src, img.alt, caption ? caption.textContent : '');
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLightbox();
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

})();
