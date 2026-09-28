# ═══════════════════════════════════════════════════════════════
#  gen5.py — 16 premium MC-server style emojis (rank badges etc.)
# ═══════════════════════════════════════════════════════════════
from PIL import Image, ImageDraw, ImageFont
import math, os

W=128; FR=8
OUT=(18,16,28,255)
F30=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30)
F24=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24)
F20=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20)
made={}
os.makedirs('assets/emojis4',exist_ok=True)

def save(n,frames):
    pf=[]
    for f in frames:
        alpha=f.getchannel('A')
        p=f.convert('RGB').convert('P',palette=Image.ADAPTIVE,colors=63)
        mask=alpha.point(lambda a:255 if a<=128 else 0)
        p.paste(63,mask)
        pf.append(p)
    pf[0].save(f'assets/emojis4/{n}.gif',save_all=True,append_images=pf[1:],duration=90,loop=0,disposal=2,transparency=63)
    made[n]=os.path.getsize(f'assets/emojis4/{n}.gif')

def ni(): return Image.new('RGBA',(W,W),(0,0,0,0))
def rr(d,box,fill,outline=None,width=1):
    x0,y0,x1,y1=box
    d.rectangle([min(x0,x1),min(y0,y1),max(x0,x1),max(y0,y1)],fill=fill,outline=outline,width=width)
def bob(f,amp=3): return amp*math.sin(f/FR*2*math.pi)
def sparkle(d,f,pts,col=(255,255,255,230),sz=3):
    for (px,py) in pts:
        ph=(f+px//17)%FR
        a=int(230*abs(math.sin(ph/FR*math.pi)))
        if a>40: d.ellipse([px-sz,py-sz,px+sz,py+sz],fill=col[:3]+(a,))

def badge(text,c1,c2,fs):
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        gl=1+0.04*math.sin(f/FR*2*math.pi)
        d.polygon([(20,30+y),(108,30+y),(116,64+y),(108,98+y),(20,98+y),(12,64+y)],fill=c1+(255,),outline=OUT,width=3)
        d.polygon([(24,36+y),(104,36+y),(110,64+y),(104,92+y),(24,92+y),(18,64+y)],fill=c2+(120,))
        d.text((64,64+y),text,font=fs,fill=(255,255,255,255),anchor='mm',stroke_width=2,stroke_fill=(20,20,30,255))
        sparkle(d,f,[(20,26+y),(108,26+y),(64,104+y)])
        fr.append(i)
    return fr

def e_skull():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.ellipse([30,18+y,98,86+y],fill=(235,235,228,255),outline=OUT,width=3)
        rr(d,[44,78+y,84,100+y],(225,225,218),OUT,3)
        d.ellipse([42,42+y,58,60+y],fill=(25,25,32,255)); d.ellipse([70,42+y,86,60+y],fill=(25,25,32,255))
        gl=int(180+70*math.sin(f/FR*2*math.pi))
        d.ellipse([47,47+y,53,53+y],fill=(120,220,255,gl)); d.ellipse([75,47+y,81,53+y],fill=(120,220,255,gl))
        d.polygon([(60,64+y),(68,64+y),(64,72+y)],fill=(30,30,36,255))
        for k in range(4): rr(d,[48+k*9,80+y,54+k*9,96+y],(200,200,194),(40,40,46,255),2)
        fr.append(i)
    return fr
def e_xswords():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        d.line([(24,24+y),(100,100+y)],fill=(210,220,235,255),width=9)
        d.line([(104,24+y),(28,100+y)],fill=(180,190,210,255),width=9)
        d.line([(24,24+y),(100,100+y)],fill=(255,255,255,220),width=3)
        d.line([(104,24+y),(28,100+y)],fill=(255,255,255,180),width=3)
        d.line([(18,88+y),(36,106+y)],fill=(250,200,50,255),width=8)
        d.line([(110,88+y),(92,106+y)],fill=(250,200,50,255),width=8)
        sparkle(d,f,[(64,58+y),(40,40+y),(90,40+y)],sz=3)
        fr.append(i)
    return fr
def e_drakegg():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        d.ellipse([34,22+y,94,106+y],fill=(30,20,36,255),outline=OUT,width=3)
        for (cx,cy,s) in [(52,44,7),(74,58,6),(58,78,8),(76,88,5),(46,62,5)]:
            d.polygon([(cx,cy-s+y),(cx+s,cy+y),(cx,cy+s+y),(cx-s,cy+y)],fill=(190,110,240,255))
        gl=int(140+100*math.sin(f/FR*2*math.pi))
        sparkle(d,f,[(30,30+y),(98,40+y),(64,14+y)],col=(210,140,255),sz=3)
        fr.append(i)
    return fr
def e_gapple():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.ellipse([26,36+y,66,96+y],fill=(250,200,60,255),outline=OUT,width=3)
        d.ellipse([62,36+y,102,96+y],fill=(250,200,60,255),outline=OUT,width=3)
        d.ellipse([40,30+y,88,88+y],fill=(255,215,80,255))
        d.line([(64,30+y),(64,18+y)],fill=(120,80,40,255),width=5)
        d.ellipse([70,14+y,86,26+y],fill=(120,200,80,255),outline=OUT,width=2)
        gl=150+int(100*math.sin(f/FR*2*math.pi))
        d.ellipse([46,42+y,60,56+y],fill=(255,245,190,gl))
        sparkle(d,f,[(34,34+y),(94,40+y),(64,98+y)],col=(255,240,170))
        fr.append(i)
    return fr
def e_coinpile():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        for (cx,cy) in [(40,86),(64,90),(88,86),(52,70),(76,70),(64,54)]:
            d.ellipse([cx-14,cy-10+y,cx+14,cy+10+y],fill=(250,200,50,255),outline=(180,130,20,255),width=3)
            d.ellipse([cx-8,cy-5+y,cx+8,cy+5+y],fill=(255,225,110,255))
        sparkle(d,f,[(40,50+y),(88,52+y),(64,36+y)],sz=3)
        fr.append(i)
    return fr
def e_crownfire():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        fl=math.sin(f/FR*2*math.pi)*5
        for fx in (34,64,94):
            d.polygon([(fx,34+y),(fx-8,18+y-int(fl)),(fx,24+y),(fx+8,14+y+int(fl))],fill=(250,140,50,255))
            d.polygon([(fx,32+y),(fx-4,22+y),(fx+4,22+y)],fill=(255,230,120,255))
        d.polygon([(24,92+y),(24,48+y),(44,66+y),(64,40+y),(84,66+y),(104,48+y),(104,92+y)],fill=(250,200,50,255),outline=OUT,width=3)
        rr(d,[24,84+y,104,100+y],(230,170,40),OUT,3)
        for gx,gc in [(40,(230,60,80)),(64,(60,160,230)),(88,(120,220,120))]:
            d.ellipse([gx-5,88+y,gx+5,98+y],fill=gc+(255,),outline=OUT,width=2)
        fr.append(i)
    return fr
def e_endereye():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,4)
        d.ellipse([28,36+y,100,92+y],fill=(40,60,35,255),outline=OUT,width=3)
        gl=int(170+80*math.sin(f/FR*2*math.pi))
        d.ellipse([44,48+y,84,80+y],fill=(110,230,110,gl))
        d.ellipse([56,56+y,72,72+y],fill=(20,40,20,255))
        d.ellipse([60,58+y,65,63+y],fill=(180,255,180,255))
        sparkle(d,f,[(30,32+y),(98,36+y),(64,98+y)],col=(140,255,140),sz=3)
        fr.append(i)
    return fr
