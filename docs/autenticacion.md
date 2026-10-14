# Autenticación con correo y contraseña

## Implementado

- Crear cuenta real con correo y contraseña en Firebase Authentication.
- Guardar el nombre visible en el perfil de Authentication.
- Iniciar y cerrar sesión; saludo con nombre o correo en Home.
- Sesión persistente mediante AsyncStorage en Android/iOS y persistencia de navegador en web.
- Esperar la restauración de la sesión antes de decidir entre login y Home.
- Recuperación de contraseña desde Iniciar sesión: solicita el envío de correo a Firebase y muestra una respuesta neutral.
- Formularios bloqueados durante solicitudes; errores de credenciales, correo existente, cuotas y conexión con mensajes legibles.
- El UID de Firebase queda disponible en la sesión para identificar al dueño de futuros intercambios. Todavía no se escriben perfiles en Firestore ni se habilitan intercambios reales.

## Configuración

Habilitar Correo electrónico/contraseña en Authentication. Completar las variables públicas EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID y EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN en mobile/.env. La configuración pública es distinta de la clave privada de Gemini.

## Verificación

Se probó en el Firebase real el registro de una cuenta temporal, actualización de nombre, cierre de sesión, rechazo de contraseña incorrecta y reingreso con el mismo UID. La cuenta temporal fue eliminada al terminar. No se enviaron correos de prueba.

TypeScript y la generación de paquetes Android/iOS pasaron. La persistencia y la recepción del correo de recuperación deben comprobarse en el teléfono con la cuenta del usuario.

## Cómo probar en el teléfono

1. Recargar Expo Go y elegir Crear cuenta; usar un correo propio y una contraseña que cumpla la política del proyecto.
2. Verificar que se abre Home y aparece el saludo.
3. Revisar la cuenta en Firebase Console → Authentication → Usuarios.
4. Cerrar y volver a abrir la app para comprobar la sesión persistente.
5. Tocar Salir e iniciar sesión nuevamente.
6. Para recuperar la contraseña, ingresar el correo en Iniciar sesión y tocar Olvidé mi contraseña; revisar la bandeja y spam.

## Pendientes

Google está habilitado en la consola, pero su botón aún requiere integración OAuth o una compilación de desarrollo apropiada. Facebook y Apple también siguen pendientes. La verificación de correo y los perfiles de intercambio se implementarán en una próxima etapa.

El chat de IA sigue pendiente de estabilizar tras los tiempos de espera observados en el teléfono.
