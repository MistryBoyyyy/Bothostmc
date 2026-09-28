from PIL import Image, ImageDraw, ImageFont
import math, os
W=128; FR=8
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',64)
SF=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',34)
made={}
def save(n,frames):
    pf=[]
    for f in frames:
        alpha=f.getchannel('A')
        p=f.convert('RGB').convert('P',palette=Image.ADAPTIVE,colors=63)
        mask=alpha.point(lambda a:255 if a<=128 else 0)
        p.paste(63,mask)
        pf.append(p)
    pf[0].save(f'assets/emojis2/{n}.gif',save_all=True,append_images=pf[1:],duration=90,loop=0,disposal=2,transparency=63)
    made[n]=os.path.getsize(f'assets/emojis2/{n}.gif')
def ni():
    return Image.new('RGBA',(W,W),(0,0,0,0))
def gem(col,hi):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.polygon([(64,14),(104,52),(64,114),(24,52)],fill=col+(255,),outline=(20,20,30,255),width=3)
        d.polygon([(64,26),(88,52),(64,92),(40,52)],fill=hi+(140,))
        sx=34+((f*10)%60); d.ellipse([sx,40,sx+8,48],fill=(255,255,255,220))
        fr.append(i)
    return fr
def ingot(col,hi):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.polygon([(30,50),(98,50),(108,86),(20,86)],fill=col+(255,),outline=(15,15,25,255),width=3)
        d.line([(34,56),(94,56)],fill=hi+(255,),width=5)
        sx=26+((f*11)%76); d.line([(sx,66),(sx+10,66)],fill=(255,255,255,160),width=3)
        fr.append(i)
    return fr
def face(base,expr):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        b=2 if f%4<2 else 0
        d.ellipse([18,18+b,110,110+b],fill=base+(255,),outline=(15,15,25,255),width=3)
        ey=52+b
        if expr in('happy','laugh','love','hype','lol','gg'):
            d.arc([38,ey-8,56,ey+8],0,180,fill=(20,20,30,255),width=5); d.arc([72,ey-8,90,ey+8],0,180,fill=(20,20,30,255),width=5)
        elif expr in('sad','cry','bruh','sleep'):
            d.arc([38,ey-4,56,ey+12],180,360,fill=(20,20,30,255),width=5); d.arc([72,ey-4,90,ey+12],180,360,fill=(20,20,30,255),width=5)
        elif expr in('angry','evil'):
            d.line([(38,ey-6),(56,ey+2)],fill=(20,20,30,255),width=6); d.line([(90,ey-6),(72,ey+2)],fill=(20,20,30,255),width=6)
            d.ellipse([42,ey+2,52,ey+12],fill=(20,20,30,255)); d.ellipse([76,ey+2,86,ey+12],fill=(20,20,30,255))
        elif expr=='cool':
            d.rectangle([34,ey-6,58,ey+6],fill=(20,20,30,255)); d.rectangle([70,ey-6,94,ey+6],fill=(20,20,30,255)); d.line([(58,ey),(70,ey)],fill=(20,20,30,255),width=4)
        elif expr=='wink':
            d.ellipse([40,ey-4,54,ey+8],fill=(20,20,30,255)); d.arc([72,ey-6,90,ey+8],0,180,fill=(20,20,30,255),width=5)
        elif expr in('shock','wow'):
            d.ellipse([40,ey-6,54,ey+8],fill=(255,255,255,255),outline=(20,20,30,255),width=4); d.ellipse([74,ey-6,88,ey+8],fill=(255,255,255,255),outline=(20,20,30,255),width=4)
        else:
            d.ellipse([42,ey-2,52,ey+8],fill=(20,20,30,255)); d.ellipse([76,ey-2,86,ey+8],fill=(20,20,30,255))
        my=82+b
        if expr in('happy','cool','wink','lol'): d.arc([44,my-10,84,my+14],0,180,fill=(20,20,30,255),width=6)
        elif expr in('laugh','hype','wow'): d.pieslice([42,my-12,86,my+18],0,180,fill=(60,20,30,255),outline=(20,20,30,255))
        elif expr in('sad','bruh','sleep'): d.arc([46,my,82,my+18],180,360,fill=(20,20,30,255),width=6)
        elif expr=='angry': d.line([(48,my+4),(80,my+4)],fill=(20,20,30,255),width=6)
        elif expr=='cry':
            d.arc([46,my,82,my+18],180,360,fill=(20,20,30,255),width=6)
            ty=(f*6)%24; d.ellipse([36,ey+10+ty,44,ey+20+ty],fill=(80,160,255,230)); d.ellipse([84,ey+10+ty,92,ey+20+ty],fill=(80,160,255,230))
        elif expr=='love':
            d.polygon([(64,my+10),(50,my-4),(56,my-10),(64,my-4),(72,my-10),(78,my-4)],fill=(255,60,90,255))
        elif expr=='rip': d.line([(48,my+4),(80,my+4)],fill=(20,20,30,255),width=5); d.line([(54,my),(54,my+8)],fill=(20,20,30,255),width=4); d.line([(66,my),(66,my+8)],fill=(20,20,30,255),width=4); d.line([(76,my),(76,my+8)],fill=(20,20,30,255),width=4)
        elif expr=='gg': d.arc([44,my-8,84,my+12],0,180,fill=(20,20,30,255),width=6); d.polygon([(20,30),(40,22),(40,38)],fill=(255,215,0,255))
        elif expr=='evil': d.arc([46,my-2,82,my+16],200,340,fill=(20,20,30,255),width=6)
        elif expr=='sleep':
            d.arc([46,my,82,my+16],0,180,fill=(20,20,30,255),width=5)
            d.text((86,20-((f*3)%14)),'Z',font=SF,fill=(160,200,255,255))
        elif expr=='hype': d.polygon([(14,44),(34,36),(34,52)],fill=(255,120,40,255)); d.polygon([(114,44),(94,36),(94,52)],fill=(255,120,40,255))
        fr.append(i)
    return fr
