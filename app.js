// Логика сайта: отрисовка задач, вкладки, тема, таблица первообразных, формулы KaTeX
document.addEventListener('DOMContentLoaded', () => {

  // Карточки с подробными решениями
  function buildCards(list, prefix, withLevel) {
    return list.map((t, i) => `
      <article class="example">
        <header>
          <span class="badge">${prefix} ${i + 1}</span>
          <h3>${t.title}</h3>
          ${withLevel && t.level ? `<span class="level">${t.level}</span>` : ''}
        </header>
        <p>${t.q}</p>
        <details>
          <summary>Показать подробное решение</summary>
          <ol class="sol">
            ${t.steps.map(s => `<li><span class="why">${s[0]}</span>${s[1]}</li>`).join('')}
          </ol>
          <p class="answer">Ответ: ${t.ans}</p>
          <p class="check">${t.check}</p>
        </details>
      </article>`).join('');
  }

  document.getElementById('ref-examples').innerHTML = buildCards(window.REF_EXAMPLES, 'Пример', false);
  document.getElementById('hw-list').innerHTML = buildCards(window.HW, 'Задача', true);
  document.getElementById('practice-examples').innerHTML = buildCards(window.PRACTICE, 'Задача', true);
  document.getElementById('hw-answers').innerHTML = window.HW.map(t => `<li>${t.ans}</li>`).join('');

  // Формулы KaTeX
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }

  // Тема
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Таблица: производные -> показать первообразные
  const dual = document.getElementById('dualTable');
  const antiBtn = document.getElementById('toggleAnti');
  antiBtn.addEventListener('click', () => {
    const on = dual.classList.toggle('show-anti');
    antiBtn.setAttribute('aria-expanded', on);
    antiBtn.textContent = on ? '← Скрыть таблицу первообразных' : 'Показать таблицу первообразных →';
  });

  // Вкладки
  const layout = document.getElementById('top');
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.panel')];
  const toggleBtn = document.getElementById('toggleSolutions');
  let current = 'ref';

  function activeDetails() {
    const p = panels.find(x => x.dataset.panel === current);
    return p ? [...p.querySelectorAll('details')] : [];
  }
  function updateToggleLabel() {
    const d = activeDetails();
    if (!d.length) return;
    toggleBtn.textContent = d.every(x => x.open) ? 'Свернуть все решения' : 'Раскрыть все решения';
  }
  function showTab(name) {
    current = name;
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === name));
    panels.forEach(p => (p.hidden = p.dataset.panel !== name));
    layout.classList.toggle('wide-off', name !== 'ref');
    toggleBtn.style.display = activeDetails().length ? '' : 'none';
    const hashes = { ref: '', hw: '#homework', practice: '#practice' };
    history.replaceState(null, '', location.pathname + hashes[name]);
    window.scrollTo({ top: 0 });
    updateToggleLabel();
  }
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
  if (location.hash === '#homework') showTab('hw');
  else if (location.hash === '#practice') showTab('practice');

  // Раскрыть / свернуть решения активной вкладки
  toggleBtn.addEventListener('click', () => {
    const d = activeDetails();
    const open = d.some(x => !x.open);
    d.forEach(x => (x.open = open));
    updateToggleLabel();
  });
  document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', updateToggleLabel));

  // Печать: раскрываем все решения
  document.getElementById('printBtn').addEventListener('click', () => {
    document.querySelectorAll('details').forEach(d => (d.open = true));
    window.print();
  });

  // Подсветка раздела в содержании
  const links = [...document.querySelectorAll('.toc a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) observer.observe(s); });

  // Кнопка «Наверх»
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 500), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
