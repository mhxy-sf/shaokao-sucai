import os
import sys
from PIL import Image

MAX_SIDE = 1600
JPEG_QUALITY = 80

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(ROOT, "images")

EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp")

def compress(path):
    before = os.path.getsize(path)
    ext = os.path.splitext(path)[1].lower()
    try:
        img = Image.open(path)

        # 缩放（先按原模式处理，最后保存时转换）
        w, h = img.size
        if max(w, h) > MAX_SIDE:
            ratio = MAX_SIDE / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

        if ext == ".png":
            # PNG 保留原格式，用 optimize 压缩
            img.save(path, "PNG", optimize=True)
            new_path = path
        else:
            # JPG/其他转 JPG 保存
            img = img.convert("RGB")
            new_path = os.path.splitext(path)[0] + ".jpg"
            img.save(new_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
            if new_path != path:
                os.remove(path)

        after = os.path.getsize(new_path)
        return before, after, new_path
    except Exception as e:
        return before, None, f"ERROR: {path} -> {e}"

def main():
    total_before = 0
    total_after = 0
    converted = []

    for dirpath, _, files in os.walk(IMG_DIR):
        for f in files:
            if f.lower().endswith(EXT):
                path = os.path.join(dirpath, f)
                before, after, np = compress(path)
                total_before += before
                if after is not None:
                    total_after += after
                    if np != path:
                        converted.append((f, np))
                    print(f"[OK] {os.path.relpath(path, ROOT)}  {before/1024:.0f}KB -> {after/1024:.0f}KB")
                else:
                    print(np)

    print("\n===== 汇总 =====")
    print(f"原总大小: {total_before/1048576:.1f} MB")
    print(f"压后总大小: {total_after/1048576:.1f} MB")
    if total_before > 0:
        print(f"压缩率: {(1 - total_after/total_before)*100:.1f}%")

if __name__ == "__main__":
    main()
