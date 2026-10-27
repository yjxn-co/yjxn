(() => {
  function updateLanguageLinks() {
    document.querySelectorAll('[data-language-switch] a').forEach(link => {
      const target = new URL(link.getAttribute('href'), location.href);
      target.search = location.search;
      target.hash = location.hash;
      link.href = target.href;
    });
  }
  updateLanguageLinks();
  addEventListener('hashchange', updateLanguageLinks);
  addEventListener('catalogpagechange', updateLanguageLinks);
})();

