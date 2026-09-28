# ═══════════════════════════════════════════════════════════════
#  gen4.py — regenerate the 21 ORIGINAL premium emojis w/ proper
#  transparency (assets/emojis/) — clean premium cut
# ═══════════════════════════════════════════════════════════════
from PIL import Image, ImageDraw, ImageFont
import math, os

W=128; FR=8
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',44)
OUT=(18,16,28,255)
made={}
os.makedirs('assets/emojis',exist_ok=True)

def save(n,frames):
    pf=[]
    for f in frames:
        alpha=f.getchannel('A')
        p=f.convert('RGB').convert('P',palette=Image.ADAPTIVE,colors=63)
        mask=alpha.point(lambda a:255 if a<=128 else 0)
        p.paste(63,mask)
        pf.append(p)
    pf[0].save(f'assets/emojis/{n}.gif',save_all=True,append_images=pf[1:],duration=90,loop=0,disposal=2,transparency=63)
    made[n]=os.path.getsize(f'assets/emojis/{n}.gif')

def ni(): return Image.new('RGBA',(W,W),(0,0,0,0))
def rr(d,box,fill,outline=None,width=1):
    x0,y0,x1,y1=box
    d.rectangle([min(x0,x1),min(y0,y1),max(x0,x1),max(y0,y1)],fill=fill,outline=outline,width=width)
def bob(f,amp=4): return amp*math.sin(f/FR*2*math.pi)
def sparkle(d,f,pts,col=(255,255,255,230),sz=3):
    for (px,py) in pts:
        ph=(f + px//17) % FR
        a=int(230*abs(math.sin(ph/FR*math.pi)))
        if a>40: d.ellipse([px-sz,py-sz,px+sz,py+sz],fill=col[:3]+(a,))

def e_gem():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.polygon([(64,12+y),(106,52+y),(64,116+y),(22,52+y)],fill=(80,225,200,255),outline=OUT,width=3)
        d.polygon([(64,26+y),(90,52+y),(64,96+y),(38,52+y)],fill=(170,255,240,150))
        d.line([(22,52+y),(106,52+y)],fill=(40,150,130,255),width=2)
        sx=34+((f*10)%60); d.ellipse([sx,42+y,sx+9,51+y],fill=(255,255,255,230))
        fr.append(i)
    return fr
def e_crown():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        d.polygon([(24,88+y),(24,44+y),(44,64+y),(64,32+y),(84,64+y),(104,44+y),(104,88+y)],fill=(250,200,50,255),outline=OUT,width=3)
        rr(d,[24,80+y,104,96+y],(230,170,40),OUT,3)
        for gx,gc in [(40,(230,60,80)),(64,(60,160,230)),(88,(120,220,120))]:
            d.ellipse([gx-5,84+y,gx+5,94+y],fill=gc+(255,),outline=OUT,width=2)
        d.ellipse([60,26+y,68,34+y],fill=(255,240,170,255))
        sparkle(d,f,[(30,40+y),(98,40+y),(64,24+y)])
        fr.append(i)
    return fr
def e_sparkle():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        def star4(cx,cy,r,col,ph):
            a=abs(math.sin((f+ph)/FR*math.pi))
            r2=max(2,int(r*(0.5+0.5*a)))
            d.polygon([(cx,cy-r2),(cx+r2*0.28,cy-r2*0.28),(cx+r2,cy),(cx+r2*0.28,cy+r2*0.28),(cx,cy+r2),(cx-r2*0.28,cy+r2*0.28),(cx-r2,cy),(cx-r2*0.28,cy-r2*0.28)],fill=col)
        star4(48,48,30,(255,240,150,255),0)
        star4(88,40,16,(160,230,255,255),3)
        star4(84,88,20,(255,170,220,255),5)
        fr.append(i)
    return fr
def e_trophy():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        d.arc([20,26+y,56,62+y],90,270,fill=(250,200,50,255),width=7)
        d.arc([72,26+y,108,62+y],270,90,fill=(250,200,50,255),width=7)
        d.pieslice([34,20+y,94,74+y],0,180,fill=(250,200,50,255),outline=OUT)
        rr(d,[34,44+y,94,74+y],(250,200,50),OUT,3)
        rr(d,[56,72+y,72,90+y],(230,170,40),OUT,3)
        rr(d,[42,90+y,86,102+y],(200,140,30),OUT,3)
        sx=40+((f*8)%40); d.line([(sx,30+y),(sx+8,30+y)],fill=(255,245,200,220),width=4)
        fr.append(i)
    return fr
def e_gift():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3)
        rr(d,[24,52+y,104,104+y],(230,70,90),OUT,3)
        rr(d,[20,40+y,108,56+y],(245,95,115),OUT,3)
        rr(d,[56,40+y,72,104+y],(250,220,120),OUT,2)
        d.ellipse([44,24+y,62,42+y],fill=(250,220,120,255),outline=OUT,width=3)
        d.ellipse([66,24+y,84,42+y],fill=(250,220,120,255),outline=OUT,width=3)
        sparkle(d,f,[(28,30+y),(100,34+y)])
        fr.append(i)
    return fr
