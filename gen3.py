# ═══════════════════════════════════════════════════════════════
#  gen3.py — 52 more premium animated emojis (RizokMC NEXUS)
#  mobs, ores, tools, status, party, food, gestures
# ═══════════════════════════════════════════════════════════════
from PIL import Image, ImageDraw, ImageFont
import math, os

W=128; FR=8
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',54)
SF=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30)
OUT=(18,16,28,255)
made={}
os.makedirs('assets/emojis3',exist_ok=True)

def save(n,frames):
    pf=[]
    for f in frames:
        alpha=f.getchannel('A')
        p=f.convert('RGB').convert('P',palette=Image.ADAPTIVE,colors=63)
        mask=alpha.point(lambda a:255 if a<=128 else 0)
        p.paste(63,mask)
        pf.append(p)
    pf[0].save(f'assets/emojis3/{n}.gif',save_all=True,append_images=pf[1:],duration=90,loop=0,disposal=2,transparency=63)
    made[n]=os.path.getsize(f'assets/emojis3/{n}.gif')

def ni(): return Image.new('RGBA',(W,W),(0,0,0,0))
def rr(d,box,fill,outline=None,width=1):
    x0,y0,x1,y1=box
    d.rectangle([min(x0,x1),min(y0,y1),max(x0,x1),max(y0,y1)],fill=fill,outline=outline,width=width)
def bob(f,amp=4): return amp*math.sin(f/FR*2*math.pi)
def blink(f): return 3 if f in (3,4) else 0
def sparkle(d,f,pts,col=(255,255,255,230),sz=3):
    for (px,py) in pts:
        ph=(f + px//17) % FR
        a=int(230*abs(math.sin(ph/FR*math.pi)))
        if a>40: d.ellipse([px-sz,py-sz,px+sz,py+sz],fill=col[:3]+(a,))

# ─────────────── MOBS (16) ───────────────
def mob_zombie():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        rr(d,[34,22+y,94,82+y],(94,160,80),OUT,3)
        rr(d,[34,22+y,94,34+y],(120,190,100))  # top light
        d.ellipse([44,40+y,58,54+y],fill=(20,30,20,255)); d.ellipse([70,40+y,84,54+y],fill=(20,30,20,255))
        d.ellipse([48,44+y,53,49+y],fill=(60,90,60,255)); d.ellipse([74,44+y,79,49+y],fill=(60,90,60,255))
        d.line([(50,68+y),(78,68+y)],fill=(30,50,30,255),width=5)
        ay=6+y*(1 if f<4 else -1)
        rr(d,[16,50+y+ay,32,58+y+ay],(94,160,80),OUT,3); rr(d,[96,50+y-ay,112,58+y-ay],(94,160,80),OUT,3)
        rr(d,[40,84+y,56,108+y],(70,120,60),OUT,3); rr(d,[72,84+y,88,108+y],(70,120,60),OUT,3)
        fr.append(i)
    return fr
def mob_skeleton():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);x=2 if f%2 else -2
        rr(d,[34+x,20,94+x,80],(226,226,214),OUT,3)
        rr(d,[42+x,38,60+x,54],(30,30,36,255)); rr(d,[68+x,38,86+x,54],(30,30,36,255))
        d.ellipse([47+x,42,53+x,48],fill=(120,20,20,255)); d.ellipse([73+x,42,79+x,48],fill=(120,20,20,255))
        rr(d,[58+x,56,70+x,64],(40,40,46,255))
        for k in range(4): rr(d,[40+x+k*13,68,48+x+k*13,76],(200,200,190),OUT,2)
        d.line([(64+x,80),(64+x,104)],fill=(210,210,200,255),width=6)
        d.line([(48+x,90),(80+x,90)],fill=(210,210,200,255),width=5)
        fr.append(i)
    return fr
def mob_spider():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        for s in (-1,1):
            for k in range(4):
                ph=math.sin((f+k)/FR*2*math.pi)*6
                d.line([(64+s*14,60+y),(64+s*(30+k*6),44+k*10+ph)],fill=(30,22,30,255),width=4)
        d.ellipse([36,44+y,92,88+y],fill=(48,34,46,255),outline=OUT,width=3)
        d.ellipse([46,36+y,82,60+y],fill=(58,42,56,255),outline=OUT,width=3)
        for ex in (54,66):
            d.ellipse([ex-3,44+y,ex+3,50+y],fill=(230,40,40,255))
        sparkle(d,f,[(52,44+y),(70,44+y)],col=(255,90,90),sz=2)
        fr.append(i)
    return fr