def e_hammer():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=math.sin(f/FR*2*math.pi)*0.3
        ca,sa=math.cos(a),math.sin(a)
        def rot(px,py):
            x,y=px-64,py-64
            return (64+x*ca-y*sa,64+x*sa+y*ca)
        d.line([rot(64,112),rot(64,52)],fill=(140,96,50,255),width=9)
        d.polygon([rot(34,20),rot(94,20),rot(98,48),rot(30,48)],fill=(160,165,180,255),outline=OUT,width=3)
        d.line([rot(38,26),rot(90,26)],fill=(220,225,240,200),width=4)
        sparkle(d,f,[rot(30,20),rot(98,20)],sz=3)
        fr.append(i)
    return fr
def e_banner():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        wv=math.sin(f/FR*2*math.pi)*6
        d.line([(30,8),(30,118)],fill=(120,80,40,255),width=6)
        d.polygon([(33,14),(104,20+wv),(96,44),(104,68+wv),(33,74)],fill=(180,40,50,255),outline=OUT,width=3)
        d.polygon([(44,28+wv/2),(64,24+wv/2),(64,58+wv/2),(54,50+wv/2),(44,58+wv/2)],fill=(255,215,60,255))
        d.ellipse([76,36+wv/2,90,50+wv/2],fill=(255,215,60,255))
        fr.append(i)
    return fr
def e_gemstack():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        cols=[(90,225,235),(250,110,160),(140,110,255),(250,200,60)]
        pos=[(40,84),(72,88),(56,60),(84,58)]
        for k,(cx,cy) in enumerate(pos):
            c=cols[k]
            d.polygon([(cx,cy-16+y),(cx+14,cy+y),(cx,cy+16+y),(cx-14,cy+y)],fill=c+(255,),outline=OUT,width=2)
            d.polygon([(cx,cy-10+y),(cx+6,cy-2+y),(cx,cy+2+y),(cx-6,cy-2+y)],fill=(255,255,255,150))
        sparkle(d,f,[(36,60+y),(88,40+y),(60,30+y)],sz=3)
        fr.append(i)
    return fr

ALL={'rank_vip':lambda:badge('VIP',(40,170,70),(90,230,120),F30),
'rank_mvp':lambda:badge('MVP',(40,130,220),(110,190,255),F30),
'rank_elite':lambda:badge('ELITE',(140,70,220),(200,140,255),F24),
'rank_og':lambda:badge('OG',(220,160,40),(255,220,120),F30),
'rank_legend':lambda:badge('LEGEND',(210,50,60),(255,120,120),F20),
'skull':e_skull,'xswords':e_xswords,'drakegg':e_drakegg,'gapple':e_gapple,
'coinpile':e_coinpile,'crownfire':e_crownfire,'endereye':e_endereye,'hammer':e_hammer,
'banner':e_banner,'gemstack':e_gemstack}
for n,fn in ALL.items():
    save(n,fn())
print(len(made),'premium server emojis;',sum(made.values())//1024,'KB')
