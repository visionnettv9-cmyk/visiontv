document.addEventListener("DOMContentLoaded", () => {
  // Elementos DOM
  const menuLinks = document.querySelectorAll("#menu a");
  const vistaBuscador = document.getElementById("vistaBuscador");
  const vistaFavoritos = document.getElementById("vistaFavoritos");
  const vistaPreview = document.getElementById("vistaPreview");
  const listaFavoritosContenedor = document.getElementById("listaFavoritos");
  const itemsLista = document.querySelectorAll("#lista .item");
  const buscadorInput = document.getElementById("buscador");

  // Estado de Favoritos desde localStorage
  let misFavoritos = JSON.parse(localStorage.getItem("visiontv_favs")) || [];

  // Inicializar nombres base e íconos de favoritos en la lista principal
  itemsLista.forEach(item => {
    const id = item.dataset.id;
    if (!item.dataset.nombreBase) {
      item.dataset.nombreBase = item.textContent.replace(' ⭐', '').trim();
    }
    actualizarTextoItem(item, id);

    // Click o selección de favorito
    item.addEventListener("click", () => {
      toggleFavorito(id);
    });
  });

  // NAVEGACIÓN DEL MENÚ IZQUIERDO
  menuLinks.forEach((link, index) => {
    if (index === 0) link.classList.add("activo"); // Activar 'Buscar' por defecto

    link.addEventListener("click", (e) => {
      e.preventDefault();
      menuLinks.forEach(l => l.classList.remove("activo"));
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
        // Para el resto de opciones del menú
        vistaFavoritos.style.display = "none";
        vistaBuscador.style.display = "none";
        vistaPreview.style.display = "block";
      }
    });
  });

  // TECLADO VIRTUAL EN PANTALLA
  const botonesTeclado = document.querySelectorAll("#tecladoTV button");
  botonesTeclado.forEach(btn => {
    btn.addEventListener("click", () => {
      const valor = btn.textContent.trim();
      if (valor === "⌫") {
        buscadorInput.value = buscadorInput.value.slice(0, -1);
      } else if (valor === "ESPACIO") {
        buscadorInput.value += " ";
      } else {
        buscadorInput.value += valor;
      }
      filtrarBusqueda();
    });
  });

  // FILTROS (Todo, Canales, Películas, Series)
  const botonesFiltro = document.querySelectorAll("#filtros button");
  botonesFiltro.forEach(btn => {
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

      if (coincideTexto && coincideCat) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  // AGREGAR / QUITAR FAVORITO
  function toggleFavorito(id) {
    if (misFavoritos.includes(id)) {
      misFavoritos = misFavoritos.filter(favId => favId !== id);
    } else {
      misFavoritos.push(id);
    }
    localStorage.setItem("visiontv_favs", JSON.stringify(misFavoritos));

    // Actualizar elemento en lista principal
    itemsLista.forEach(item => {
      if (item.dataset.id === id) {
        actualizarTextoItem(item, id);
      }
    });

    // Si está activa la vista de favoritos, actualizarla
    if (vistaFavoritos.style.display === "block") {
      cargarVistaFavoritos();
    }
  }

  function actualizarTextoItem(item, id) {
    const nombre = item.dataset.nombreBase;
    if (misFavoritos.includes(id)) {
      item.textContent = `${nombre} ⭐`;
    } else {
      item.textContent = nombre;
    }
  }

  // CARGAR LA VISTA DE FAVORITOS (Sin importar si están ocultos por búsqueda)
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
});
