#!/usr/bin/env python3
# Premium animated emojis (transparent GIF + PNG) + animated banners for embeds
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math, os

S = 512
OUT = 128
FRAMES = 18
DUR = 80
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
os.makedirs('emojis', exist_ok=True)
os.makedirs('banners', exist_ok=True)


def tw(t, phase=0.0):
    return 0.5 + 0.5 * math.sin(2 * math.pi * t + phase * 2 * math.pi)


def vgrad(size, colors):
    w, h = size
    img = Image.new('RGB', (w, h))
    px = img.load()
    n = len(colors) - 1
    for y in range(h):
        t = y / max(h - 1, 1) * n
        i = min(int(t), n - 1)
        f = t - i
        c = tuple(int(colors[i][k] + (colors[i + 1][k] - colors[i][k]) * f) for k in range(3))
        for x in range(w):
            px[x, y] = c
    return img


def add_glow(img, color, radius=24, alpha=150):
    a = img.split()[3].filter(ImageFilter.GaussianBlur(radius))
    glow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    layer = Image.new('RGBA', img.size, color + (alpha,))
    glow.paste(layer, (0, 0), a)
    return Image.alpha_composite(glow, img)


def draw_sparkle(d, cx, cy, r, color):
    pts = []
    for i in range(96):
        th = i / 96 * 2 * math.pi
        rr = r * (0.06 + 0.94 * abs(math.cos(2 * th)) ** 2.6)
        pts.append((cx + rr * math.cos(th), cy + rr * math.sin(th)))
    d.polygon(pts, fill=color)


def poly_img(pts, colors, outline=None, ow=0):
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    img.paste(vgrad((S, S), colors), (0, 0), mask)
    if outline:
        ImageDraw.Draw(img).line(list(pts) + [pts[0]], fill=outline, width=ow, joint='curve')
    return img


def composite(base, *layers):
    for l in layers:
        base = Image.alpha_composite(base, l)
    return base


def blank(w=S, h=S):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


# ================= EMOJI ART =================
def gem_frame(t):
    img = blank()
    sc = 1 + 0.045 * math.sin(2 * math.pi * t)
    def P(x, y):
        return (S / 2 + (x - 0.5) * S * sc, S / 2 + (y - 0.5) * S * sc)
    pts = [P(0.28, 0.20), P(0.72, 0.20), P(0.93, 0.40), P(0.5, 0.94), P(0.07, 0.40)]
    img = poly_img(pts, [(170, 245, 255), (0, 175, 255), (0, 55, 205)], outline=(225, 250, 255, 255), ow=9)
    d = ImageDraw.Draw(img)
    d.line([P(0.28, 0.20), P(0.5, 0.94)], fill=(255, 255, 255, 90), width=6)
    d.line([P(0.72, 0.20), P(0.5, 0.94)], fill=(255, 255, 255, 90), width=6)
    d.line([P(0.07, 0.40), P(0.5, 0.94)], fill=(255, 255, 255, 55), width=6)
    d.line([P(0.93, 0.40), P(0.5, 0.94)], fill=(255, 255, 255, 55), width=6)
    d.line([P(0.07, 0.40), P(0.93, 0.40)], fill=(255, 255, 255, 130), width=8)
    hl = tw(t, 0)
    band = [P(0.31, 0.21), P(0.44, 0.21), P(0.22, 0.40), P(0.10, 0.40)]
    d.polygon(band, fill=(255, 255, 255, int(70 + 150 * hl)))
    img = add_glow(img, (0, 170, 255), radius=26, alpha=140)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.78, 0.20, 44, 0.0), (0.19, 0.76, 34, 0.33), (0.86, 0.62, 28, 0.66)]:
        a = tw(t, ph)
        if a > 0.15:
            draw_sparkle(d, cx * S, cy * S, r * (0.55 + 0.45 * a), (255, 255, 255, int(255 * a)))
    return img


