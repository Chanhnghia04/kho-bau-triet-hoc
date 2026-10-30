from PIL import Image
from collections import deque

def extract_sprites():
    im = Image.open(r'D:\1\kho-bau-triet-hoc\public\assets\animationplayer.jpg').convert('RGB')
    w, h = im.size
    pixels = im.load()

    # Column segments roughly:
    # 0: ~10..82
    # 1: ~95..165
    # 2: ~180..250
    # 3: ~268..335
    # 4: ~352..418
    # 5: ~438..508
    # 6: ~524..585
    # 7: ~612..665
    # 8: ~673..748
    # 9: ~787..832
    # 10: ~872..918
    
    # Rows: Row 0 (top): y=15..275, Row 1 (bottom): y=285..550
    cols = [
        (10, 85),
        (95, 168),
        (180, 252),
        (265, 338),
        (350, 420),
        (435, 510),
        (520, 588),
        (610, 668),
        (670, 750),
        (785, 835),
        (870, 920)
    ]
    
    rows = [
        (15, 275),
        (280, 550)
    ]
    
    count = 0
    extracted_info = []
    
    for r_idx, (y0, y1) in enumerate(rows):
        for c_idx, (x0, x1) in enumerate(cols):
            sub = im.crop((x0, y0, x1, y1))
            # Flood fill transparent background
            sub_rgba = sub.convert('RGBA')
            sw, sh = sub_rgba.size
            spixels = sub_rgba.load()
            
            # Check if there's any colored content
            is_bg = lambda r, g, b: abs(r-g)<=8 and abs(g-b)<=8 and abs(r-b)<=8 and 140 <= r <= 245
            
            colored = sum(1 for sy in range(sh) for sx in range(sw) if not is_bg(*spixels[sx, sy][:3]))
            if colored < 500:
                continue
                
            # BFS flood fill from edges to make background transparent
            visited = [[False]*sh for _ in range(sw)]
            queue = deque()
            for x in range(sw):
                if is_bg(*spixels[x, 0][:3]): queue.append((x, 0)); visited[x][0] = True
                if is_bg(*spixels[x, sh-1][:3]): queue.append((x, sh-1)); visited[x][sh-1] = True
            for y in range(sh):
                if is_bg(*spixels[0, y][:3]): queue.append((0, y)); visited[0][y] = True
                if is_bg(*spixels[sw-1, y][:3]): queue.append((sw-1, y)); visited[sw-1][y] = True
                
            while queue:
                cx, cy = queue.popleft()
                spixels[cx, cy] = (0, 0, 0, 0)
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < sw and 0 <= ny < sh and not visited[nx][ny]:
                        if is_bg(*spixels[nx, ny][:3]):
                            visited[nx][ny] = True
                            queue.append((nx, ny))
            
            bbox = sub_rgba.getbbox()
            if bbox:
                trimmed = sub_rgba.crop(bbox)
                out_name = f'anim_frame_r{r_idx}_c{c_idx}.png'
                out_path = rf'D:\1\kho-bau-triet-hoc\public\assets\{out_name}'
                trimmed.save(out_path)
                count += 1
                extracted_info.append((out_name, trimmed.size, r_idx, c_idx))
                print(f'Extracted {out_name}: size {trimmed.size}')
                
    print(f'Total frames extracted: {count}')

if __name__ == '__main__':
    extract_sprites()
