/**
 * Shared component loader for Business Bridge Hub.
 * Loads navbar.html and footer.html into placeholder divs,
 * then highlights the current page's nav link.
 */

function getCurrentPage() {
  const path = window.location.pathname.split('/').pop();
  return path || 'index.html';
}

function highlightActiveNav() {
  const current = getCurrentPage();
  document.querySelectorAll('nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('nav-active');
    }
  });
}

function loadComponent(id, file, callback) {
  var el = document.getElementById(id);
  if (!el) return;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      el.innerHTML = xhr.responseText;
      if (callback) callback();
    }
  };
  xhr.send();
}

document.addEventListener("DOMContentLoaded", function () {
  const basePath = window.location.origin;
  
    fetch(basePath + "/navbar.html")
      .then(r => r.text())
      .then(data => document.getElementById("navbar-container").innerHTML = data)
      .catch(error => console.error("Navbar load error:", error));
    
    fetch(basePath + "/sidebar.html")
      .then(r => r.text())
      .then(data => document.getElementById("sidebar-container").innerHTML = data)
      .catch(error => console.error("Sidebar load error:", error));

    fetch(basePath + "/footer.html")
      .then(r => r.text())
      .then(data => document.getElementById("footer-container").innerHTML = data)
      .catch(error => console.error("Footer load error:", error));
});