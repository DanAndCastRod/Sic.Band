# [SIC] / V09 editorial

Entrega: output/pdf/SIC_Key_Visual_System_V09.pdf. Diez páginas horizontales, 840 x 600 puntos. Producción con ReportLab; texto y elementos gráficos vectoriales. Fotografías originales, conversión determinista a blanco y negro, ajuste tonal global en directo y recorte proporcional. Sin generación de fotografías ni incorporación de los pósteres V08 como páginas.

## Arquitectura

1. Apertura: la idea toca materia.
2. Gramática: definición comparada de SILENCE, SIGNAL y TRACE.
3. SILENCE: demostración de pausa, escala y contacto.
4. MATTER: dos escalas de una misma acción.
5. SIGNAL: pico de intensidad a partir de fotografía real.
6. CURRENT / TRIAD: relación entre los tres integrantes y roles.
7. TRACE: convivencia explícita de archivo de formación anterior y formación actual.
8. Recursos: función del rojo y jerarquía tipográfica.
9. AMBIGUOUS: aplicación abierta, sin anuncio de lanzamiento.
10. Producción: invariantes y fuentes enlazadas.

## Auditoría

Se inspeccionaron el PDF V05 de ocho páginas, PRESENCE V06 y las ocho imágenes V07 previamente recuperadas. El alcance V06 es una muestra, no una auditoría de toda la ronda. Se leyeron AGENTS, continuidad, índice visual, núcleo de marca, sistema, integrantes y catálogo.

DMP06423.jpg se inspeccionó como guía indicada por el usuario. La fotografía empleada en TRIAD es DSC06220.2.jpg: Francisco a la izquierda, Daniel al centro y Juan Pablo a la derecha. La identidad se cotejó con la guía, conservando los píxeles originales; no hay reconstrucción facial.

## Revisiones internas

Primera composición: se revisó el documento completo renderizado. Se detectó repetición del bajo, una portada demasiado próxima al tratamiento de SIGNAL y un PDF excesivamente pesado.

Segunda composición: portada centrada en contacto; uso de DSC06220.2.jpg para relación grupal; AMBIGUOUS en negro y con fragmentos de esa fuente; mayor contraste tipográfico selectivo; imágenes embebidas a 240 ppp máximos de colocación mediante JPEG de calidad 94. Originales intactos.

Revisión página por página: se corrigió la colisión del titular MATTER con la fotografía, la demostración demasiado sutil de FAULT y un rostro excesivamente dominante en AMBIGUOUS. Se levantaron moderadamente sombras del material de directo.

Verificación final: diez páginas renderizadas; ocho enlaces PDF; texto extraíble, fuentes TrueType incrustadas y ningún bloque de texto fuera de página. Se verificaron acentos y ausencia de caracteres de sustitución. El render de revisión se realizó con PyMuPDF, ya que Poppler no estaba disponible en el entorno.

## Juicio crítico

V09 cumple el cambio de entregable: explica y demuestra un sistema editorial mediante una secuencia. Mejora la procedencia documental, la fidelidad de identidad y la relación entre ejemplos y reglas. No utiliza grunge para unificar.

Todavía predomina el bajo en la demostración de acción. Falta amplitud de fotografía de guitarra, batería y relación escénica actual. TRIAD es una relación de estudio; no demuestra aún el mismo vínculo en directo. La tipografía funciona técnicamente pero su combinación necesita validación como elección definitiva de identidad. La adaptación a móvil, hero y preimpresión no fue parte de esta edición.

Veredicto: REFINAR. PDF terminado y apto para revisión y circulación digital interna; no declarar el sistema matriz aprobado para producción general.

## Continuidad

El contrato completo está en ../../13_PRODUCTION_CONTRACT.md. El constructor build_v09.py utiliza originales locales de tmp/pdfs y tmp/imagegen, cuyas procedencias y huellas están registradas en sources.json. No eliminar esas fuentes si se necesita reconstruir esta edición.

