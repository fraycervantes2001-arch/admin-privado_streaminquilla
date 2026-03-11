document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ventaForm");
  const tipoSelect = document.getElementById("tipo");
  const perfilGroup = document.getElementById("perfilGroup");
  const previewBtn = document.getElementById("previewBtn");
  const copyBtn = document.getElementById("copyBtn");
  const ticketPreview = document.getElementById("ticketPreview");
  const toast = document.getElementById("toast");

  const confirmModal = document.getElementById("confirmModal");
  const confirmSend = document.getElementById("confirmSend");
  const cancelSend = document.getElementById("cancelSend");

  let pendingWhatsAppUrl = "";

  const EMOJIS = {
  ticket: "🎫",
  cliente: "👤",
  producto: "📺",
  tipo: "📌",
  precio: "💰",
  fecha: "📅",
  vence: "⌛",
  acceso: "🔐",
  correo: "📩",
  contrasena: "🔑",
  check: "✅",
  fuego: "🔥"
 };

  const togglePerfil = () => {
    if (tipoSelect.value === "Perfil") {
      perfilGroup.style.display = "flex";
    } else {
      perfilGroup.style.display = "none";
    }
  };

  const mostrarToast = (mensaje, tipo = "success") => {
    toast.textContent = mensaje;
    toast.className = `toast show ${tipo}`;

    setTimeout(() => {
      toast.className = "toast";
    }, 2600);
  };

  const generarTicket = () => {
    const nombre = document.getElementById("nombre").value.trim() || "No especificado";
    const producto = document.getElementById("producto").value;
    const tipo = tipoSelect.value;
    const precio = document.getElementById("precio").value || "0";
    const correo = document.getElementById("correo").value.trim() || "No especificado";
    const contrasena = document.getElementById("contrasena").value.trim() || "No especificada";
    const perfil = document.getElementById("perfil").value.trim();

    const fecha = new Date();
    const fechaActual = fecha.toLocaleDateString("es-CO");

    const precioNumero = parseInt(precio, 10) || 0;
    const precioFormateado = precioNumero.toLocaleString("es-CO");

    const fechaVencimiento = new Date(fecha);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    const fechaVenceFormateada = fechaVencimiento.toLocaleDateString("es-CO");

    let datosAcceso = `${EMOJIS.acceso} DATOS DE ACCESO
${EMOJIS.correo} Correo: ${correo}
${EMOJIS.contrasena} Contraseña: ${contrasena}
`;

    if (tipo === "Perfil") {
      datosAcceso += `${EMOJIS.cliente} Perfil: ${perfil || "No especificado"}\n`;
    }

    return `${EMOJIS.ticket} TICKET DE VENTA - STREAMING QUILLA
---------------------------------------
${EMOJIS.cliente} Cliente: ${nombre}
${EMOJIS.producto} Producto: ${producto}
${EMOJIS.tipo} Tipo: ${tipo}
${EMOJIS.precio} Precio: $${precioFormateado} COP
${EMOJIS.fecha} Fecha: ${fechaActual}
${EMOJIS.vence} Fecha Vencimiento: ${fechaVenceFormateada}
---------------------------------------
${datosAcceso}
---------------------------------------
${EMOJIS.check} Servicio Activado con éxito
${EMOJIS.fuego} Gracias por tu compra`;
  };

  const actualizarVistaPrevia = () => {
    ticketPreview.textContent = generarTicket();
  };

  const obtenerNumeroFormateado = () => {
    let numero = document.getElementById("numero").value.trim();
    numero = numero.replace(/\D/g, "");

    if (numero.length === 10) {
      numero = "57" + numero;
    }

    return numero;
  };

  const abrirModal = () => {
    confirmModal.classList.add("active");
  };

  const cerrarModal = () => {
    confirmModal.classList.remove("active");
  };

  togglePerfil();
  actualizarVistaPrevia();

  tipoSelect.addEventListener("change", () => {
    togglePerfil();
    actualizarVistaPrevia();
  });

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input", actualizarVistaPrevia);
    input.addEventListener("change", actualizarVistaPrevia);
  });

  previewBtn.addEventListener("click", () => {
    actualizarVistaPrevia();
    mostrarToast("Vista previa actualizada");
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(generarTicket());
      mostrarToast("Ticket copiado al portapapeles");
    } catch (error) {
      mostrarToast("No se pudo copiar el ticket", "error");
    }
  });

  function construirWhatsAppUrl(numero, mensaje) {

    const textoNormalizado = mensaje.replace(/\n/g, "\r\n");

    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

    if (isMobile) {
        return `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(textoNormalizado)}`;
    } else {
        return `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(textoNormalizado)}`;
    }

}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const mensaje = generarTicket();
  const numero = obtenerNumeroFormateado();

  if (!numero) {
    mostrarToast("Ingresa un número de WhatsApp válido", "error");
    return;
  }

  pendingWhatsAppUrl = construirWhatsAppUrl(numero, mensaje);
  abrirModal();
});

  confirmSend.addEventListener("click", () => {
    if (pendingWhatsAppUrl) {
      window.open(pendingWhatsAppUrl, "_blank");
      mostrarToast("Ticket listo para enviar por WhatsApp");
      form.reset();
      togglePerfil();
      actualizarVistaPrevia();
      pendingWhatsAppUrl = "";
      cerrarModal();
    }
  });

  cancelSend.addEventListener("click", cerrarModal);

  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
      cerrarModal();
    }
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      console.log("Service Worker registrado");
    } catch (error) {
      console.error("Error registrando Service Worker:", error);
    }
  });
}