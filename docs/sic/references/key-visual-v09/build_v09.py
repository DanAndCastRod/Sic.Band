from pathlib import Path
from io import BytesIO
from PIL import Image,ImageOps
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import fitz,json,hashlib

ROOT=Path(__file__).resolve().parents[4]
OUT=ROOT/'output/pdf'
TMP=ROOT/'tmp/pdfs/v09'
OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(parents=True,exist_ok=True)
for n,f in [('N','ARIALN.TTF'),('B','ARIALNB.TTF'),('D','impact.ttf'),('R','arial.ttf'),('M','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(n,'C:/Windows/Fonts/'+f))
W,H=840,600
WHITE='#F7F7F5'; BLACK='#101010'; RED='#D71920'; GRAY='#606060'
sources={'live':ROOT/'tmp/pdfs/Cuanzas-113.jpg','bass':ROOT/'tmp/imagegen/Cuanzas-94.jpg','triad':ROOT/'tmp/pdfs/DMP06423.jpg','relation':ROOT/'tmp/pdfs/DSC06220.2.jpg','sofa':ROOT/'tmp/imagegen/DMP06450-2.jpg','archive':ROOT/'tmp/pdfs/Desmintiendo mitos-68.jpg'}
ims={}
for k,p in sources.items():
    im=ImageOps.exif_transpose(Image.open(p))
    # Deterministic neutral conversion only; no synthesis, retouching or geometry changes.
    ims[k]=ImageOps.grayscale(im)
    if k in ('bass','live'):
        gamma=.82 if k=='bass' else .90
        ims[k]=ims[k].point([round((v/255)**gamma*255) for v in range(256)])
c=canvas.Canvas(str(OUT/'SIC_Key_Visual_System_V09.pdf'),pagesize=(W,H),pageCompression=1)
c.setTitle('[SIC] Key Visual System V09')
c.setAuthor('Sentence In Conflict')
c.setSubject('Sistema editorial: SILENCE / SIGNAL / TRACE')
used=[]
def rect(x,y,w,h,col):
    c.setFillColor(col);c.rect(x,H-y-h,w,h,fill=1,stroke=0)
def line(x,y,x2,y2,col=BLACK,width=.6):
    c.setStrokeColor(col);c.setLineWidth(width);c.line(x,H-y,x2,H-y2)
def text(s,x,y,size=12,font='R',col=BLACK):
    c.setFillColor(col);c.setFont(font,size);c.drawString(x,H-y-size*.8,s)
def multi(lines,x,y,size=12,font='R',col=BLACK,leading=None):
    for i,s in enumerate(lines):text(s,x,y+i*(leading or size*1.35),size,font,col)
def para(s,x,y,width,size=11,col=GRAY,font='R',leading=None):
    words=s.split();rows=[];row=''
    for word in words:
        test=(row+' '+word).strip()
        if pdfmetrics.stringWidth(test,font,size)>width and row:rows.append(row);row=word
        else:row=test
    if row:rows.append(row)
    multi(rows,x,y,size,font,col,leading)
    return y+len(rows)*(leading or size*1.35)
def photo(k,x,y,w,h,box=None):
    im=ims[k]
    if box:
        iw,ih=im.size; im=im.crop(tuple(round(v*(iw if i%2==0 else ih)) for i,v in enumerate(box)))
    iw,ih=im.size;s=max(w/iw,h/ih)
    dx=x+(w-iw*s)/2;dy=y+(h-ih*s)/2
    c.saveState();p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0,fill=0)
    # Embed 240 ppi JPEG derivatives at placement scale; originals remain intact.
    im=im.copy();im.thumbnail((max(1,round(iw*s/72*240)),max(1,round(ih*s/72*240))),Image.Resampling.LANCZOS)
    buffer=BytesIO();im.save(buffer,format='JPEG',quality=94);buffer.seek(0)
    c.drawImage(ImageReader(buffer),dx,H-dy-ih*s,iw*s,ih*s)
    c.restoreState();used.append({'page':c.getPageNumber(),'source':sources[k].name,'box':box,'width':w,'height':h})
def fitphoto(k,x,y,w,h):
    im=ims[k];iw,ih=im.size;s=min(w/iw,h/ih);photo(k,x+(w-iw*s)/2,y+(h-ih*s)/2,iw*s,ih*s)
def footer(n,label,dark=False):
    col='#AAAAAA' if dark else GRAY
    text('[SIC]   /   KEY VISUAL SYSTEM',36,570,8,'M',col)
    text(label,340,570,8,'M',col)
    text('V09   /   '+str(n).zfill(2),732,570,8,'M',col)
def page(n,label,dark=False):
    rect(0,0,W,H,BLACK if dark else WHITE);footer(n,label,dark)
def end():c.showPage()

# 01: Opening thesis. Native type intersects physical source at the fold.
page(1,'IDEA / MATERIA')
photo('live',426,103,414,445,box=(.03,.47,.88,.94))
text('[ S I C ]',36,35,22,'N')
text('SENTENCE IN CONFLICT',36,70,8,'M')
text('KEY VISUAL SYSTEM',36,151,10,'M')
multi(['UNA IDEA','NO PESA.'],32,207,92,'D',leading=91)
text('hasta que toca algo.',38,411,21,'N')
line(399,407,453,407,RED,2)
multi(['Dirección de arte y sistema editorial','SILENCE / SIGNAL / TRACE'],38,484,11,'N',leading=18)
end()

# 02: State grammar, explained through rhythm rather than a template.
page(2,'GRAMÁTICA')
text('Tres estados. Una tensión.',36,43,37,'B')
para('La identidad cambia de densidad, no de significado. El blanco prepara la aparición; el cuerpo la activa; el archivo conserva lo ocurrido.',36,97,655,14,BLACK)
cols=[36,302,568]
for x,n,title in zip(cols,['01','02','03'],['SILENCE','SIGNAL','TRACE']):
    text(n,x,164,9,'M',GRAY);text(title,x,187,28,'B')
# three deliberately different examples
rect(36,236,232,140,'#FFFFFF');text('espera.',52,319,11,'M');line(232,324,249,324,RED,1)
rect(302,236,232,140,BLACK);photo('live',379,236,155,140,box=(.02,.12,.90,.65))
photo('archive',568,236,90,140);photo('sofa',674,271,126,105,box=(0,0,1,.85))
for x,s,copy in zip(cols,['Idea / ausencia','Cuerpo / intensidad','Memoria / evidencia'],[
'Una frase, un intervalo, un recorte. El vacío debe crear expectativa y dirigir la mirada.',
'La energía está en el gesto, el instrumento y la luz. La fotografía sostiene el pico de intensidad.',
'El encuadre puede cambiar. La procedencia no. Cada dato debe corresponder al archivo mostrado.']):
    text(s,x,396,14,'B');para(copy,x,423,224,11)
text('MATTER y TRIAD son territorios de contenido. AMBIGUOUS es una aplicación en desarrollo.',36,519,10,'N',GRAY)
end()

# 03: Silence demonstration.
page(3,'SILENCE')
text('01 / SILENCE',36,39,9,'M',GRAY)
photo('bass',550,137,290,382,box=(.04,.47,.65,.85))
text('NO BUSQUES UNA RESPUESTA.',90,269,19,'N')
text('entra en el conflicto.',90,302,13,'N')
line(420,281,563,281,RED,1.2)
para('El texto detiene la mirada antes del contacto. Un solo recorte sostiene la presencia física; el rostro no es necesario.',36,496,356,11)
text('RECORTE / Cuanzas-94.jpg',550,535,8,'M',GRAY)
end()

# 04: Matter analytical montage from source, two changing scales.
page(4,'MATTER')
text('DEL GESTO A LA MATERIA',36,38,10,'M',GRAY)
multi(['La idea','se vuelve','materia.'],36,75,42,'D',leading=44)
photo('live',0,222,374,291,box=(.03,.40,.91,.94))
photo('live',345,119,495,225,box=(.09,.53,.49,.77))
text('CONTACTO',391,367,11,'M')
para('La mano es el punto de entrada. El segundo encuadre amplía la relación entre cuerpo e instrumento. Dos escalas de una misma fotografía, sin inventar otra acción.',391,395,330,13,BLACK)
line(391,475,804,475,BLACK,.6)
text('MISMA FUENTE / Cuanzas-113.jpg',391,493,8,'M',GRAY)
end()

# 05: Signal photo essay with black field.
page(5,'SIGNAL',True)
photo('live',286,0,554,548)
rect(0,0,286,548,BLACK)
text('02 / SIGNAL',36,39,9,'M','#AAAAAA')
multi(['SEÑAL','EN CONFLICTO.'],36,175,33,'D','#FFFFFF',leading=41)
para('La luz atraviesa el cuerpo. La diagonal del instrumento acelera la lectura. El negro deja que el gesto aparezca.',36,287,205,13,'#DDDDDD')
text('Cuanzas-113.jpg',36,478,9,'M','#AAAAAA')
text('Fotografía de directo',36,498,10,'N','#AAAAAA')
end()

# 06: Current identity as a relational spread, original intact.
page(6,'CURRENT / TRIAD')
text('Tres funciones.',36,38,31,'B')
text('Un mismo pulso.',36,75,31,'B')
para('La formación actual se lee como una relación. Las personas conservan su vínculo dentro de una misma fotografía.',494,43,309,11)
fitphoto('relation',0,150,660,330)
# Labels in same left to right order as the actual photograph
for y,name,role,pos in [(187,'Francisco Valencia','BAJO','IZQUIERDA'),(293,'Daniel Castañeda','GUITARRA Y VOZ','CENTRO'),(399,'Juan Pablo Hurtado','BATERÍA','DERECHA')]:
    text(pos,683,y,8,'M',GRAY);text(name,683,y+22,14,'B');text(role,683,y+47,8,'M',GRAY)
text('DSC06220.2.jpg',36,503,8,'M',GRAY)
text('Identidad cotejada con DMP06423.jpg',36,524,9,'N',GRAY)
end()

# 07: True archive; no invented chronology.
page(7,'TRACE')
text('03 / TRACE',36,36,9,'M',GRAY)
text('El archivo no se reescribe.',36,62,35,'B')
photo('archive',36,122,239,359)
fitphoto('sofa',320,154,190,286)
text('Desmintiendo mitos-68.jpg',36,494,8,'M')
text('Archivo / formación anterior',36,514,10,'N',GRAY)
text('DMP06450-2.jpg',320,454,8,'M')
text('Formación actual',320,474,10,'N',GRAY)
text('DOS CONTEXTOS',566,166,10,'M')
para('El archivo admite distintas formaciones. La composición las pone en relación sin presentarlas como una misma etapa.',566,198,227,13,BLACK)
line(566,314,604,314,RED,1.5)
para('Aquí solo se publican los nombres reales de los archivos y el contexto de formación documentado. No se atribuyen fecha ni lugar.',566,341,227,11)
para('Los nombres de archivo son vínculos a los originales de Drive.',566,470,221,9)
c.linkURL('https://drive.google.com/file/d/1HZqUe9MWVW6eVeQLJmYDH3IlrtgT_Ok8/view',(36,H-505,275,H-490),relative=0)
c.linkURL('https://drive.google.com/file/d/1y5EyhemtBOModqJBTb7FkVcB2IV4isLu/view',(320,H-465,510,H-450),relative=0)
end()

# 08: Operational grammar; native examples, not pasted posters.
page(8,'RECURSOS / FUNCIÓN')
text('El rojo tiene que hacer algo.',36,41,36,'B')
para('Se usa cuando cambia una lectura. Su ausencia también pertenece al sistema.',36,96,700,14,BLACK)
for x,lab in [(36,'AXIS / separar'),(302,'FAULT / interrumpir'),(568,'TRACE / señalar')]:
    text(lab,x,161,11,'M')
line(146,203,146,304,RED,1.3)
text('idea',49,242,21,'N');text('materia',169,242,21,'N')
text('CON',302,238,28,'B');text('FLICTO',367,249,28,'B');line(361,233,361,253,RED,1.3)
photo('bass',568,200,170,102,box=(.11,.49,.82,.90))
line(742,280,775,280,RED,1.3)
for x,s in [(36,'Ordena dos campos. No divide el formato por costumbre.'),(302,'Marca una discontinuidad. No simula daño sobre rostros ni documentos.'),(568,'Localiza una huella. No inventa códigos ni datos de archivo.')]:
    para(s,x,329,226,11)
line(36,413,804,413,BLACK,.6)
text('TIPOGRAFÍA',36,435,9,'M',GRAY)
text('Una voz puede bajar.',36,461,28,'N')
para('Condensada para tensión y jerarquía. Texto de lectura para explicar. Monoespaciada únicamente para estados, procedencia o navegación.',424,437,370,12)
text('NEGRO / BLANCO: campos equivalentes. ROJO: intervención, nunca relleno.',36,523,10,'N',GRAY)
end()

# 09: Open development, no fabricated creative evidence.
page(9,'AMBIGUOUS',True)
photo('relation',564,108,276,183,box=(.23,.45,.70,.98))
photo('relation',489,315,351,233,box=(.44,.65,1,1))
text('APLICACIÓN / EN DESARROLLO',36,41,9,'M','#AAAAAA')
text('AMBIGUOUS',34,164,65,'D','#FFFFFF')
text('SIGNAL IN DEVELOPMENT',39,250,14,'M',RED)
para('La identidad deja espacio para lo que todavía no está resuelto.',39,337,352,22,'#FFFFFF',font='N')
para('Los fragmentos ensayan una relación visual. No documentan una sesión de composición ni anticipan una portada, fecha o lanzamiento.',39,449,374,11,'#AAAAAA')
text('DSC06220.2.jpg / fragmentos',489,552,8,'M','#AAAAAA')
end()

# 10: production contract, provenance, usable closure.
page(10,'CRITERIO DE PRODUCCIÓN')
text('Lo que debe permanecer.',36,40,36,'B')
left=[
('IDENTIDAD','CURRENT / TRIAD incluye únicamente a Daniel Castañeda, Juan Pablo Hurtado y Francisco Valencia, con sus roles documentados.'),
('IMAGEN','Escalado proporcional y recorte editorial. Sin rostros regenerados, cuerpos estirados ni escenas reconstruidas.'),
('EVIDENCIA','TRACE utiliza originales y datos comprobados. Las formaciones anteriores se contextualizan.'),
('RITMO','Cada página tiene una función. El tamaño del texto, la densidad y el uso de rojo responden a ella.')
]
y=112
for title,body in left:
    text(title,36,y,10,'M');para(body,36,y+23,355,11);y+=95
text('FUENTES DE ESTA EDICIÓN',451,115,10,'M')
para('Base: AGENTS.md; 01_BRAND_CORE; 02_KEY_VISUAL_SYSTEM; 03_MEMBER_IDENTITIES; 09_HANDOFF_SUMMARY; 10_VISUAL_REFERENCES.',451,144,348,10)
para('Auditoría visual: PDF V05 completo, PRESENCE de V06 y las ocho composiciones V07. V08 se conserva como antecedente crítico.',451,207,348,10)
text('FOTOGRAFÍA / ORIGINALES',451,276,9,'M',GRAY)
srcs=[('DMP06423.jpg / guía de identidad','1Eygl5iEQBKe3sOGDmAqAltj-2VMIm1ha'),('DSC06220.2.jpg','1mGuNmmjrJnjEd8-4Hl0_WpbM7D2egPSY'),('DMP06450-2.jpg','1y5EyhemtBOModqJBTb7FkVcB2IV4isLu'),('Cuanzas-94.jpg','1-wBFTcR2FWSRSf59XjhNNx-8vWacO6Tc'),('Cuanzas-113.jpg','10dfrxiwwkhzsP3deOhmm6Y-j4amYLVFJ'),('Desmintiendo mitos-68.jpg','1HZqUe9MWVW6eVeQLJmYDH3IlrtgT_Ok8')]
for i,(name,id) in enumerate(srcs):
    y=302+i*22;text(name,451,y,10,'M')
    c.linkURL('https://drive.google.com/file/d/'+id+'/view',(451,H-y-12,800,H-y+3),relative=0)
para('Fotografías reales convertidas a blanco y negro. Texto y composición vectoriales. Ninguna página es un póster generado incrustado.',451,450,348,10)
text('V09 / EDICIÓN EDITORIAL / 10.09.2026',451,511,9,'M')
end()
c.save()
pdf=fitz.open(OUT/'SIC_Key_Visual_System_V09.pdf')
for i,p in enumerate(pdf):p.get_pixmap(matrix=fitz.Matrix(1.25,1.25),alpha=False).save(TMP/f'page-{i+1:02d}.png')
# Contact sheet is solely a PDF review artifact.
thumbs=[]
for i in range(len(pdf)):
    im=Image.open(TMP/f'page-{i+1:02d}.png');im.thumbnail((420,300));thumbs.append(im)
sheet=Image.new('RGB',(840,1500),'#bbbbbb')
for i,im in enumerate(thumbs):sheet.paste(im,((i%2)*420,(i//2)*300))
sheet.save(TMP/'review-sheet.jpg',quality=90)
(TMP/'photo-placements.json').write_text(json.dumps(used,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(pdf),'bytes':(OUT/'SIC_Key_Visual_System_V09.pdf').stat().st_size,'review':str(TMP/'review-sheet.jpg')}))