def mob_enderman():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        rr(d,[36,16+y,92,74+y],(16,14,20,255),OUT,3)
        gl=180+int(60*math.sin(f/FR*2*math.pi))
        d.ellipse([44,38+y,58,50+y],fill=(210,90,255,gl)); d.ellipse([70,38+y,84,50+y],fill=(210,90,255,gl))
        d.ellipse([46,40+y,56,48+y],fill=(245,190,255,gl)); d.ellipse([72,40+y,82,48+y],fill=(245,190,255,gl))
        rr(d,[54,74+y,62,100+y],(16,14,20,255)); rr(d,[66,74+y,74,100+y],(16,14,20,255))
        sparkle(d,f,[(30,30+y),(98,44+y),(36,86+y),(94,90+y)],col=(210,120,255),sz=3)
        fr.append(i)
    return fr
def mob_pig():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3);b=blink(f)
        rr(d,[28,24+y,100,88+y],(240,150,160),OUT,3)
        d.polygon([(30,26+y),(30,10+y),(46,24+y)],fill=(235,130,145),outline=OUT)
        d.polygon([(98,26+y),(98,10+y),(82,24+y)],fill=(235,130,145),outline=OUT)
        if b<2:
            d.ellipse([42,42+y,52,52+y],fill=(40,25,35,255)); d.ellipse([76,42+y,86,52+y],fill=(40,25,35,255))
        else:
            d.line([(42,47+y),(52,47+y)],fill=(40,25,35,255),width=3); d.line([(76,47+y),(86,47+y)],fill=(40,25,35,255),width=3)
        rr(d,[50,56+y,78,74+y],(225,120,135),OUT,3)
        d.ellipse([56,62+y,61,69+y],fill=(150,70,90,255)); d.ellipse([67,62+y,72,69+y],fill=(150,70,90,255))
        fr.append(i)
    return fr
def mob_cow():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3);b=blink(f)
        d.polygon([(32,22+y),(24,6+y),(44,16+y)],fill=(222,214,196),outline=OUT)
        d.polygon([(96,22+y),(104,6+y),(84,16+y)],fill=(222,214,196),outline=OUT)
        rr(d,[30,20+y,98,86+y],(236,230,214),OUT,3)
        rr(d,[30,20+y,58,52+y],(90,62,44,255)); rr(d,[74,54+y,98,86+y],(90,62,44,255))
        if b<2:
            d.ellipse([42,44+y,52,54+y],fill=(30,24,30,255)); d.ellipse([76,44+y,86,54+y],fill=(30,24,30,255))
        else:
            d.line([(42,49+y),(52,49+y)],fill=(30,24,30,255),width=3); d.line([(76,49+y),(86,49+y)],fill=(30,24,30,255),width=3)
        rr(d,[50,64+y,78,82+y],(244,170,180),OUT,3)
        d.ellipse([56,70+y,61,77+y],fill=(160,90,100,255)); d.ellipse([67,70+y,72,77+y],fill=(160,90,100,255))
        fr.append(i)
    return fr
def mob_sheep():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2);b=blink(f)
        for (cx,cy) in [(40,34),(64,26),(88,34),(30,58),(98,58),(36,80),(92,80),(64,88)]:
            d.ellipse([cx-16,cy-14+y,cx+16,cy+14+y],fill=(242,240,236),outline=(200,196,190,255),width=2)
        rr(d,[46,44+y,82,78+y],(214,178,150),OUT,3)
        if b<2:
            d.ellipse([53,52+y,60,60+y],fill=(40,30,35,255)); d.ellipse([68,52+y,75,60+y],fill=(40,30,35,255))
        else:
            d.line([(53,56+y),(60,56+y)],fill=(40,30,35,255),width=3); d.line([(68,56+y),(75,56+y)],fill=(40,30,35,255),width=3)
        d.ellipse([58,64+y,70,70+y],fill=(180,140,115,255))
        fr.append(i)
    return fr
def mob_chicken():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,4)
        d.polygon([(56,10+y),(50,24+y),(62,24+y)],fill=(220,60,50,255))
        d.polygon([(66,8+y),(62,24+y),(74,24+y)],fill=(220,60,50,255))
        d.ellipse([36,22+y,92,74+y],fill=(246,244,238),outline=OUT,width=3)
        d.ellipse([46,38+y,56,48+y],fill=(35,30,35,255)); d.ellipse([70,38+y,80,48+y],fill=(35,30,35,255))
        d.ellipse([49,40+y,53,44+y],fill=(255,255,255,255)); d.ellipse([73,40+y,77,44+y],fill=(255,255,255,255))
        d.polygon([(58,54+y),(70,54+y),(64,68+y)],fill=(245,150,40,255),outline=OUT)
        rr(d,[54,76+y,62,96+y],(240,160,50),OUT,2); rr(d,[66,76+y,74,96+y],(240,160,50),OUT,2)
        fr.append(i)
    return fr
