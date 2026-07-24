import os
import json
import urllib.request
import urllib.error
import re
import datetime

def clean_html(html_content):
    # Remove script and style tags
    clean = re.sub(r'<(script|style).*?>.*?</\1>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    # Remove all other HTML tags
    clean = re.sub(r'<.*?>', ' ', clean)
    # Normalize whitespaces
    return " ".join(clean.split())

def validate_url_context(url, badge, title):
    # Determine keywords based on the badge or title
    keywords = []
    badge_lower = badge.lower()
    
    if "厚生労働" in badge_lower or "厚労" in badge_lower:
        keywords = ["厚生労働", "健康", "厚生", "医療", "ガイド"]
    elif "スポーツ庁" in badge_lower or "文部科学" in badge_lower:
        keywords = ["スポーツ", "基本計画", "体力", "基本計画", "jsa"]
    elif "nature" in badge_lower:
        keywords = ["nature", "journal", "exercise", "transducers", "pubmed", "ncbi", "springer"]
    elif "pubmed" in badge_lower or "学術" in badge_lower or "論文" in badge_lower or "臨床" in badge_lower:
        keywords = ["pubmed", "ncbi", "nih", "journal", "abstract", "clinical", "study", "medicine"]
    
    # If no specific badge keywords, extract words from title
    if not keywords:
        keywords = [w for w in re.split(r'[ 　「」『』（）()・、。]', title) if len(w) >= 2]
        
    if not keywords:
        return True, "No keywords to match context."

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            text = clean_html(html).lower()
            
            matched = []
            for kw in keywords:
                if kw.lower() in text:
                    matched.append(kw)
            
            if len(matched) > 0:
                return True, f"Context Match Success (Matched keywords: {', '.join(matched)})"
            else:
                return False, f"Context Match Warning: Page text does not contain expected keywords ({', '.join(keywords)})"
    except Exception as e:
        return False, f"Context Match Error: Failed to retrieve or parse page text ({e})"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'articles_db.json')
    results_path = os.path.join(script_dir, 'link_test_results.json')
    
    if not os.path.exists(db_path):
        print(f"Error: articles_db.json not found at {db_path}")
        return False
        
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    # Gather all external URLs
    links_to_test = []
    
    def extract_links_from_list(articles, day_name, cat_name):
        for idx, a in enumerate(articles):
            hook = a.get("btn_hook", "").strip()
            if hook.startswith("http://") or hook.startswith("https://"):
                links_to_test.append({
                    "url": hook,
                    "title": a.get("title", ""),
                    "badge": a.get("badge", ""),
                    "day": day_name,
                    "category": cat_name,
                    "index": idx
                })

    # Scan baseline and days
    for key, val in db.items():
        if key == "current_day":
            continue
        # Check if it is dayX or baseline
        if isinstance(val, dict):
            for cat in ['sports', 'health', 'beauty']:
                if cat in val:
                    extract_links_from_list(val[cat], key, cat)
                    
    print(f"Found {len(links_to_test)} external links to validate.")
    
    results = {}
    has_errors = False
    
    for item in links_to_test:
        url = item["url"]
        print(f"Testing [{item['day']}.{item['category']}] {item['title'][:25]}... -> {url}")
        
        status = "success"
        code = 200
        message = ""
        context_match = True
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.status
                # Perform context check
                ok, ctx_msg = validate_url_context(url, item["badge"], item["title"])
                message = ctx_msg
                if not ok:
                    status = "warning"
                    context_match = False
        except urllib.error.HTTPError as e:
            status = "error"
            code = e.code
            message = f"HTTP Error: {e.code} ({e.reason})"
            has_errors = True
            context_match = False
        except Exception as e:
            status = "error"
            code = 0
            message = f"Connection Failed: {e}"
            has_errors = True
            context_match = False
            
        print(f"  Result: {status.upper()} (HTTP {code}) - {message}")
        results[url] = {
            "title": item["title"],
            "badge": item["badge"],
            "day": item["day"],
            "category": item["category"],
            "index": item["index"],
            "status": status,
            "code": code,
            "context_match": context_match,
            "message": message
        }
        
    # Write report
    report = {
        "last_run": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "has_errors": has_errors,
        "results": results
    }
    # Write report as JSON
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=4)
    print(f"Verification report saved to {results_path}")
    
    # Write report as JS for browser file:// compatibility
    js_path = os.path.join(script_dir, 'link_test_results.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"window.LINK_TEST_RESULTS = {json.dumps(report, ensure_ascii=False, indent=4)};\n")
    print(f"Browser-compatible JS report saved to {js_path}")
    
    return not has_errors

if __name__ == '__main__':
    main()
