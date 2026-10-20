import os
from PIL import Image

def process_logo(src_path, dest_paths):
    img = Image.open(src_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Any pixel with high brightness / near white becomes fully transparent
    for item in datas:
        r, g, b, a = item
        # If pixel is near-white (background)
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)

    # Automatically crop away empty/transparent border so artwork fills canvas tightly
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        # Add a tiny 10px transparent padding for aesthetics
        pad = 12
        new_w = img.width + pad * 2
        new_h = img.height + pad * 2
        padded_img = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
        padded_img.paste(img, (pad, pad))
        img = padded_img

    for dest in dest_paths:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        img.save(dest, "PNG")
        print(f"Saved transparent cropped logo to {dest} (Size: {img.size})")

if __name__ == "__main__":
    src = "apps/web/public/logo.png"
    destinations = [
        "apps/web/public/logo.png",
        "apps/web/public/favicon.png",
        "apps/web/public/icons/icon-192.png",
        "apps/web/public/icons/icon-512.png",
        "apps/desktop/assets/images/logo.png",
    ]
    process_logo(src, destinations)
