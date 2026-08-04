// CORE CONNECT for Business - SaaS Portal Logic

document.addEventListener('DOMContentLoaded', () => {
    checkB2BSession();
    setupTabListeners();
});

// 1. Session & Authentication Management
function checkB2BSession() {
    const session = JSON.parse(localStorage.getItem('b2b_session'));
    const loginSection = document.getElementById('loginSection');
    const portalSection = document.getElementById('portalSection');
    
    if (session) {
        // Logged in
        loginSection.style.display = 'none';
        portalSection.style.display = 'block';
        
        document.getElementById('displayDept').innerText = session.employeeDept;
        document.getElementById('displayName').innerText = `${session.employeeName} 様`;
        document.getElementById('displayTenant').innerText = session.tenantId;
        
        // Render Dashboard components
        renderHrvTrendChart();
        loadB2BArticles();
    } else {
        // Logged out
        loginSection.style.display = 'flex';
        portalSection.style.display = 'none';
    }
}

window.handleB2BLogin = function(event) {
    event.preventDefault();
    const tenantId = document.getElementById('tenantId').value.trim();
    const employeeId = document.getElementById('employeeId').value.trim();
    const employeeName = document.getElementById('employeeName').value.trim();
    const employeeDept = document.getElementById('employeeDept').value;
    
    if (tenantId && employeeId && employeeName) {
        const session = { tenantId, employeeId, employeeName, employeeDept };
        localStorage.setItem('b2b_session', JSON.stringify(session));
        
        // Seed initial history if empty to make it look premium immediately
        const history = JSON.parse(localStorage.getItem('b2b_hrv_history') || '[]');
        if (history.length === 0) {
            const mockDates = ["7/25 09:12", "7/26 08:45", "7/27 09:02", "7/28 08:50", "7/29 09:15"];
            const mockHrv = [36, 42, 28, 48, 52];
            const mockHr = [72, 70, 78, 68, 65];
            const mockStress = ["通常", "通常", "高", "通常", "良好"];
            const seeded = mockDates.map((d, i) => ({
                date: d,
                hrv: mockHrv[i],
                hr: mockHr[i],
                stress: mockStress[i]
            }));
            localStorage.setItem('b2b_hrv_history', JSON.stringify(seeded));
        }
        
        checkB2BSession();
    }
};

window.handleB2BLogout = function() {
    localStorage.removeItem('b2b_session');
    checkB2BSession();
};

// 2. Personal HRV Trend Chart rendering
function renderHrvTrendChart() {
    const chartContainer = document.getElementById('hrvChart');
    if (!chartContainer) return;
    
    const history = JSON.parse(localStorage.getItem('b2b_hrv_history') || '[]');
    
    if (history.length === 0) {
        chartContainer.innerHTML = `
            <div class="empty-chart-state">
                自律神経の測定データがありません。<br>カメラ起動ボタンからスキャンを開始しましょう！
            </div>
        `;
        return;
    }
    
    chartContainer.innerHTML = '';
    
    // Determine max HRV for scaling (capped at 100)
    const maxVal = Math.max(...history.map(h => h.hrv), 60);
    const containerHeight = 130; // max px height for bars
    
    history.forEach(item => {
        const ptHeight = Math.round((item.hrv / maxVal) * containerHeight);
        
        // Color coding: Good (green/teal), Warning (red/orange)
        let barColor = 'linear-gradient(to top, var(--accent-blue), var(--accent-teal))';
        if (item.hrv < 30) {
            barColor = 'linear-gradient(to top, #d32f2f, var(--accent-red))';
        } else if (item.hrv >= 50) {
            barColor = 'linear-gradient(to top, var(--accent-teal), var(--accent-green))';
        }
        
        const pointHtml = `
            <div class="trend-point">
                <div class="trend-bar" data-val="${item.hrv} ms (HR:${item.hr})" style="height:${ptHeight}px; background:${barColor};"></div>
                <div class="trend-date">${item.date}</div>
            </div>
        `;
        chartContainer.insertAdjacentHTML('beforeend', pointHtml);
    });
}

// 3. Tab Management
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            const stressFeed = document.getElementById('stress-feed');
            const postureFeed = document.getElementById('posture-feed');
            
            if (targetTab === 'stress') {
                stressFeed.style.display = 'block';
                postureFeed.style.display = 'none';
            } else {
                stressFeed.style.display = 'none';
                postureFeed.style.display = 'block';
            }
        });
    });
}

