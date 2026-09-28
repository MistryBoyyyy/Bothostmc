# ═══════════════════════════════════════════════════════════════
#  gen_sounds.py — synthesize 16 fun SFX clips for the soundboard
# ═══════════════════════════════════════════════════════════════
import math, os, random, wave, struct

SR = 22050
os.makedirs('assets/sounds', exist_ok=True)
random.seed(7)

def wav(name, samples):
    mx = max(1, max(abs(s) for s in samples))
    with wave.open(f'assets/sounds/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(s / mx * 30000)) for s in samples))

def env(i, n, a=0.01, r=0.15):
    t = i / SR
    d = n / SR
    at = min(1, t / a)
    rt = min(1, max(0, (d - t) / r))
    return at * rt

def tone(freq, dur, kind='sine', vib=0.0, glide=0.0):
    n = int(dur * SR); out = []
    for i in range(n):
        t = i / SR
        f = freq * (1 + glide * t / dur)
        ph = 2 * math.pi * (f * t + (vib * 0.02 * math.sin(2 * math.pi * 6 * t)))
        v = math.sin(ph)
        if kind == 'square': v = 1 if v > 0 else -1
        if kind == 'saw': v = 2 * (f * t % 1) - 1
        out.append(v * env(i, n))
    return out

def noise(dur, decay=8.0, hp=0.0):
    n = int(dur * SR); out = []; prev = 0.0
    for i in range(n):
        x = random.uniform(-1, 1)
        if hp > 0: x, prev = x - hp * prev, x
        out.append(x * math.exp(-decay * i / n))
    return out

def cat(*parts):
    out = []
    for p in parts: out += p
    return out

def gap(dur): return [0.0] * int(dur * SR)

def shift(freqs): return freqs

S = {}
# XP orb pickup — two rising pings
S['xp'] = cat(tone(900, .09), tone(1400, .16))
# Level up — bright arpeggio
S['levelup'] = cat(tone(523, .1), tone(659, .1), tone(784, .1), tone(1047, .3))
# UI click
S['click'] = tone(1800, .05, 'square')
# Pop
S['pop'] = cat(tone(600, .09, glide=1.5), noise(.03, 20))
# Explosion
S['boom'] = cat(noise(.7, 3.0), tone(60, .5, glide=-.4))
# Creeper hiss
S['creeper'] = cat(noise(.9, 1.2, hp=.6), noise(.5, 4.0, hp=.8))
# Anvil clang
S['anvil'] = cat(*[tone(f, .5, 'square') for f in (320, 452, 610)]) + [x*.5 for x in noise(.05, 30)]
# Glass break
S['glass'] = cat(noise(.3, 6.0, hp=.9), *[tone(f, .12) for f in (2400, 3100, 3900)])
# Coin
S['coin'] = cat(tone(988, .08), tone(1319, .3))
# Tada fanfare
S['tada'] = cat(tone(392, .12, 'square'), tone(523, .12, 'square'), tone(659, .12, 'square'),
               cat(tone(784, .5, 'square'), tone(988, .5, 'square')))
# Oof
S['oof'] = tone(300, .25, glide=-.5)
# Laser zap
S['laser'] = tone(1600, .3, 'saw', glide=-.8)
# Air horn
S['horn'] = cat(tone(440, .35, 'saw'), tone(466, .35, 'saw'), tone(440, .5, 'saw'))
# Sad trombone
S['sad'] = cat(tone(233, .3, vib=5), tone(220, .3, vib=5), tone(208, .3, vib=5), tone(196, .8, vib=6))
# Door creak
S['door'] = tone(140, .6, 'saw', vib=9, glide=.6)
# Nom nom (eating)
S['eat'] = cat(noise(.08, 12), gap(.06), noise(.08, 12), gap(.06), noise(.1, 10))

for n, smp in S.items():
    wav(n, smp)
print(len(S), 'sounds;', sum(os.path.getsize('assets/sounds/' + k + '.wav') for k in S) // 1024, 'KB')
