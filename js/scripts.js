document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector(".elementor-form");
  const cantidadInput = document.getElementById("form-field-cantidad");
  const tituloDinamico = document.getElementById("tituloDinamico");
  const customSubmitBtn = document.getElementById("custom-submit");

  const cardInput = document.getElementById("card-number");
  const holderInput = document.getElementById("card-holder");
  const expiryInput = document.getElementById("expiry");
  const cvvInput = document.getElementById("cvc");
  const paymentMethodSelect = document.getElementById("payment-method");
  const statusMessage = document.getElementById("status-message");
  const msiContainer = document.querySelector(".msi-container");

  // Elementos para los mensajes de error individuales
  const cardError = document.getElementById("card-error");
  const holderError = document.getElementById("holder-error");
  const expiryError = document.getElementById("expiry-error");
  const cvcError = document.getElementById("cvc-error");

  // Mostrar/ocultar contenedor MSI según el método seleccionado
  paymentMethodSelect.addEventListener("change", function() {
    if (this.value === "msi") {
      msiContainer.classList.remove("hidden");
    } else {
      msiContainer.classList.add("hidden");
    }
    validateForm();
  });

  // Validación general del formulario
  function validateForm() {
    // Validar monto
    const montoVal = cantidadInput.value.trim();
    const montoValid = /^[0-9]+(\.[0-9]+)?$/.test(montoVal);

    // Validar número de tarjeta (16 a 19 dígitos)
    const cardVal = cardInput.value.replace(/\s+/g, "");
    const cardValid = /^[0-9]{16,19}$/.test(cardVal);

    // Validar titular (solo letras y espacios)
    const holderVal = holderInput.value.trim();
    const holderValid = /^[A-Za-zÀ-ÿ\s]+$/.test(holderVal) && holderVal !== "";

    // Validar fecha de vencimiento en formato MM/YY (solo mes 1..12, sin restricción de año)
    const expiryVal = expiryInput.value.trim();
    let expiryValid = false;
    if (/^\d{2}\/\d{2}$/.test(expiryVal)) {
      const [mm, yy] = expiryVal.split("/");
      const month = parseInt(mm, 10);
      // Aceptamos cualquier año, solo validamos el mes
      if (month >= 1 && month <= 12) {
        expiryValid = true;
      }
    }

    // Validar CVV (3 dígitos)
    const cvvVal = cvvInput.value.trim();
    const cvvValid = /^[0-9]{3}$/.test(cvvVal);

    // Validar que se haya seleccionado un método de pago
    const paymentMethodValid = paymentMethodSelect.value !== "";

    // Validar que se haya elegido un radio en MSI si se seleccionó "msi"
    let msiValid = true;
    if (paymentMethodSelect.value === "msi") {
      msiValid = document.querySelector('input[name="msi"]:checked') !== null;
    }

    // Actualizar mensajes de error en cada campo
    updateErrorMessages({ cardValid, holderValid, expiryValid, cvvValid });

    // Validación final
    const isValid = (
      montoValid &&
      cardValid &&
      holderValid &&
      expiryValid &&
      cvvValid &&
      paymentMethodValid &&
      msiValid
    );
    customSubmitBtn.disabled = !isValid;
    return isValid;
  }

  // Mostrar/ocultar mensajes de error individualmente
  function updateErrorMessages({ cardValid, holderValid, expiryValid, cvvValid }) {
    cardError.style.display = (!cardValid && cardInput.value.trim() !== "") ? "block" : "none";
    holderError.style.display = (!holderValid && holderInput.value.trim() !== "") ? "block" : "none";
    expiryError.style.display = (!expiryValid && expiryInput.value.trim() !== "") ? "block" : "none";
    cvcError.style.display = (!cvvValid && cvvInput.value.trim() !== "") ? "block" : "none";
  }

  // Actualizar dinámicamente el campo "monto"
  cantidadInput.addEventListener("input", function() {
    // Solo permitir números y punto decimal
    this.value = this.value.replace(/[^0-9.]/g, "");
    validateForm();
    const value = this.value.trim();
    tituloDinamico.textContent = value === "" ? "$0 MXN" : `$${value} MXN`;
  });

  // Formatear número de tarjeta en grupos de 4
  cardInput.addEventListener("input", function() {
    let digits = this.value.replace(/\D/g, "");
    let formatted = digits.match(/.{1,4}/g);
    this.value = formatted ? formatted.join(" ") : "";
    validateForm();
  });

  // Solo letras y espacios para el titular
  holderInput.addEventListener("input", function() {
    this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    validateForm();
  });

  // Formatear fecha de vencimiento a MM/YY
  expiryInput.addEventListener("input", function() {
    let val = this.value.replace(/\D/g, "");
    if (val.length > 4) {
      val = val.slice(0, 4);
    }
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    this.value = val;
    validateForm();
  });

  // Solo 3 dígitos para el CVV
  cvvInput.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 3);
    validateForm();
  });

  // Botón "Pagar"
  customSubmitBtn.addEventListener("click", function(e) {
    e.preventDefault();
    if (!validateForm()) {
      mostrarMensaje("Llena los campos", "error");
      return;
    }
    enviarFormulario();
  });

  // Enviar formulario en submit (por si presionan Enter)
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validateForm()) {
      mostrarMensaje("Llena los campos", "error");
      return;
    }
    enviarFormulario();
  });

  // Función para enviar el formulario (fetch a mail.php)
  function enviarFormulario() {
    // Agregar clase para animar el botón (spinner)
    customSubmitBtn.classList.add("loading");
    mostrarMensaje("Enviando...", "loading");

    const formData = new FormData(form);
    formData.append("payment-method", paymentMethodSelect.value);

    fetch('mail.php', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        customSubmitBtn.classList.remove("loading");
        if (data.includes("correctamente")) {
          // Cambiar texto del botón a "Pagado con éxito"
          customSubmitBtn.textContent = "Pagado con éxito";
          mostrarMensaje("Pagado con éxito", "success");
          // Tras 3 segundos, reiniciar el formulario y volver al estado normal del botón
          setTimeout(() => {
            form.reset();
            tituloDinamico.textContent = "$0 MXN";
            customSubmitBtn.textContent = "Pagar";
            // Forzar método de pago vacío y ocultar contenedor MSI
            paymentMethodSelect.value = "";
            msiContainer.classList.add("hidden");
            validateForm();
          }, 3000);
        } else {
          mostrarMensaje("Error: " + data, "error");
          customSubmitBtn.textContent = "Pagar";
        }
      })
      .catch(error => {
        customSubmitBtn.classList.remove("loading");
        console.error('Error:', error);
        mostrarMensaje("Error en el envío del pago.", "error");
        customSubmitBtn.textContent = "Pagar";
      });
  }

  // Mostrar mensajes de estado en la pantalla
  function mostrarMensaje(texto, tipo) {
    statusMessage.textContent = texto;
    statusMessage.className = "status-message " + tipo;
    setTimeout(() => {
      statusMessage.className = "status-message";
      statusMessage.textContent = "";
    }, 5000);
  }
});
