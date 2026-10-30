import os
from PIL import Image
from collections import deque

def extract_clean_sprite(sheet, box):
    crop = sheet.crop(box).convert('RGBA')
    w, h = crop.size
    pixels = crop.load()
    
    def is_bg(r, g, b):
        diff = max(abs(r-g), abs(g-b), abs(r-b))
        avg = (r + g + b) // 3
        return diff <= 14 and 125 <= avg <= 245

    vis = [[False]*h for _ in range(w)]
    q = deque()
    
    for x in range(w):
        if is_bg(*pixels[x, 0][:3]): q.append((x, 0)); vis[x][0] = True
        if is_bg(*pixels[x, h-1][:3]): q.append((x, h-1)); vis[x][h-1] = True
    for y in range(h):
        if is_bg(*pixels[0, y][:3]): q.append((0, y)); vis[0][y] = True
        if is_bg(*pixels[w-1, y][:3]): q.append((w-1, y)); vis[w-1][y] = True

    while q:
        cx, cy = q.popleft()
        pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not vis[nx][ny]:
                if is_bg(*pixels[nx, ny][:3]):
                    vis[nx][ny] = True
                    q.append((nx, ny))

    bbox = crop.getbbox()
    return crop.crop(bbox) if bbox else crop

def extract_portrait(portrait_path):
    im = Image.open(portrait_path).convert('RGBA')
    w, h = im.size
    pixels = im.load()
    
    def is_bg(r, g, b):
        diff = max(abs(r-g), abs(g-b), abs(r-b))
        avg = (r + g + b) // 3
        return diff <= 16 and 125 <= avg <= 245

    vis = [[False]*h for _ in range(w)]
    q = deque()
    for x in range(w):
        if is_bg(*pixels[x, 0][:3]): q.append((x, 0)); vis[x][0] = True
        if is_bg(*pixels[x, h-1][:3]): q.append((x, h-1)); vis[x][h-1] = True
    for y in range(h):
        if is_bg(*pixels[0, y][:3]): q.append((0, y)); vis[0][y] = True
        if is_bg(*pixels[w-1, y][:3]): q.append((w-1, y)); vis[w-1][y] = True

    while q:
        cx, cy = q.popleft()
        pixels[cx, cy] = (0, 0, 0, 0)
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not vis[nx][ny]:
                if is_bg(*pixels[nx, ny][:3]):
                    vis[nx][ny] = True
                    q.append((nx, ny))

    bbox = im.getbbox()
    trimmed = im.crop(bbox) if bbox else im
    return trimmed

def main():
    sheet_path = r'C:\Users\Admin\.gemini\antigravity\brain\42b96d2e-4462-49c4-9564-3c199130031d\.user_uploaded\media_1791095837996.jpg'
    portrait_path = r'C:\Users\Admin\.gemini\antigravity\brain\42b96d2e-4462-49c4-9564-3c199130031d\.user_uploaded\media_1791095837989.jpg'
    
    sheet = Image.open(sheet_path).convert('RGB')
    out_dir = r'D:\1\kho-bau-triet-hoc\public\assets\player_anim_female'
    os.makedirs(out_dir, exist_ok=True)

    # 1. Row 0: Idle (4 frames)
    idle_cols = [(16, 70), (100, 155), (188, 242), (274, 328)]
    for i, (x0, x1) in enumerate(idle_cols):
        sprite = extract_clean_sprite(sheet, (x0, 15, x1, 98))
        sprite.save(os.path.join(out_dir, f'idle_{i}.png'))
        print(f'Extracted idle_{i}.png: {sprite.size}')

    # 2. Row 1: Walk / Run Side (6 frames)
    walk_side_cols = [(14, 70), (101, 155), (187, 240), (273, 329), (361, 416), (446, 500)]
    for i, (x0, x1) in enumerate(walk_side_cols):
        sprite = extract_clean_sprite(sheet, (x0, 110, x1, 192))
        sprite.save(os.path.join(out_dir, f'walk_side_{i}.png'))
        print(f'Extracted walk_side_{i}.png: {sprite.size}')

    # 3. Row 4: Walk Down / Climb (6 frames)
    walk_down_cols = [(17, 67), (100, 150), (185, 235), (269, 320), (354, 405), (444, 512)]
    for i, (x0, x1) in enumerate(walk_down_cols):
        sprite = extract_clean_sprite(sheet, (x0, 385, x1, 481))
        sprite.save(os.path.join(out_dir, f'walk_down_{i}.png'))
        print(f'Extracted walk_down_{i}.png: {sprite.size}')

    # 4. Row 5: Walk Up / Collect (5 frames)
    walk_up_cols = [(17, 74), (102, 156), (190, 245), (276, 330), (356, 417)]
    for i, (x0, x1) in enumerate(walk_up_cols):
        sprite = extract_clean_sprite(sheet, (x0, 494, x1, 572))
        sprite.save(os.path.join(out_dir, f'walk_up_{i}.png'))
        print(f'Extracted walk_up_{i}.png: {sprite.size}')

    # 5. Extract portrait and previews
    portrait = extract_portrait(portrait_path)
    portrait_178 = portrait.resize((178, 288), Image.Resampling.LANCZOS)
    portrait_178.save(r'D:\1\kho-bau-triet-hoc\public\assets\explorer_female.png')
    portrait_178.save(r'D:\1\kho-bau-triet-hoc\public\assets\test_female_tint.png')
    
    preview_71 = portrait.resize((71, 115), Image.Resampling.LANCZOS)
    preview_71.save(r'D:\1\kho-bau-triet-hoc\public\assets\f_preview.png')

    # Also save raw jpg copies for reference
    raw_portrait = Image.open(portrait_path)
    raw_portrait.save(r'D:\1\kho-bau-triet-hoc\public\assets\player_nu.jpg')
    raw_portrait.save(r'D:\1\kho-bau-triet-hoc\public\assets\playernu.jpg')

    print('All female sprites and portraits extracted successfully!')

if __name__ == '__main__':
    main()
