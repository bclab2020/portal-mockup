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
    applyCustomHUDCoordinates();
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
            
            if (seconds >= 40) {
                clearInterval(breathingTimer);
                breathingActive = false;
                balloon.style.width = '30px';
                balloon.style.height = '30px';
                balloon.style.transition = 'all 0.5s ease';
                balloon.style.boxShadow = breathingType === "478" ? '0 0 15px var(--accent-red)' : '0 0 15px var(--accent-teal)';
                txt.innerHTML = `<span style="color:var(--accent-teal); font-weight:800;">🏆 深呼吸セッション完了！ 自律神経が整いました。</span>`;
                btn.innerText = "もう一度行う";
                btn.style.borderColor = "var(--accent-teal)";
                btn.style.color = "var(--accent-teal)";
                btn.style.background = "rgba(100,255,218,0.06)";
                return;
            }
            seconds++;
        };
        
        runCycle();
        breathingTimer = setInterval(runCycle, 1000);
    }
};


function applyCustomHUDCoordinates() {
    const keys = ['twist', 'shoulder', 'neck', 'chest', 'wrist', 'hamstring', 'catcow', 'shrug'];
    keys.forEach(key => {
        const stored = localStorage.getItem(`hud_${key}`);
        if (!stored) return;
        try {
            const config = JSON.parse(stored);
            const ex = symptomExercises[key];
            if (!ex) return;
            
            const svgId = ex.svgId;
            if (!svgId) return;
            
            const pathSelector = `path[marker-end="url(#${svgId})"], path[marker-end="url(#portal-${svgId})"]`;
            const paths = document.querySelectorAll(pathSelector);
            paths.forEach(path => {
                path.setAttribute('d', `M ${config.sx} ${config.sy} Q ${config.cx} ${config.cy} ${config.ex} ${config.ey}`);
                const circle = path.parentNode.querySelector('circle');
                if (circle) {
                    circle.setAttribute('cx', config.sx);
                    circle.setAttribute('cy', config.sy);
                }
                const texts = path.parentNode.querySelectorAll('text');
                
                // Load offsets if saved, else use defaults
                const sxo = config.sxo !== undefined ? config.sxo : -30;
                const syo = config.syo !== undefined ? config.syo : 10;
                const exo = config.exo !== undefined ? config.exo : 10;
                const eyo = config.eyo !== undefined ? config.eyo : -5;

                if (texts[0]) {
                    texts[0].setAttribute('x', config.sx + sxo);
                    texts[0].setAttribute('y', config.sy + syo);
                    if (config.startLabel) texts[0].textContent = config.startLabel;
                }
                if (texts[1]) {
                    texts[1].setAttribute('x', config.ex + exo);
                    texts[1].setAttribute('y', config.ey + eyo);
                    if (config.endLabel) texts[1].textContent = config.endLabel;
                }
            });
        } catch (e) {
            console.error("Failed to apply custom HUD coordinate override:", key, e);
        }
    });
}


