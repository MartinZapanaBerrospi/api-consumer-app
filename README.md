# 🐉 PokéAPI Explorer - Búsqueda Avanzada

Una aplicación web moderna y altamente interactiva para la exploración de Pokémon que consume de forma eficiente y exhaustiva los servicios de la [PokéAPI](https://pokeapi.co/) oficial. El proyecto ha sido diseñado para ofrecer una experiencia premium y fluida al usuario final.

## 🚀 Funcionalidades Destacadas

- **Búsqueda Predictiva y Autocompletado Inteligente**: Posibilidad de buscar al instante mediante nombre o número de Pokédex. Un módulo predictivo guarda en caché la lista completa en segundo plano y sugiere resultados velozmente al ritmo de tecleo.
- **Interfaz Rica en Detalles Dinámicos**:
  - Grito oficial integrado de la generación actual y un *fallback* a su audio clásico (Legacy Cries).
  - Posibilidad de alternar el arte oficial para revelar sus codiciadas versiones *Shiny* o variocolor.
  - Barras animadas de estadísticas de combate (HP, Ataque, Defensa, Velocidad) basadas en paletas de colores representativos de rendimiento.
  - Insignias de tipos elementales auto-estilizadas, además del cálculo de tamaño y peso real basado en el *flavor text* de la especie.
- **Cadenas Evolutivas Computadas**: Se consumen múltiples endpoints distintos correlacionados para armar recursivamente toda la estructura evolutiva de una sola especie. Cada etapa cuenta con miniaturas dinámicas y navegables que permiten saltar a otra entrada directamente.
- **Estados de Carga Óptimos (Skeleton Loader)**: Implementación minuciosa de contenedores de carga falsos (*skeletons*) que se despliegan mientras se resuelven las respuestas asíncronas de la API, previniendo los saltos repentinos y mejorando notablemente el *UX*.
- **Caché y Memoria de Historial de Bucle**: Registro continuo por debajo en almacenamiento local (`localStorage`) que mantiene presentes las últimas vistas para un acceso inmediato.
- **Modo Suerte (Aleatoriedad Aritmética)**: Soporte integrado de un generador matemático que escoge al azar entre los más de mil Pokémon soportados en el servicio actual, sin recargar la página.

## 🛠️ Arquitectura y Stack Tecnológico

- **HTML5 & CSS3**: Maquetación semántica estricta. Interfaz de usuario mejorada con insignias (*badges*), gradientes fluidos, modales integrados, animaciones *ease-in-out* y tipografías (Inter).
- **JavaScript Moderno (ES8+) / VanillaJS**:
  - Desempeño orquestado en búsquedas multicapa manejando y resolviendo múltiples promesas encadenadas con `async / await` e identificadores estáticos de red.
  - Consumo activo a API REST externa (Múltiples endpoints: `/pokemon`, `/pokemon-species`, `/evolution-chain`).
  - Lógica recursiva y técnica de parseo profundo indispensable para decodificar y ordenar jerárquicamente las caprichosas estructuras anidadas provenientes de las respuestas JSON de cadenas de evolución de la base de datos de Pokémon.

## ⚙️ Instalación y Entorno Local

Debido a que este proyecto utiliza asíncronamente las políticas de solicitudes cruzadas (`CORS`) y la *Fetch API* nativa para comunicarse con servidores en dominios externos, su ejecución estricta debe ser procesada montando el entorno mediante un servidor local.

1. Clona el proyecto en tu máquina local.
2. Abre la ventana de tu CLI/terminal e ingresa en la carpeta raíz generada:
   ```bash
   cd api-consumer-app
   ```
3. Lanza de manera ágil un servidor local. Si no cuentas en tu entorno con plataformas como un ecosistema en Node (`Live Server`), una aproximación universal usando Python funcionará a la perfección:
   ```bash
   python -m http.server 8000
   ```
4. Ingresa a `http://localhost:8000` en tu navegador.

## 👨‍💻 Autor y Desarrollo

- **Martín Zapana**
