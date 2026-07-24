import os
import json
import datetime
import urllib.request
import base64

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'articles_db.json')
    config_path = os.path.join(script_dir, 'github_config.json')
    
    # 1. Load articles database
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return
        
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    # 2. Resolve current day and increment
    current_day = db.get("current_day", "day1")
    current_day_num = int(current_day.replace("day", ""))
    
    next_day_num = current_day_num + 1
    next_day = f"day{next_day_num}"
    
    if next_day not in db:
        print(f"Notice: All pre-generated days have been published. Loop back to day1.")
        next_day = "day1"
        next_day_num = 1
        
    db["current_day"] = next_day
    print(f"Publishing day advanced from {current_day} to {next_day}")
    
    # 3. Save database locally
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=4)
    print("Updated articles_db.json locally successfully!")
    
    # 3.5 Run pre-publish link validation check
    import validate_links
    print("Running pre-publish link validation...")
    if not validate_links.main():
        print("Error: Link validation detected broken links (HTTP errors).")
        print("Aborting GitHub deployment to preserve site credibility.")
        print("Please review link_test_results.json and fix the database before publishing.")
        return
        
    # 4. Load GitHub configuration
    if not os.path.exists(config_path):
        print(f"Notice: github_config.json not found. Skipping auto-deploy.")
        print("You can manually drag-and-drop the updated articles_db.json to GitHub.")
        return
        
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
        
    token = config.get("token", "").strip()
    owner = config.get("owner", "").strip()
    repo = config.get("repo", "").strip()
    
    if not token or "貼り付けてください" in token:
        print("Notice: GitHub token is not set in github_config.json. Skipping auto-deploy.")
        print("Please edit github_config.json to set your token, or manually upload articles_db.json.")
        return
        
    # 5. Deploy via GitHub REST API (No local Git dependency!)
    try:
        print(f"Deploying updated database to GitHub ({owner}/{repo})...")
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/articles_db.json"
        
        # 5.1 Get current file SHA to perform update
        req_get = urllib.request.Request(url, headers={
            "Authorization": f"token {token}",
            "User-Agent": "Mozilla/5.0"
        })
        try:
            with urllib.request.urlopen(req_get, timeout=10) as resp_get:
                file_info = json.loads(resp_get.read().decode('utf-8'))
                sha = file_info.get('sha')
        except Exception as e_get:
            print(f"Warning: Failed to fetch current file SHA (might be a new file): {e_get}")
            sha = None
            
        # 5.2 Put the updated content
        db_content = json.dumps(db, ensure_ascii=False, indent=4)
        content_bytes = db_content.encode('utf-8')
        content_b64 = base64.b64encode(content_bytes).decode('utf-8')
        
        commit_msg = f"Daily automated article publish - {datetime.date.today().strftime('%Y-%m-%d')} (advanced to {next_day})"
        put_data = {
            "message": commit_msg,
            "content": content_b64
        }
        if sha:
            put_data["sha"] = sha
            
        req_put = urllib.request.Request(url, method="PUT", headers={
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }, data=json.dumps(put_data).encode('utf-8'))
        
        with urllib.request.urlopen(req_put, timeout=15) as resp_put:
            result = json.loads(resp_put.read().decode('utf-8'))
            print("Successfully updated articles_db.json on GitHub via API!")
            print(f"Commit SHA: {result.get('commit', {}).get('sha', '')[:8]}")
            
    except Exception as e:
        print(f"GitHub API deployment failed: {e}")
        print("Please verify your internet connection, repository name, and token permissions.")

if __name__ == '__main__':
    main()
