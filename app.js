// --- ELEMENTOS DEL DOM ---
const menuItems = document.querySelectorAll('#menu a');
const boxInput = document.getElementById('boxInput');
const tecladoBtns = document.querySelectorAll('#tecladoTV button');
const filtroBtns = document.querySelectorAll('#filtros button');
const buscador = document.getElementById('buscador');
const vistaPreview = document.getElementById('vistaPreview');
const vistaBuscador = document.getElementById('vistaBuscador');
const vistaFavoritos = document.getElementById('vistaFavoritos');
const listaContenedor = document.getElementById('lista');
const listaFavoritosContenedor = document.getElementById('listaFavoritos');

// --- VARIABLES DE NAVEGACIÓN ---
let zona = 'menu', mPos = 0, tPos = 0, fPos = 0, lPos = 0, favPos = 0;
let modoActual = 'preview'; // 'preview', 'buscador', 'favoritos'
let categoriaActual = 'todo';

// --- GUARDAR TEXTO ORIGINAL DE CADA ITEM ---
document.querySelectorAll('#lista .item').forEach(item => {
  if (!item.dataset.nombreOriginal) {
    item.dataset.nombreOriginal = item.textContent.trim();
  }
});

// --- MÓDULO DE FAVORITOS (localStorage) ---
let misFavoritos = JSON.parse(localStorage.getItem('visiontv_favs')) || [];

function guardarFavoritos() {
  localStorage.setItem('visiontv_favs', JSON.stringify(misFavoritos));
}

function toggleFavorito(id) {
  const index = misFavoritos.indexOf(id);
  if (index === -1) {
    misFavoritos.push(id);
  } else {
    misFavoritos.splice(index, 1);
  }
  guardarFavoritos();
  actualizarIconosFavoritos();
  if (modoActual === 'favoritos') {
    cargarVistaFavoritos();
  }
}

function actualizarIconosFavoritos() {
  document.querySelectorAll('#lista .item').forEach(item => {
    const id = item.dataset.id;
    const esFav = misFavoritos.includes(id);
    const nombreBase = item.dataset.nombreOriginal;
    
    item.textContent = esFav ? `${nombreBase} ⭐` : nombreBase;
  });
}

function cargarVistaFavoritos() {
  listaFavoritosContenedor.innerHTML = '';
  const itemsOriginales = document.querySelectorAll('#lista .item');
  let contador = 0;

  itemsOriginales.forEach(item => {
    if (misFavoritos.includes(item.dataset.id)) {
      const clon = item.cloneNode(true);
      clon.classList.remove('foco', 'activo');
      listaFavoritosContenedor.appendChild(clon);
      contador++;
    }
  });

  if (contador === 0) {
    listaFavoritosContenedor.innerHTML = '<p style="color:#888; padding:10px;">No tienes elementos guardados en Favoritos.</p>';
  }

  // Ajustar posición si la lista cambia
  const favsVisibles = getFavVisibles();
  if (favPos >= favsVisibles.length) {
    favPos = Math.max(0, favsVisibles.length - 1);
  }
}

// --- BÚSQUEDA Y FILTRADO ---
const getVisibles = () => Array.from(document.querySelectorAll('#lista .item')).filter(el => el.style.display !== 'none');
const getFavVisibles = () => Array.from(document.querySelectorAll('#listaFavoritos .item'));

function getTextoLimpio(el) {
  const texto = el.dataset.nombreOriginal || el.textContent;
  return texto.replace(/^[^\wáéíóúñ]+/i, '').replace(' ⭐', '').trim().toLowerCase();
}

function filtrarResultados() {
  const query = buscador.value.toLowerCase().trim();
  const todosLosItems = Array.from(document.querySelectorAll('#lista .item'));

  todosLosItems.forEach(item => {
    const texto = getTextoLimpio(item);
    const catItem = item.dataset.cat;
    const coincideTexto = texto.includes(query);
    const coincideCategoria = (categoriaActual === 'todo' || catItem === categoriaActual);

    item.style.display = (coincideTexto && coincideCategoria) ? 'flex' : 'none';
  });

  const itemsVisibles = getVisibles();
  itemsVisibles.sort((a, b) => {
    const textoA = getTextoLimpio(a);
    const textoB = getTextoLimpio(b);

    if (query !== '') {
      const empiezaA = textoA.startsWith(query);
      const empiezaB = textoB.startsWith(query);
      if (empiezaA && !empiezaB) return -1;
      if (!empiezaA && empiezaB) return 1;
    }
    return textoA.localeCompare(textoB, 'es', { sensitivity: 'base' });
  });

  itemsVisibles.forEach(item => listaContenedor.appendChild(item));

  if (lPos >= getVisibles().length) {
    lPos = Math.max(0, getVisibles().length - 1);
  }
}

buscador.addEventListener('input', filtrarResultados);

// --- NAVEGACIÓN Y VISTAS ---
function quitarFocos() {
  document.querySelectorAll('.foco').forEach(e => e.classList.remove('foco'));
}

function cambiarVista(vista) {
  modoActual = vista;
  vistaPreview.style.display = 'none';
  vistaBuscador.style.display = 'none';
  vistaFavoritos.style.display = 'none';

  if (vista === 'buscador') {
    vistaBuscador.style.display = 'flex';
    zona = 'input';
    filtrarResultados();
  } else if (vista === 'favoritos') {
    vistaFavoritos.style.display = 'flex';
    cargarVistaFavoritos();
    zona = 'favoritos';
    favPos = 0;
  } else {
    vistaPreview.style.display = 'block';
    zona = 'menu';
  }
  enfocar();
}

