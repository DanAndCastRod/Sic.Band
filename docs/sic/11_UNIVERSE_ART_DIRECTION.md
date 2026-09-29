# [SIC] — Frente B: Refinamiento artístico del universo 3D

## Propósito

Este documento preserva la dirección del **Frente B** para que el refinamiento artístico de `Web/universe.html` no se pierda mientras se resuelve primero el Frente A (`Web/immersive.html`).

El universo 3D ya funciona técnicamente, pero **todavía no está aprobado artísticamente**. El problema actual no es de navegación básica sino de lenguaje visual: demasiada geometría cruda, materiales pobres, iluminación débil y una lectura cercana a demo técnica / low-poly sin suficiente identidad [SIC].

La referencia conceptual sigue siendo el Key Visual System funcional **v11.5** y sus reglas: `SILENCE / SIGNAL / TRACE`, con `GESTURE` como vocabulario transversal y `MATTER` como territorio físico.

---

## 1. Diagnóstico actual

### Geometría

- Gran parte del mundo se percibe como polígono sin acabado.
- La simplificación geométrica es aceptable solo si la silueta y el material sostienen la intención artística.
- El low-poly no debe convertirse en estética automática.
- La escena necesita objetos con forma más intencional y variaciones de masa, tensión y vacío.

### Materiales

- Los materiales actuales son demasiado uniformes y digitales.
- Falta sensación de pintura, arrastre, superficie, desgaste y materia.
- Negro, blanco y rojo deben leerse como **materiales**, no como simples colores planos.

### Iluminación

- La iluminación actual no jerarquiza bien los elementos.
- Algunas luces no producen una lectura clara de volumen.
- Hay que evitar iluminación genérica de demo 3D.
- La escena debe sentirse como una instalación artística, no como un showroom.

### Composición

- No basta con tener objetos correctos; deben relacionarse como una composición espacial.
- Debe existir un núcleo, líneas de tensión, zonas de vacío, ritmos y focos.
- La escena no debe llenarse uniformemente.

### Integración con el KVS

- El universo debe sentirse como una extensión tridimensional del KVS, no como un universo visual paralelo.
- El 3D debe reforzar `SILENCE / SIGNAL / TRACE`, `GESTURE`, `MATTER`, `TRIAD` y `AMBIGUOUS`.

---

## 2. Principio rector

> El universo no se refina añadiendo más objetos. Se refina haciendo que cada volumen, material, luz y vacío cambie la lectura.

Aplicar la misma regla de reducción del KVS:

> Si un elemento no cambia la lectura conceptual, se elimina.

---

## 3. Dirección estética

### Carácter general

- escultórico;
- pictórico;
- editorial;
- abstracto;
- táctil;
- espacial;
- controlado pero no cuadriculado;
- experimental sin sacrificar navegación.

### Evitar

- superficies plásticas genéricas;
- exceso de wireframe;
- iluminación gamer/neón sin función;
- objetos decorativos sin narrativa;
- saturación uniforme;
- materiales hiperrealistas que rompan el lenguaje del KVS;
- convertir todo el universo en negro + rojo + glitch;
- una colección de modelos Meshy sin dirección común.

---

## 4. Sistema de assets Meshy

Los assets se crearán como piezas independientes para poder componerlos en Three.js.

### A. Strokes principales

#### `gesture-silence.glb`

Función:
- representar latencia y vacío;
- abrir espacio;
- funcionar como forma liviana y respirada.

Dirección:
- pocos volúmenes;
- masa delgada;
- huecos amplios;
- off-white / negro suave;
- rojo mínimo o inexistente.

#### `gesture-signal.glb`

Función:
- activación;
- tensión;
- impacto;
- dirección.

Dirección:
- forma más cortante;
- diagonales;
- mayor presión visual;
- rojo más presente;
- silueta legible desde varios ángulos.

#### `gesture-trace.glb`

Función:
- residuo;
- huella;
- memoria.

Dirección:
- erosionado;
- fragmentado;
- incompleto;
- bordes rotos;
- capas parciales.

#### `gesture-ambiguous.glb`

Función:
- señal todavía sin cerrar;
- transición;
- posibilidad.

Dirección:
- híbrido entre materia y fragmento;
- asimetría;
- estado inestable;
- no debe parecer una obra terminada.

### B. Fragmentos secundarios

Crear una familia reducida de:

- placas;
- residuos;
- cortes;
- masas pequeñas;
- fragmentos suspendidos;
- piezas que puedan orbitar o responder al usuario.

No todos requieren textura compleja. Deben servir a la composición.

### C. Objetos narrativos

Solo cuando aporten contexto:

- cassettes;
- carteles;
- señalética;
- archivo;
- objetos vinculados a fases musicales;
- elementos físicos de escenario o estudio.

No convertir el universo en una colección literal de memorabilia.

---

## 5. Materialidad

La materialidad deseada es **escultórico-pictórica**, no hiperrealista.

### Negro

- profundo;
- mate;
- algunas zonas con brillo residual;
- evitar negro plano absoluto en todos los objetos.

### Blanco / off-white

- hueso;
- papel;
- yeso;
- pintura seca;
- superficies con ligera rugosidad.

### Rojo

- denso;
- físico;
- pigmento / pintura / señal;
- no neón por defecto;
- usarlo donde cambie la lectura.

### Textura

Buscar:

- arrastre;
- acumulación;
- raspado;
- borde seco;
- zonas de desgaste;
- irregularidad controlada.