def mob_wolf():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3);b=blink(f)
        d.polygon([(30,30+y),(26,8+y),(48,20+y)],fill=(196,196,202),outline=OUT)
        d.polygon([(98,30+y),(102,8+y),(80,20+y)],fill=(196,196,202),outline=OUT)
        rr(d,[28,24+y,100,86+y],(216,216,222),OUT,3)
        if b<2:
            d.ellipse([42,42+y,52,52+y],fill=(40,35,40,255)); d.ellipse([76,42+y,86,52+y],fill=(40,35,40,255))
        else:
            d.line([(42,47+y),(52,47+y)],fill=(40,35,40,255),width=3); d.line([(76,47+y),(86,47+y)],fill=(40,35,40,255),width=3)
        d.polygon([(56,58+y),(72,58+y),(64,68+y)],fill=(50,44,50,255))
        tl=(f%FR)/FR*8
        d.pieslice([52,70+y,76,86+y+int(tl)],0,180,fill=(240,110,120,255),outline=OUT)
        fr.append(i)
    return fr
def mob_cat():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3);b=blink(f)
        d.polygon([(30,32+y),(30,8+y),(52,22+y)],fill=(228,150,60),outline=OUT)
        d.polygon([(98,32+y),(98,8+y),(76,22+y)],fill=(228,150,60),outline=OUT)
        rr(d,[28,26+y,100,88+y],(240,170,70),OUT,3)
        if b<2:
            d.ellipse([42,44+y,54,56+y],fill=(120,190,60,255),outline=OUT,width=2); d.ellipse([74,44+y,86,56+y],fill=(120,190,60,255),outline=OUT,width=2)
            d.line([(48,46+y),(48,54+y)],fill=(20,20,25,255),width=3); d.line([(80,46+y),(80,54+y)],fill=(20,20,25,255),width=3)
        else:
            d.line([(42,50+y),(54,50+y)],fill=(20,20,25,255),width=3); d.line([(74,50+y),(86,50+y)],fill=(20,20,25,255),width=3)
        d.polygon([(60,62+y),(68,62+y),(64,68+y)],fill=(240,120,130,255))
        for wy in (58,64):
            d.line([(30,wy+y),(12,wy-4+y)],fill=(90,60,30,255),width=2); d.line([(98,wy+y),(116,wy-4+y)],fill=(90,60,30,255),width=2)
        fr.append(i)
    return fr
def mob_villager():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        rr(d,[32,20+y,96,84+y],(196,150,110),OUT,3)
        d.line([(40,38+y),(58,44+y)],fill=(60,40,30,255),width=5); d.line([(88,38+y),(70,44+y)],fill=(60,40,30,255),width=5)
        d.ellipse([44,46+y,54,56+y],fill=(50,60,55,255)); d.ellipse([74,46+y,84,56+y],fill=(50,60,55,255))
        rr(d,[58,52+y,70,72+y],(176,128,92),OUT,3)
        d.line([(50,76+y),(78,76+y)],fill=(80,50,40,255),width=4)
        rr(d,[40,86+y,88,104+y],(120,80,50),OUT,3)
        fr.append(i)
    return fr
def mob_witch():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        d.polygon([(64,2+y),(30,34+y),(98,34+y)],fill=(90,50,140),outline=OUT)
        rr(d,[24,32+y,104,42+y],(70,38,110),OUT,3)
        rr(d,[36,42+y,92,88+y],(206,170,150),OUT,3)
        d.ellipse([46,52+y,56,62+y],fill=(60,40,70,255)); d.ellipse([72,52+y,82,62+y],fill=(60,40,70,255))
        d.ellipse([60,62+y,68,72+y],fill=(160,120,110,255))
        d.arc([48,70+y,80,86+y],0,180,fill=(90,50,60,255),width=4)
        sparkle(d,f,[(26,20+y),(102,28+y),(20,70+y)],col=(190,120,255),sz=3)
        fr.append(i)
    return fr
