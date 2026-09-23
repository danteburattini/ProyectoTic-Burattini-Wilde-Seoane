let currentYear = 2026;
const yearDisplay = document.querySelector('.year-selector span');
const yearBtns = document.querySelectorAll('.year-btn');

if (yearBtns.length === 2 && yearDisplay) {
  yearBtns[0].addEventListener('click', () => {
    currentYear--;
    yearDisplay.textContent = currentYear;
  });

  yearBtns[1].addEventListener('click', () => {
    currentYear++;
    yearDisplay.textContent = currentYear;
  });
}