def e_fire():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        fl=math.sin(f/FR*2*math.pi)*6
        d.polygon([(64,6),(34,58),(38,86),(64,112),(90,86),(94,58)],fill=(250,120,40,255),outline=OUT,width=3)
        d.polygon([(64,34),(46,66),(50,88),(64,102),(78,88),(82,66)],fill=(255,190,60,255))
        d.polygon([(64,58+fl),(54,78),(58,92),(64,98),(70,92),(74,78)],fill=(255,245,180,255))
        fr.append(i)
    return fr
def e_ticket():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,3);r=(f%4)//2*2
        rr(d,[14,40+y+r,114,88+y-r],(250,200,60),OUT,3)
        d.ellipse([8,54+y,24,74+y],fill=(0,0,0,0),outline=OUT,width=3)
        d.ellipse([104,54+y,120,74+y],fill=(0,0,0,0),outline=OUT,width=3)
        for k in range(4): d.line([(44+k*12,46+y),(44+k*12,82+y)],fill=(180,130,30,180),width=2)
        d.text((58,64+y),'★',font=FONT,fill=(200,60,60,255),anchor='mm')
        fr.append(i)
    return fr
def e_lock():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        up=4 if f in (0,1,6,7) else 0
        d.arc([42,26-up,86,70-up],180,360,fill=(200,200,210,255),width=9)
        rr(d,[30,58,98,110],(250,190,60),OUT,3)
        rr(d,[30,58,98,70],(255,215,110))
        d.ellipse([58,72,70,86],fill=(90,60,20,255))
        rr(d,[61,82,67,98],(90,60,20,255))
        fr.append(i)
    return fr