const symptomExercises = {
    twist: {
        title: "🧘 30秒・椅子ひねりストレッチ（自律神経・腰痛ケア）",
        desc: "<strong>【姿勢・方向】</strong>背筋をまっすぐ伸ばして椅子に深く腰掛け、上体を右へねじります。左手で背もたれを掴み、右手は椅子の座面後方を支えて固定します。<br><strong>【秒数】</strong>痛気持ちいいところでキープし、<strong>左右それぞれ15秒間（計30秒）</strong>行います。<br><strong>【呼吸法】</strong>ねじりながら息をゆっくり吐き出します。",
        img: "stretch_twist_jp.jpg?v=1.0.1",
        color: "#ff5252",
        svgId: "arrow-red",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-red" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#ff5252"/>
                </marker>
            </defs>
            <path d="M 200 120 Q 150 135 112 112" fill="none" stroke="#ff5252" stroke-width="2.5" marker-start="url(#portal-arrow-red)" marker-end="url(#portal-arrow-red)" stroke-dasharray="4 2"/>
            <circle cx="200" cy="120" r="4.5" fill="#ff5252" stroke="#050c1c" stroke-width="1.5"/>
            <text x="185" y="138" fill="#ff5252" font-size="10" font-weight="700" font-family="monospace">START (正面)</text>
            <text x="88" y="102" fill="#ff5252" font-size="10" font-weight="700" font-family="monospace">END (ねじる)</text>
        </svg>`
    },
    shoulder: {
        title: "🧘 肩・肩甲骨拡張ストレッチ（肩こり解消）",
        desc: "<strong>【姿勢・方向】</strong>右腕を左方向に真っ直ぐ伸ばし、左腕で右肘を抱え込むように胸に強く引き寄せます。肩甲骨が外側にしっかりと広がる感覚を意識します。<br><strong>【秒数】</strong>肩の奥が伸びる位置で、<strong>左右それぞれ15秒間（計30秒）</strong>キープします。<br><strong>【呼吸法】</strong>深く穏やかな胸式呼吸を繰り返します。",
        img: "stretch_shoulder_jp.jpg?v=1.0.1",
        color: "#00bfff",
        svgId: "arrow-blue",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-blue" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#00bfff"/>
                </marker>
            </defs>
            <path d="M 100 80 Q 157 80 214 80" fill="none" stroke="#00bfff" stroke-width="2.5" marker-start="url(#portal-arrow-blue)" marker-end="url(#portal-arrow-blue)" stroke-dasharray="4 2"/>
            <circle cx="100" cy="80" r="4.5" fill="#00bfff" stroke="#050c1c" stroke-width="1.5"/>
            <text x="80" y="76" fill="#00bfff" font-size="10" font-weight="700" font-family="monospace">START (胸元)</text>
            <text x="224" y="76" fill="#00bfff" font-size="10" font-weight="700" font-family="monospace">END (指先を伸ばす)</text>
        </svg>`
    },
    neck: {
        title: "🧘 首・肩・頚椎アライメントストレッチ（首こり・頭痛）",
        desc: "<strong>【姿勢・方向】</strong>背筋を伸ばし、右手を頭の左側に添え、頭をゆっくり右斜め前（45度方向）に傾けます。左肩が上がらないよう、意識して固定します。<br><strong>【秒数】</strong>首の左後ろが伸びる強さで、<strong>左右それぞれ15秒間（計30秒）</strong>キープします。<br><strong>【呼吸法】</strong>息を細く長く吐き出しながら、じんわりと伸ばします。",
        img: "stretch_neck_jp.jpg?v=1.0.1",
        color: "#64ffda",
        svgId: "arrow-teal",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-teal" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#64ffda"/>
                </marker>
            </defs>
            <path d="M 120 45 Q 140 52 148 76" fill="none" stroke="#64ffda" stroke-width="2.5" marker-start="url(#portal-arrow-teal)" marker-end="url(#portal-arrow-teal)" stroke-dasharray="4 2"/>
            <circle cx="120" cy="45" r="4.5" fill="#64ffda" stroke="#050c1c" stroke-width="1.5"/>
            <text x="98" y="40" fill="#64ffda" font-size="10" font-weight="700" font-family="monospace">START (正面)</text>
            <text x="158" y="72" fill="#64ffda" font-size="10" font-weight="700" font-family="monospace">END (傾けてキープ)</text>
        </svg>`
    },
    chest: {
        title: "🧘 大胸筋チェストオープナー（巻き肩・猫背リセット）",
        desc: "<strong>【姿勢・方向】</strong>頭の後ろで両手を組み、息を吸いながら肘を大きく後ろに引きます。胸を天井に向けてしっかりと開きます。<br><strong>【秒数】</strong>胸の前の筋肉が心地よく広がる位置で、<strong>15秒間キープを2回</strong>行います。<br><strong>【呼吸法】</strong>胸いっぱいに息を吸い込み、吐きながらさらに深く開きます。",
        img: "stretch_chest_jp.jpg?v=1.0.1",
        color: "#ff44dd",
        svgId: "arrow-pink",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-pink" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#ff44dd"/>
                </marker>
            </defs>
            <path d="M 125 50 Q 165 60 205 50" fill="none" stroke="#ff44dd" stroke-width="2.5" marker-start="url(#portal-arrow-pink)" marker-end="url(#portal-arrow-pink)" stroke-dasharray="4 2"/>
            <circle cx="125" cy="50" r="4.5" fill="#ff44dd" stroke="#050c1c" stroke-width="1.5"/>
            <text x="110" y="42" fill="#ff44dd" font-size="10" font-weight="700" font-family="monospace">START (組む)</text>
            <text x="210" y="42" fill="#ff44dd" font-size="10" font-weight="700" font-family="monospace">END (開く)</text>
        </svg>`
    },
    wrist: {
        title: "🧘 手首・前腕ストレッチ（タイピング疲労軽減）",
        desc: "<strong>【姿勢・方向】</strong>腕を前に真っ直ぐ伸ばし、手のひらを前に向けます。反対の手で指先を手前に引き、前腕の内側を伸ばします。<br><strong>【秒数】</strong>手首から前腕が伸びる位置で、<strong>左右それぞれ15秒間</strong>キープします。<br><strong>【呼吸法】</strong>息を止めずに、リラックスして細く長い呼吸を続けます。",
        img: "stretch_wrist_jp.jpg?v=1.0.1",
        color: "#ffaa00",
        svgId: "arrow-orange",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-orange" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#ffaa00"/>
                </marker>
            </defs>
            <path d="M 110 90 Q 160 90 210 90" fill="none" stroke="#ffaa00" stroke-width="2.5" marker-start="url(#portal-arrow-orange)" marker-end="url(#portal-arrow-orange)" stroke-dasharray="4 2"/>
            <circle cx="110" cy="90" r="4.5" fill="#ffaa00" stroke="#050c1c" stroke-width="1.5"/>
            <text x="90" y="85" fill="#ffaa00" font-size="10" font-weight="700" font-family="monospace">START (手首)</text>
            <text x="215" y="85" fill="#ffaa00" font-size="10" font-weight="700" font-family="monospace">END (引く)</text>
        </svg>`
    },
    hamstring: {
        title: "🧘 ハムストリングス伸ばし（足のむくみ・腰痛解消）",
        desc: "<strong>【姿勢・方向】</strong>片方の足を前に伸ばしてかかとを床につけます。背すじを伸ばしたまま、上体をゆっくり前に倒して太ももの裏を伸ばします。<br><strong>【秒数】</strong>もも裏が伸びる位置で、<strong>左右それぞれ15秒間（計30秒）</strong>キープします。<br><strong>【呼吸法】</strong>息を吐きながら上体を倒すと、効果的にストレッチできます。",
        img: "stretch_hamstring_jp.jpg?v=1.0.1",
        color: "#00e5ff",
        svgId: "arrow-cyan",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-cyan" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#00e5ff"/>
                </marker>
            </defs>
            <path d="M 100 150 Q 150 170 200 190" fill="none" stroke="#00e5ff" stroke-width="2.5" marker-start="url(#portal-arrow-cyan)" marker-end="url(#portal-arrow-cyan)" stroke-dasharray="4 2"/>
            <circle cx="100" cy="150" r="4.5" fill="#00e5ff" stroke="#050c1c" stroke-width="1.5"/>
            <text x="78" y="145" fill="#00e5ff" font-size="10" font-weight="700" font-family="monospace">START (股関節)</text>
            <text x="205" y="185" fill="#00e5ff" font-size="10" font-weight="700" font-family="monospace">END (伸ばす)</text>
        </svg>`
    },
    catcow: {
        title: "🧘 キャット＆カウ（背骨・背中の柔軟性向上）",
        desc: "<strong>【姿勢・方向】</strong>椅子に座ったまま両手で膝を掴みます。息を吐きながら背中を丸め、おへそを覗き込みます。次に息を吸いながら胸を前に押し出し、背骨を反らせます。<br><strong>【秒数】</strong>丸める・反らすを交互に<strong>各5秒間、3回往復（計30秒）</strong>行います。<br><strong>【呼吸法】</strong>呼吸と動作を深く連動させます。",
        img: "stretch_catcow_jp.jpg?v=1.0.1",
        color: "#76ff03",
        svgId: "arrow-lime",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-lime" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#76ff03"/>
                </marker>
            </defs>
            <path d="M 165 50 Q 140 95 165 140" fill="none" stroke="#76ff03" stroke-width="2.5" marker-start="url(#portal-arrow-lime)" marker-end="url(#portal-arrow-lime)" stroke-dasharray="4 2"/>
            <circle cx="165" cy="50" r="4.5" fill="#76ff03" stroke="#050c1c" stroke-width="1.5"/>
            <text x="175" y="55" fill="#76ff03" font-size="10" font-weight="700" font-family="monospace">START (背中上)</text>
            <text x="175" y="145" fill="#76ff03" font-size="10" font-weight="700" font-family="monospace">END (骨盤後傾)</text>
        </svg>`
    },
    shrug: {
        title: "🧘 肩すくめ＆脱力リフレッシュ（肩・首まわりのコリ解消）",
        desc: "<strong>【姿勢・方向】</strong>背筋を伸ばし、両肩を耳に近づけるように限界まで高く引き上げ、首回りにギュッと力を入れます。その後、一キーに肩の力を抜いてストンと落とします。<br><strong>【秒数】</strong>力を入れる(5秒)→抜く(10秒)を<strong>2〜3回反復</strong>します。<br><strong>【呼吸法】</strong>肩を上げる時に吸い、落とす時に一気に「はぁー」と吐き出します。",
        img: "stretch_shrug_jp.jpg?v=1.0.2",
        color: "#ffeb3b",
        svgId: "arrow-yellow",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-yellow" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#ffeb3b"/>
                </marker>
            </defs>
            <path d="M 165 100 Q 165 75 165 50" fill="none" stroke="#portal-arrow-yellow" stroke-width="2.5" marker-start="url(#portal-arrow-yellow)" marker-end="url(#portal-arrow-yellow)" stroke-dasharray="4 2"/>
            <circle cx="165" cy="100" r="4.5" fill="#ffeb3b" stroke="#050c1c" stroke-width="1.5"/>
            <text x="175" y="105" fill="#ffeb3b" font-size="10" font-weight="700" font-family="monospace">START (脱力)</text>
            <text x="175" y="55" fill="#ffeb3b" font-size="10" font-weight="700" font-family="monospace">END (すくめる)</text>
        </svg>`
    },
    eyes: {
        title: "🧘 眼球ストレッチ＆遠近ピント調整（眼精疲労軽減）",
        desc: "<strong>【姿勢・方向】</strong>顔を正面に向けたまま、目を大きく開けて眼球を上下左右,円を描くようにぐるぐると回します。その後、近くの指先と遠くの景色を交互に見つめます。<br><strong>【秒数】</strong>眼球ローリング左右各3周、遠近ピント調整を<strong>15秒間（計30秒）</strong>行います。<br><strong>【呼吸法】</strong>呼吸を止めずに穏やかに繰り返します。",
        img: "stretch_eyes_jp.jpg?v=1.0.1",
        color: "#e040fb",
        svgId: "arrow-magenta",
        defaultSVG: `<svg viewBox="0 0 330 220" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;">
            <defs>
                <marker id="portal-arrow-magenta" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#e040fb"/>
                </marker>
            </defs>
            <path d="M 150 75 Q 165 55 180 75" fill="none" stroke="#portal-arrow-magenta" stroke-width="2.5" marker-start="url(#portal-arrow-magenta)" marker-end="url(#portal-arrow-magenta)" stroke-dasharray="4 2"/>
            <circle cx="150" cy="75" r="4.5" fill="#e040fb" stroke="#050c1c" stroke-width="1.5"/>
            <text x="120" y="70" fill="#e040fb" font-size="10" font-weight="700" font-family="monospace">START (遠く)</text>
            <text x="185" y="70" fill="#e040fb" font-size="10" font-weight="700" font-family="monospace">END (閉じる)</text>
        </svg>`
    }
};