def crown_frame(t):
    img = blank()
    wob = math.sin(2 * math.pi * t) * 0.05
    layer = blank()
    def R(x, y):
        cx, cy = S / 2, S * 0.75
        dx, dy = x - cx, y - cy
        return (cx + dx * math.cos(wob) - dy * math.sin(wob), cy + dx * math.sin(wob) + dy * math.cos(wob))
    tips = [R(0.16 * S, 0.30 * S), R(0.50 * S, 0.16 * S), R(0.84 * S, 0.30 * S)]
    crown_pts = [
        R(0.18 * S, 0.58 * S), tips[0],
        R(0.34 * S, 0.46 * S), tips[1],
        R(0.66 * S, 0.46 * S), tips[2],
        R(0.82 * S, 0.58 * S), R(0.82 * S, 0.80 * S), R(0.18 * S, 0.80 * S),
    ]
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(crown_pts, fill=255)
    layer.paste(vgrad((S, S), [(255, 235, 130), (255, 200, 40), (200, 130, 0)]), (0, 0), mask)
    dl = ImageDraw.Draw(layer)
    dl.line(list(crown_pts) + [crown_pts[0]], fill=(255, 245, 190, 255), width=8, joint='curve')
    dl.ellipse([R(0.44 * S, 0.62 * S), R(0.56 * S, 0.76 * S)], fill=(230, 40, 60, 255), outline=(255, 220, 220, 255), width=4)
    for (tx, ty) in tips:
        r = 22
        dl.ellipse([tx - r, ty - r, tx + r, ty + r], fill=(255, 250, 240, 255), outline=(200, 180, 120, 255), width=3)
    img = composite(img, layer)
    img = add_glow(img, (255, 200, 30), radius=24, alpha=130)
    d = ImageDraw.Draw(img)
    for ((tx, ty), ph) in zip(tips, [0.0, 0.25, 0.5]):
        a = tw(t, ph)
        if a > 0.15:
            draw_sparkle(d, tx, ty - 34, 34 * (0.5 + 0.5 * a), (255, 255, 255, int(255 * a)))
    return img


def sparkle_frame(t):
    img = blank()
    rot = t * math.pi / 2
    pulse = 0.75 + 0.25 * tw(t, 0)
    R = 210 * pulse
    pts = []
    for i in range(96):
        th = i / 96 * 2 * math.pi + rot
        rr = R * (0.06 + 0.94 * abs(math.cos(2 * th)) ** 2.6)
        pts.append((S / 2 + rr * math.cos(th), S / 2 + rr * math.sin(th)))
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    img.paste(vgrad((S, S), [(255, 255, 255), (255, 235, 150), (255, 200, 60)]), (0, 0), mask)
    img = add_glow(img, (255, 220, 90), radius=30, alpha=160)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.22, 0.25, 46, 0.1), (0.80, 0.30, 38, 0.4), (0.72, 0.82, 42, 0.7), (0.25, 0.75, 30, 0.55)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(235 * a)))
    return img


def trophy_frame(t):
    img = blank()
    bob = math.sin(2 * math.pi * t) * 8
    layer = blank()
    dl = ImageDraw.Draw(layer)
    cup = [(0.26, 0.18), (0.74, 0.18), (0.68, 0.52), (0.58, 0.62), (0.42, 0.62), (0.32, 0.52)]
    cup_pts = [(x * S, y * S + bob) for x, y in cup]
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(cup_pts, fill=255)
    layer.paste(vgrad((S, S), [(255, 240, 150), (255, 195, 30), (185, 120, 0)]), (0, 0), mask)
    dl = ImageDraw.Draw(layer)
    dl.line(list(cup_pts) + [cup_pts[0]], fill=(255, 248, 200, 255), width=7, joint='curve')
    dl.ellipse([0.24 * S, 0.14 * S + bob, 0.76 * S, 0.24 * S + bob], fill=(255, 230, 120, 255), outline=(180, 120, 0, 255), width=5)
    dl.arc([0.10 * S, 0.20 * S + bob, 0.34 * S, 0.50 * S + bob], 90, 270, fill=(255, 210, 60, 255), width=16)
    dl.arc([0.66 * S, 0.20 * S + bob, 0.90 * S, 0.50 * S + bob], 270, 90, fill=(255, 210, 60, 255), width=16)
    dl.rectangle([0.44 * S, 0.62 * S + bob, 0.56 * S, 0.74 * S + bob], fill=(255, 200, 40, 255))
    dl.rounded_rectangle([0.30 * S, 0.74 * S + bob, 0.70 * S, 0.86 * S + bob], 18, fill=(255, 210, 60, 255), outline=(160, 100, 0, 255), width=4)
    img = composite(img, layer)
    img = add_glow(img, (255, 200, 40), radius=24, alpha=140)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.20, 0.20, 40, 0.0), (0.82, 0.24, 34, 0.35), (0.50, 0.08, 30, 0.7)]:
        a = tw(t, ph)
        if a > 0.18:
            draw_sparkle(d, cx * S, cy * S + bob, r * (0.5 + 0.5 * a), (255, 255, 255, int(255 * a)))
    return img