def e_hourglass():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        rr(d,[34,10,94,20],(140,96,50),OUT,2); rr(d,[34,108,94,118],(140,96,50),OUT,2)
        d.polygon([(40,20),(88,20),(68,58),(60,58)],fill=(190,230,255,140),outline=OUT,width=2)
        d.polygon([(60,70),(68,70),(88,108),(40,108)],fill=(190,230,255,140),outline=OUT,width=2)
        lv=20+int((f/FR)*26)
        d.polygon([(64-8+(lv-20)//3,lv),(64+8-(lv-20)//3,lv),(70,56),(58,56)],fill=(250,220,130,255))
        d.line([(64,58),(64,104)],fill=(250,220,130,255),width=3)
        bw=6+f
        d.polygon([(64-bw,108),(64+bw,108),(64+bw-2,96+f),(64-bw+2,96+f)],fill=(250,220,130,255))
        fr.append(i)
    return fr
def e_pick():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=math.sin(f/FR*2*math.pi)*0.22
        ca,sa=math.cos(a),math.sin(a)
        def rot(px,py):
            x,y=px-64,py-64
            return (64+x*ca-y*sa,64+x*sa+y*ca)
        d.line([rot(50,106),rot(84,44)],fill=(140,96,50,255),width=9)
        d.arc([30,10,110,90],200,340,fill=(170,170,180,255),width=10)
        d.arc([30,14,110,94],200,340,fill=(120,120,132,255),width=4)
        sparkle(d,f,[(96,34),(34,34)])
        fr.append(i)
    return fr
def e_music():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        y1=bob(f,5); y2=bob(f+4,5)
        d.line([(52,84+y1),(52,30+y1),(88,22+y2),(88,76+y2)],fill=(160,110,240,255),width=6)
        d.line([(52,30+y1),(88,22+y2)],fill=(190,150,255,255),width=10)
        d.ellipse([36,76+y1,58,94+y1],fill=(190,140,255,255),outline=OUT,width=3)
        d.ellipse([72,68+y2,94,86+y2],fill=(190,140,255,255),outline=OUT,width=3)
        sparkle(d,f,[(30,40),(100,50),(64,16)],col=(220,190,255))
        fr.append(i)
    return fr
def e_rmc():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        gl=1+0.05*math.sin(f/FR*2*math.pi)
        s=int(46*gl)
        rr(d,[64-s,64-s,64+s,64+s],(30,20,50,255),(168,85,247,255),4)
        rr(d,[64-s+6,64-s+6,64+s-6,64+s-6],(0,0,0,0),(0,212,255,200),2)
        d.text((64,64),'RMC',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(34*gl)),fill=(255,215,0,255),anchor='mm')
        sparkle(d,f,[(24,24),(104,28),(26,102),(102,102)],col=(0,212,255),sz=2)
        fr.append(i)
    return fr
def e_sword():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=math.sin(f/FR*2*math.pi)*0.2
        ca,sa=math.cos(a),math.sin(a)
        def rot(px,py):
            x,y=px-64,py-64
            return (64+x*ca-y*sa,64+x*sa+y*ca)
        d.polygon([rot(64,8),rot(74,22),rot(70,78),rot(58,78),rot(54,22)],fill=(210,220,235,255),outline=OUT,width=3)
        d.line([rot(64,14),rot(64,74)],fill=(255,255,255,200),width=3)
        rr(d,*[0]*4,fill=(0,0,0,0)) if False else None
        d.polygon([rot(44,78),rot(84,78),rot(84,88),rot(44,88)],fill=(250,200,50,255),outline=OUT,width=3)
        d.line([rot(64,88),rot(64,110)],fill=(140,96,50,255),width=8)
        d.ellipse([rot(60,110)[0]-5,rot(60,110)[1]-5,rot(60,110)[0]+5,rot(60,110)[1]+5],fill=(250,200,50,255),outline=OUT,width=2)
        sparkle(d,f,[(64,12),(80,40)])
        fr.append(i)
    return fr
def e_creeper():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        fl=1 if f in (2,3) else 0
        g=(110+fl*60,200,90+fl*40)
        rr(d,[20,16,108,112],g+(255,),OUT,3)
        for (cx,cy) in [(30,26),(62,20),(88,30),(36,60),(70,64),(92,76),(26,88),(58,92)]:
            rr(d,[cx,cy,cx+14,cy+12],(g[0]-30,g[1]-40,g[2]-25,255))
        rr(d,[34,38,54,58],(20,25,20,255)); rr(d,[74,38,94,58],(20,25,20,255))
        rr(d,[54,58,74,82],(20,25,20,255))
        rr(d,[46,78,58,100],(20,25,20,255)); rr(d,[70,78,82,100],(20,25,20,255))
        fr.append(i)
    return fr
def e_tnt():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        rr(d,[24,34+y,104,104+y],(220,50,40),OUT,3)
        rr(d,[24,58+y,104,80+y],(245,235,220))
        d.text((64,69+y),'TNT',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20),fill=(180,40,35,255),anchor='mm')
        rr(d,[58,22+y,70,36+y],(90,90,95),OUT,2)
        ph=f/FR*2*math.pi
        d.line([(64,22+y),(74,10+y)],fill=(60,60,60,255),width=3)
        if f%2: d.ellipse([70,4,82,16],fill=(255,220,90,255))
        else: d.ellipse([72,6,80,14],fill=(255,160,60,255))
        fr.append(i)
    return fr
def e_heart():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        p=1+0.12*math.sin(f/FR*2*math.pi)
        s=int(40*p); cx,cy=64,66
        d.polygon([(cx,cy+s),(cx-s,cy),(cx-int(s*0.5),cy-int(s*0.7)),(cx,cy-int(s*0.25)),(cx+int(s*0.5),cy-int(s*0.7)),(cx+s,cy)],fill=(240,60,90,255),outline=OUT,width=3)
        d.ellipse([cx-int(s*0.55),cy-int(s*0.5),cx-int(s*0.1),cy-int(s*0.1)],fill=(255,150,170,180))
        fr.append(i)
    return fr
def e_coin():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        w=int(44*abs(math.cos(f/FR*math.pi)))+6
        d.ellipse([64-w,20,64+w,108],fill=(250,200,50,255),outline=(180,130,20,255),width=4)
        if w>18:
            d.ellipse([64-w+9,29,64+w-9,99],fill=(255,225,110,255))
            d.text((64,64),'R',font=FONT,fill=(200,140,30,255),anchor='mm')
        sparkle(d,f,[(40,26),(92,40)],sz=2)
        fr.append(i)
    return fr
def e_star():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        a=f/FR*2*math.pi*0.5
        pts=[]
        for k in range(10):
            r=52 if k%2==0 else 22
            aa=a+k/10*2*math.pi-math.pi/2
            pts.append((64+r*math.cos(aa),64+r*math.sin(aa)))
        d.polygon(pts,fill=(255,215,60,255),outline=OUT,width=3)
        d.ellipse([56,52,70,66],fill=(255,245,190,200))
        sparkle(d,f,[(30,30),(98,34),(64,110)],sz=2)
        fr.append(i)
    return fr
def e_grass():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i);y=bob(f,2)
        rr(d,[20,44+y,108,108+y],(140,96,60),OUT,3)
        for (cx,cy) in [(32,62),(58,74),(84,60),(46,92),(76,94)]:
            rr(d,[cx,cy+y,cx+10,cy+8+y],(110,74,45,255))
        rr(d,[20,34+y,108,52+y],(110,190,80),OUT,3)
        for k in range(7):
            h=8+((k*7+f)%8)
            d.polygon([(24+k*12,36+y),(28+k*12,36+y-h),(32+k*12,36+y)],fill=(130,210,95,255))
        fr.append(i)
    return fr
