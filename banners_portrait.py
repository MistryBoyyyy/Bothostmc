
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
    text_c(d, PW / 2, 428, 'HAR INVITE COUNT HOTI HAI', ImageFont.truetype(FONT_B, 27), (200, 255, 220), (5, 30, 20), 3)
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