def mob_blaze():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        rr(d,[38,26+y,90,72+y],(250,180,50),OUT,3)
        rr(d,[38,26+y,90,36+y],(255,210,110))
        d.ellipse([48,40+y,58,50+y],fill=(255,240,200,255)); d.ellipse([70,40+y,80,50+y],fill=(255,240,200,255))
        d.ellipse([50,42+y,56,48+y],fill=(200,80,20,255)); d.ellipse([72,42+y,78,48+y],fill=(200,80,20,255))
        for k in range(3):
            a=(f+k*2)/FR*2*math.pi
            rx=64+44*math.cos(a); ry=88+10*math.sin(a)
            rr(d,[rx-4,ry,rx+4,ry+16],(255,150,30),OUT,2)
        fr.append(i)
    return fr
def mob_ghast():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,4)
        d.ellipse([20,14+y,108,92+y],fill=(240,238,238),outline=OUT,width=3)
        d.ellipse([42,44+y,56,64+y],fill=(60,20,30,255)); d.ellipse([72,44+y,86,64+y],fill=(60,20,30,255))
        d.ellipse([38,66+y,50,74+y],fill=(250,170,180,140)); d.ellipse([78,66+y,90,74+y],fill=(250,170,180,140))
        d.arc([50,66+y,78,82+y],0,180,fill=(80,30,40,255),width=4)
        for k in range(4):
            tx=34+k*20; ph=math.sin((f+k)/FR*2*math.pi)*5
            d.line([(tx,88+y),(tx+ph,112+y)],fill=(210,206,206,255),width=5)
        fr.append(i)
    return fr
def mob_slime():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        sq=abs(math.sin(f/FR*math.pi))*10
        x0=int(24-sq/2); x1=int(104+sq/2); y0=int(30+sq); y1=104
        rr(d,[x0,y0,x1,y1],(110,200,90,200),OUT,3)
        rr(d,[x0+8,y0+6,x1-8,y0+18],(160,230,140,160))
        ey=y0+int((y1-y0)*0.35)
        d.ellipse([46,ey,58,ey+12],fill=(30,50,30,255)); d.ellipse([70,ey,82,ey+12],fill=(30,50,30,255))
        d.ellipse([49,ey+2,53,ey+6],fill=(200,255,200,255)); d.ellipse([73,ey+2,77,ey+6],fill=(200,255,200,255))
        my=ey+22
        d.arc([50,my,78,my+14],0,180,fill=(30,50,30,255),width=4)
        fr.append(i)
    return fr
def mob_bat():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,5)
        fl=math.sin(f/FR*2*math.pi)*16
        d.polygon([(56,58+y),(12,34+y+fl),(20,64+y),(40,70+y)],fill=(90,60,120),outline=OUT)
        d.polygon([(72,58+y),(116,34+y+fl),(108,64+y),(88,70+y)],fill=(90,60,120),outline=OUT)
        d.ellipse([44,40+y,84,80+y],fill=(110,74,146),outline=OUT,width=3)
        d.polygon([(46,42+y),(44,28+y),(58,38+y)],fill=(110,74,146),outline=OUT)
        d.polygon([(82,42+y),(84,28+y),(70,38+y)],fill=(110,74,146),outline=OUT)
        d.ellipse([52,52+y,60,60+y],fill=(240,200,80,255)); d.ellipse([68,52+y,76,60+y],fill=(240,200,80,255))
        d.ellipse([54,54+y,57,57+y],fill=(30,20,35,255)); d.ellipse([70,54+y,73,57+y],fill=(30,20,35,255))
        fr.append(i)
    return fr

# ─────────────── ORES (6) ───────────────
def ore(col,hi):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        rr(d,[14,14,114,114],(128,128,134),OUT,3)
        rr(d,[14,14,114,26],(150,150,156)); rr(d,[14,102,114,114],(100,100,108))
        for (cx,cy,s) in [(40,42,12),(76,36,10),(58,68,14),(88,72,9),(34,86,9)]:
            d.polygon([(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)],fill=col+(255,),outline=(20,20,28,255),width=2)
            d.polygon([(cx,cy-s+3),(cx+4,cy-2),(cx,cy+1),(cx-4,cy-2)],fill=hi+(160,))
        sparkle(d,f,[(40,42),(58,68),(88,72)],col=(255,255,255),sz=3)
        fr.append(i)
    return fr

# ─────────────── TOOLS (8) ───────────────
def tool_axe():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=math.sin(f/FR*2*math.pi)*0.25
        ca,sa=math.cos(a),math.sin(a)
        def rot(px,py):
            x,y=px-64,py-64
            return (64+x*ca-y*sa,64+x*sa+y*ca)
        d.line([rot(58,104),rot(70,44)],fill=(140,96,50,255),width=9)
        d.polygon([rot(64,20),rot(98,32),rot(94,56),rot(66,48),rot(56,34)],fill=(150,225,240,255),outline=OUT,width=3)
        d.polygon([rot(64,20),rot(36,30),rot(40,50),rot(62,44),rot(56,34)],fill=(110,190,210,255),outline=OUT,width=3)
        sparkle(d,f,[(96,34),(40,30)])
        fr.append(i)
    return fr
