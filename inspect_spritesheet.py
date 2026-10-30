from PIL import Image

def inspect():
    im = Image.open(r'D:\1\kho-bau-triet-hoc\public\assets\animationplayer.jpg').convert('RGB')
    w, h = im.size
    print('Size:', w, h)
    
    # Let's save slices of the image to see what frames exist
    # Let's crop into 4 horizontal strips and 4 vertical strips
    strip_h = h // 2
    strip_w = w // 4
    
    for row in range(2):
        for col in range(4):
            box = (col * strip_w, row * strip_h, (col + 1) * strip_w, (row + 1) * strip_h)
            cropped = im.crop(box)
            cropped.save(rf'D:\1\kho-bau-triet-hoc\public\assets\tile_{row}_{col}.png')
            print(f'Saved tile_{row}_{col}.png:', box)

if __name__ == '__main__':
    inspect()