def txt(t,col):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y=8*math.sin(f/FR*2*math.pi)
        d.text((64,64+y),t,font=FONT,fill=col+(255,),anchor='mm')
        fr.append(i)
    return fr
def wave(col1,col2):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rounded_rectangle([20,30,108,108],14,fill=col1+(255,),outline=(15,15,25,255),width=3)
        for x in range(24,100,8):
            y=64+int(8*math.sin((x+f*8)/16))
            d.line([(x,y),(x+6,y)],fill=col2+(200,),width=4)
        fr.append(i)
    return fr
ITEMS=[]
for n,c,h in [('gem_emerald',(40,220,120),(180,255,210)),('gem_ruby',(230,40,70),(255,170,190)),('gem_sapphire',(40,110,255),(170,210,255)),('gem_amethyst',(170,80,255),(230,190,255)),('gem_topaz',(255,180,40),(255,230,170)),('gem_onyx',(70,70,90),(150,150,170))]:
    ITEMS.append((n,gem(c,h)))
for n,c,h in [('ingot_iron',(220,220,230),(255,255,255)),('ingot_gold',(255,200,40),(255,240,150)),('ingot_netherite',(70,60,66),(140,120,120)),('ingot_copper',(200,110,70),(255,180,140)),('ingot_diamond',(120,230,240),(220,255,255)),('lump_coal',(40,40,46),(110,110,120))]:
    ITEMS.append((n,ingot(c,h)))
for n,b,e in [('face_happy',(255,210,80),'happy'),('face_sad',(120,170,255),'sad'),('face_angry',(255,90,70),'angry'),('face_laugh',(255,230,110),'laugh'),('face_cry',(110,190,255),'cry'),('face_love',(255,120,160),'love'),('face_cool',(120,220,200),'cool'),('face_wink',(255,200,120),'wink'),('face_shock',(255,240,140),'shock'),('face_sleep',(170,160,255),'sleep'),('face_bruh',(200,200,200),'bruh'),('face_hype',(255,140,60),'hype'),('face_gg',(140,255,140),'gg'),('face_rip',(190,190,200),'rip'),('face_wow',(255,180,220),'wow'),('face_evil',(150,90,200),'evil'),('face_lol',(255,220,60),'lol')]:
    ITEMS.append((n,face(b,e)))