def tool_shovel():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,4)
        d.line([(64,110),(64,52+y)],fill=(140,96,50,255),width=9)
        rr(d,[46,20+y,82,54+y],(150,225,240),OUT,3)
        d.polygon([(46,54+y),(82,54+y),(72,64+y),(56,64+y)],fill=(110,190,210,255),outline=OUT)
        sparkle(d,f,[(52,28+y),(76,44+y)])
        fr.append(i)
    return fr
def tool_hoe():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,4)
        d.line([(58,110),(70,44+y)],fill=(140,96,50,255),width=9)
        rr(d,[64,26+y,104,38+y],(150,225,240),OUT,3)
        rr(d,[92,26+y,104,52+y],(110,190,210),OUT,3)
        sparkle(d,f,[(98,30+y),(70,40+y)])
        fr.append(i)
    return fr
def tool_trident():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,5)
        d.line([(64,112),(64,40+y)],fill=(200,180,140,255),width=7)
        for px in (48,64,80):
            d.polygon([(px,10+y),(px-6,30+y),(px+6,30+y)],fill=(90,220,220,255),outline=OUT,width=2)
            d.line([(px,30+y),(px,42+y)],fill=(90,200,200,255),width=5)
        d.line([(48,40+y),(80,40+y)],fill=(90,200,200,255),width=5)
        sparkle(d,f,[(48,14+y),(80,14+y),(64,60+y)],col=(140,255,255))
        fr.append(i)
    return fr
def tool_crossbow():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.arc([24,24+y,104,80+y],200,340,fill=(140,96,50,255),width=8)
        d.line([(64,34+y),(64,92+y)],fill=(110,74,40,255),width=9)
        pull=4*math.sin(f/FR*2*math.pi)
        d.line([(30,44+y),(64,60+y+pull),(98,44+y)],fill=(220,220,210,255),width=3)
        if pull<0:
            d.line([(64,60+y+pull),(64,34+y)],fill=(190,190,190,255),width=3)
        rr(d,[56,88+y,72,102+y],(90,60,32),OUT,2)
        fr.append(i)
    return fr
def tool_ebook():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.polygon([(18,34+y),(62,44+y),(62,104+y),(18,94+y)],fill=(120,60,160),outline=OUT,width=3)
        d.polygon([(110,34+y),(66,44+y),(66,104+y),(110,94+y)],fill=(140,75,180),outline=OUT,width=3)
        d.polygon([(24,40+y),(58,48+y),(58,98+y),(24,90+y)],fill=(238,230,244))
        d.polygon([(104,40+y),(70,48+y),(70,98+y),(104,90+y)],fill=(228,218,236))
        gl=150+int(100*math.sin(f/FR*2*math.pi))
        for k in range(3):
            d.line([(30,54+k*14+y),(52,58+k*14+y)],fill=(160,90,220,gl),width=3)
            d.line([(76,58+k*14+y),(98,54+k*14+y)],fill=(160,90,220,gl),width=3)
        sparkle(d,f,[(64,26+y),(40,30+y),(88,30+y)],col=(210,150,255),sz=4)
        fr.append(i)
    return fr
def tool_totem():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        gl=140+int(110*math.sin(f/FR*2*math.pi))
        rr(d,[34,14+y,94,110+y],(30,160,110),OUT,3)
        rr(d,[34,14+y,94,26+y],(60,200,140))
        d.ellipse([42,34+y,58,50+y],fill=(240,240,230,255),outline=OUT,width=2)
        d.ellipse([70,34+y,86,50+y],fill=(240,240,230,255),outline=OUT,width=2)
        d.ellipse([46,38+y,54,46+y],fill=(20,90,60,gl)); d.ellipse([74,38+y,82,46+y],fill=(20,90,60,gl))
        rr(d,[56,52+y,72,64+y],(20,120,80),OUT,2)
        d.line([(44,76+y),(84,76+y)],fill=(15,80,55,255),width=6)
        for k in range(4): d.line([(48+k*12,76+y),(48+k*12,86+y)],fill=(15,80,55,255),width=3)
        sparkle(d,f,[(26,24+y),(102,40+y),(26,90+y)],col=(90,255,190),sz=3)
        fr.append(i)
    return fr
