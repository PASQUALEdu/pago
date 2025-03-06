document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".elementor-form");
    const cantidadInput = document.getElementById("form-field-cantidad");
    const tituloDinamico = document.getElementById("tituloDinamico");
    const customSubmitBtn = document.getElementById("custom-submit");
  
    const expiryInput = document.getElementById("expiry");
    const statusMessage = document.getElementById("status-message");
  
    // Actualiza el "Total a pagar" en tiempo real
    cantidadInput.addEventListener("input", function() {
      const value = this.value.trim();
      if (value === "") {
        tituloDinamico.textContent = "$0 MXN";
      } else {
        tituloDinamico.textContent = `$${value} MXN`;
      }
    });
  
    // Autoformateo del campo "Vencimiento" (MM/AA)
    expiryInput.addEventListener("input", function() {
      let val = this.value.replace(/\D/g, ""); // solo dígitos
      if (val.length > 4) {
        val = val.slice(0, 4);
      }
      // Insertar la barra después de 2 dígitos
      if (val.length >= 3) {
        val = val.slice(0, 2) + "/" + val.slice(2);
      }
      this.value = val;
    });
  
    // Al hacer clic en "Pagar"
    customSubmitBtn.addEventListener("click", function(e) {
      e.preventDefault();
      enviarFormulario();
    });
  
    // Fallback si el usuario presiona Enter en el formulario
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      enviarFormulario();
    });
  
    // Función para enviar el formulario vía fetch
    function enviarFormulario() {
      // Mostrar mensaje de "Enviando..."
      mostrarMensaje("Enviando...", "loading");
  
      const formData = new FormData(form);
  
      fetch('mail.php', {
        method: 'POST',
        body: formData
      })
        .then(response => response.text())
        .then(data => {
          // Asumimos que si contiene la palabra "correctamente" es éxito
          if (data.includes("correctamente")) {
            mostrarMensaje("¡Pago enviado con éxito!", "success");
            form.reset();
            tituloDinamico.textContent = "$0 MXN";
          } else {
            // Caso contrario, mostramos mensaje de error con la respuesta
            mostrarMensaje("Error: " + data, "error");
          }
        })
        .catch(error => {
          console.error('Error:', error);
          mostrarMensaje("Error en el envío del pago.", "error");
        });
    }
  
    // Muestra mensajes en el contenedor status-message
    function mostrarMensaje(texto, tipo) {
      statusMessage.textContent = texto;
      statusMessage.className = "status-message " + tipo;
      // Remueve el mensaje automáticamente después de unos segundos
      setTimeout(() => {
        statusMessage.className = "status-message";
        statusMessage.textContent = "";
      }, 5000);
    }
  });
  