def gift_frame(t):
    img = blank()
    hop = abs(math.sin(2 * math.pi * t))
    dy = -30 * hop
    sq = 1 - 0.06 * (1 - hop)
    layer = blank()
    dl = ImageDraw.Draw(layer)
    def Y(y):
        return S / 2 + (y - 0.5) * S * sq + dy
    box = [(0.22 * S, Y(0.48)), (0.78 * S, Y(0.48)), (0.78 * S, Y(0.88)), (0.22 * S, Y(0.88))]
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).polygon(box, fill=255)
    layer.paste(vgrad((S, S), [(165, 90, 255), (120, 40, 220), (75, 20, 150)]), (0, 0), mask)
    dl = ImageDraw.Draw(layer)
    dl.line(list(box) + [box[0]], fill=(200, 160, 255, 255), width=6, joint='curve')
    dl.rounded_rectangle([0.18 * S, Y(0.38), 0.82 * S, Y(0.50)], 10, fill=(255, 205, 50, 255), outline=(180, 130, 0, 255), width=4)
    dl.rectangle([0.46 * S, Y(0.50), 0.54 * S, Y(0.88)], fill=(255, 205, 50, 255))
    dl.ellipse([0.30 * S, Y(0.26), 0.50 * S, Y(0.40)], outline=(255, 205, 50, 255), width=14)
    dl.ellipse([0.50 * S, Y(0.26), 0.70 * S, Y(0.40)], outline=(255, 205, 50, 255), width=14)
    dl.ellipse([0.46 * S, Y(0.31), 0.54 * S, Y(0.39)], fill=(255, 230, 120, 255))
    img = composite(img, layer)
    img = add_glow(img, (150, 80, 255), radius=22, alpha=130)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.18, 0.28, 38, 0.0), (0.84, 0.35, 32, 0.4), (0.78, 0.80, 28, 0.7)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(255 * a)))
    return img


def fire_frame(t):
    img = blank()
    def flame(colors, scale, amp):
        mask = Image.new('L', (S, S), 0)
        md = ImageDraw.Draw(mask)
        n = 26
        for i in range(n + 1):
            yn = i / n
            y = S * (0.88 - 0.68 * yn)
            r = (150 * scale) * (1.05 - 0.85 * yn) ** 1.15
            wob = math.sin(yn * 5.5 + 2 * math.pi * t * 2) * amp * (0.15 + yn)
            wob2 = math.sin(yn * 9 + 2 * math.pi * t * 3 + 1.7) * amp * 0.5 * yn
            x = S / 2 + (wob + wob2) * scale
            md.ellipse([x - r, y - r, x + r, y + r], fill=255)
        layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        layer.paste(vgrad((S, S), colors), (0, 0), mask)
        return layer
    img = composite(img,
                    flame([(255, 60, 0), (255, 110, 0), (255, 150, 0)], 1.0, 55),
                    flame([(255, 140, 0), (255, 180, 20), (255, 210, 60)], 0.72, 42),
                    flame([(255, 220, 60), (255, 240, 120), (255, 250, 180)], 0.45, 30),
                    flame([(255, 255, 210), (255, 255, 230), (255, 255, 250)], 0.22, 18))
    img = add_glow(img, (255, 90, 0), radius=26, alpha=150)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.24, 0.30, 30, 0.1), (0.78, 0.20, 26, 0.5)]:
        a = tw(t, ph)
        if a > 0.3:
            draw_sparkle(d, cx * S, cy * S, r * a, (255, 240, 180, int(220 * a)))
    return img


