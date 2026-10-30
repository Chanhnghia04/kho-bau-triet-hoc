import os
from PIL import Image

def make_female(im, is_back=False):
    female = im.copy()
    w, h = female.size
    pixels = female.load()
    
    hair_dark = (55, 28, 14, 255)
    hair_mid = (135, 75, 38, 255)
    hair_light = (185, 115, 62, 255)
    ribbon_red = (239, 68, 68, 255)
    ribbon_dark = (185, 28, 28, 255)
    skin = (252, 211, 178, 255)
    skin_shadow = (225, 165, 130, 255)
    skirt_khaki = (140, 115, 65, 255)
    skirt_shadow = (95, 75, 40, 255)
    socks_cream = (245, 240, 220, 255)
    
    if not is_back:
        # 1. Sweet blush & eyelashes on face (y: 0.3*h .. 0.45*h)
        for y in range(int(0.28 * h), int(0.48 * h)):
            for x in range(w):
                p = pixels[x, y]
                if p[3] > 0 and p[0] > 180 and p[1] > 130 and p[0] > p[2] + 25:
                    # Blush on cheek areas
                    if x < int(0.45 * w) or x > int(0.65 * w):
                        if (x + y) % 2 == 0:
                            pixels[x, y] = (255, max(0, p[1] - 25), max(0, p[2] - 20), p[3])
                            
        # 2. Flowing braids on left and right sides
        for y in range(int(0.35 * h), int(0.72 * h)):
            # Right braid
            rx = int(0.75 * w)
            for bx in range(rx, min(w, rx + 8)):
                if pixels[bx, y][3] > 0:
                    pixels[bx, y] = hair_mid if bx < rx + 5 else hair_light
            # Left braid (if not backpack)
            lx = int(0.18 * w)
            for bx in range(max(0, lx - 4), lx + 4):
                if pixels[bx, y][3] > 0 and pixels[bx, y][1] < 120:
                    pixels[bx, y] = hair_mid
                    
        # Red ribbon bows at y ≈ 0.58*h
        by_mid = int(0.58 * h)
        for by in range(by_mid - 3, by_mid + 4):
            for bx in range(int(0.72 * w), min(w, int(0.88 * w))):
                if pixels[bx, by][3] > 0:
                    pixels[bx, by] = ribbon_red if (bx + by) % 2 == 0 else ribbon_dark
    else:
        # Back view: long hair and red bows from behind
        for y in range(int(0.35 * h), int(0.72 * h)):
            for bx in range(int(0.72 * w), min(w, int(0.85 * w))):
                if pixels[bx, y][3] > 0:
                    pixels[bx, y] = hair_mid
            for bx in range(int(0.15 * w), int(0.28 * w)):
                if pixels[bx, y][3] > 0:
                    pixels[bx, y] = hair_mid
        by_mid = int(0.58 * h)
        for by in range(by_mid - 3, by_mid + 4):
            for bx in range(int(0.70 * w), min(w, int(0.85 * w))):
                if pixels[bx, by][3] > 0:
                    pixels[bx, by] = ribbon_red
            for bx in range(int(0.15 * w), int(0.30 * w)):
                if pixels[bx, by][3] > 0:
                    pixels[bx, by] = ribbon_red
                    
    # Pleated skirt in lower torso (y: 0.72*h .. 0.85*h)
    for y in range(int(0.72 * h), int(0.84 * h)):
        for x in range(int(0.3 * w), int(0.75 * w)):
            p = pixels[x, y]
            if p[3] > 0 and (p[0] > 70 and p[1] > 60 and p[2] < 60):
                pixels[x, y] = skirt_khaki if x % 4 != 0 else skirt_shadow
                
    return female

def main():
    in_dir = r'D:\1\kho-bau-triet-hoc\public\assets\player_anim'
    out_dir = r'D:\1\kho-bau-triet-hoc\public\assets\player_anim_female'
    os.makedirs(out_dir, exist_ok=True)
    
    for f in os.listdir(in_dir):
        if f.endswith('.png'):
            im = Image.open(os.path.join(in_dir, f))
            is_back = 'up' in f
            fem = make_female(im, is_back)
            fem.save(os.path.join(out_dir, f))
            print(f'Saved female {f}')

if __name__ == '__main__':
    main()