def e_potion():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        rr(d,[54,12,74,30],(140,96,50),OUT,2)
        d.polygon([(54,28),(74,28),(88,52),(88,96),(40,96),(40,52)],fill=(190,230,255,120),outline=OUT,width=3)
        d.polygon([(44,62),(84,62),(84,92),(44,92)],fill=(220,80,220,230))
        for k in range(3):
            by=88-((f*6+k*14)%34)
            d.ellipse([52+k*10,by,58+k*10,by+6],fill=(255,160,255,220))
        sparkle(d,f,[(36,40),(92,46)],col=(255,160,255),sz=2)
        fr.append(i)
    return fr
def e_bolt():
    fr=[]
    for f in range(FR):
        i=ni();d=ImageDraw.Draw(i)
        x=4 if f in (1,2,3) else (-4 if f in (5,6,7) else 0)
        d.polygon([(70+x,6),(36+x,62),(58+x,62),(48+x,122),(92+x,54),(68+x,54)],fill=(255,220,60,255),outline=OUT,width=3)
        d.polygon([(70+x,6),(52+x,36),(66+x,36)],fill=(255,245,190,200))
        sparkle(d,f,[(30,30),(100,80)],sz=2)
        fr.append(i)
    return fr

ALL={'gem':e_gem,'crown':e_crown,'sparkle':e_sparkle,'trophy':e_trophy,'gift':e_gift,'fire':e_fire,
'ticket':e_ticket,'lock':e_lock,'hourglass':e_hourglass,'pick':e_pick,'music':e_music,'rmc':e_rmc,
'sword':e_sword,'creeper':e_creeper,'tnt':e_tnt,'heart':e_heart,'coin':e_coin,'star':e_star,
'grass':e_grass,'potion':e_potion,'bolt':e_bolt}
for n,fn in ALL.items():
    save(n,fn())
print(len(made),'originals regenerated;',sum(made.values())//1024,'KB')
