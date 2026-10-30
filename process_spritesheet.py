import os
from PIL import Image
from collections import deque

def extract_clean_sprite(im, box):
    crop = im.crop(box).convert('RGBA')
    w, h = crop.size
    pixels = crop.load()
    
    is_bg = lambda r, g, b: abs(r-g)<=8 and abs(g-b)<=8 and abs(r-b)<=8 and 140 <= r <= 245
    visited = [[False]*h for _ in range(w)]
    queue = deque()
    
    for x in range(w):
        if is_bg(*pixels[x, 0][:3]): queue.append((x, 0)); visited[x][0] = True
        if is_bg(*pixels[x, h-1][:3]): queue.append((x, h-1)); visited[x][h-1] = True
    for y in range(h):
        if is_bg(*pixels[0, y][:3]): queue.append((0, y)); visited[0][y] = True
        if is_bg(*pixels[w-1, y][:3]): queue.append((w-1, y)); visited[w-1][y] = True
        
    while queue:
        cx, cy = queue.popleft()
        pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if is_bg(*pixels[nx, ny][:3]):
                    visited[nx][ny] = True
                    queue.append((nx, ny))
                    
    bbox = crop.getbbox()
    return crop.crop(bbox) if bbox else crop

def main():
    im = Image.open(r'D:\1\kho-bau-triet-hoc\public\assets\animationplayer.jpg').convert('RGB')
    out_dir = r'D:\1\kho-bau-triet-hoc\public\assets\player_anim'
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Row 0: Idle frames (y=15..102)
    # Col clusters: (21, 67), (105, 154), (192, 235), (275, 320)
    idle_cols = [(16, 75), (100, 160), (185, 245), (270, 330)]
    for i, (x0, x1) in enumerate(idle_cols):
        sprite = extract_clean_sprite(im, (x0, 15, x1, 102))
        sprite.save(os.path.join(out_dir, f'idle_{i}.png'))
        print(f'Saved idle_{i}.png: {sprite.size}')
        
    # 2. Row 4: Walk / Run Down frames (y=375..462)
    # Col clusters: (16, 68), (99, 149), (183, 236), (266, 319), (352, 402), (444, 510)
    walk_down_cols = [(14, 75), (95, 155), (180, 240), (263, 323), (348, 408), (440, 512)]
    for i, (x0, x1) in enumerate(walk_down_cols):
        sprite = extract_clean_sprite(im, (x0, 375, x1, 462))
        sprite.save(os.path.join(out_dir, f'walk_down_{i}.png'))
        print(f'Saved walk_down_{i}.png: {sprite.size}')

    # 3. Row 1: Walk / Run Side frames (y=105..192)
    walk_side_cols = [(16, 75), (100, 160), (185, 245), (270, 330), (358, 418), (442, 502)]
    for i, (x0, x1) in enumerate(walk_side_cols):
        sprite = extract_clean_sprite(im, (x0, 105, x1, 192))
        sprite.save(os.path.join(out_dir, f'walk_side_{i}.png'))
        print(f'Saved walk_side_{i}.png: {sprite.size}')

    # 4. Row 5: Walk / Run Up (Back view) frames (y=465..552)
    walk_up_cols = [(14, 75), (98, 160), (185, 248), (270, 330), (350, 420)]
    for i, (x0, x1) in enumerate(walk_up_cols):
        sprite = extract_clean_sprite(im, (x0, 465, x1, 552))
        sprite.save(os.path.join(out_dir, f'walk_up_{i}.png'))
        print(f'Saved walk_up_{i}.png: {sprite.size}')

    print('All player_anim sprites extracted successfully!')

if __name__ == '__main__':
    main()