function switchSymptom(key) {
    const activeExerciseCard = document.getElementById('activeExerciseCard');
    if (!activeExerciseCard) return;
    
    // Stop any running eye game session when switching tabs
    if (typeof resetEyeTrackingSession === 'function') {
        resetEyeTrackingSession();
    }

    document.querySelectorAll('.symptom-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `btn-symptom-${key}`) {
            btn.classList.add('active');
        }
    });

    const ex = symptomExercises[key];
    if (!ex) return;

    activeExerciseCard.style.opacity = 0;
    
    setTimeout(() => {
        const isEyeGame = (key === 'eyes');
        let rightColumnHtml = '';
        
        if (isEyeGame) {
            rightColumnHtml = `
                <div class="eye-tracker-game-container" style="position:relative; width:100%; height:100%; min-height:220px; background:#050c1c; display:flex; flex-direction:column; align-items:center; justify-content:center; box-sizing:border-box; padding:10px;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(100,255,218,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(100,255,218,0.04) 1px, transparent 1px); background-size:15px 15px; pointer-events:none; z-index:1;"></div>
                    <div id="eyeTargetBall" style="position:absolute; top:50%; left:50%; width:16px; height:16px; margin-left:-8px; margin-top:-8px; border-radius:50%; background:radial-gradient(circle, #64ffda 0%, rgba(100,255,218,0.6) 60%, transparent 100%); box-shadow: 0 0 15px #64ffda; z-index:5; transform: translate(0, 0); transition: transform 0.05s linear, width 0.2s, height 0.2s, margin-left 0.2s, margin-top 0.2s; display:none;"></div>
                    
                    <div id="eyeGameStatus" style="z-index:2; text-align:center; padding:10px;">
                        <div style="font-size:13px; font-weight:800; color:var(--accent-teal); margin-bottom:8px;">👀 眼筋ストレッチ・ガイド</div>
                        <div style="font-size:10px; color:var(--text-secondary); max-width:240px; line-height:1.5; margin-bottom:12px;">
                            画面中央からスタートするグリーンの光を、頭を動かさずに目だけで追ってください。
                        </div>
                        <button id="startEyeGameBtn" onclick="startEyeTrackingSession()" style="padding:6px 20px; font-size:11px; font-weight:700; color:#050c1c; background:var(--accent-teal); border:none; border-radius:20px; cursor:pointer; box-shadow: 0 0 10px rgba(100,255,218,0.3); transition:all 0.2s; font-family:inherit;">
                            ▶ セッションを開始する
                        </button>
                    </div>
                    
                    <div id="eyeGameInstruct" style="position:absolute; top:12px; left:12px; right:12px; z-index:2; font-size:10px; font-weight:700; color:var(--text-primary); background:rgba(5,12,28,0.85); border:1px solid rgba(100,255,218,0.2); padding:6px 10px; border-radius:6px; text-align:center; display:none;">
                        準備中...
                    </div>
                    
                    <div id="eyeGameTimer" style="position:absolute; bottom:12px; right:12px; z-index:2; font-size:10px; font-weight:700; font-family:monospace; color:var(--accent-teal); background:rgba(5,12,28,0.8); padding:3px 6px; border-radius:4px; border:1px solid rgba(100,255,218,0.15); display:none;">
                        30.0s
                    </div>
                    
                    <div id="eyeGameDone" style="z-index:2; text-align:center; display:none; padding:10px;">
                        <div style="font-size:24px; margin-bottom:8px;">🎉</div>
                        <div style="font-size:12px; font-weight:700; color:var(--accent-teal); margin-bottom:6px;">眼筋リフレッシュ完了！</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-bottom:12px;">目の周りのピント調整筋の緊張がほぐれました。</div>
                        <button onclick="resetEyeTrackingSession()" style="padding:4px 15px; font-size:10px; font-weight:700; color:var(--text-secondary); background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:15px; cursor:pointer; font-family:inherit;">
                            もう一度行う
                        </button>
                    </div>
                </div>
            `;
        } else {
            rightColumnHtml = `
                <img src="${ex.img}" style="width:100%; height:100%; object-fit:cover; display:block;">
                ${ex.defaultSVG}
            `;
        }

        activeExerciseCard.innerHTML = `
            <div style="font-size:12px; font-weight:700; color:${ex.color}; margin-bottom:8px;">${ex.title}</div>
            <div class="exercise-flex-layout" style="display:flex; gap:15px; align-items:stretch; margin-top:8px;">
                <div style="flex:1; font-size:11px; color:var(--text-secondary); line-height:1.6; background:${ex.color}05; border:1px solid ${ex.color}15; padding:12px; border-radius:8px; display:flex; flex-direction:column; justify-content:center;">
                    ${ex.desc}
                </div>
                <div style="flex:1; position:relative; border-radius:8px; overflow:hidden; border:1px solid ${ex.color}; box-shadow: 0 0 15px ${ex.color}40; min-height:220px;">
                    ${rightColumnHtml}
                </div>
            </div>
        `;
        activeExerciseCard.style.opacity = 1;
        if (!isEyeGame) {
            applyCustomHUDCoordinates();
        }
    }, 150);
}


