# Activar CartaQR Pro en la nube
1. Crea un proyecto Supabase gratuito en https://supabase.com. No compartas contraseñas ni claves secretas.
2. En SQL Editor ejecuta schema.sql. Usa un proyecto nuevo y revisa las políticas antes de usar datos reales.
3. En Project Settings > API copia Project URL y anon/publishable key a cloud/config.js. Son claves públicas, NUNCA la service_role/secret.
4. En Authentication > URL Configuration, establece Site URL en https://juanmiiguel.github.io/cartaqr-pro/cloud/ y añade esa URL a los redirects autorizados.
5. En Storage verifica el bucket público menu-photos y el límite de 250 KB por archivo.
6. Accede a /cartaqr-pro/cloud/, crea una cuenta y confirma el email; añade restaurante, productos y fotografías; pulsa Guardar y publicar.
7. La carta pública usa /cartaqr-pro/menu/?r=slug. El QR apunta a esta dirección permanente. Puedes actualizar platos sin reimprimirlo.
8. Para uso real: validar alérgenos, revisar RGPD, política de privacidad, backups, límite de uso y monitorización de cuotas gratuitas. No hay Stripe ni suscripciones todavía.
Nota: Cada usuario administra un restaurante. 100 productos máximo en la interfaz. El límite no es una cuota de servidor. Las imágenes eliminadas del menú no se borran automáticamente del bucket; implementar limpieza antes de escalar.