# ---------------- TICKET ----------------
def ticket_frame(t):
    img = blank()
    wob = math.sin(2 * math.pi * t) * 0.07
    def R(x, y):
        cx, cy = S / 2, S / 2
        dx, dy = x - cx, y - cy
        return (cx + dx * math.cos(wob) - dy * math.sin(wob), cy + dx * math.sin(wob) + dy * math.cos(wob))
    body = [R(0.08 * S, 0.30 * S), R(0.92 * S, 0.30 * S), R(0.92 * S, 0.70 * S), R(0.08 * S, 0.70 * S)]
    mask = Image.new('L', (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.polygon(body, fill=255)
    md.ellipse([0.08 * S - 26, 0.5 * S - 26, 0.08 * S + 26, 0.5 * S + 26], fill=0)
    md.ellipse([0.92 * S - 26, 0.5 * S - 26, 0.92 * S + 26, 0.5 * S + 26], fill=0)
    img.paste(vgrad((S, S), [(190, 120, 255), (130, 50, 230), (80, 20, 160)]), (0, 0), mask)
    d = ImageDraw.Draw(img)
    d.line(list(body) + [body[0]], fill=(220, 180, 255, 255), width=8, joint='curve')
    # perforation
    for i in range(5):
        y = 0.34 * S + i * 0.08 * S
        d.ellipse([0.66 * S - 5, y - 5, 0.66 * S + 5, y + 5], fill=(255, 255, 255, 200))
    # star on left part
    draw_sparkle(d, 0.36 * S, 0.5 * S, 60 * (0.8 + 0.2 * tw(t, 0)), (255, 230, 130, 255))
    img = add_glow(img, (160, 80, 255), radius=22, alpha=130)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.80, 0.20, 36, 0.2), (0.18, 0.80, 30, 0.6)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(240 * a)))
    return img


# ---------------- LOCK ----------------
def lock_frame(t):
    img = blank()
    bob = math.sin(2 * math.pi * t) * 6
    layer = blank()
    dl = ImageDraw.Draw(layer)
    # shackle
    dl.arc([0.30 * S, 0.16 * S + bob, 0.70 * S, 0.56 * S + bob], 180, 360, fill=(220, 230, 240, 255), width=26)
    # body
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0.22 * S, 0.46 * S + bob, 0.78 * S, 0.88 * S + bob], 40, fill=255)
    layer.paste(vgrad((S, S), [(255, 235, 130), (255, 195, 40), (190, 120, 0)]), (0, 0), mask)
    dl = ImageDraw.Draw(layer)
    dl.rounded_rectangle([0.22 * S, 0.46 * S + bob, 0.78 * S, 0.88 * S + bob], 40, outline=(255, 248, 200, 255), width=8)
    # keyhole
    dl.ellipse([0.44 * S, 0.56 * S + bob, 0.56 * S, 0.68 * S + bob], fill=(70, 40, 0, 255))
    dl.polygon([(0.47 * S, 0.66 * S + bob), (0.53 * S, 0.66 * S + bob), (0.56 * S, 0.80 * S + bob), (0.44 * S, 0.80 * S + bob)], fill=(70, 40, 0, 255))
    img = composite(img, layer)
    img = add_glow(img, (255, 200, 40), radius=22, alpha=130)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.24, 0.24, 38, 0.1), (0.80, 0.30, 30, 0.5)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(240 * a)))
    return img