function enfocar() {
  quitarFocos();
  if (zona === 'menu') {
    menuItems[mPos]?.classList.add('foco');
    if (modoActual === 'preview') {
      const imgUrl = menuItems[mPos]?.getAttribute('data-img') || 'hero.jpg';
      vistaPreview.style.backgroundImage = `url('${imgUrl}')`;
    }
    menuItems[mPos]?.scrollIntoView({ block: 'nearest' });
  }
  if (zona === 'input') {
    boxInput.classList.add('foco');
    boxInput.scrollIntoView({ block: 'nearest' });
  }
  if (zona === 'teclado') {
    tecladoBtns[tPos]?.classList.add('foco');
  }
  if (zona === 'filtros') {
    filtroBtns[fPos]?.classList.add('foco');
  }
  if (zona === 'lista') {
    const visibles = getVisibles();
    if (visibles.length > 0 && visibles[lPos]) {
      visibles[lPos].classList.add('foco');
      visibles[lPos].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  if (zona === 'favoritos') {
    const favs = getFavVisibles();
    if (favs.length > 0 && favs[favPos]) {
      favs[favPos].classList.add('foco');
      favs[favPos].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

function seleccionar() {
  document.querySelectorAll('.activo').forEach(e => e.classList.remove('activo'));

  if (zona === 'menu') {
    menuItems[mPos]?.classList.add('activo');
    const textoOpcion = menuItems[mPos]?.textContent.toLowerCase();

    if (textoOpcion.includes('buscar')) {
      cambiarVista('buscador');
    } else if (textoOpcion.includes('favoritos')) {
      cambiarVista('favoritos');
    } else {
      cambiarVista('preview');
    }
  }

  if (zona === 'input') buscador.focus();

  if (zona === 'filtros') {
    filtroBtns[fPos]?.classList.add('activo');
    categoriaActual = filtroBtns[fPos].dataset.cat;
    filtrarResultados();
  }

  if (zona === 'lista') {
    const visibles = getVisibles();
    if (visibles[lPos]) {
      const id = visibles[lPos].dataset.id;
      toggleFavorito(id);
    }
  }

  if (zona === 'favoritos') {
    const favs = getFavVisibles();
    if (favs.length > 0 && favs[favPos]) {
      const id = favs[favPos].dataset.id;
      toggleFavorito(id); // Al dar enter en favoritos se remueve y refresca la lista
    }
  }

  if (zona === 'teclado') {
    const tecla = tecladoBtns[tPos].textContent;
    if (tecla === '⌫') buscador.value = buscador.value.slice(0, -1);
    else if (tecla === 'ESPACIO') buscador.value += ' ';
    else buscador.value += tecla;
    filtrarResultados();
  }
}

// --- CONTROLES DE TECLADO / SMART TV ---
document.addEventListener('keydown', e => {
  if (['Escape', 'Backspace'].includes(e.key) || [10009, 461].includes(e.keyCode)) {
    if (modoActual !== 'preview' && document.activeElement !== buscador) {
      cambiarVista('preview');
      return;
    }
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

  if (e.key === 'ArrowDown') {
    if (zona === 'menu') mPos = Math.min(mPos + 1, menuItems.length - 1);
    else if (zona === 'input') { zona = 'teclado'; tPos = 0; }
    else if (zona === 'teclado') { if (tPos < 20) tPos += 10; else { zona = 'filtros'; fPos = 0; } }
    else if (zona === 'filtros') { if (getVisibles().length > 0) { zona = 'lista'; lPos = 0; } }
    else if (zona === 'lista') lPos = Math.min(lPos + 1, getVisibles().length - 1);
    else if (zona === 'favoritos') favPos = Math.min(favPos + 1, getFavVisibles().length - 1);
  }

  if (e.key === 'ArrowUp') {
    if (zona === 'menu') mPos = Math.max(mPos - 1, 0);
    else if (zona === 'teclado') { if (tPos >= 10) tPos -= 10; else zona = 'input'; }
    else if (zona === 'filtros') { zona = 'teclado'; tPos = 20; }
    else if (zona === 'lista') { if (lPos === 0) zona = 'filtros'; else lPos--; }
    else if (zona === 'favoritos') favPos = Math.max(favPos - 1, 0);
    else if (zona === 'input') { cambiarVista('preview'); }
  }

  if (e.key === 'ArrowRight') {
    if (zona === 'menu' && modoActual === 'buscador') zona = 'input';
    else if (zona === 'menu' && modoActual === 'favoritos') zona = 'favoritos';
    else if (zona === 'teclado') tPos = Math.min(tPos + 1, tecladoBtns.length - 1);
    else if (zona === 'filtros') fPos = Math.min(fPos + 1, filtroBtns.length - 1);
  }

  if (e.key === 'ArrowLeft') {
    if (zona === 'teclado') tPos = Math.max(tPos - 1, 0);
    else if (zona === 'filtros') { if (fPos === 0) cambiarVista('preview'); else fPos--; }
    else if (zona === 'lista' || zona === 'input' || zona === 'favoritos') cambiarVista('preview');
  }

  if (e.key === 'Enter') seleccionar();

  enfocar();
});

// Inicialización
actualizarIconosFavoritos();
filtrarResultados();
enfocar();
