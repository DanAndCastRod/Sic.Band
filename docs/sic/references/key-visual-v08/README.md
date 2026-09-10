# [SIC] — V08

Ocho exploraciones visuales generadas con el image_gen integrado a partir de V07 y de dos fotografías fuente verificadas. El usuario eligió expresamente generar todas las piezas con IA como exploraciones.

Esta ronda sirve para evaluar dirección, composición y reducción. Las imágenes generadas no son reproducciones documentales de las fotografías fuente ni sustituyen su archivo original. La fidelidad de los integrantes requiere validación antes de una aplicación pública.

## Piezas

| Archivo | Cambio respecto de V07 |
|---|---|
| [Una idea no pesa](silence_una_idea_no_pesa_v08.png) | Más vacío, menor titular, sin logo grande, rojo ni rótulos periféricos. |
| [No busques una respuesta](manifesto_no_busques_una_respuesta_v08.png) | Conserva la interrupción roja; elimina el filename incorrecto y el desgaste. |
| [The signal was here](silence_the_signal_was_here_v08.png) | Fragmento pequeño de mano y bajo, gran campo blanco, sin fecha ni rostro generado. |
| [Señal en conflicto](signal_live_state_v08.png) | Una escena derivada de una fuente real; elimina el collage, los marcos y la banda genérica. |
| [La idea se vuelve materia](matter_la_idea_se_vuelve_materia_v08.png) | Una sola acción sobre un pedal, sin cinta, códigos ni nota inventada. |
| [Tres funciones](triad_tres_funciones_v08.png) | Una escena grupal referenciada en la formación real; nombres y roles correctos, sin waveform. |
| [Archivo vivo](trace_archivo_vivo_v08.png) | Una fuente identificada; se declara interpretación visual, sin fingir un documento original. |
| [Ambiguous](ambiguous_signal_in_development_v08.png) | Elimina el collage y conserva únicamente la señal de desarrollo. |

Abrir [galeria.html](galeria.html) para comparar las ocho piezas, o cada PNG para verlo a tamaño completo.

## Fuentes

- [Índice canónico V07](../../10_VISUAL_REFERENCES.md): referencias conceptuales de Una idea, MANIFESTO, MATTER y AMBIGUOUS.
- [DMP06450-2.jpg](https://drive.google.com/file/d/1y5EyhemtBOModqJBTb7FkVcB2IV4isLu/view): fuente de TRIAD. La copia local reducida de referencia está en `sources/DMP06450-2-reference.jpg`.
- [Cuanzas-94.jpg](https://drive.google.com/file/d/1-wBFTcR2FWSRSf59XjhNNx-8vWacO6Tc/view): fuente de SIGNAL, The signal was here y TRACE. La copia local reducida está en `sources/Cuanzas-94-reference.jpg`.

Las copias de referencia conservan la proporción de los originales. No se dedujeron fechas ni lugares de las fechas de subida de Drive.

## Evaluación de esta ronda

- Se eliminaron los rótulos de versión/estado, las listas decorativas y los códigos sin fuente.
- La reducción funciona mejor en Una idea, MANIFESTO y The signal was here. Esta última sí prueba una ocupación fotográfica muy baja.
- MATTER abandona las cinco imágenes y permite identificar una acción concreta.
- TRIAD mantiene la situación grupal de la fuente y escribe correctamente los tres nombres y roles. Sigue siendo una recreación generada y no una certificación de fidelidad facial.
- TRACE corrige la asociación errónea de fuentes, pero, por la elección de generar con IA, continúa siendo una exploración del territorio; no supera por sí misma el requisito de archivo documental original.
- SIGNAL y TRACE usan una tipografía con serif en su titular. Es una variación de esta ronda, no una nueva familia tipográfica aprobada.
- V08 explora una reducción fuerte. Queda por contrastar si tanta limpieza conserva suficiente tensión para [SIC] y si hay que recuperar algún gesto material con una función concreta.
- Los rótulos secundarios de SIGNAL y TRIAD necesitan revisarse al adaptar a tamaños de publicación. Los PNG son láminas de evaluación; no se declara resuelta una aplicación web o social.

## Método y prompts

Todas las composiciones finales fueron generadas con image_gen integrado, una llamada por pieza. No se hizo composición manual de rostros o archivo. Las dos referencias grandes de TRIAD y TRACE se redujeron proporcionalmente solo para poder cargarlas en la herramienta; los PNG finales no se editaron con Python.

Los prompts de las seis primeras piezas están en [prompts-conceptuales.md](prompts-conceptuales.md). Los prompts finales de TRIAD y TRACE están en [prompts.json](prompts.json). El término «preservar» en un prompt expresa una instrucción a la generación, no una garantía de identidad pixel a pixel.

No se publicaron estas piezas, no se modificó la web y no se sustituyó el archivo V07.
