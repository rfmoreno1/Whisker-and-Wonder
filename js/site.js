/* jshint esversion: 6, browser: true */
(() => {
  'use strict';
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('site-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open', !expanded);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.focus();
      }
    });
    // Reset the mobile menu when the viewport switches to desktop.
    window.matchMedia('(max-width: 767px)').addEventListener('change', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    });
  }
  const page = document.body.dataset.page;
  if (page === 'shop' && document.querySelector('.product-page')) {
    document.querySelectorAll('[data-nav="shop"]').forEach(a => a.setAttribute('aria-current','page'));
  }
  if (page === 'privacy') {
    document.querySelectorAll('[data-nav]').forEach(a => a.removeAttribute('aria-current'));
    // Desktop shows the full policy; small screens start with collapsed sections.
    const mobilePolicy = window.matchMedia('(max-width: 767px)');
    const policySections = document.querySelectorAll('details.policy-item');
    const setPolicyLayout = () => {
      policySections.forEach(section => { section.open = !mobilePolicy.matches; });
      const target = document.getElementById(location.hash.slice(1));
      if (target && target.matches('details.policy-item')) target.open = true;
    };
    setPolicyLayout();
    mobilePolicy.addEventListener('change', setPolicyLayout);
    window.addEventListener('hashchange', () => {
      const target = document.getElementById(location.hash.slice(1));
      if (target && target.matches('details.policy-item')) target.open = true;
    });
  }
  function openDraft(to, subject, body, feedback) {
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (feedback) {
      feedback.textContent = 'Your email app should open with a prepared draft. Please review it and press Send there. If nothing opens, check that a default email app is configured.';
      // Keep an accessible fallback link if the email app does not open.
      const link = document.createElement('a');
      link.href = mailto;
      link.textContent = ' Open email draft again.';
      feedback.appendChild(link);
    }
    window.location.href = mailto;
  }
  function validateOrShow(form, status) {
    if (form.checkValidity()) return true;
    form.reportValidity();
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) firstInvalid.focus();
    if (status) status.textContent = 'Please complete the required fields correctly before continuing.';
    return false;
  }
  const contact = document.getElementById('contact-form');
  if (contact) contact.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = document.getElementById('contact-feedback');
    if (!validateOrShow(contact,status)) return;
    const name = contact.elements.namedItem('name').value.trim();
    const email = contact.elements.namedItem('email').value.trim();
    const subject = contact.elements.namedItem('subject').value.trim();
    const message = contact.elements.namedItem('message').value.trim();
    if (!name || !subject || message.length < 10) { status.textContent='Please complete all required fields.'; return; }
    const body = `Name: ${name}
Reply-to email: ${email}

Message:
${message}`;
    openDraft('hello@examplewebsite142.com', `Whisker & Wonder inquiry: ${subject}`, body, status);
  });
  document.querySelectorAll('.order-form').forEach(form => {
    const quantity = form.querySelector('.quantity-field');
    const status = form.querySelector('.order-feedback');
    const subtotal = form.querySelector('.order-subtotal strong');
    const minus = form.querySelector('.quantity-minus');
    const plus = form.querySelector('.quantity-plus');

    // Show the current subtotal as the customer changes quantity.
    function updateSubtotal() {
      const qty = Number(quantity.value);
      if (Number.isInteger(qty) && qty >= 1 && qty <= 20) {