# ---------------- HOURGLASS ----------------
def hourglass_frame(t):
    img = blank()
    layer = blank()
    dl = ImageDraw.Draw(layer)
    # frame bars
    dl.rounded_rectangle([0.24 * S, 0.10 * S, 0.76 * S, 0.16 * S], 12, fill=(255, 210, 60, 255))
    dl.rounded_rectangle([0.24 * S, 0.84 * S, 0.76 * S, 0.90 * S], 12, fill=(255, 210, 60, 255))
    # glass outline
    glass = [(0.30, 0.16), (0.70, 0.16), (0.52, 0.50), (0.70, 0.84), (0.30, 0.84), (0.48, 0.50)]
    glass_pts = [(x * S, y * S) for x, y in glass]
    dl.line(glass_pts + [glass_pts[0]], fill=(200, 230, 255, 200), width=8, joint='curve')
    # sand top (shrinks)
    top_level = 0.20 + 0.24 * t
    hw = max(0.02, (0.50 - top_level) / 0.30) * 0.18
    dl.polygon([(0.5 - hw) * S, top_level * S, (0.5 + hw) * S, top_level * S, (0.5 * S, 0.48 * S)], fill=(255, 220, 120, 255))
    # sand bottom (grows)
    bot_level = 0.80 - 0.24 * t
    hw2 = max(0.02, (0.80 - bot_level) / 0.30) * 0.18
    dl.polygon([(0.5 - hw2) * S, bot_level * S, (0.5 + hw2) * S, bot_level * S, (0.5 + hw2) * S, 0.84 * S, (0.5 - hw2) * S, 0.84 * S], fill=(255, 220, 120, 255))
    # stream
    if t < 0.92:
        dl.rectangle([0.49 * S, top_level * S, 0.51 * S, bot_level * S], fill=(255, 230, 150, 255))
    img = composite(img, layer)
    img = add_glow(img, (255, 210, 80), radius=20, alpha=120)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.20, 0.30, 32, 0.15), (0.82, 0.60, 28, 0.55)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(240 * a)))
    return img


# ---------------- PICKAXE ----------------
def pick_frame(t):
    img = blank()
    wob = math.sin(2 * math.pi * t) * 0.08
    layer = blank()
    dl = ImageDraw.Draw(layer)
    def R(x, y):
        cx, cy = S / 2, S / 2
        dx, dy = x - cx, y - cy
        return (cx + dx * math.cos(wob) - dy * math.sin(wob), cy + dx * math.sin(wob) + dy * math.cos(wob))
    # handle
    dl.line([R(0.32 * S, 0.78 * S), R(0.66 * S, 0.34 * S)], fill=(150, 100, 40, 255), width=34)
    dl.line([R(0.32 * S, 0.78 * S), R(0.66 * S, 0.34 * S)], fill=(200, 150, 80, 255), width=18)
    # head arc
    head = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    hd = ImageDraw.Draw(head)
    hd.arc([0.14 * S, 0.10 * S, 0.86 * S, 0.82 * S], 200, 340, fill=(140, 220, 255, 255), width=40)
    hd.arc([0.14 * S, 0.10 * S, 0.86 * S, 0.82 * S], 200, 340, fill=(230, 250, 255, 255), width=16)
    # rotate head with same wobble
    head = head.rotate(-math.degrees(wob), center=(S / 2, S / 2))
    layer = Image.alpha_composite(layer, head)
    img = composite(img, layer)
    img = add_glow(img, (120, 200, 255), radius=20, alpha=120)
    d = ImageDraw.Draw(img)
    for (cx, cy, r, ph) in [(0.20, 0.22, 36, 0.1), (0.82, 0.40, 30, 0.5)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * S, cy * S, r * (0.5 + 0.5 * a), (255, 255, 255, int(240 * a)))
    return img


EMOJIS = {
    'gem': gem_frame,
    'crown': crown_frame,
    'sparkle': sparkle_frame,
    'trophy': trophy_frame,
    'gift': gift_frame,
    'fire': fire_frame,
    'ticket': ticket_frame,
    'lock': lock_frame,
    'hourglass': hourglass_frame,
    'pick': pick_frame,
}

