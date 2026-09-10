# [SIC] — Dirección web

## Función de la web

La web no debe ser solo un manifiesto ni una biografía de banda. Debe funcionar como centro de experiencia, escucha y medición.

## Arquitectura objetivo

```text
[SIC]
├── CURRENT SIGNALS
│   ├── Mss White
│   ├── Así
│   ├── Perspectivas
│   └── Out of Control
├── CONFLICT
├── MATTER
├── TRIAD
├── LAB
├── LIVE
├── ARCHIVE
└── AMBIGUOUS / SIGNAL IN DEVELOPMENT
```

## Principios de UX

- La música debe aparecer temprano.
- Evitar una home que obligue a leer demasiado antes de escuchar.
- La navegación debe sentirse parte del universo, pero seguir siendo usable.
- `CURRENT SIGNALS` debe funcionar como entrada inmediata a los singles recientes.
- `ARCHIVE` debe separar historia de comunicación actual.
- `AMBIGUOUS` no debe presentarse como lanzamiento terminado.

## Aplicación del Key Visual System

### SILENCE

Usar para hero, manifiestos, preguntas y entradas editoriales. Puede haber grandes zonas blancas y fotografía parcial.

### SIGNAL

Usar en live, momentos de escucha, performance, transiciones o módulos de alta energía.

### TRACE

Usar en archivo e historia. Mostrar solo metadata real.

## Formación actual

`TRIAD` debe mostrar únicamente:

- Daniel Castañeda — guitarra y voz;
- Juan Pablo Hurtado — batería;
- Francisco Valencia — bajo.

No incluir antiguos integrantes fuera de `ARCHIVE / TRACE`.

## Tracking recomendado

Instrumentar, cuando sea viable:

- `signal_start`
- `preview_play`
- `listen_spotify`
- `listen_youtube`
- `listen_apple`
- `return_visit`

## KPI operativo sugerido

**CPIL — Coste por escucha intencional**

`inversión / usuarios que reproducen un preview y luego hacen clic hacia una plataforma de escucha`

## Estado del repo

Existe una exploración `Web/2026.html` creada para alinear la narrativa con `CURRENT SIGNALS / TRIAD / ARCHIVE / AMBIGUOUS`.

No asumir que esa página es la implementación definitiva. Debe revisarse contra el Key Visual System actual antes de integrar cambios en `Web/index.html`.

## Próximo paso para Codex

Antes de implementar el nuevo hero:

1. leer `02_KEY_VISUAL_SYSTEM.md`;
2. revisar `Web/index.html` y `Web/2026.html`;
3. identificar componentes actuales reutilizables;
4. proponer un plan de migración;
5. no introducir una plantilla visual rígida;
6. validar mobile y desktop;
7. mantener acceso rápido a escucha.
