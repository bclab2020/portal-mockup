import os
import json
import datetime
import subprocess

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'articles_db.json')
    
    # 1. Load articles database
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return
        
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    # 2. Resolve current day and increment
    current_day = db.get("current_day", "day1")
    current_day_num = int(current_day.replace("day", ""))
    
    # Let's see if next day exists
    next_day_num = current_day_num + 1
    next_day = f"day{next_day_num}"
    
    if next_day not in db:
        print(f"Notice: All pre-generated days have been published. Loop back to day1.")
        next_day = "day1"
        next_day_num = 1
        
    db["current_day"] = next_day
    print(f"Publishing day advanced from {current_day} to {next_day}")
    
    # 3. Save database back
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=4)
    print("Updated articles_db.json successfully!")
    
    # 4. Automatic Git deploy (only pushing the updated JSON database)
    try:
        print("Running git deployment...")
        # Check if git is initialized
        subprocess.run(["git", "status"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Git commands
        subprocess.run(["git", "add", "articles_db.json"], check=True)
        commit_msg = f"Daily automated article publish - {datetime.date.today().strftime('%Y-%m-%d')} (advanced to {next_day})"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Git push completed successfully!")
    except Exception as e:
        print(f"Git auto-push skipped or failed: {e}")
        print("Note: Make sure git is configured and you have push permissions.")

if __name__ == '__main__':
    main()