// 4. Load B2B filtered articles from articles_db.json
function loadB2BArticles() {
    const stressGrid = document.getElementById('stress-grid');
    const postureGrid = document.getElementById('posture-grid');
    
    if (!stressGrid || !postureGrid) return;
    
    fetch('articles_db.json')
        .then(res => res.json())
        .then(db => {
            const currentDay = db.current_day || 'day1';
            
            let allArticles = [];
            
            // Gather all articles published up to currentDay
            const dayKeys = Object.keys(db).filter(k => k.startsWith('day') || k === 'baseline');
            
            // Sort day keys to maintain chronological ordering
            const sortedDays = dayKeys.sort((a, b) => {
                if (a === 'baseline') return -1;
                if (b === 'baseline') return 1;
                const na = parseInt(a.replace('day', ''));
                const nb = parseInt(b.replace('day', ''));
                return na - nb;
            });
            
            // Collect matching articles within currentDay window
            const maxDayNum = currentDay === 'baseline' ? 0 : parseInt(currentDay.replace('day', ''));
            
            sortedDays.forEach(day => {
                const dayNum = day === 'baseline' ? 0 : parseInt(day.replace('day', ''));
                if (dayNum <= maxDayNum) {
                    const categories = db[day];
                    Object.keys(categories).forEach(cat => {
                        allArticles = allArticles.concat(categories[cat]);
                    });
                }
            });
            
            // Filter articles for B2B Wellness Categories
            const stressArticles = allArticles.filter(art => {
                const text = (art.title + art.description + art.tag).toLowerCase();
                const keywords = ['自律神経', 'ストレス', '睡眠', '心拍', '疲労', '脈波', 'hrv', '心臓', '呼吸'];
                return keywords.some(k => text.includes(k)) && !text.includes('メイク') && !text.includes('化粧');
            });
            
            const postureArticles = allArticles.filter(art => {
                const text = (art.title + art.description + art.tag).toLowerCase();
                const keywords = ['アライメント', '姿勢', '首', '肩', '背中', '骨格', '咬筋', '関節', '歩行', '歩き方', '運動', '筋力', '腰'];
                return keywords.some(k => text.includes(k)) && !text.includes('メイク') && !text.includes('アイシャドウ');
            });
            
            renderGrid(stressGrid, stressArticles);
            renderGrid(postureGrid, postureArticles);
        })
        .catch(err => {
            console.error("Failed to load B2B articles:", err);
            stressGrid.innerHTML = '<div style="color:var(--accent-red)">コラムデータをロードできませんでした。</div>';
            postureGrid.innerHTML = '<div style="color:var(--accent-red)">コラムデータをロードできませんでした。</div>';
        });
}

function renderGrid(container, articles) {
    if (articles.length === 0) {
        container.innerHTML = '<div class="empty-state" style="color:var(--text-secondary); padding:30px; text-align:center;">該当する推奨ケアコラムはありません。</div>';
        return;
    }
    
    // Remove duplicates by title
    const uniqueArticles = [];
    const seenTitles = new Set();
    articles.forEach(art => {
        if (!seenTitles.has(art.title)) {
            seenTitles.add(art.title);
            uniqueArticles.push(art);
        }
    });
    
    container.innerHTML = '';
    
    uniqueArticles.forEach(art => {
        const itemHtml = `
            <div class="glass-card feed-item" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span class="category-badge" style="background:rgba(100,255,218,0.08); border:1px solid rgba(100,255,218,0.15); color:var(--accent-teal); font-size:10px; padding:2px 6px; border-radius:4px;">${art.tag || '健康コラム'}</span>
                        <span style="font-size:10px; color:var(--text-secondary);">${art.author || '✍️ 医療顧問監修'}</span>
                    </div>
                    <div class="item-title" style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:6px; line-height:1.4;">${art.title}</div>
                    <div class="item-desc" style="font-size:11px; color:var(--text-secondary); line-height:1.5;">${art.description}</div>
                </div>
                
                ${art.external_link ? `
                    <a href="${art.external_link}" target="_blank" style="text-decoration:none; font-size:11px; color:var(--accent-blue); font-weight:700; display:inline-flex; align-items:center; gap:4px; margin-top:5px;">
                        📖 エビデンス論文を開く ➔
                    </a>
                ` : ''}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}