def tool_elytra():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        fl=math.sin(f/FR*2*math.pi)*14
        d.polygon([(62,30+y),(20,20+y+fl),(28,84+y),(60,74+y)],fill=(196,196,204),outline=OUT,width=3)
        d.polygon([(66,30+y),(108,20+y+fl),(100,84+y),(68,74+y)],fill=(180,180,190),outline=OUT,width=3)
        d.line([(40,32+y+fl/2),(44,76+y)],fill=(140,140,150,255),width=3)
        d.line([(88,32+y+fl/2),(84,76+y)],fill=(130,130,142,255),width=3)
        rr(d,[58,26+y,70,78+y],(120,120,132),OUT,2)
        fr.append(i)
    return fr

# ─────────────── STATUS (4) ───────────────
def status_disc(kind):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        p=1+0.06*math.sin(f/FR*2*math.pi)
        r=int(44*p)
        cx,cy=64,64
        if kind=='online':
            d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(60,200,90,255),outline=(30,120,55,255),width=4)
            d.ellipse([cx-r+10,cy-r+8,cx-6,cy-6],fill=(130,235,150,150))
        elif kind=='idle':
            d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(245,190,60,255),outline=(160,120,30,255),width=4)
            d.ellipse([cx-r+24,cy-r-10,cx+r+14,cy+r-24],fill=(0,0,0,0))
        elif kind=='dnd':
            d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(235,70,80,255),outline=(150,35,45,255),width=4)
            rr(d,[cx-24,cy-5,cx+24,cy+5],(255,240,240,255))
        else:
            d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(120,124,138,255),outline=(80,84,96,255),width=4)
            zy=30-(f*3)%18
            d.text((84,zy),'z',font=SF,fill=(240,244,255,255))
            d.text((98,zy-14),'Z',font=SF,fill=(240,244,255,200))
        sparkle(d,f,[(24,28),(104,40),(30,100)],col=(255,255,255),sz=2)
        fr.append(i)
    return fr

# ─────────────── PARTY (4) ───────────────
def party_confetti():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        cols=[(255,90,110),(90,200,255),(255,210,70),(140,255,150),(220,130,255)]
        for k in range(10):
            cx=16+(k*23)%100
            cy=((f*14+k*29)%140)-10
            c=cols[k%5]
            d.polygon([(cx,cy),(cx+8,cy+3),(cx+6,cy+11),(cx-2,cy+8)],fill=c+(255,))
        fr.append(i)
    return fr
def party_balloon():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,5)
        d.ellipse([34,12+y,94,76+y],fill=(240,80,100),outline=(170,45,65,255),width=3)
        d.ellipse([46,24+y,62,42+y],fill=(255,160,175,170))
        d.polygon([(60,76+y),(68,76+y),(64,86+y)],fill=(200,60,80,255))
        ph=math.sin(f/FR*2*math.pi)*5
        d.line([(64,86+y),(64+ph,100+y),(64-ph,112+y)],fill=(200,200,210,255),width=2)
        fr.append(i)
    return fr
def party_popper():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.polygon([(30,104),(54,58),(70,74),(46,116)],fill=(250,190,60),outline=OUT,width=3)
        d.polygon([(30,104),(42,82),(50,90),(38,112)],fill=(255,120,90,255))
        cols=[(255,90,110),(90,200,255),(255,210,70),(140,255,150)]
        ext=(f/FR)*22
        for k in range(7):
            a=-0.9+k*0.3
            bx=62+math.cos(a)*(14+ext+ (k%3)*5); by=66+math.sin(a)*(14+ext+(k%3)*5)
            d.ellipse([bx-4,by-4,bx+4,by+4],fill=cols[k%4]+(255,))
        fr.append(i)
    return fr
def party_fireworks():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        d.line([(34,116),(60,92)],fill=(150,110,70,255),width=5)
        prog=f/FR
        if prog<0.45:
            ry=92-prog/0.45*64
            d.polygon([(60,ry-10),(55,ry+2),(65,ry+2)],fill=(255,140,80,255))
            sparkle(d,f,[(60,ry+8)],col=(255,190,120),sz=3)
        else:
            e=(prog-0.45)/0.55
            cols=[(255,90,110),(90,200,255),(255,210,70),(140,255,150),(220,130,255),(255,160,90),(120,255,220),(255,120,220)]
            for k in range(8):
                a=k/8*2*math.pi+0.3
                rr_=10+e*34
                bx=60+math.cos(a)*rr_; by=30+math.sin(a)*rr_
                d.ellipse([bx-3,by-3,bx+3,by+3],fill=cols[k]+(int(255*(1-e*0.55)),))
        fr.append(i)
    return fr