# ================= SAVE PIPELINE =================
def gif_frame_p(rgba, size):
    """RGBA -> P with hard 1-bit transparency at palette index 255 (no black bg)"""
    fr = rgba.resize((size, size), Image.LANCZOS)
    alpha = fr.split()[3].point(lambda a: 255 if a < 128 else 0)
    p = fr.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)
    p.paste(255, (0, 0, size, size), alpha)
    return p


def save_gif(frames_p, path, dur=DUR):
    frames_p[0].save(path, save_all=True, append_images=frames_p[1:],
                     duration=dur, loop=0, disposal=2, transparency=255)


for name, fn in EMOJIS.items():
    rgba_frames = [fn(i / FRAMES) for i in range(FRAMES)]
    # animated GIF with real transparency
    save_gif([gif_frame_p(f, OUT) for f in rgba_frames], f'emojis/{name}.gif')
    # smooth PNG (perfect alpha) — middle frame
    rgba_frames[FRAMES // 2].resize((OUT, OUT), Image.LANCZOS).save(f'emojis/{name}.png')
    print(f'{name}: gif {os.path.getsize(f"emojis/{name}.gif")/1024:.0f}KB, png {os.path.getsize(f"emojis/{name}.png")/1024:.0f}KB')



# ================= BANNERS (PORTRAIT HD CARDS) =================
# Tall premium cards; kept under Discord's 256KB emoji limit => permanent CDN URL
PW, PH = 512, 680
BFR = 8


def text_c(d, cx, y, txt, font, fill, outline=None, ow=4):
    bbox = d.textbbox((0, 0), txt, font=font)
    w = bbox[2] - bbox[0]
    x = cx - w / 2 - bbox[0]
    if outline:
        for dx in range(-ow, ow + 1):
            for dy in range(-ow, ow + 1):
                if abs(dx) + abs(dy):
                    d.text((x + dx, y + dy), txt, font=font, fill=outline)
    d.text((x, y), txt, font=font, fill=fill)


def shine(base, t, width=220, color=(255, 255, 255)):
    mask = Image.new('L', base.size, 0)
    d = ImageDraw.Draw(mask)
    x = -300 + (PW + 600) * t
    d.polygon([(x, 0), (x + width, 0), (x + width - 140, PH), (x - 140, PH)], fill=70)
    white = Image.new(base.mode, base.size, color)
    return Image.composite(white, base, mask.filter(ImageFilter.GaussianBlur(30)))


def pbase(colors):
    return vgrad((PW, PH), colors).convert('RGBA')


def paste_icon(base, frame_fn, t, size, x, y):
    ic = frame_fn(t).resize((size, size), Image.LANCZOS)
    base.paste(ic, (x, y), ic.split()[3])
    return base


def banner_welcome(t):
    base = pbase([(24, 16, 60), (52, 26, 120), (24, 16, 60)])
    d = ImageDraw.Draw(base)
    base = paste_icon(base, crown_frame, t, 150, (PW - 150) // 2, 34)
    text_c(d, PW / 2, 232, 'WELCOME', ImageFont.truetype(FONT_B, 78), (255, 215, 80), (60, 30, 0), 6)
    text_c(d, PW / 2, 336, 'TO RIZOKMC', ImageFont.truetype(FONT_B, 44), (180, 220, 255), (10, 10, 40), 4)
    d.line([(60, 430), (PW - 60, 430)], fill=(140, 120, 255, 255), width=4)
    text_c(d, PW / 2, 468, 'PLAY.RIZOKMC.FUN', ImageFont.truetype(FONT_B, 34), (255, 235, 150), (70, 45, 0), 4)
    base = paste_icon(base, gem_frame, t, 110, 26, 540)
    base = paste_icon(base, sparkle_frame, t, 90, PW - 120, 550)
    base = shine(base, t)
    d = ImageDraw.Draw(base)
    for (cx, cy, r, ph) in [(0.15, 0.32, 18, 0.1), (0.86, 0.30, 16, 0.45), (0.5, 0.66, 14, 0.7)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * PW, cy * PH, r * (0.5 + 0.5 * a), (255, 255, 255, int(230 * a)))
    return base


def banner_giveaway(t):
    base = pbase([(70, 12, 26), (130, 32, 32), (70, 12, 26)])
    d = ImageDraw.Draw(base)
    base = paste_icon(base, gem_frame, t, 150, (PW - 150) // 2, 30)
    text_c(d, PW / 2, 232, 'GIVEAWAY', ImageFont.truetype(FONT_B, 68), (255, 215, 80), (70, 20, 0), 6)
    text_c(d, PW / 2, 330, 'REACT & WIN', ImageFont.truetype(FONT_B, 42), (255, 190, 160), (40, 8, 8), 4)
    d.line([(60, 420), (PW - 60, 420)], fill=(255, 150, 120, 255), width=4)
    base = paste_icon(base, trophy_frame, t, 140, (PW - 140) // 2, 480)
    base = shine(base, t)
    d = ImageDraw.Draw(base)
    for (cx, cy, r, ph) in [(0.2, 0.28, 18, 0.0), (0.8, 0.28, 16, 0.4), (0.5, 0.62, 14, 0.75)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * PW, cy * PH, r * (0.5 + 0.5 * a), (255, 255, 255, int(230 * a)))
    return base


def banner_invites(t):
    base = pbase([(8, 44, 38), (18, 100, 76), (8, 44, 38)])
    d = ImageDraw.Draw(base)
    base = paste_icon(base, trophy_frame, t, 150, (PW - 150) // 2, 26)
    text_c(d, PW / 2, 226, 'INVITE', ImageFont.truetype(FONT_B, 72), (140, 255, 190), (0, 40, 25), 6)
    text_c(d, PW / 2, 316, 'TRACKING', ImageFont.truetype(FONT_B, 72), (140, 255, 190), (0, 40, 25), 6)
    text_c(d, PW / 2, 428, 'EVERY INVITE COUNTS', ImageFont.truetype(FONT_B, 30), (200, 255, 220), (5, 30, 20), 3)
    for i in range(5):
        h = 40 + 110 * tw(t, i / 5)
        d.rectangle([PW // 2 - 90 + i * 38, 640 - h, PW // 2 - 66 + i * 38, 640], fill=(120, 255, 190, 255))
    base = shine(base, t)
    return base


def banner_server(t):
    base = pbase([(28, 50, 16), (60, 120, 40), (28, 50, 16)])
    d = ImageDraw.Draw(base)
    base = paste_icon(base, gem_frame, t, 140, (PW - 140) // 2, 30)
    text_c(d, PW / 2, 226, 'RIZOKMC', ImageFont.truetype(FONT_B, 80), (150, 255, 120), (10, 50, 10), 6)
    text_c(d, PW / 2, 340, 'PLAY.RIZOKMC.FUN', ImageFont.truetype(FONT_B, 40), (255, 235, 150), (70, 45, 0), 4)
    d.line([(60, 430), (PW - 60, 430)], fill=(180, 255, 150, 255), width=4)
    text_c(d, PW / 2, 462, 'BEDROCK PORT: 19132', ImageFont.truetype(FONT_B, 30), (220, 255, 200), (10, 40, 10), 3)
    base = paste_icon(base, fire_frame, t, 120, (PW - 120) // 2, 520)
    base = shine(base, t)
    d = ImageDraw.Draw(base)
    for (cx, cy, r, ph) in [(0.18, 0.30, 16, 0.1), (0.82, 0.30, 16, 0.5), (0.5, 0.88, 12, 0.8)]:
        a = tw(t, ph)
        if a > 0.2:
            draw_sparkle(d, cx * PW, cy * PH, r * (0.5 + 0.5 * a), (255, 255, 255, int(230 * a)))
    return base


BANNERS = {
    'welcome': banner_welcome,
    'giveaway': banner_giveaway,
    'invites': banner_invites,
    'server': banner_server,
}

for name, fn in BANNERS.items():
    frames = []
    for i in range(BFR):
        fr = fn(i / BFR).convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=64)
        frames.append(fr)
    path = f'banners/{name}.gif'
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=110, loop=0)
    print(f'banner {name}: {os.path.getsize(path)/1024:.0f}KB')

print('done')
