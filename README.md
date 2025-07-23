# EconoWorld / EconoTest

## Descripción
EconoWorld es una plataforma educativa interactiva para aprender economía a través de cuestionarios, cromos coleccionables y recursos multimedia. El módulo EconoTest permite a los usuarios responder tests temáticos, ganar cromos y visualizar su progreso en un álbum digital.

## Características principales
- **Tests temáticos**: Preguntas de opción múltiple sobre distintas áreas de economía.
- **Cromos coleccionables**: Gana cromos al responder correctamente y complétalos en tu álbum.
- **Álbum digital**: Visualiza todos los cromos ganados y los que faltan por temática.
- **Paginación tipo libro**: Navega por tu álbum como si fuera un libro real.
- **Reseteo de intentos**: Cada test tiene 3 intentos diarios, que se resetean automáticamente cada 24 horas.
- **Autenticación**: Acceso mediante Google o UTPL.

## Instalación
1. Clona el repositorio:
   ```bash
   git clone <URL-del-repo>
   cd EconoWold
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura Firebase:
   - Crea un proyecto en [Firebase](https://firebase.google.com/).
   - Habilita Firestore y Authentication (Google/MS).
   - Copia tu configuración en `src/environments/environment.ts`.

4. Inicia el servidor de desarrollo:
   ```bash
   ng serve
   ```
   Accede a [http://localhost:4200](http://localhost:4200)

## Estructura del proyecto
- `src/app/modules/client/econotest/` — Módulo principal de EconoTest (tests, álbum, cromos)
- `src/app/services/` — Servicios para autenticación, cromos, temáticas, evaluaciones
- `src/app/core/component/header/` — Header y navegación
- `src/assets/images/` — Imágenes de cromos y recursos

## Tecnologías utilizadas
- Angular
- Firebase (Firestore, Auth, Storage)
- RxJS
- SCSS

## Versiones utilizadas
- **Angular**: 15+ (recomendado 15.x o superior)
- **Firebase JS SDK**: 9+
- **@angular/fire**: 7+
- **RxJS**: 7+
- **Node.js**: 16.x o superior
- **npm**: 8.x o superior
- **SCSS**: 1.49+

## Notas de desarrollo
- Los cromos ganados se asocian a cada usuario y nunca se borran al resetear intentos.
- El álbum muestra todas las temáticas y el progreso de cromos por cada una.
- La paginación del álbum muestra dos cromos por página, uno en cada hoja.
- El contador de correctas solo aumenta al enviar la respuesta.
- El menú de navegación en EconoTest solo muestra Álbum, Portada y el nombre de usuario.

## Contribución
1. Haz un fork del repositorio.
2. Crea una rama para tu feature/fix: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios y commitea: `git commit -am 'Agrega nueva funcionalidad'`
4. Haz push a tu rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request.

## Licencia
Este proyecto es propiedad de UTPL y se distribuye solo con fines educativos.
