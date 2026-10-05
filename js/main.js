(() => {
  const cabecera = document.querySelector('.cabecera');

  // Cabecera: transparente sobre el héroe, sólida al desplazarse. Si la
  // portada tiene texto oscuro (foto clara), la cabecera también, mientras
  // esté transparente.
  const primero = document.querySelector('main > :first-child');
  if (primero && primero.classList.contains('heroe--oscuro')) cabecera.classList.add('cabecera--oscura');
  const alDesplazar = () => cabecera.classList.toggle('is-solida', window.scrollY > 8);

  // Menú móvil
  const hamburguesa = document.querySelector('.hamburguesa');
  const panel = document.getElementById('menu-movil');
  const botonCerrar = panel.querySelector('.menu-movil__cerrar');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const movil = matchMedia('(max-width:599px)');
  const abrir = () => {
    panel.hidden = false;
    panel.offsetWidth;
    panel.classList.add('is-abierto');
    if (movil.matches) document.body.style.overflow = 'hidden';
    hamburguesa.setAttribute('aria-expanded', 'true');
    botonCerrar.focus();
  };
  const cerrar = () => {
    if (panel.hidden) return;
    panel.classList.remove('is-abierto');
    document.body.style.overflow = '';
    hamburguesa.setAttribute('aria-expanded', 'false');
    if (reducido.matches) { panel.hidden = true; return; }
    setTimeout(() => { if (!panel.classList.contains('is-abierto')) panel.hidden = true; }, 500);
  };
  hamburguesa.addEventListener('click', abrir);
  botonCerrar.addEventListener('click', () => { cerrar(); hamburguesa.focus(); });
  panel.querySelector('[data-cerrar]').addEventListener('click', () => { cerrar(); hamburguesa.focus(); });
  // En móvil el panel se cierra al elegir; en tablet y laptop permanece abierto
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (movil.matches) cerrar(); }));
  movil.addEventListener('change', () => { if (!panel.hidden) document.body.style.overflow = movil.matches ? 'hidden' : ''; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { cerrar(); hamburguesa.focus(); } });
  // (addListener: Safari anterior a 14 no tiene addEventListener aquí.)
  const ancho = matchMedia('(min-width:1200px)'), alCambiar = e => { if (e.matches) cerrar(); };
  if (ancho.addEventListener) ancho.addEventListener('change', alCambiar); else ancho.addListener(alCambiar);

  // Ítem activo del menú según la sección visible
  // Las secciones salen del menú (editable): las opciones #ancla de esta página.
  const enlaces = [...document.querySelectorAll('.menu a, .menu-movil__lista a')];
  const ruta = p => p.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  enlaces.forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h.startsWith('/') && !h.includes('#') && ruta(h) === ruta(location.pathname)) a.setAttribute('aria-current', 'page');
  });
  const ids = [...new Set(enlaces.map(a => (a.getAttribute('href') || '').match(/^#([\w-]+)$/)?.[1]).filter(Boolean))];
  const secciones = ids.map(id => document.getElementById(id)).filter(Boolean);
  const marcarActivo = () => {
    const y = window.scrollY + cabecera.offsetHeight + window.innerHeight * 0.3;
    let activa = null;
    secciones.forEach(s => { if (s.getBoundingClientRect().top + window.scrollY <= y) activa = s.id; });
    if (secciones.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) activa = secciones[secciones.length - 1].id;
    enlaces.forEach(a => {
      if (a.getAttribute('aria-current') === 'page') return;
      if (a.getAttribute('href') === '#' + activa) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  let pendiente = false;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { alDesplazar(); marcarActivo(); pendiente = false; });
  }, { passive: true });
  window.addEventListener('resize', marcarActivo);
  alDesplazar();
  marcarActivo();

  // Guía de retícula: G = columnas, B = línea base (o ?reticula en la URL)
  const pagina = document.querySelector('.pagina');
  const guiaCols = document.createElement('div');
  guiaCols.className = 'guia guia--cols';
  guiaCols.innerHTML = '<div class="contenedor">' + '<div></div>'.repeat(12) + '</div>';
  const guiaBase = document.createElement('div');
  guiaBase.className = 'guia guia--base';
  const etiqueta = document.createElement('div');
  etiqueta.className = 'guia-etiqueta';
  [guiaCols, guiaBase, etiqueta].forEach(el => { el.hidden = true; el.setAttribute('aria-hidden', 'true'); pagina.appendChild(el); });

  const textoEtiqueta = () => {
    const w = window.innerWidth;
    const bp = w >= 1440 ? ['Desktop', 12, 24, 'auto'] : w >= 1024 ? ['Laptop', 12, 24, 64] : w >= 600 ? ['Tablet', 8, 24, 40] : ['Móvil', 4, 16, 24];
    etiqueta.textContent = `${bp[0]} · ${w}px · ${bp[1]} col · medianil ${bp[2]} · margen ${bp[3]} · línea base 8`;
  };
  const actualizarEtiqueta = () => { etiqueta.hidden = guiaCols.hidden && guiaBase.hidden; textoEtiqueta(); };
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'g') guiaCols.hidden = !guiaCols.hidden;
    else if (k === 'b') guiaBase.hidden = !guiaBase.hidden;
    else return;
    actualizarEtiqueta();
  });
  window.addEventListener('resize', textoEtiqueta);
  if (new URLSearchParams(location.search).has('reticula')) { guiaCols.hidden = false; guiaBase.hidden = false; actualizarEtiqueta(); }
})();
