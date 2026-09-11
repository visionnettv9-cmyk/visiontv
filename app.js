document.addEventListener("DOMContentLoaded", () => {
  // Referencias del DOM
  const menuLinks = document.querySelectorAll("#menu a");
  const vistaBuscar = document.getElementById("vistaBuscar");
  const vistaFavoritos = document.getElementById("vistaFavoritos");
  const listaFavoritosContenedor = document.getElementById("listaFavoritos");
  const itemsLista = document.querySelectorAll("#lista .item");

  // Cargar lista de Favoritos guardados desde localStorage
  let misFavoritos = JSON.parse(localStorage.getItem("visiontv_favs")) || [];

  // Inicializar items de la lista principal
  itemsLista.forEach(item => {
    const id = item.dataset.id;
    if (!item.dataset.nombreBase) {
      item.dataset.nombreBase = item.textContent.replace(' ⭐', '').trim();
    }
    actualizarTextoItem(item, id);

    // Al hacer clic, agregar o quitar de Favoritos
    item.addEventListener("click", () => {
      toggleFavorito(id);
    });
  });

  // Cambiar entre secciones en el menú izquierdo
  menuLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const texto = link.textContent.trim().toLowerCase();

      if (texto.includes("favoritos")) {
        vistaBuscar.style.display = "none";
        vistaFavoritos.style.display = "block";
        cargarVistaFavoritos();
      } else if (texto.includes("buscar")) {
        vistaFavoritos.style.display = "none";
        vistaBuscar.style.display = "block";
      }
    });
  });

  // Agregar o quitar elemento de favoritos
  function toggleFavorito(id) {
    if (misFavoritos.includes(id)) {
      misFavoritos = misFavoritos.filter(favId => favId !== id);
    } else {
      misFavoritos.push(id);
    }
    localStorage.setItem("visiontv_favs", JSON.stringify(misFavoritos));

    // Actualizar texto del item en la lista principal
    itemsLista.forEach(item => {
      if (item.dataset.id === id) {
        actualizarTextoItem(item, id);
      }
    });

    // Si estamos en la pestaña de Favoritos, recargar la vista
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

  // Cargar de forma independiente todos los items guardados
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