# ─────────────── FOOD (6) ───────────────
def food_burger():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.pieslice([26,20+y,102,72+y],180,360,fill=(232,178,96),outline=OUT,width=3)
        rr(d,[24,44+y,104,56+y],(120,190,80),OUT,2)
        rr(d,[26,54+y,102,72+y],(122,72,42),OUT,3)
        rr(d,[24,70+y,104,82+y],(250,200,70),OUT,2)
        d.pieslice([26,64+y,102,108+y],0,180,fill=(222,164,88),outline=OUT,width=3)
        sparkle(d,f,[(44,26+y),(84,30+y)])
        fr.append(i)
    return fr
def food_fries():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        for k in range(5):
            fx=36+k*13; fy=22+y+(k%2)*8
            rr(d,[fx,fy,fx+8,62+y],(250,205,80),OUT,2)
        d.polygon([(28,56+y),(100,56+y),(92,112+y),(36,112+y)],fill=(225,60,60),outline=OUT,width=3)
        rr(d,[28,56+y,100,68+y],(245,90,90))
        fr.append(i)
    return fr
def food_icecream():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.polygon([(42,58+y),(86,58+y),(64,116+y)],fill=(214,164,100),outline=OUT,width=3)
        for lx in (50,60,70):
            d.line([(lx,64+y),(lx+6,96+y)],fill=(180,130,70,255),width=2)
        d.ellipse([36,22+y,92,64+y],fill=(250,150,190),outline=OUT,width=3)
        d.ellipse([46,30+y,62,44+y],fill=(255,200,225,200))
        d.ellipse([88,44+y,96,56+y],fill=(240,80,110,255),outline=OUT,width=2)
        dy=(f*4)%16
        d.ellipse([42,60+y+dy,50,70+y+dy],fill=(250,150,190,220))
        fr.append(i)
    return fr
def food_donut():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=f/FR*2*math.pi
        d.ellipse([16,16,112,112],fill=(226,168,106),outline=OUT,width=3)
        d.pieslice([16,16,112,112],0,360,fill=(226,168,106))
        d.ellipse([22,22,106,106],fill=(245,140,180))
        d.ellipse([46,46,82,82],fill=(0,0,0,0))
        d.ellipse([46,46,82,82],outline=(200,120,150,255),width=4)
        cols=[(255,255,255),(120,220,255),(255,230,120),(160,255,170)]
        for k in range(8):
            sa=a+k/8*2*math.pi
            sx=64+30*math.cos(sa); sy=64+30*math.sin(sa)
            d.line([(sx-4,sy-2),(sx+4,sy+2)],fill=cols[k%4]+(255,),width=3)
        fr.append(i)
    return fr
def food_candy():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        tw=math.sin(f/FR*2*math.pi)*10
        d.polygon([(36,48),(12,34+tw),(12,94+tw),(36,80)],fill=(240,90,120),outline=OUT,width=2)
        d.polygon([(92,48),(116,34+tw),(116,94+tw),(92,80)],fill=(240,90,120),outline=OUT,width=2)
        d.ellipse([30,38,98,90],fill=(250,110,140),outline=OUT,width=3)
        d.arc([36,44,92,84],200,340,fill=(255,255,255,230),width=6)
        fr.append(i)
    return fr
def food_choco():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        rr(d,[24,30+y,104,98+y],(110,68,40),OUT,3)
        for gy in range(2):
            for gx in range(3):
                rr(d,[30+gx*24,36+gy*30+y,50+gx*24,58+gy*30+y],(140,92,58),(80,48,28,255),2)
        sx=20+((f*12)%80)
        d.line([(sx,38+y),(sx+14,38+y)],fill=(255,240,220,170),width=4)
        fr.append(i)
    return fr

