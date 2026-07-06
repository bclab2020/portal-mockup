import os
import json
import datetime
import subprocess

# Define image mapping for subcategories
IMAGES_MAP = {
    "soccer": "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=400",
    "baseball": "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=400",
    "tennis": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400",
    "basketball": "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=400",
    "volleyball": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=400",
    "track": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
    
    "stress": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
    "sleep": "https://images.unsplash.com/photo-1511295742364-92767fa62d9f?auto=format&fit=crop&q=80&w=400",
    "nutrition": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400",
    "pain": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    "check": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
    
    "makeup": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400",
    "cosmetics": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400",
    "hairstyle": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400",
    "styling": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400",
    "bodymake": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400"
}

def make_card_html(art):
    # Set pink badge for beauty, default blue/purple for others
    badge_style = ""
    if art['sport'] in ['makeup', 'cosmetics', 'hairstyle', 'styling', 'bodymake']:
        badge_style = ' style="background:var(--accent-pink); color:#fff;"'
    
    # Use custom img_id if defined, otherwise resolve from tags
    if 'img_id' in art and art['img_id'].strip():
        img_url = f"https://images.unsplash.com/{art['img_id']}?auto=format&fit=crop&q=80&w=400"
    else:
        tags = art['sport'].split()
        img_url = None
        for tag in tags:
            if tag in IMAGES_MAP:
                img_url = IMAGES_MAP[tag]
                break
        if not img_url:
            img_url = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400" 
    
    html = f"""
                        <!-- Daily Added Article ({art['badge']}) -->
                        <div class="article-card" data-sport="{art['sport']}">
                            <div class="article-image" style="background-image: url('{img_url}');">
                                <span class="article-badge"{badge_style}>{art['badge']}</span>
                            </div>
                            <div class="article-content">
                                <div class="article-body">
                                    <h3>{art['title']}</h3>
                                    <p>{art['p']}</p>
                                </div>
                                <div class="article-footer">
                                    <div class="article-meta">
                                        <span>{art['time']}</span>
                                        <span>{art['author']}</span>
                                    </div>
                                    <button class="btn-hook" onclick="{art['btn_hook']}">
                                        {art['btn_text']} <span>▶</span>
                                    </button>
                                </div>
                            </div>
                        </div>"""
    return html

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    state_path = os.path.join(script_dir, 'publishing_state.json')
    db_path = os.path.join(script_dir, 'articles_db.json')
    html_path = os.path.join(script_dir, 'index.html')
    
    # 1. Load or initialize publishing state
    if os.path.exists(state_path):
        with open(state_path, 'r', encoding='utf-8') as f:
            state = json.load(f)
    else:
        state = {"current_day_index": 1}
        
    day_key = f"day{state['current_day_index']}"
    print(f"Publishing articles for: {day_key}")
    
    # 2. Load articles database
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return
        
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    if day_key not in db:
        print(f"Notice: All pre-generated days have been published. Loop back to day1.")
        state['current_day_index'] = 1
        day_key = "day1"
        
    day_articles = db[day_key]
    
    # 3. Read index.html
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Find offsets for sections
    sports_start = html.find('id="sportsPanel"')
    health_start = html.find('id="healthPanel"')
    beauty_start = html.find('id="beautyPanel"')
    lab_start = html.find('id="labPanel"')
    
    # --- INSERT SPORTS ARTICLES ---
    sports_section = html[sports_start:health_start]
    list_tag = '<div class="article-list">'
    target_idx = sports_section.find(list_tag)
    if target_idx != -1:
        insert_pos = sports_start + target_idx + len(list_tag)
        sports_cards_html = "\n" + "\n".join([make_card_html(art) for art in day_articles['sports']])
        html = html[:insert_pos] + sports_cards_html + html[insert_pos:]
        
        # Adjust offsets for subsequent sections
        offset = len(sports_cards_html)
        health_start += offset
        beauty_start += offset
        lab_start += offset
        
    # --- INSERT HEALTH ARTICLES ---
    health_section = html[health_start:beauty_start]
    target_idx = health_section.find(list_tag)
    if target_idx != -1:
        insert_pos = health_start + target_idx + len(list_tag)
        health_cards_html = "\n" + "\n".join([make_card_html(art) for art in day_articles['health']])
        html = html[:insert_pos] + health_cards_html + html[insert_pos:]
        
        # Adjust offsets for subsequent sections
        offset = len(health_cards_html)
        beauty_start += offset
        lab_start += offset
        
    # --- INSERT BEAUTY ARTICLES ---
    beauty_section = html[beauty_start:lab_start]
    target_idx = beauty_section.find(list_tag)
    if target_idx != -1:
        insert_pos = beauty_start + target_idx + len(list_tag)
        beauty_cards_html = "\n" + "\n".join([make_card_html(art) for art in day_articles['beauty']])
        html = html[:insert_pos] + beauty_cards_html + html[insert_pos:]
        
    # 4. Save index.html
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Injected new articles into index.html successfully!")
    
    # 5. Update state for the next run
    state['current_day_index'] += 1
    with open(state_path, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=4)
        
    # 6. Automatic Git deploy
    try:
        print("Running git deployment...")
        # Check if git is initialized
        subprocess.run(["git", "status"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Git commands
        subprocess.run(["git", "add", "index.html", "publishing_state.json"], check=True)
        commit_msg = f"Daily automated article publish - {datetime.date.today().strftime('%Y-%m-%d')} ({day_key})"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Git push completed successfully!")
    except Exception as e:
        print(f"Git auto-push skipped or failed: {e}")
        print("Note: Make sure git is configured and you have push permissions.")

if __name__ == '__main__':
    main()