def apple(col,spark):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([30,44,98,110],fill=col+(255,),outline=(15,15,25,255),width=3)
        d.line([(64,44),(64,30)],fill=(90,60,30,255),width=6)
        d.ellipse([66,24,86,40],fill=(80,200,80,255))
        if spark and f%2: d.ellipse([44,56,52,64],fill=(255,255,255,220))
        fr.append(i)
    return fr
ITEMS+= [('food_apple',apple((230,40,50),False)),('food_gapple',apple((255,200,40),True))]
def bread():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y=2*int(math.sin(f/FR*2*math.pi))
        d.rounded_rectangle([24,50+y,104,100+y],20,fill=(210,150,70,255),outline=(120,80,30,255),width=3)
        d.arc([38,44+y,62,68+y],180,360,fill=(230,180,110,255),width=8); d.arc([64,44+y,90,68+y],180,360,fill=(230,180,110,255),width=8)
        fr.append(i)
    return fr
ITEMS.append(('food_bread',bread()))
def cookie():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([26,30,102,106],fill=(200,140,70,255),outline=(110,70,30,255),width=3)
        for j,(x,y) in enumerate([(46,52),(74,48),(60,72),(84,78),(42,82)]):
            on=(f+j)%3; d.ellipse([x,y,x+10,y+10],fill=(70,40,20,255) if on else (90,55,30,255))
        fr.append(i)
    return fr
