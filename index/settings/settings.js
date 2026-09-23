const switches = document.querySelectorAll('.switch input');

switches.forEach((sw, index) => {
  sw.addEventListener('change', () => {
    localStorage.setItem(`setting_${index}`, sw.checked);
  });
});