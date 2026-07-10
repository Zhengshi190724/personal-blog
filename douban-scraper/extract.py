"""
豆瓣帖子内容提取脚本
用法: python extract.py
输出: output/output.txt (标题、作者、正文、回复)
"""

import html
import re
import time
import requests
from pathlib import Path

TOPIC_URL = "https://www.douban.com/group/topic/487190733/?_spm_id=MjExMzg1MzM1&_i=873807679JJTl1"
OUTPUT_DIR = Path(__file__).parent / "录像带租赁店"
IMG_DIR = OUTPUT_DIR / "images"
OUTPUT_FILE = OUTPUT_DIR / "录像带租赁店.txt"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.douban.com/",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def fetch_page(url: str) -> str:
    """获取页面HTML"""
    print(f"  请求: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    print(f"  状态: {resp.status_code}, 大小: {len(resp.text)} 字符")
    return resp.text


def download_images(image_urls: list[str]) -> list[str]:
    """下载帖子图片，返回本地路径列表"""
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    local_paths = []

    session = requests.Session()
    session.headers.update(HEADERS)

    for i, url in enumerate(image_urls):
        # 将 jpg 转为 webp（CDN对webp格式的请求响应更好）
        download_url = url
        if url.endswith(".jpg"):
            download_url = url[:-4] + ".webp"
        ext = "webp"
        local_path = IMG_DIR / f"page_{i + 1:02d}.{ext}"
        try:
            resp = session.get(download_url, timeout=30)
            resp.raise_for_status()
            local_path.write_bytes(resp.content)
            local_paths.append(str(local_path))
            size_kb = len(resp.content) // 1024
            print(f"  [{i + 1}/{len(image_urls)}] 下载完成: {local_path.name} ({size_kb}KB)")
        except Exception as e:
            print(f"  [{i + 1}/{len(image_urls)}] 下载失败: {e}")
        time.sleep(0.5)

    return local_paths


def ocr_images(image_paths: list[str]) -> str:
    """对图片列表进行OCR，返回合并文本。使用 PaddleOCR (需先安装依赖)。"""
    # 方案1: PaddleOCR (推荐)
    try:
        import os
        os.environ["FLAGS_use_mkldnn"] = "0"

        from paddleocr import PaddleOCR

        print("  使用 PaddleOCR (PP-OCRv4)...")
        ocr = PaddleOCR(lang="ch")
        full_text = []
        for i, path in enumerate(image_paths):
            try:
                result = ocr.ocr(path)
                lines = []
                if result and result[0]:
                    for line in result[0]:
                        lines.append(line[1][0])
                text = "\n".join(lines)
                full_text.append(text)
                print(f"  [{i + 1}/{len(image_paths)}] OCR: {Path(path).name} ({len(text)} 字符)")
            except Exception as e:
                print(f"  [{i + 1}/{len(image_paths)}] 失败: {e}")
        return "\n\n".join(full_text)
    except ImportError:
        pass

    # 方案2: Tesseract OCR (备选)
    try:
        import pytesseract
        from PIL import Image

        # 尝试自动检测 Tesseract 安装位置
        import shutil
        tesseract_exe = shutil.which("tesseract") or ""
        if not tesseract_exe:
            for candidate in [
                r"D:\Users\26012\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            ]:
                if Path(candidate).exists():
                    tesseract_exe = candidate
                    break
        if tesseract_exe:
            pytesseract.pytesseract.tesseract_cmd = tesseract_exe

        print("  使用 Tesseract OCR...")
        full_text = []
        for i, path in enumerate(image_paths):
            try:
                img = Image.open(path)
                text = pytesseract.image_to_string(img, lang="chi_sim+eng")
                full_text.append(text)
                print(f"  [{i + 1}/{len(image_paths)}] OCR: {Path(path).name} ({len(text)} 字符)")
            except Exception as e:
                print(f"  [{i + 1}/{len(image_paths)}] 失败: {e}")
        return "\n\n".join(full_text)
    except ImportError:
        pass

    # 无法OCR
    print("\n[!] 未检测到可用的 OCR 引擎。请选择以下方案安装：")
    print("  方案A (推荐): PaddleOCR")
    print("    pip install 'numpy<2' 'opencv-python<4.7' paddlepaddle==2.6.2 paddleocr==2.7.3")
    print("  方案B: Tesseract-OCR")
    print("    1. 下载安装: https://github.com/UB-Mannheim/tesseract/wiki")
    print("    2. 下载中文语言包 chi_sim.traineddata 放入 tessdata 目录")
    print("    3. pip install pytesseract pillow")
    return ""


def extract_location(content: str, default: str = "未知地点") -> str:
    """从HTML中提取发帖地点"""
    loc_match = re.search(r'<span class="ip-location">([^<]+)</span>', content)
    if loc_match:
        return html.unescape(loc_match.group(1))
    return default


def extract_comments(content: str) -> list[tuple[str, str]]:
    """从HTML中提取回复列表 [(用户+时间, 内容)]"""
    comments = []
    # 找到评论区：<h4> 标签带回复内容
    comment_blocks = re.findall(
        r'<h4[^>]*>(.*?)</h4>.*?<p[^>]*>(.*?)</p>',
        content, re.DOTALL
    )
    for block in comment_blocks:
        header = re.sub(r'<.*?>', '', block[0]).strip()
        header = html.unescape(header)
        # 压缩空白
        header = ' '.join(header.split())
        body = re.sub(r'<.*?>', '', block[1]).strip()
        body = html.unescape(body)
        if body:
            comments.append((header, body))
    return comments


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("豆瓣帖子内容提取")
    print("=" * 60)

    # --- 获取页面 ---
    print("\n[1/5] 获取页面...")
    content = fetch_page(TOPIC_URL)

    # --- 提取元数据 ---
    print("\n[2/5] 提取元数据...")

    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    title = re.sub(r'<.*?>', '', title_match.group(1)).strip() if title_match else "未知标题"
    title = html.unescape(title)

    author_match = re.search(
        r'href="https://www.douban.com/people/(\d+)/"[^>]*>([^<]+)</a>',
        content
    )
    author = author_match.group(2).strip() if author_match else "未知作者"

    date_match = re.search(r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})', content)
    date = date_match.group(1) if date_match else "未知日期"

    location = extract_location(content)

    print(f"  标题: {title}")
    print(f"  作者: {author}")
    print(f"  时间: {date}")
    print(f"  地点: {location}")

    # --- 提取图片URL ---
    print("\n[3/5] 提取图片URL...")
    raw_urls = re.findall(
        r'https:[\\/]{2,3}img\d+\.doubanio\.com[\\/]+view[\\/]+group_topic'
        r'[\\/]+l[\\/]+public[\\/]+p\d+\.(?:jpg|webp)',
        content
    )
    image_urls = []
    for u in raw_urls:
        clean = u.replace("\\", "")
        image_urls.append(clean)
    image_urls = list(dict.fromkeys(image_urls))
    print(f"  找到 {len(image_urls)} 张图片")

    # --- 提取回复 ---
    print("\n[4/5] 提取回复...")
    comments = extract_comments(content)
    print(f"  找到 {len(comments)} 条回复")

    # --- 下载并OCR图片 ---
    print("\n[5/5] 图片处理...")
    print("  (如需OCR文字提取，请安装 Tesseract-OCR)")
    local_paths = download_images(image_urls)
    story_text = ""
    if local_paths:
        story_text = ocr_images(local_paths)
        if story_text:
            print(f"  OCR提取了 {len(story_text)} 个字符")
        else:
            print("  OCR 不可用，图片已保存到 output/images/ 目录")

    # --- 写入文件 ---
    print(f"\n写入: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"标题: {title}\n")
        f.write(f"作者: {author}\n")
        f.write(f"发布时间: {date}\n")
        f.write(f"地点: {location}\n")
        f.write("=" * 60 + "\n\n")

        if story_text:
            f.write("【正文内容（OCR提取）】\n\n")
            f.write(story_text)
            f.write("\n" + "=" * 60 + "\n\n")
        else:
            f.write(f"【正文为 {len(image_urls)} 张图片，已保存至 output/images/ 目录】\n")
            f.write("如需提取图片中文字，安装 Tesseract-OCR 后重新运行:\n")
            f.write("  1. 下载: https://github.com/UB-Mannheim/tesseract/wiki\n")
            f.write("  2. pip install pytesseract pillow\n")
            f.write("  3. python extract.py\n\n")
            f.write("=" * 60 + "\n\n")

        if comments:
            f.write("【回复内容】\n\n")
            for header, body in comments:
                f.write(f"{header}\n")
                f.write(f"  {body}\n\n")

    print(f"\n完成! 输出: {OUTPUT_FILE}")
    if not story_text:
        print(f"图片目录: {IMG_DIR}")


if __name__ == "__main__":
    main()
