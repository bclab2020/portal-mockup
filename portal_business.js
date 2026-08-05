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
        renderLatestHrvRemedies();
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
            <div class="empty-chart-state" style="color:var(--text-secondary); text-align:center; padding:30px; font-size:12px;">
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
            <div class="trend-point" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; position:relative;">
                <div class="trend-bar" data-val="${item.hrv} ms (HR:${item.hr})" style="height:${ptHeight}px; background:${barColor}; width:15px; border-radius:3px; cursor:pointer;" title="HRV: ${item.hrv}ms, Stress: ${item.stress}"></div>
                <div class="trend-date" style="font-size:8px; color:var(--text-secondary); margin-top:5px;">${item.date.split(' ')[0]}</div>
            </div>
        `;
        chartContainer.insertAdjacentHTML('beforeend', pointHtml);
    });
}

// 2.5 Render Latest HRV Status & Desk Remedies on Dashboard
function renderLatestHrvRemedies() {
    const remedyContainer = document.getElementById('remedyCardContainer');
    if (!remedyContainer) return;
    
    const history = JSON.parse(localStorage.getItem('b2b_hrv_history') || '[]');
    if (history.length === 0) {
        remedyContainer.innerHTML = `
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
                本日の自律神経測定データがまだありません。カメラ起動ボタンから30秒間のストレススキャンを実行してください。
            </div>
        `;
        return;
    }
    
    const latest = history[history.length - 1];
    
    let badgeColor = 'var(--accent-teal)';
    let remedyText = '';
    let statusText = latest.stress || '通常';
    
    if (statusText === '良好' || latest.hrv >= 50) {
        badgeColor = 'var(--accent-teal)';
        remedyText = `
            <span style="color:var(--accent-teal); font-weight:700;">🧘 良好なコンディションです</span><br>
            自律神経バランスは非常に良好に安定しています。この状態をキープするため、PC作業中は以下のデスクケアを行ってください：
            <ul style="padding-left:15px; margin:8px 0 0 0; display:flex; flex-direction:column; gap:4px; font-size:11px;">
                <li>👀 <strong>10秒まばたき眼筋ストレッチ</strong> (目を閉じたまま上下左右に眼球を動かします)</li>
                <li>👂 <strong>耳介マッサージ</strong> (両耳をつまんで上下左右に引っ張り、血流を促します)</li>
            </ul>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.5; margin-top:10px; background:rgba(100,255,218,0.02); border:1px solid rgba(100,255,218,0.08); padding:8px; border-radius:6px;">
                <strong>【姿勢・方向】</strong>背筋を伸ばし、右手を頭の左側に添え、頭をゆっくり右斜め前（45度方向）に傾けます。左肩が上がらないよう、意識して固定します。<br>
                <strong>【秒数】</strong>首の左後ろが心地よく伸びる強さで、<strong>左右それぞれ15秒間（計30秒）</strong>キープします。<br>
                <strong>【呼吸法】</strong>息を細く長く吐き出しながら、頭の重みを利用してじんわりとストレッチします。
            </div>
            <div style='position:relative; margin-top:8px; border-radius:8px; overflow:hidden; border:1px solid var(--accent-teal); box-shadow: 0 0 12px rgba(100, 255, 218, 0.2);'>
                <img src='stretch_neck_jp.jpg' style='width:100%; display:block;'>
                <div style='position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(100,255,218,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(100,255,218,0.06) 1px, transparent 1px); background-size:15px 15px; pointer-events:none;'></div>
                <div style='position:absolute; top:10px; right:10px; background:rgba(100,255,218,0.85); color:#050c1c; font-size:8px; font-weight:700; padding:2px 6px; border-radius:4px; font-family:monospace; border:1px solid var(--accent-teal);'>ALIGNMENT: OK</div>
                <!-- Holographic Overlay SVG -->
                <svg style='position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;'>
                    <defs>
                        <marker id='portal-arrow-teal' markerWidth='6' markerHeight='6' refX='3' refY='3' orient='auto'>
                            <path d='M0,0 L6,3 L0,6 Z' fill='#64ffda'/>
                        </marker>
                    </defs>
                    <path d='M 120 45 Q 140 52 148 76' fill='none' stroke='#64ffda' stroke-width='2.5' marker-end='url(#portal-arrow-teal)' stroke-dasharray='4 2'/>
                    <circle cx="120" cy="45" r="4.5" fill="#64ffda" stroke="#050c1c" stroke-width="1.5"/>
                    <text x="80" y="42" fill="#64ffda" font-size="8.5" font-weight="700" font-family="sans-serif">START (正面)</text>
                    <text x="155" y="85" fill="#64ffda" font-size="8.5" font-weight="700" font-family="sans-serif">END (傾けてキープ)</text>
                </svg>
                <div style='position:absolute; bottom:10px; left:10px; background:rgba(5,12,28,0.8); border:1px solid var(--accent-teal); padding:2px 5px; border-radius:4px; font-size:8px; color:var(--accent-teal); font-family:monospace;'>LEFT SHOULDER: LOCK DOWN</div>
            </div>
        `;
    } else if (statusText === '高' || latest.hrv < 30) {
        badgeColor = 'var(--accent-red)';
        remedyText = `
            <span style="color:var(--accent-red); font-weight:700;">⚠️ 自律神経ストレス過多の兆候</span><br>
            HRV数値が低下しており、交感神経が優位な緊張状態です。デスクで即座にできる以下のリセットケアを行ってください：
            <ul style="padding-left:15px; margin:8px 0 0 0; display:flex; flex-direction:column; gap:4px; font-size:11px;">
                <li>🧘 <strong>30秒・椅子ひねりストレッチ</strong> (背もたれを持って上体をゆっくりねじり、背骨の緊張をほぐします)</li>
                <li>👃 <strong>4-7-8 呼吸リフレッシュ</strong> (4秒吸って7秒止め、8秒かけて細く長く吐き出します)</li>
            </ul>
            <!-- Breathing Balloon Widget -->
            <div class="breathing-widget-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; margin-top:10px; background:rgba(255,82,82,0.02); border:1px dashed rgba(255,82,82,0.15); border-radius:8px; text-align:center;">
                <div style="font-size:9px; color:var(--accent-red); font-weight:700; margin-bottom:10px; letter-spacing:0.5px;">🧘 呼吸ガイド（バルーンの伸縮と同調してください）</div>
                <div style="width:100px; height:100px; display:flex; align-items:center; justify-content:center; position:relative;">
                    <div id="breathingBalloon" style="width:30px; height:30px; border-radius:50%; background:radial-gradient(circle, var(--accent-red) 0%, rgba(255,82,82,0.4) 70%, transparent 100%); box-shadow: 0 0 20px var(--accent-red); transition: all 1.5s ease-in-out;"></div>
                    <div style="position:absolute; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow: 0 0 8px #fff;"></div>
                </div>
                <div id="breathingText" style="font-size:10px; font-weight:700; color:var(--text-primary); margin-top:10px; height:15px; letter-spacing:0.5px;">準備中...</div>
                <button id="breathingControlBtn" onclick="toggleBreathingGuide()" style="margin-top: 10px; padding: 4px 15px; font-size: 10px; font-weight: 700; border-radius: 20px; border: 1px solid var(--accent-teal); color: var(--accent-teal); background: rgba(100,255,218,0.06); cursor: pointer; transition: all 0.2s; width:100%;">▶ ガイドを開始する</button>
                <button id="breathingControlBtn" onclick="toggleBreathingGuide()" style="margin-top: 10px; padding: 4px 15px; font-size: 10px; font-weight: 700; border-radius: 20px; border: 1px solid var(--accent-teal); color: var(--accent-teal); background: rgba(100,255,218,0.06); cursor: pointer; transition: all 0.2s; width:100%;">▶ ガイドを開始する</button>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.5; margin-top:10px; background:rgba(255,82,82,0.02); border:1px solid rgba(255,82,82,0.08); padding:8px; border-radius:6px;">
                <strong>【姿勢・方向】</strong>背筋を伸ばし椅子に深く座り、息を吐きながら上体を右へゆっくりねじります。左手で背もたれを掴み、右手は椅子の座面後方を支えます。<br>
                <strong>【秒数】</strong>痛気持ちいいところでキープし、<strong>左右それぞれ15秒間（計30秒）</strong>行います。<br>
                <strong>【呼吸法】</strong><strong>吸う4秒・吐く8秒</strong>の腹式呼吸をゆっくり繰り返します。
            </div>
            <div style='position:relative; margin-top:8px; border-radius:8px; overflow:hidden; border:1px solid var(--accent-red); box-shadow: 0 0 12px rgba(255, 82, 82, 0.2);'>
                <img src='stretch_twist_jp.jpg' style='width:100%; display:block;'>
                <div style='position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(255,82,82,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,82,82,0.06) 1px, transparent 1px); background-size:15px 15px; pointer-events:none;'></div>
                <div style='position:absolute; top:10px; right:10px; background:rgba(255,82,82,0.85); color:#fff; font-size:8px; font-weight:700; padding:2px 6px; border-radius:4px; font-family:monospace; border:1px solid var(--accent-red);'>ALIGNMENT: OK</div>
                <!-- Holographic Overlay SVG -->
                <svg style='position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;'>
                    <defs>
                        <marker id='portal-arrow-red' markerWidth='6' markerHeight='6' refX='3' refY='3' orient='auto'>
                            <path d='M0,0 L6,3 L0,6 Z' fill='#ff5252'/>
                        </marker>
                    </defs>
                    <path d='M 200 120 Q 150 135 112 112' fill='none' stroke='#ff5252' stroke-width='2.5' marker-end='url(#portal-arrow-red)' stroke-dasharray='4 2'/>
                    <circle cx="200" cy="120" r="4.5" fill="#ff5252" stroke="#050c1c" stroke-width="1.5"/>
                    <text x="185" y="138" fill="#ff5252" font-size="8.5" font-weight="700" font-family="sans-serif">START (正面)</text>
                    <text x="70" y="98" fill="#ff5252" font-size="8.5" font-weight="700" font-family="sans-serif">END (ねじる)</text>
                </svg>
                <div style='position:absolute; bottom:10px; left:10px; background:rgba(5,12,28,0.8); border:1px solid var(--accent-red); padding:2px 5px; border-radius:4px; font-size:8px; color:var(--accent-red); font-family:monospace;'>SPINE ROTATION: 35°</div>
            </div>
        `;
    } else {
        badgeColor = 'var(--accent-orange)';
        remedyText = `
            <span style="color:var(--accent-orange); font-weight:700;">🚶 平均的な自律神経バランスです</span><br>
            ストレスレベルは標準範囲内ですが、PC作業の連続により疲労が蓄積しやすくなっています。以下のリフレッシュを行ってください：
            <ul style="padding-left:15px; margin:8px 0 0 0; display:flex; flex-direction:column; gap:4px; font-size:11px;">
                <li>肩こり <strong>肩甲骨引き寄せロール</strong> (両肩をすくめてストンと落とし、肘を曲げて後ろに引きます)</li>
                <li>👀 <strong>遠近ピント合わせ法</strong> (近くの指先と3m先の壁を交互に3秒ずつ見つめ、眼筋をほぐします)</li>
            </ul>
            <!-- Breathing Balloon Widget -->
            <div class="breathing-widget-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; margin-top:10px; background:rgba(100,255,218,0.02); border:1px dashed rgba(100,255,218,0.15); border-radius:8px; text-align:center;">
                <div style="font-size:9px; color:var(--accent-teal); font-weight:700; margin-bottom:10px; letter-spacing:0.5px;">🧘 呼吸ガイド（バルーンの伸縮と同調してください）</div>
                <div style="width:100px; height:100px; display:flex; align-items:center; justify-content:center; position:relative;">
                    <div id="breathingBalloon" style="width:30px; height:30px; border-radius:50%; background:radial-gradient(circle, var(--accent-teal) 0%, rgba(100,255,218,0.4) 70%, transparent 100%); box-shadow: 0 0 20px var(--accent-teal); transition: all 1.5s ease-in-out;"></div>
                    <div style="position:absolute; width:12px; height:12px; border-radius:50%; background:#fff; box-shadow: 0 0 8px #fff;"></div>
                </div>
                <div id="breathingText" style="font-size:10px; font-weight:700; color:var(--text-primary); margin-top:10px; height:15px; letter-spacing:0.5px;">準備中...</div>
                <button id="breathingControlBtn" onclick="toggleBreathingGuide()" style="margin-top: 10px; padding: 4px 15px; font-size: 10px; font-weight: 700; border-radius: 20px; border: 1px solid var(--accent-teal); color: var(--accent-teal); background: rgba(100,255,218,0.06); cursor: pointer; transition: all 0.2s; width:100%;">▶ ガイドを開始する</button>
                <button id="breathingControlBtn" onclick="toggleBreathingGuide()" style="margin-top: 10px; padding: 4px 15px; font-size: 10px; font-weight: 700; border-radius: 20px; border: 1px solid var(--accent-teal); color: var(--accent-teal); background: rgba(100,255,218,0.06); cursor: pointer; transition: all 0.2s; width:100%;">▶ ガイドを開始する</button>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.5; margin-top:10px; background:rgba(0,191,255,0.02); border:1px solid rgba(0,191,255,0.08); padding:8px; border-radius:6px;">
                <strong>【姿勢・方向】</strong>右腕を左方向に真っ直ぐ伸ばし、左腕で右肘を抱え込むように胸に引き寄せます。肩甲骨が外側に広がるのを意識します。<br>
                <strong>【秒数】</strong>肩の奥が心地よく伸びる位置で、<strong>左右それぞれ15秒間（計30秒）</strong>キープします。<br>
                <strong>【呼吸法】</strong>肩をすくめず、深く穏やかな呼吸を繰り返します。
            </div>
            <div style='position:relative; margin-top:8px; border-radius:8px; overflow:hidden; border:1px solid var(--accent-blue); box-shadow: 0 0 12px rgba(0, 191, 255, 0.2);'>
                <img src='stretch_shoulder_jp.jpg' style='width:100%; display:block;'>
                <div style='position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(0,191,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.06) 1px, transparent 1px); background-size:15px 15px; pointer-events:none;'></div>
                <div style='position:absolute; top:10px; right:10px; background:rgba(0,191,255,0.85); color:#fff; font-size:8px; font-weight:700; padding:2px 6px; border-radius:4px; font-family:monospace; border:1px solid var(--accent-blue);'>ALIGNMENT: OK</div>
                <!-- Holographic Overlay SVG -->
                <svg style='position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;'>
                    <defs>
                        <marker id='portal-arrow-blue' markerWidth='6' markerHeight='6' refX='3' refY='3' orient='auto'>
                            <path d='M0,0 L6,3 L0,6 Z' fill='#00bfff'/>
                        </marker>
                    </defs>
                    <path d='M 100 80 L 214 80' fill='none' stroke='#00bfff' stroke-width='2.5' marker-end='url(#portal-arrow-blue)' stroke-dasharray='4 2'/>
                    <circle cx="100" cy="80" r="4.5" fill="#00bfff" stroke="#050c1c" stroke-width="1.5"/>
                    <text x="75" y="92" fill="#00bfff" font-size="8.5" font-weight="700" font-family="sans-serif">START (胸元)</text>
                    <text x="200" y="70" fill="#00bfff" font-size="8.5" font-weight="700" font-family="sans-serif">END (指先を伸ばす)</text>
                </svg>
                <div style='position:absolute; bottom:10px; left:10px; background:rgba(5,12,28,0.8); border:1px solid var(--accent-blue); padding:2px 5px; border-radius:4px; font-size:8px; color:var(--accent-blue); font-family:monospace;'>SCAPULA RETRACTION: ENGAGED</div>
            </div>
        `;
    }
    
    remedyContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">
            <div style="font-size:11px; color:var(--text-secondary);">${latest.date} 測定</div>
            <div style="font-size:11px; font-weight:700; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:3px 8px; border-radius:12px; color:var(--text-primary);">
                HRV: <span style="color:${badgeColor}; font-weight:700;">${latest.hrv} ms</span> | 心拍: <span>${latest.hr} bpm</span>
            </div>
        </div>
        <div style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            ${remedyText}
        </div>
    `;
    
    // Initialize breathing guide animation in sidebar if balloon element exists
    if (document.getElementById('breathingBalloon')) {
        initBreathingGuide(statusText === '高' || latest.hrv < 30 ? "478" : "36");
    }
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
                        if (cat === 'health') {
                            allArticles = allArticles.concat(categories[cat]);
                        }
                    });
                }
            });
            
            // Filter articles for B2B Wellness Categories
            const stressArticles = allArticles.filter(art => {
                const text = (art.title + (art.p || '') + (art.tag || '')).toLowerCase();
                const keywords = ['自律神経', 'ストレス', '睡眠', '心拍', '疲労', '脈波', 'hrv', '心臓', '呼吸'];
                return keywords.some(k => text.includes(k)) && !text.includes('メイク') && !text.includes('化粧');
            });
            
            const postureArticles = allArticles.filter(art => {
                const text = (art.title + (art.p || '') + (art.tag || '')).toLowerCase();
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
                    <div class="item-desc" style="font-size:11px; color:var(--text-secondary); line-height:1.5;">${art.p || ''}</div>
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


// 5. Shared Breathing Balloon Animation Loop for B2B portal sidebar
let breathingTimer = null;
let breathingActive = false;
let breathingType = "36";

function initBreathingGuide(type) {
    breathingType = type;
    breathingActive = false;
    if (breathingTimer) clearInterval(breathingTimer);
    
    const balloon = document.getElementById('breathingBalloon');
    const txt = document.getElementById('breathingText');
    const btn = document.getElementById('breathingControlBtn');
    if (!balloon || !txt) return;
    
    balloon.style.width = '30px';
    balloon.style.height = '30px';
    balloon.style.transition = 'all 0.5s ease';
    balloon.style.background = type === "478" ? 'radial-gradient(circle, var(--accent-red) 0%, rgba(255,82,82,0.4) 70%, transparent 100%)' : 'radial-gradient(circle, var(--accent-teal) 0%, rgba(100,255,218,0.4) 70%, transparent 100%)';
    balloon.style.boxShadow = type === "478" ? '0 0 15px var(--accent-red)' : '0 0 15px var(--accent-teal)';
    txt.innerHTML = `<span style="color:var(--text-secondary);">一時停止中</span>`;
    
    if (btn) {
        btn.innerText = "▶ ガイドを開始する";
        btn.style.borderColor = type === "478" ? "var(--accent-red)" : "var(--accent-teal)";
        btn.style.color = type === "478" ? "var(--accent-red)" : "var(--accent-teal)";
        btn.style.background = type === "478" ? "rgba(255,82,82,0.06)" : "rgba(100,255,218,0.06)";
    }
}

window.toggleBreathingGuide = function() {
    const btn = document.getElementById('breathingControlBtn');
    const txt = document.getElementById('breathingText');
    const balloon = document.getElementById('breathingBalloon');
    if (!btn || !txt || !balloon) return;
    
    breathingActive = !breathingActive;
    
    if (!breathingActive) {
        if (breathingTimer) clearInterval(breathingTimer);
        balloon.style.width = '30px';
        balloon.style.height = '30px';
        balloon.style.transition = 'all 0.5s ease';
        balloon.style.boxShadow = breathingType === "478" ? '0 0 15px var(--accent-red)' : '0 0 15px var(--accent-teal)';
        txt.innerHTML = `<span style="color:var(--text-secondary);">一時停止中</span>`;
        btn.innerText = "▶ ガイドを開始する";
        btn.style.borderColor = breathingType === "478" ? "var(--accent-red)" : "var(--accent-teal)";
        btn.style.color = breathingType === "478" ? "var(--accent-red)" : "var(--accent-teal)";
        btn.style.background = breathingType === "478" ? "rgba(255,82,82,0.06)" : "rgba(100,255,218,0.06)";
    } else {
        btn.innerText = "⏸ ガイドを一時停止";
        btn.style.borderColor = "var(--text-primary)";
        btn.style.color = "var(--text-primary)";
        btn.style.background = "rgba(255,255,255,0.08)";
        
        let seconds = 0;
        const runCycle = () => {
            if (!document.getElementById('breathingBalloon')) {
                clearInterval(breathingTimer);
                return;
            }
            
            if (breathingType === "478") {
                const subSec = seconds % 19;
                if (subSec < 4) {
                    balloon.style.width = '90px';
                    balloon.style.height = '90px';
                    balloon.style.transition = 'all 4s ease-in-out';
                    balloon.style.background = 'radial-gradient(circle, var(--accent-red) 0%, rgba(255,82,82,0.4) 70%, transparent 100%)';
                    balloon.style.boxShadow = '0 0 20px var(--accent-red)';
                    txt.innerHTML = `<span style="color:#ff5252; font-weight:700;">吸い込む (Inhale)... ${4 - subSec}秒</span>`;
                } else if (subSec < 11) {
                    balloon.style.width = '90px';
                    balloon.style.height = '90px';
                    balloon.style.transition = 'all 0.5s ease';
                    balloon.style.boxShadow = subSec % 2 === 0 ? '0 0 35px #ff5252' : '0 0 20px #ff5252';
                    txt.innerHTML = `<span style="color:#ff9100; font-weight:700;">止める (Hold)... ${11 - subSec}秒</span>`;
                } else {
                    balloon.style.width = '30px';
                    balloon.style.height = '30px';
                    balloon.style.transition = 'all 8s ease-in-out';
                    balloon.style.background = 'radial-gradient(circle, var(--accent-teal) 0%, rgba(100,255,218,0.4) 70%, transparent 100%)';
                    balloon.style.boxShadow = '0 0 20px var(--accent-teal)';
                    txt.innerHTML = `<span style="color:#64ffda; font-weight:700;">ゆっくり吐く (Exhale)... ${19 - subSec}秒</span>`;
                }
            } else {
                const subSec = seconds % 9;
                if (subSec < 3) {
                    balloon.style.width = '90px';
                    balloon.style.height = '90px';
                    balloon.style.transition = 'all 3s ease-in-out';
                    balloon.style.background = 'radial-gradient(circle, var(--accent-teal) 0%, rgba(100,255,218,0.4) 70%, transparent 100%)';
                    balloon.style.boxShadow = '0 0 20px var(--accent-teal)';
                    txt.innerHTML = `<span style="color:#64ffda; font-weight:700;">吸い込む (Inhale)... ${3 - subSec}秒</span>`;
                } else {
                    balloon.style.width = '30px';
                    balloon.style.height = '30px';
                    balloon.style.transition = 'all 6s ease-in-out';
                    balloon.style.background = 'radial-gradient(circle, var(--accent-blue) 0%, rgba(0,191,255,0.4) 70%, transparent 100%)';
                    balloon.style.boxShadow = '0 0 20px var(--accent-blue)';
                    txt.innerHTML = `<span style="color:#00bfff; font-weight:700;">ゆっくり吐く (Exhale)... ${9 - subSec}秒</span>`;
                }
            }
            seconds++;
        };
        
        runCycle();
        breathingTimer = setInterval(runCycle, 1000);
    }
};
