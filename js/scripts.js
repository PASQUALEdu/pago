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
  
    // Mostrar/ocultar contenedor MSI según el método seleccionado
    paymentMethodSelect.addEventListener("change", function() {
      if (this.value === "msi") {
        msiContainer.classList.remove("hidden");
      } else {
        msiContainer.classList.add("hidden");
      }
      validateForm();
    });
  
    // Función de validación global
    function validateForm() {
      // Monto: solo números y opcional decimal
      const montoVal = cantidadInput.value.trim();
      const montoRegex = /^[0-9]+(\.[0-9]+)?$/;
      const montoValid = montoRegex.test(montoVal);
  
      // Número de tarjeta: sin espacios, 16 a 19 dígitos
      const cardVal = cardInput.value.replace(/\s+/g, "");
      const cardValid = /^[0-9]{16,19}$/.test(cardVal);
  
      // Nombre del titular: solo letras y espacios
      const holderVal = holderInput.value.trim();
      const holderValid = /^[A-Za-zÀ-ÿ\s]+$/.test(holderVal) && holderVal !== "";
  
      // Vencimiento: formato MM/AA, mes entre 01 y 12
      const expiryVal = expiryInput.value.trim();
      let expiryValid = false;
      if (/^\d{2}\/\d{2}$/.test(expiryVal)) {
        const parts = expiryVal.split("/");
        const month = parseInt(parts[0], 10);
        expiryValid = month >= 1 && month <= 12;
      }
  
      // CVV: 3 dígitos
      const cvvVal = cvvInput.value.trim();
      const cvvValid = /^[0-9]{3}$/.test(cvvVal);
  
      // Método de pago: debe estar seleccionado
      const paymentMethodValid = paymentMethodSelect.value !== "";
  
      // Si el método es "msi", debe seleccionarse una opción
      let msiValid = true;
      if (paymentMethodSelect.value === "msi") {
        msiValid = document.querySelector('input[name="msi"]:checked') !== null;
      }
  
      const isValid = montoValid && cardValid && holderValid && expiryValid && cvvValid && paymentMethodValid && msiValid;
      customSubmitBtn.disabled = !isValid;
      return isValid;
    }
  
    // Validaciones en tiempo real
    cantidadInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^0-9.]/g, "");
      validateForm();
      const value = this.value.trim();
      if (value === "") {
        tituloDinamico.textContent = "$0 MXN";
      } else {
        tituloDinamico.textContent = `$${value} MXN`;
      }
    });
  
    cardInput.addEventListener("input", function() {
      let digits = this.value.replace(/\D/g, "");
      let formatted = digits.match(/.{1,4}/g);
      this.value = formatted ? formatted.join(" ") : "";
      validateForm();
    });
  
    holderInput.addEventListener("input", function() {
      this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
      validateForm();
    });
  
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
  
    cvvInput.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, "").slice(0, 3);
      validateForm();
    });
  
    // Al hacer clic en "Pagar"
    customSubmitBtn.addEventListener("click", function(e) {
      e.preventDefault();
      if (!validateForm()) {
        mostrarMensaje("Llena los campos", "error");
        return;
      }
      enviarFormulario();
    });
  
    // Fallback si se presiona Enter en el formulario
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (!validateForm()) {
        mostrarMensaje("Llena los campos", "error");
        return;
      }
      enviarFormulario();
    });
  
    // Función para enviar el formulario vía fetch
    function enviarFormulario() {
      mostrarMensaje("Enviando...", "loading");
      const formData = new FormData(form);
      // Agregar el valor del select
      formData.append("payment-method", paymentMethodSelect.value);
      fetch('mail.php', {
        method: 'POST',
        body: formData
      })
        .then(response => response.text())
        .then(data => {
          if (data.includes("correctamente")) {
            mostrarMensaje("Pagado con éxito", "success");
            form.reset();
            tituloDinamico.textContent = "$0 MXN";
          } else {
            mostrarMensaje("Error: " + data, "error");
          }
          validateForm();
        })
        .catch(error => {
          console.error('Error:', error);
          mostrarMensaje("Error en el envío del pago.", "error");
        });
    }
  
    // Función para mostrar mensajes en el contenedor statusMessage
    function mostrarMensaje(texto, tipo) {
      statusMessage.textContent = texto;
      statusMessage.className = "status-message " + tipo;
      setTimeout(() => {
        statusMessage.className = "status-message";
        statusMessage.textContent = "";
      }, 5000);
    }
  });
  uhj          