ITEMS.append(('food_cookie',cookie()))
def cake():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([28,64,100,104],fill=(255,240,250,255),outline=(200,120,160,255),width=3)
        d.rectangle([28,64,100,78],fill=(255,120,170,255))
        d.rectangle([60,40,68,64],fill=(120,200,255,255))
        fl=4+2*(f%2); d.ellipse([64-fl//2,40-fl,64+fl//2,40],fill=(255,200,60,255))
        fr.append(i)
    return fr
ITEMS.append(('food_cake',cake()))
def melon():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.pieslice([22,30,106,114],0,180,fill=(255,90,100,255))
        d.arc([22,30,106,114],0,180,fill=(40,160,60,255),width=10)
        for j,x in enumerate([44,62,80]): d.ellipse([x,66+(f+j)%3,x+6,72+(f+j)%3],fill=(30,30,30,255))
        fr.append(i)
    return fr
ITEMS.append(('food_melon',melon()))
def pumpkin():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([24,40,104,108],fill=(240,140,30,255),outline=(140,70,10,255),width=3)
        d.line([(48,42),(48,106)],fill=(200,110,20,255),width=5); d.line([(80,42),(80,106)],fill=(200,110,20,255),width=5)
        d.line([(64,36),(70,24)],fill=(60,120,40,255),width=6)
        gl=255 if f%2 else 160
        d.polygon([(44,66),(56,66),(50,76)],fill=(gl,gl,60,255)); d.polygon([(72,66),(84,66),(78,76)],fill=(gl,gl,60,255))
        fr.append(i)
    return fr
ITEMS.append(('food_pumpkin',pumpkin()))
def carrot():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y=2*(f%2)
        d.polygon([(64,110),(46,50),(82,50)],fill=(250,130,30,255),outline=(150,70,10,255),width=3)
        d.line([(56,66),(72,66)],fill=(200,100,20,255),width=4); d.line([(58,82),(70,82)],fill=(200,100,20,255),width=4)
        d.line([(58,48),(50,30+y)],fill=(60,180,60,255),width=6); d.line([(70,48),(78,30-y)],fill=(60,180,60,255),width=6)
        fr.append(i)
    return fr
ITEMS.append(('food_carrot',carrot()))
def steak():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([26,44,102,100],fill=(150,70,40,255),outline=(90,40,20,255),width=3)
        d.ellipse([36,54,92,90],fill=(200,110,70,255))
        d.ellipse([84,84,104,102],fill=(250,240,230,255))
        if f%2: d.line([(44,40),(52,28)],fill=(200,200,200,150),width=4); d.line([(64,38),(72,26)],fill=(200,200,200,150),width=4)
        fr.append(i)
    return fr
ITEMS.append(('food_steak',steak()))
def mush():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        b=2*(f%2)
        d.rounded_rectangle([52,64,76,104],8,fill=(240,230,210,255))
        d.pieslice([26,26+b,102,86+b],180,360,fill=(230,50,50,255))
        d.ellipse([44,44+b,56,56+b],fill=(255,255,255,255)); d.ellipse([72,40+b,84,52+b],fill=(255,255,255,255))
        fr.append(i)
    return fr
ITEMS.append(('food_mushroom',mush()))
def berry():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([34,48,66,80],fill=(120,200,60,255)); d.ellipse([62,58,94,90],fill=(100,180,50,255)); d.ellipse([46,72,78,104],fill=(130,210,70,255))
        d.ellipse([44+(f%3)*4,58,50+(f%3)*4,64],fill=(255,255,255,200))
        fr.append(i)
    return fr
ITEMS.append(('food_berry',berry()))
def torch():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rounded_rectangle([58,54,70,110],5,fill=(120,80,40,255))
        fl=10+4*((f*7)%3)
        d.ellipse([64-fl//2,44-fl,64+fl//2,44],fill=(255,180,40,255))
        d.ellipse([64-fl//4,44-fl+4,64+fl//4,44],fill=(255,240,120,255))
        fr.append(i)
    return fr
ITEMS.append(('item_torch',torch()))
def chest():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([26,60,102,106],fill=(140,90,40,255),outline=(70,40,15,255),width=3)
        open_=6 if f%4<2 else 0
        d.rectangle([26,44-open_,102,60],fill=(170,110,50,255),outline=(70,40,15,255),width=3)
        d.rectangle([58,58,70,76],fill=(255,210,80,255))
        fr.append(i)
    return fr
ITEMS.append(('item_chest',chest()))
def furnace():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([28,30,100,106],fill=(120,120,130,255),outline=(60,60,70,255),width=3)
        d.rectangle([40,40,88,58],fill=(70,70,80,255))
        fl=6+3*(f%2)
        d.rectangle([48,70,80,96],fill=(40,40,46,255))
        d.polygon([(64,94),(64-fl,94),(64,94-fl),(64+fl,94)],fill=(255,160,40,255))
        fr.append(i)
    return fr
ITEMS.append(('item_furnace',furnace()))
def book():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([30,36,98,100],fill=(120,50,40,255),outline=(60,20,15,255),width=3)
        p=(f%4)*14
        d.rectangle([40+p//2,46,88,90],fill=(240,230,200,255))
        d.line([(44,56),(84,56)],fill=(120,110,90,255),width=3); d.line([(44,68),(84,68)],fill=(120,110,90,255),width=3)
        fr.append(i)
    return fr
ITEMS.append(('item_book',book()))
def map_():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([26,32,102,104],fill=(230,220,180,255),outline=(120,100,60,255),width=3)
        d.line([(34,50),(60,50),(60,74),(88,74)],fill=(120,100,60,255),width=3)
        x=34+((f*8)%56); d.ellipse([x,60,x+8,68],fill=(220,40,40,255))
        fr.append(i)
    return fr
ITEMS.append(('item_map',map_()))
def compass():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([24,24,104,104],fill=(200,160,80,255),outline=(100,70,30,255),width=4)
        d.ellipse([34,34,94,94],fill=(30,40,60,255))
        a=f/FR*2*math.pi
        d.line([(64,64),(64+26*math.cos(a),64+26*math.sin(a))],fill=(255,60,60,255),width=5)
        d.line([(64,64),(64-18*math.cos(a),64-18*math.sin(a))],fill=(230,230,230,255),width=5)
        fr.append(i)
    return fr
ITEMS.append(('item_compass',compass()))
def clock():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([24,24,104,104],fill=(255,210,80,255),outline=(140,100,20,255),width=4)
        d.ellipse([34,34,94,94],fill=(40,30,60,255))
        a=f/FR*2*math.pi
        d.line([(64,64),(64+24*math.sin(a),64-24*math.cos(a))],fill=(255,240,150,255),width=5)
        d.line([(64,64),(64+14*math.sin(a/3),64-14*math.cos(a/3))],fill=(255,240,150,255),width=6)
        fr.append(i)
    return fr
ITEMS.append(('item_clock',clock()))
def bow():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        pull=6*(f%4<2)
        d.arc([30,20,110,108],-70,70,fill=(140,90,40,255),width=8)
        d.line([(88,34),(88-pull,64),(88,94)],fill=(230,230,230,255),width=3)
        fr.append(i)
    return fr
ITEMS.append(('item_bow',bow()))
def shield():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        g=2*(f%2)
        d.polygon([(64,16+g),(104,30+g),(100,80+g),(64,112),(28,80+g),(24,30+g)],fill=(60,90,200,255),outline=(200,170,60,255),width=4)
        d.polygon([(64,34+g),(86,42+g),(64,92+g),(42,42+g)],fill=(200,170,60,255))
        fr.append(i)
    return fr
ITEMS.append(('item_shield',shield()))
def helmet():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.pieslice([26,30,102,106],180,360,fill=(120,220,235,255))
        d.rectangle([26,66,102,88],fill=(120,220,235,255),outline=(40,140,160,255),width=3)
        d.rectangle([38,70,56,84],fill=(20,30,40,255)); d.rectangle([72,70,90,84],fill=(20,30,40,255))
        sx=30+((f*10)%60); d.line([(sx,40),(sx+8,48)],fill=(255,255,255,180),width=3)
        fr.append(i)
    return fr
ITEMS.append(('item_helmet',helmet()))
def pearl():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([30,30,98,98],fill=(30,150,160,255),outline=(10,80,90,255),width=3)
        a=f/FR*2*math.pi
        d.ellipse([54+10*math.cos(a),54+10*math.sin(a),66+10*math.cos(a),66+10*math.sin(a)],fill=(180,255,255,200))
        fr.append(i)
    return fr
ITEMS.append(('item_pearl',pearl()))
def bone():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y=2*(f%2)
        d.rectangle([40,58+y,88,70+y],fill=(240,240,235,255))
        for x in (32,86):
            d.ellipse([x,46+y,x+16,62+y],fill=(240,240,235,255)); d.ellipse([x,62+y,x+16,78+y],fill=(240,240,235,255))
        fr.append(i)
    return fr
ITEMS.append(('item_bone',bone()))
def feather():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=6*math.sin(f/FR*2*math.pi)
        d.polygon([(40+a,100),(56,40),(76,28),(84,44),(64,104)],fill=(240,240,250,255),outline=(150,150,180,255),width=2)
        d.line([(52+a//2,92),(74,40)],fill=(150,150,180,255),width=3)
        fr.append(i)
    return fr
ITEMS.append(('item_feather',feather()))
def egg():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([36,30,92,106],fill=(240,235,220,255),outline=(170,160,140,255),width=3)
        d.ellipse([48,44,62,58],fill=(255,255,255,200))
        fr.append(i)
    return fr
ITEMS.append(('item_egg',egg()))
def bed():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rectangle([22,64,106,92],fill=(200,50,50,255),outline=(110,20,20,255),width=3)
        d.rectangle([22,52,46,70],fill=(240,240,240,255))
        d.rectangle([22,88,30,104],fill=(90,60,30,255)); d.rectangle([98,88,106,104],fill=(90,60,30,255))
        if f%4<2: d.text((60,20),'z',font=SF,fill=(160,200,255,255))
        fr.append(i)
    return fr
ITEMS.append(('item_bed',bed()))
ITEMS.append(('item_lava',wave((120,30,10),(255,150,30))))
ITEMS.append(('item_water',wave((30,80,200),(120,200,255))))
def ice():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rounded_rectangle([28,28,100,100],12,fill=(150,220,255,200),outline=(80,160,220,255),width=3)
        sx=34+((f*9)%56); d.line([(sx,36),(sx+12,60)],fill=(255,255,255,220),width=4)
        fr.append(i)
    return fr
ITEMS.append(('item_ice',ice()))
def redstone():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.polygon([(64,84),(44,64),(64,44),(84,64)],fill=(200,30,30,255))
        for j,(x,y) in enumerate([(40,80),(88,80),(64,30),(30,50),(98,50)]):
            if (f+j)%2: d.line([(x,y),(x+8,y+6)],fill=(255,60,60,220),width=3)
        fr.append(i)
    return fr
ITEMS.append(('item_redstone',redstone()))
def gunpowder():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.pieslice([30,50,98,110],180,360,fill=(90,90,95,255))
        for j,(x,y) in enumerate([(46,60),(64,52),(80,62),(56,70),(74,72)]):
            if (f+j)%3==0: d.ellipse([x,y,x+4,y+4],fill=(255,240,120,255))
        fr.append(i)
    return fr
ITEMS.append(('item_gunpowder',gunpowder()))
def blaze():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rounded_rectangle([58,26,70,102],6,fill=(250,200,60,255))
        for j,y in enumerate([36,60,84]):
            off=6 if (f+j)%2 else -6
            d.rounded_rectangle([30+off,y,44+off,y+12],5,fill=(250,180,40,255)); d.rounded_rectangle([84-off,y,98-off,y+12],5,fill=(250,180,40,255))
        fr.append(i)
    return fr
ITEMS.append(('item_blaze',blaze()))
def key():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=int(6*math.sin(f/FR*2*math.pi))
        d.ellipse([30,30+a//2,62,62+a//2],outline=(255,210,80,255),width=8)
        d.line([(58,58+a//2),(96,96)],fill=(255,210,80,255),width=8)
        d.line([(84,84),(92,76)],fill=(255,210,80,255),width=8); d.line([(94,94),(102,86)],fill=(255,210,80,255),width=8)
        fr.append(i)
    return fr
ITEMS.append(('item_key',key()))
def bell():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=int(8*math.sin(f/FR*2*math.pi))
        d.polygon([(64+a,26),(88+a//2,74),(92+a//2,88),(36+a//2,88),(40+a//2,74)],fill=(255,210,80,255),outline=(150,110,20,255),width=3)
        d.ellipse([58+a//2,88,70+a//2,100],fill=(150,110,20,255))
        fr.append(i)
    return fr
ITEMS.append(('item_bell',bell()))
def flint():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.polygon([(36,90),(48,44),(84,40),(92,70),(70,96)],fill=(70,70,80,255),outline=(30,30,40,255),width=3)
        if f%3==0: d.line([(84,36),(96,24)],fill=(255,240,120,255),width=4)
        fr.append(i)
    return fr
ITEMS.append(('item_flint',flint()))
def leaf():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=int(10*math.sin(f/FR*2*math.pi))
        d.polygon([(64,20+a),(96,60),(64,108),(32,60)],fill=(70,190,70,255),outline=(30,120,30,255),width=3)
        d.line([(64,30+a//2),(64,100)],fill=(30,120,30,255),width=4)
        fr.append(i)
    return fr
ITEMS.append(('nat_leaf',leaf()))
def flower(c1,c2):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        r=int(4*math.sin(f/FR*2*math.pi))
        for k in range(6):
            a=k*math.pi/3+f*0.2
            d.ellipse([64+30*math.cos(a)-10-r//2,64+30*math.sin(a)-10-r//2,64+30*math.cos(a)+10+r//2,64+30*math.sin(a)+10+r//2],fill=c1+(255,))
        d.ellipse([54,54,74,74],fill=c2+(255,))
        fr.append(i)
    return fr
ITEMS.append(('nat_rose',flower((230,50,70),(255,220,80))))
ITEMS.append(('nat_dandelion',flower((255,230,80),(255,160,40))))
def sun():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([40,40,88,88],fill=(255,210,60,255))
        for k in range(8):
            a=k*math.pi/4+f*math.pi/16
            d.line([(64+30*math.cos(a),64+30*math.sin(a)),(64+46*math.cos(a),64+46*math.sin(a))],fill=(255,210,60,255),width=6)
        fr.append(i)
    return fr
ITEMS.append(('nat_sun',sun()))
def moon():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([32,32,96,96],fill=(230,230,250,255))
        d.ellipse([44+(f%3),32,108,96],fill=(0,0,0,0))
        d.ellipse([40,40,52,52],fill=(190,190,220,255)); d.ellipse([52,66,60,74],fill=(190,190,220,255))
        fr.append(i)
    return fr
ITEMS.append(('nat_moon',moon()))
def cloud():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        x=int(6*math.sin(f/FR*2*math.pi))
        d.ellipse([30+x,50,70+x,86],fill=(240,240,250,255)); d.ellipse([56+x,40,96+x,80],fill=(240,240,250,255)); d.ellipse([44+x,58,84+x,94],fill=(250,250,255,255))
        fr.append(i)
    return fr
ITEMS.append(('nat_cloud',cloud()))
def rain():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([30,34,70,66],fill=(180,180,200,255)); d.ellipse([56,28,96,64],fill=(180,180,200,255))
        for j,x in enumerate([40,60,80]):
            y=70+((f*8+j*10)%30)
            d.line([(x,y),(x-4,y+10)],fill=(90,170,255,255),width=4)
        fr.append(i)
    return fr
ITEMS.append(('nat_rain',rain()))
def snow():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        for k in range(3):
            a=k*math.pi/3+f*math.pi/24
            d.line([(64-40*math.cos(a),64-40*math.sin(a)),(64+40*math.cos(a),64+40*math.sin(a))],fill=(220,240,255,255),width=5)
        d.ellipse([58,58,70,70],fill=(255,255,255,255))
        fr.append(i)
    return fr
ITEMS.append(('nat_snow',snow()))
def dice():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.rounded_rectangle([30,30,98,98],14,fill=(250,250,250,255),outline=(150,150,160,255),width=3)
        pats=[[(64,64)],[(46,46),(82,82)],[(46,46),(64,64),(82,82)],[(46,46),(82,46),(46,82),(82,82)],[(46,46),(82,46),(64,64),(46,82),(82,82)]]
        for (x,y) in pats[f%5]: d.ellipse([x-7,y-7,x+7,y+7],fill=(220,40,60,255))
        fr.append(i)
    return fr
ITEMS.append(('misc_dice',dice()))
def target():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([28,28,100,100],fill=(250,250,250,255)); d.ellipse([40,40,88,88],fill=(220,40,50,255)); d.ellipse([52,52,76,76],fill=(250,250,250,255)); d.ellipse([60,60,68,68],fill=(220,40,50,255))
        a=f/FR*2*math.pi
        d.line([(64+8*math.cos(a),64+8*math.sin(a)),(64+40*math.cos(a),64+40*math.sin(a))],fill=(40,40,40,255),width=4)
        fr.append(i)
    return fr
ITEMS.append(('misc_target',target()))
def check():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([24,24,104,104],fill=(50,200,100,255))
        d.line([(42,66),(58,84)],fill=(255,255,255,255),width=10)
        if f>2: d.line([(58,84),(90,46)],fill=(255,255,255,255),width=10)
        fr.append(i)
    return fr
ITEMS.append(('misc_check',check()))
def cross():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.ellipse([24,24,104,104],fill=(230,60,60,255))
        s=1+0.08*math.sin(f/FR*2*math.pi)
        d.line([(64-22*s,64-22*s),(64+22*s,64+22*s)],fill=(255,255,255,255),width=12)
        d.line([(64-22*s,64+22*s),(64+22*s,64-22*s)],fill=(255,255,255,255),width=12)
        fr.append(i)
    return fr
ITEMS.append(('misc_cross',cross()))
ITEMS.append(('misc_quest',txt('?',(255,210,80))))
ITEMS.append(('misc_excl',txt('!',(255,90,70))))
ITEMS.append(('misc_o7',txt('o7',(160,220,255))))
def updn(up,c):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y=int(6*math.sin(f/FR*2*math.pi))
        s=-1 if up else 1
        d.polygon([(64,64+s*44+s*y),(96,64+s*8+s*y),(32,64+s*8+s*y)],fill=c+(255,))
        d.rectangle([52,min(64+s*8,64+s*40),76,max(64+s*8,64+s*40)],fill=c+(255,))
        fr.append(i)
    return fr
ITEMS.append(('misc_up',updn(True,(80,220,120))))
ITEMS.append(('misc_down',updn(False,(255,90,70))))
ITEMS.append(('misc_vs',txt('VS',(255,120,40))))
ITEMS.append(('misc_100',txt('100',(255,60,60))))
for n,fr in ITEMS: save(n,fr)
print(len(made),'new emojis;',sum(made.values())//1024,'KB total')
