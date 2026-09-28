# best-frame PNG still for every animated emoji (emojis2 + emojis3)
from PIL import Image
import os

os.makedirs('assets/stills', exist_ok=True)
n = 0
for src in ['assets/emojis2', 'assets/emojis3']:
    for f in sorted(os.listdir(src)):
        if not f.endswith('.gif'):
            continue
        im = Image.open(os.path.join(src, f))
        best = None
        bestn = -1
        for k in range(im.n_frames):
            im.seek(k)
            hist = im.convert('RGBA').getchannel('A').histogram()
            ink = sum(hist[130:])  # mostly-opaque pixels
            if ink > bestn:
                bestn = ink
                best = im.convert('RGBA')
        best.save('assets/stills/' + f.replace('.gif', '.png'))
        n += 1
print('stills:', n)
