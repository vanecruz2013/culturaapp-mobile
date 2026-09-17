# Cultura App — Mobile

Red social de descubrimiento cultural para iOS y Android.

Registra, puntúa y comparte películas, libros, series y música. Descubre qué consume la gente que conoces y haz visible el impacto de tus recomendaciones.

## Stack

- **React Native** con Expo
- **React Navigation** — navegación
- **Zustand** — estado global
- **React Query** — sincronización con API
- **TypeScript**

## Requisitos

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac) o app Expo Go
- Android: Android Studio o app Expo Go

## Instalación

```bash
npm install
npx expo start
```

## Estructura

```
src/
├── api/          # Llamadas al backend y APIs externas
├── components/   # Componentes reutilizables
├── screens/
│   ├── auth/     # Login, registro
│   ├── home/     # Pantalla de inicio
│   ├── discover/ # Búsqueda y descubrimiento
│   ├── profile/  # Perfil propio y ajeno
│   └── content/  # Detalle de contenido
├── store/        # Estado global (Zustand)
├── navigation/   # Configuración de navegación
├── hooks/        # Custom hooks
└── utils/        # Helpers y constantes
```

## Repositorios del proyecto

- **Backend:** [culturaapp-backend](https://github.com/vanecruz2013/culturaapp-backend)
- **Documento funcional:** ver `FUNCTIONAL_SPEC_MVP.md`

## Roadmap MVP

- [ ] Sprint 1 — Autenticación + películas básico
- [ ] Sprint 2 — Libros, series y música
- [ ] Sprint 3 — Sistema de recomendaciones
- [ ] Sprint 4 — Pulido y lanzamiento