// Inject symptom tabs stylesheet dynamically
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .symptom-tab-btn {
            padding: 6px 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            color: var(--text-secondary);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
        }
        .symptom-tab-btn:hover {
            background: rgba(255,255,255,0.08);
            color: var(--text-primary);
            border-color: rgba(255,255,255,0.15);
        }
        .symptom-tab-btn.active {
            background: linear-gradient(45deg, rgba(100,255,218,0.15), rgba(0,191,255,0.15));
            color: var(--accent-teal);
            border-color: var(--accent-teal);
            box-shadow: 0 0 10px rgba(100,255,218,0.15);
        }
    `;
    document.head.appendChild(style);
})();


// ----------------------------------------------------
// Eye Tracking Game Gamification Engine for Portal
// ----------------------------------------------------
let eyeGameActive = false;
let eyeGameTimerId = null;
let eyeGameStartTime = 0;
let eyeGameDuration = 40000;

function startEyeTrackingSession() {
    if (eyeGameActive) return;
    eyeGameActive = true;
    
    const statusDiv = document.getElementById('eyeGameStatus');
    const instructDiv = document.getElementById('eyeGameInstruct');
    const timerDiv = document.getElementById('eyeGameTimer');
    const ball = document.getElementById('eyeTargetBall');
    const doneDiv = document.getElementById('eyeGameDone');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (doneDiv) doneDiv.style.display = 'none';
    if (instructDiv) instructDiv.style.display = 'block';
    if (timerDiv) timerDiv.style.display = 'block';
    if (ball) ball.style.display = 'block';
    
    eyeGameStartTime = performance.now();
    
    function drawFrame(now) {
        if (!eyeGameActive) return;
        const elapsed = now - eyeGameStartTime;
        const pct = elapsed / eyeGameDuration;
        
        if (pct >= 1.0) {
            endEyeTrackingSession();
            return;
        }
        
        if (timerDiv) {
            timerDiv.textContent = ((eyeGameDuration - elapsed) / 1000).toFixed(1) + 's';
        }
        
        let x = 0;
        let y = 0;
        let scale = 1.0;
        let instruct = "";
        
        const phase = Math.floor(pct * 4);
        if (phase === 0) {
            const subPct = (pct * 4) % 1.0;
            y = Math.sin(subPct * Math.PI * 2) * 60;
            instruct = "【上下ストレッチ】頭を動かさず、緑の光を上下に追ってください";
        } else if (phase === 1) {
            const subPct = (pct * 4) % 1.0;
            x = Math.sin(subPct * Math.PI * 2) * 90;
            instruct = "【左右ストレッチ】ボールの左右の水平な動きを目だけで追います";
        } else if (phase === 2) {
            const subPct = (pct * 4) % 1.0;
            const angle = subPct * Math.PI * 2;
            x = Math.cos(angle) * 80;
            y = Math.sin(angle) * 50;
            instruct = "【眼球円ローリング】大きく滑らかに円を描くように目を回します";
        } else {
            const subPct = (pct * 4) % 1.0;
            scale = 1.0 + Math.sin(subPct * Math.PI * 3) * 0.7;
            const angle = subPct * Math.PI * 2;
            x = Math.sin(angle * 2) * 30;
            instruct = "【遠近フォーカス】ボールのサイズ（遠近）変化に合わせてピントを合わせます";
        }
        
        if (instructDiv) instructDiv.innerHTML = `🧘 ${instruct}`;
        if (ball) {
            ball.style.transform = `translate(${x}px, ${y}px)`;
            const baseSize = 16;
            const currentSize = Math.max(8, baseSize * scale);
            ball.style.width = `${currentSize}px`;
            ball.style.height = `${currentSize}px`;
            ball.style.marginLeft = `-${currentSize/2}px`;
            ball.style.marginTop = `-${currentSize/2}px`;
        }
        
        eyeGameTimerId = requestAnimationFrame(drawFrame);
    }
    
    eyeGameTimerId = requestAnimationFrame(drawFrame);
}

function endEyeTrackingSession() {
    eyeGameActive = false;
    cancelAnimationFrame(eyeGameTimerId);
    
    const instructDiv = document.getElementById('eyeGameInstruct');
    const timerDiv = document.getElementById('eyeGameTimer');
    const ball = document.getElementById('eyeTargetBall');
    const doneDiv = document.getElementById('eyeGameDone');
    
    if (instructDiv) instructDiv.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'none';
    if (ball) ball.style.display = 'none';
    if (doneDiv) doneDiv.style.display = 'block';
}

function resetEyeTrackingSession() {
    eyeGameActive = false;
    cancelAnimationFrame(eyeGameTimerId);
    
    const statusDiv = document.getElementById('eyeGameStatus');
    const instructDiv = document.getElementById('eyeGameInstruct');
    const timerDiv = document.getElementById('eyeGameTimer');
    const ball = document.getElementById('eyeTargetBall');
    const doneDiv = document.getElementById('eyeGameDone');
    
    if (statusDiv) statusDiv.style.display = 'block';
    if (instructDiv) instructDiv.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'none';
    if (ball) ball.style.display = 'none';
    if (doneDiv) doneDiv.style.display = 'none';
}