# ─────────────── GESTURES (8) ───────────────
def gest_hand(kind):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        SK=(250,205,170); OL=(190,140,105,255)
        p=1+0.08*math.sin(f/FR*2*math.pi)
        if kind=='up':
            rr(d,[44,44,88,100],SK,OL,3)
            rr(d,[48,16,64,52],SK,OL,3)
            rr(d,[44,64,88,76],SK,OL,2)
        elif kind=='down':
            rr(d,[44,28,88,84],SK,OL,3)
            rr(d,[68,76,84,112],SK,OL,3)
            rr(d,[44,52,88,64],SK,OL,2)
        elif kind=='clap':
            g=int(14*abs(math.sin(f/FR*math.pi)))
            rr(d,[30-g,40,58-g,96],SK,OL,3)
            rr(d,[70+g,40,98+g,96],SK,OL,3)
            if g<3: sparkle(d,f,[(64,30),(54,44),(74,44)],col=(255,230,140),sz=4)
        elif kind=='wave':
            a=math.sin(f/FR*2*math.pi)*0.35
            ca,sa=math.cos(a),math.sin(a)
            def rot(px,py):
                x,y=px-64,py-96
                return (64+x*ca-y*sa,96+x*sa+y*ca)
            d.polygon([rot(44,96),rot(84,96),rot(80,52),rot(48,52)],fill=SK,outline=OL,width=3)
            for k in range(4):
                d.polygon([rot(48+k*9,54),rot(56+k*9,54),rot(56+k*9,22),rot(48+k*9,22)],fill=SK,outline=OL,width=2)
        elif kind=='salute':
            rr(d,[46,50,86,104],SK,OL,3)
            rr(d,[40,28,80,44],SK,OL,3)
            rr(d,[46,58,86,70],SK,OL,2)
            sparkle(d,f,[(96,26),(104,42)],col=(255,230,140),sz=3)
        elif kind=='shush':
            rr(d,[52,40,76,104],SK,OL,3)
            rr(d,[58,14,70,48],SK,OL,3)
            rr(d,[40,64,88,88],SK,OL,2)
            d.ellipse([58,58,70,70],fill=(230,120,130,255))
        elif kind=='ok':
            d.ellipse([30,44,74,88],outline=SK,width=14)
            d.ellipse([30,44,74,88],outline=OL,width=2)
            rr(d,[66,26,80,60],SK,OL,3)
            rr(d,[74,36,90,66],SK,OL,3)
            rr(d,[80,48,96,74],SK,OL,3)
        else: # fingerheart
            rr(d,[48,44,64,100],SK,OL,3)
            rr(d,[60,40,76,88],SK,OL,3)
            hx,hy=66,34
            hs=6+4*abs(math.sin(f/FR*math.pi))
            d.polygon([(hx,hy+hs),(hx-hs,hy),(hx-hs*0.5,hy-hs*0.6),(hx,hy-hs*0.2),(hx+hs*0.5,hy-hs*0.6),(hx+hs,hy)],fill=(240,80,110,255))
        fr.append(i)
    return fr

# ═══════════════ REGISTER ═══════════════
ALL = {
 'mob_zombie':mob_zombie,'mob_skeleton':mob_skeleton,'mob_spider':mob_spider,'mob_enderman':mob_enderman,
 'mob_pig':mob_pig,'mob_cow':mob_cow,'mob_sheep':mob_sheep,'mob_chicken':mob_chicken,'mob_wolf':mob_wolf,
 'mob_cat':mob_cat,'mob_villager':mob_villager,'mob_witch':mob_witch,'mob_blaze':mob_blaze,'mob_ghast':mob_ghast,
 'mob_slime':mob_slime,'mob_bat':mob_bat,
 'ore_diamond':lambda:ore((90,225,235),(220,255,255)),
 'ore_gold':lambda:ore((250,205,70),(255,240,170)),
 'ore_iron':lambda:ore((216,176,150),(245,220,200)),
 'ore_coal':lambda:ore((45,45,52),(110,110,120)),
 'ore_lapis':lambda:ore((50,80,200),(120,150,255)),
 'ore_redstone':lambda:ore((220,40,40),(255,120,120)),
 'tool_axe':tool_axe,'tool_shovel':tool_shovel,'tool_hoe':tool_hoe,'tool_trident':tool_trident,
 'tool_crossbow':tool_crossbow,'tool_ebook':tool_ebook,'tool_totem':tool_totem,'tool_elytra':tool_elytra,
 'st_online':lambda:status_disc('online'),'st_idle':lambda:status_disc('idle'),
 'st_dnd':lambda:status_disc('dnd'),'st_afk':lambda:status_disc('afk'),
 'party_confetti':party_confetti,'party_balloon':party_balloon,'party_popper':party_popper,'party_fireworks':party_fireworks,
 'food_burger':food_burger,'food_fries':food_fries,'food_icecream':food_icecream,'food_donut':food_donut,
 'food_candy':food_candy,'food_choco':food_choco,
 'gest_up':lambda:gest_hand('up'),'gest_down':lambda:gest_hand('down'),'gest_clap':lambda:gest_hand('clap'),
 'gest_wave':lambda:gest_hand('wave'),'gest_salute':lambda:gest_hand('salute'),'gest_shush':lambda:gest_hand('shush'),
 'gest_ok':lambda:gest_hand('ok'),'gest_fingerheart':lambda:gest_hand('fingerheart'),
}
for n,fn in ALL.items():
    save(n,fn())
print(len(made),'new emojis;',sum(made.values())//1024,'KB total')
