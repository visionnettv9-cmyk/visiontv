document.addEventListener("DOMContentLoaded", () => {
  // Elementos DOM
  const menuLinks = Array.from(document.querySelectorAll("#menu a"));
  const vistaBuscador = document.getElementById("vistaBuscador");
  const vistaFavoritos = document.getElementById("vistaFavoritos");
  const vistaPreview = document.getElementById("vistaPreview");
  const listaFavoritosContenedor = document.getElementById("listaFavoritos");
  const itemsLista = Array.from(document.querySelectorAll("#lista .item"));
  const buscadorInput = document.getElementById("buscador");
  const botonesTeclado = Array.from(document.querySelectorAll("#tecladoTV button"));
  const botonesFiltro = Array.from(document.querySelectorAll("#filtros button"));

  // Estado de Favoritos desde localStorage
  let misFavoritos = JSON.parse(localStorage.getItem("visiontv_favs")) || [];

  // Variables de Control y Navegación
  let zonaActual = "menu"; // "menu", "teclado", "filtros", "lista", "favoritos"
  let posMenu = 0;
  let posTeclado = 0;
  let posFiltro = 0;
  let posLista = 0;
  let posFav = 0;

  // Inicializar nombres base en la lista principal
  itemsLista.forEach(item => {
    const id = item.dataset.id;
    if (!item.dataset.nombreBase) {
      item.dataset.nombreBase = item.textContent.replace(' ⭐', '').trim();
    }
    actualizarTextoItem(item, id);

    item.addEventListener("click", () => {
      toggleFavorito(id);
    });
  });

  // --- NAVEGACIÓN Y CAMBIO DE VISTAS ---
  function seleccionarMenu(index) {
    menuLinks.forEach(l => l.classList.remove("activo"));
    posMenu = index;
    const link = menuLinks[posMenu];
    if (link) {
      link.classList.add("activo");
      const texto = link.textContent.trim().toLowerCase();

      if (texto.includes("favoritos")) {
        vistaBuscador.style.display = "none";
        vistaPreview.style.display = "none";
        vistaFavoritos.style.display = "block";
        cargarVistaFavoritos();
      } else if (texto.includes("buscar")) {
        vistaFavoritos.style.display = "none";
        vistaPreview.style.display = "block";
        vistaBuscador.style.display = "block";
      } else {
        vistaFavoritos.style.display = "none";
        vistaBuscador.style.display = "none";
        vistaPreview.style.display = "block";
      }
    }
  }

  menuLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      zonaActual = "menu";
      seleccionarMenu(index);
      actualizarFocoVisual();
    });
  });

  // --- BUSCADOR Y FILTROS ---
  botonesTeclado.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      ejecutarTecla(btn.textContent.trim());
    });
  });

  function ejecutarTecla(valor) {
    if (valor === "⌫") {
      buscadorInput.value = buscadorInput.value.slice(0, -1);
    } else if (valor === "ESPACIO") {
      buscadorInput.value += " ";
    } else {
      buscadorInput.value += valor;
    }
    filtrarBusqueda();
  }

  botonesFiltro.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      botonesFiltro.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      filtrarBusqueda();
    });
  });

  function filtrarBusqueda() {
    const texto = buscadorInput.value.toLowerCase().trim();
    const filtroActivo = document.querySelector("#filtros button.activo")?.dataset.cat || "todo";

    itemsLista.forEach(item => {
      const nombre = (item.dataset.nombreBase || item.textContent).toLowerCase();
      const cat = item.dataset.cat;
      const coincideTexto = nombre.includes(texto);
      const coincideCat = (filtroActivo === "todo" || cat === filtroActivo);

      item.style.display = (coincideTexto && coincideCat) ? "block" : "none";
    });
  }

  function getItemsVisibles() {
    return itemsLista.filter(item => item.style.display !== "none");
  }

  function getFavsVisibles() {
    return Array.from(listaFavoritosContenedor.querySelectorAll(".item"));
  }

  // --- MANEJO DE FAVORITOS ---
  function toggleFavorito(id) {
    if (misFavoritos.includes(id)) {
      misFavoritos = misFavoritos.filter(favId => favId !== id);
    } else {
      misFavoritos.push(id);
    }
    localStorage.setItem("visiontv_favs", JSON.stringify(misFavoritos));

    itemsLista.forEach(item => {
      if (item.dataset.id === id) {
        actualizarTextoItem(item, id);
      }
    });

    if (vistaFavoritos.style.display === "block") {
      cargarVistaFavoritos();
    }
  }

  function actualizarTextoItem(item, id) {
    const nombre = item.dataset.nombreBase;
    item.textContent = misFavoritos.includes(id) ? `${nombre} ⭐` : nombre;
  }

  function cargarVistaFavoritos() {
    listaFavoritosContenedor.innerHTML = '';
    let guardados = 0;

    misFavoritos.forEach(id => {
      const itemOriginal = document.querySelector(`#lista .item[data-id="${id}"]`);
      if (itemOriginal) {
        const nombre = itemOriginal.dataset.nombreBase;
        const clon = document.createElement('div');
        clon.className = 'item';
        clon.dataset.id = id;
        clon.dataset.cat = itemOriginal.dataset.cat;
        clon.dataset.nombreBase = nombre;
        clon.textContent = `${nombre} ⭐`;

        clon.addEventListener("click", () => {
          toggleFavorito(id);
        });

        listaFavoritosContenedor.appendChild(clon);
        guardados++;
      }
    });

    if (guardados === 0) {
      listaFavoritosContenedor.innerHTML = '<p style="color:#888; padding:15px;">No tienes elementos guardados en favoritos.</p>';
    }
  }

  // --- CONTROL DE TECLADO / FLECHAS DEL CONTROL REMOTO ---
  document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(key)) {
      e.preventDefault(); // Evitar scroll de pantalla
    }

    if (key === "ArrowUp") moverArriba();
    else if (key === "ArrowDown") moverAbajo();
    else if (key === "ArrowLeft") moverIzquierda();
    else if (key === "ArrowRight") moverDerecha();
    else if (key === "Enter") presionarEnter();

    actualizarFocoVisual();
  });

  function moverArriba() {
    if (zonaActual === "menu") {
      if (posMenu > 0) posMenu--;
      seleccionarMenu(posMenu);
    } else if (zonaActual === "teclado") {
      if (posTeclado >= 10) posTeclado -= 10;
    } else if (zonaActual === "filtros") {
      zonaActual = "teclado";
      posTeclado = 20; // Ir a la última fila del teclado
    } else if (zonaActual === "lista") {
      if (posLista > 0) {
        posLista--;
      } else {
        zonaActual = "filtros";
      }
    } else if (zonaActual === "favoritos") {
      if (posFav > 0) posFav--;
    }
  }

  function moverAbajo() {
    if (zonaActual === "menu") {
      if (posMenu < menuLinks.length - 1) posMenu++;
      seleccionarMenu(posMenu);
    } else if (zonaActual === "teclado") {
      if (posTeclado + 10 < botonesTeclado.length) {
        posTeclado += 10;
      } else {
        zonaActual = "filtros";
        posFiltro = 0;
      }
    } else if (zonaActual === "filtros") {
      const visibles = getItemsVisibles();
      if (visibles.length > 0) {
        zonaActual = "lista";
        posLista = 0;
      }
    } else if (zonaActual === "lista") {
      const visibles = getItemsVisibles();
      if (posLista < visibles.length - 1) posLista++;
    } else if (zonaActual === "favoritos") {
      const favs = getFavsVisibles();
      if (posFav < favs.length - 1) posFav++;
    }
  }

  function moverIzquierda() {
    if (zonaActual === "teclado") {
      if (posTeclado % 10 > 0) posTeclado--;
      else { zonaActual = "menu"; }
    } else if (zonaActual === "filtros") {
      if (posFiltro > 0) posFiltro--;
      else { zonaActual = "menu"; }
    } else if (zonaActual === "lista" || zonaActual === "favoritos") {
      zonaActual = "menu";
    }
  }

  function moverDerecha() {
    if (zonaActual === "menu") {
      const texto = menuLinks[posMenu].textContent.trim().toLowerCase();
      if (texto.includes("favoritos")) {
        const favs = getFavsVisibles();
        if (favs.length > 0) {
          zonaActual = "favoritos";
          posFav = 0;
        }
      } else if (texto.includes("buscar")) {
        zonaActual = "teclado";
        posTeclado = 0;
      }
    } else if (zonaActual === "teclado") {
      if ((posTeclado + 1) % 10 !== 0 && posTeclado < botonesTeclado.length - 1) posTeclado++;
    } else if (zonaActual === "filtros") {
      if (posFiltro < botonesFiltro.length - 1) posFiltro++;
    }
  }

  function presionarEnter() {
    if (zonaActual === "menu") {
      seleccionarMenu(posMenu);
    } else if (zonaActual === "teclado") {
      const btn = botonesTeclado[posTeclado];
      if (btn) ejecutarTecla(btn.textContent.trim());
    } else if (zonaActual === "filtros") {
      const btn = botonesFiltro[posFiltro];
      if (btn) btn.click();
    } else if (zonaActual === "lista") {
      const visibles = getItemsVisibles();
      const item = visibles[posLista];
      if (item) toggleFavorito(item.dataset.id);
    } else if (zonaActual === "favoritos") {
      const favs = getFavsVisibles();
      const item = favs[posFav];
      if (item) toggleFavorito(item.dataset.id);
    }
  }

  // APLICAR RESALTADO DEL ELEMENTO SELECCIONADO (FOCO)
  function actualizarFocoVisual() {
    document.querySelectorAll(".foco").forEach(el => el.classList.remove("foco"));

    if (zonaActual === "menu") {
      menuLinks[posMenu]?.classList.add("foco");
    } else if (zonaActual === "teclado") {
      botonesTeclado[posTeclado]?.classList.add("foco");
    } else if (zonaActual === "filtros") {
      botonesFiltro[posFiltro]?.classList.add("foco");
    } else if (zonaActual === "lista") {
      const visibles = getItemsVisibles();
      visibles[posLista]?.classList.add("foco");
    } else if (zonaActual === "favoritos") {
      const favs = getFavsVisibles();
      favs[posFav]?.classList.add("foco");
    }
  }

  // Foco inicial por defecto
  seleccionarMenu(0);
  actualizarFocoVisual();
});