---

## 6. Iluminación objetivo

La luz debe construir lectura espacial.

### Esquema base

1. **Key light**
   - blanca / neutra;
   - dirección clara;
   - define volumen principal.

2. **Red accent**
   - localizada;
   - baja cobertura;
   - enfatiza puntos de fricción.

3. **Fill**
   - suave;
   - mantiene lectura de sombras;
   - evita negros completamente muertos.

4. **Rim / contraluz**
   - separa siluetas;
   - refuerza profundidad.

5. **Atmósfera**
   - niebla ligera;
   - partículas muy contenidas;
   - glow localizado solo donde aporte.

### Regla

> No iluminar todo. La oscuridad y el vacío también forman parte de la composición.

---

## 7. Composición espacial

El mundo debe funcionar como una escultura navegable.

### Estructura sugerida

- **núcleo principal**: pieza dominante;
- **campo de tensión**: strokes secundarios;
- **vacíos**: zonas de descanso visual;
- **nodos**: hotspots con contenido;
- **archivo periférico**: TRACE;
- **zona abierta**: AMBIGUOUS / signal in development.

### Movimiento

- cámara estable;
- parallax sutil;
- objetos con movimiento lento;
- reacción a pointer/touch;
- evitar rotación constante tipo demo de producto.

---

## 8. Interacción

Los objetos deben revelar contenido, no solo reaccionar.

Posibles comportamientos:

- hover/tap → identificación conceptual;
- focus → acercamiento controlado;
- click → metadata / texto / imagen;
- scroll → cambio de estado;
- proximidad → activación lumínica;
- selección → separación temporal de una pieza.

Estados interactivos:

- SILENCE;
- SIGNAL;
- TRACE;
- TRIAD;
- AMBIGUOUS.

---

## 9. Arquitectura técnica de assets

Cloudflare Pages no debe volver a contener GLB pesados.

### Hosting

Bucket R2:

`sic-assets`

Dominio:

`https://assets.sic.releven.cc`

### Convención sugerida

```text
https://assets.sic.releven.cc/
├── universe/
│   └── sic_universe_station.glb
└── gesture/
    ├── gesture-silence.glb
    ├── gesture-signal.glb
    ├── gesture-trace.glb
    ├── gesture-ambiguous.glb
    └── fragments/
```

La ruta actual del universo puede mantenerse mientras se migra gradualmente.

---

## 10. Presupuesto técnico

### Geometría

Orientación por asset:

- fragmento pequeño: 2k–8k triángulos;
- stroke principal: 5k–15k;
- pieza compleja: máximo aproximado 30k cuando esté justificado.

No perseguir el mayor número de triángulos disponible.

### Peso

Objetivo deseado:

- 1–8 MiB por GLB individual;
- evitar assets >15 MiB salvo necesidad real;
- comprimir con Meshopt o Draco cuando no degrade el resultado.

### Texturas

- preferir 1K;
- 2K solo en piezas protagonistas;
- evitar múltiples mapas de alta resolución sin valor visible.

### Móvil

- reducir partículas;
- limitar DPR;
- simplificar sombras;
- LOD cuando sea necesario;
- carga progresiva de GLB.

---

## 11. Flujo de trabajo Meshy → Three.js

1. definir función narrativa del asset;
2. producir referencia visual si hace falta;
3. generar modelo en Meshy;
4. revisar silueta;
5. reducir triángulos;
6. revisar materiales/texturas;
7. exportar GLB;
8. subir a R2;
9. integrar en Three.js;
10. ajustar escala / pivote / posición;
11. revisar iluminación;
12. validar desktop;
13. validar móvil;
14. eliminar asset si no mejora la escena.

No generar assets en serie sin validación intermedia.

---

## 12. Orden de implementación

### Fase B1 — Art direction

- definir composición final;
- decidir assets imprescindibles;
- reducir objetos no funcionales.

### Fase B2 — Meshy

- generar strokes principales;
- generar fragmentos;
- optimizar geometría y texturas.

### Fase B3 — Material pass

- unificar negro / blanco / rojo;
- corregir roughness;
- corregir contraste;
- revisar texturas.

### Fase B4 — Lighting pass

- rehacer esquema de luces;
- controlar exposición;
- integrar fog y glow.

### Fase B5 — Interaction pass

- hotspots;
- estados;
- transiciones;
- feedback visual.

### Fase B6 — Performance

- móvil;
- peso;
- carga;
- DPR;
- sombras;
- memoria GPU.

### Fase B7 — Art review

Validar contra v11.5 y no contra una estética genérica de videojuego.

---

## 13. Criterios de aprobación

El Frente B puede considerarse aprobado cuando:

- la escena deja de parecer una demo low-poly;
- la materialidad se percibe intencional;
- el rojo no funciona como simple decoración;
- la iluminación define volumen y jerarquía;
- existen vacíos reales;
- los estados del KVS son reconocibles;
- los modelos de Meshy se sienten parte de una familia visual;
- el recorrido funciona en desktop y móvil;
- ningún asset grande depende del bundle de Cloudflare Pages;
- el universo puede reconocerse como [SIC] incluso sin leer el logo.

---

## 14. Estado

**Estado actual:** documentado / pendiente de producción artística.

**Prioridad inmediata:** Frente A — estabilizar `Web/immersive.html`.

**Después:** iniciar B1 y B2 con assets Meshy dirigidos específicamente para el universo.
