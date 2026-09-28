# [SIC] — Gesture 3D assets

Esta carpeta recibe los modelos 3D que sustituyen o complementan los strokes procedurales de `Web/immersive.html`.

## Slots previstos

- `gesture-silence.glb` — forma más abierta, liviana y con mayor espacio negativo.
- `gesture-signal.glb` — mayor tensión, dirección y ruptura.
- `gesture-trace.glb` — forma residual, erosionada o fragmentaria.

## Reglas de arte

- No construir marcos alrededor de la pintura: el stroke debe sentirse como materia libre en el espacio.
- Paleta base: negro, blanco/off-white y rojo.
- Evitar texto, logos y rostros dentro del modelo.
- El modelo puede ser abstracto, escultórico o pictórico; no debe parecer un objeto decorativo genérico.
- Priorizar una silueta clara desde varios ángulos y evitar microdetalle que no sobreviva en móvil.
- Mantener cada asset separado para poder asignar interacción y metadata independiente.

## Reglas técnicas

- Formato: GLB.
- Origen/pivote cercano al centro geométrico.
- Escala consistente entre assets.
- Texturas embebidas cuando existan.
- Evitar luces y cámaras exportadas.
- Ideal: 5k–30k triángulos por stroke; usar menos cuando la forma lo permita.
- Materiales PBR simples.
- Probar compresión Draco o Meshopt antes de producción si el peso final lo exige.

La experiencia ya contiene un fallback procedural en Three.js: si estos GLB no existen, la interacción sigue funcionando.
