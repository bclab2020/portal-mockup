// CORE CONNECT Portal Controller
document.addEventListener('DOMContentLoaded', () => {
    // Initial Tabs Navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    const iframe = document.getElementById('measurementIframe');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled-btn')) return;
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });

    function switchTab(tabId) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        panels.forEach(p => p.classList.toggle('active', p.id === `${tabId}Panel`));
        
        // Handle iframe focus/trigger
        if (tabId === 'lab') {
            iframe.contentWindow.focus();
        }
    }

    // Expose switchTab to global window for click event handlers
    window.switchTab = switchTab;

    // Deep link and trigger mode in embedded app
    window.launchMeasurement = function(mode) {
        switchTab('lab');
        // Reload iframe with query parameters to trigger camera and mode
        iframe.src = `./mock_app.html?mode=${mode}&autoStart=true`;
    };

    // ==========================================================================
    // Mock Community Data & Rendering
    // ==========================================================================
    let communityPosts = [
        {
            id: 1,
            author: "佐藤 健二",
            avatar: "健",
            role: "アスリート",
            time: "30分前",
            content: "最近オーバーヘッドスクワット時の体幹前傾角度が深くなってしまう（43°）のが悩みです。大腿四頭筋の硬さでしょうか？どなたか改善トレーニングを教えてください！",
            sharedMetric: {
                modeName: "🏋️ OHS (側面動作)",
                metrics: [
                    { name: "体幹前傾角", val: "43.2°", status: "warn", statusText: "傾き大" },
                    { name: "膝屈曲角度", val: "102.5°", status: "good", statusText: "良好" },
                    { name: "上腕挙上角", val: "148.0°", status: "warn", statusText: "制限あり" }
                ],
                swayArea: null
            },
            likes: 12,
            liked: false,
            replies: [
                {
                    author: "佐藤 翼 (トレーナー)",
                    avatar: "翼",
                    role: "専門家メンター",
                    isExpert: true,
                    time: "15分前",
                    content: "佐藤さん、こんにちは！体幹が43°倒れているのは、股関節（特に臀筋群）の硬さと、ふくらはぎの硬さ（足関節の背屈制限）が主な原因です。スクワット前に『アンクルストレッチ』と、壁にお尻をつけて行う『ヒップヒンジの練習』を15回×3セット行うと、上半身を立てやすくなりますよ！お試しください。"
                }
            ]
        },
        {
            id: 2,
            author: "高橋 凛",
            avatar: "凛",
            role: "市民ランナー",
            time: "2時間前",
            content: "1ヶ月間、毎日プランクとスクワットを続けたら、左右の荷重バランスが大幅に改善しました！以前は左足にかなり偏っていたのですが、ほぼ50/50のニュートラルアライメントになりました 😆",
            sharedMetric: {
                modeName: "🧍 静止姿勢・前面アライメント",
                metrics: [
                    { name: "全身荷重比率", val: "左 49.5% / 右 50.5%", status: "good", statusText: "ニュートラル" },
                    { name: "アシンメトリー偏位", val: "1.0%", status: "good", statusText: "極めて良好" }
                ],
                swayArea: null
            },
            likes: 24,
            liked: true,
            replies: []
        }
    ];

    const timelineContainer = document.getElementById('timelineContainer');
    
    function renderTimeline() {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';
        
        communityPosts.forEach(post => {
            let sharedMetricHtml = '';
            if (post.sharedMetric) {
                let rowsHtml = '';
                post.sharedMetric.metrics.forEach(m => {
                    rowsHtml += `
                        <div class="shared-metric-row">
                            <span>${m.name}</span>
                            <span class="val ${m.status}">${m.val} (${m.statusText})</span>
                        </div>
                    `;
                });

                let radarHtml = '';
                if (post.sharedMetric.swayArea) {
                    radarHtml = `
                        <div class="shared-radar-preview">
                            <canvas id="postCanvasRadar_${post.id}" width="110" height="110"></canvas>
                        </div>
                    `;
                }

                sharedMetricHtml = `
                    <div class="post-shared-metric">
                        <div class="shared-metric-info">
                            <div class="shared-metric-title">📊 測定共有: ${post.sharedMetric.modeName}</div>
                            ${rowsHtml}
                        </div>
                        ${radarHtml}
                    </div>
                `;
            }

            let repliesHtml = '';
            if (post.replies && post.replies.length > 0) {
                let replyItemsHtml = '';
                post.replies.forEach(reply => {
                    replyItemsHtml += `
                        <div class="reply-card">
                            <div class="post-header" style="margin-bottom:8px;">
                                <div class="post-user">
                                    <div class="composer-avatar" style="width:30px; height:30px; font-size:11px; background:linear-gradient(45deg, var(--accent-orange), #ff5722);">${reply.avatar}</div>
                                    <div>
                                        <span class="post-username" style="font-size:12px;">${reply.author}</span>
                                        <span class="post-userrole mentor">${reply.role}</span>
                                    </div>
                                </div>
                                <span class="post-time">${reply.time}</span>
                            </div>
                            <div class="post-body" style="font-size:12px; line-height:1.5; margin-bottom:0;">${reply.content}</div>
                        </div>
                    `;
                });
                repliesHtml = `<div class="post-replies">${replyItemsHtml}</div>`;
            }

            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="post-header">
                    <div class="post-user">
                        <div class="composer-avatar">${post.avatar}</div>
                        <div>
                            <span class="post-username">${post.author}</span>
                            <span class="post-userrole">${post.role}</span>
                        </div>
                    </div>
                    <span class="post-time">${post.time}</span>
                </div>
                <div class="post-body">${post.content}</div>
                ${sharedMetricHtml}
                <div class="post-footer">
                    <button class="post-action ${post.liked ? 'liked' : ''}" onclick="window.likePost(${post.id})">
                        ❤️ <span>${post.likes}</span> いいね
                    </button>
                    <button class="post-action" onclick="window.focusReply(${post.id})">
                        💬 <span>${post.replies.length}</span> コメント
                    </button>
                </div>
                ${repliesHtml}
            `;
            timelineContainer.appendChild(postCard);

            // Draw mini-radar canvas mockup if swayArea exists
            if (post.sharedMetric && post.sharedMetric.swayArea) {
                setTimeout(() => {
                    const canvas = document.getElementById(`postCanvasRadar_${post.id}`);
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        drawMiniRadar(ctx, post.sharedMetric.swayArea);
                    }
                }, 50);
            }
        });
    }

    // Mini-radar simulation rendering
    function drawMiniRadar(ctx, areaVal) {
        const w = 110, h = 110;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        [15, 30, 45].forEach(r => {
            ctx.beginPath(); ctx.arc(w/2, h/2, r, 0, 2*Math.PI); ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.stroke();

        // Draw 95% Confidence Ellipse
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.strokeStyle = areaVal > 1500 ? '#ff5252' : '#39ff14';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = areaVal > 1500 ? 'rgba(255,82,82,0.08)' : 'rgba(57,255,20,0.08)';
        ctx.beginPath();
        // size mapped relative to area
        const rX = Math.sqrt(areaVal) * 0.7;
        const rY = rX * 0.6;
        ctx.ellipse(2, -3, rX, rY, 0.3, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // Handle liking
    window.likePost = function(postId) {
        const post = communityPosts.find(p => p.id === postId);
        if (post) {
            if (post.liked) {
                post.likes--;
                post.liked = false;
            } else {
                post.likes++;
                post.liked = true;
            }
            renderTimeline();
        }
    };

    window.focusReply = function(postId) {
        switchTab('community');
        document.getElementById('postInput').focus();
        document.getElementById('postInput').placeholder = `@コメントID ${postId} への返信を記入してください...`;
        document.getElementById('postInput').dataset.replyTo = postId;
    };

    renderTimeline();

    // Post Composer Submission logic
    const postSubmitBtn = document.getElementById('postSubmitBtn');
    const postInput = document.getElementById('postInput');
    const attachSessionBtn = document.getElementById('attachSessionBtn');
    let attachedSession = null;

    postSubmitBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        if (!text) {
            alert("投稿メッセージを入力してください。");
            return;
        }

        const replyTo = postInput.dataset.replyTo;
        if (replyTo) {
            // Reply posting
            const targetPost = communityPosts.find(p => p.id === parseInt(replyTo));
            if (targetPost) {
                targetPost.replies.push({
                    author: "ゲストユーザー",
                    avatar: "ゲ",
                    role: "アスリート",
                    time: "1秒前",
                    content: text
                });
            }
            postInput.dataset.replyTo = "";
            postInput.placeholder = "測定結果の感想や悩みを共有しよう！最新の測定結果をグラフ添付して投稿することも可能です...";
        } else {
            // Main feed posting
            let sharedMetric = null;
            if (attachedSession) {
                sharedMetric = formatAttachedMetric(attachedSession);
            }

            const newPost = {
                id: Date.now(),
                author: "ゲストユーザー",
                avatar: "ゲ",
                role: "アスリート",
                time: "1秒前",
                content: text,
                sharedMetric: sharedMetric,
                likes: 0,
                liked: false,
                replies: []
            };

            communityPosts.unshift(newPost);
            
            // Trigger automatic simulated expert review after 3 seconds!
            const textLower = text.toLowerCase();
            const triggerAutoReply = true;
            if (triggerAutoReply) {
                setTimeout(() => {
                    newPost.replies.push({
                        author: "田中 誠 (理学療法士)",
                        avatar: "誠",
                        role: "専門家メンター",
                        time: "たった今",
                        content: `ご投稿ありがとうございます！測定結果を拝見しました。${newPost.sharedMetric ? 'アライメントの崩れに対するセルフエクササイズとして、当ポータルの「ストレッチ動画セッション」の受講が有効です。希望があれば45分の個別指導予約も枠が空いていますよ！' : 'アライメント測定も行なっていただくと、よりパーソナライズされた関節可動域トレーニング法を処方できます。'}`
                    });
                    renderTimeline();
                }, 3000);
            }
        }

        // Reset composer
        postInput.value = '';
        attachedSession = null;
        attachSessionBtn.classList.remove('attached');
        attachSessionBtn.innerHTML = `📊 最新の測定データを添付する`;
        renderTimeline();
    });

    // Helper to format attached IndexedDB metrics into community layout
    function formatAttachedMetric(session) {
        const modeNames = {
            'front': '🧍 前面アライメント', 'back': '🧍 後面アライメント',
            'l_side': '🧍 左側面アライメント', 'r_side': '🧍 右側面アライメント',
            'dyn_overhead': '🏋️ OHS (前面動作)', 'dyn_overhead_side': '🏋️ OHS (側面動作)'
        };

        const metricsList = [];
        if (session.metrics.weightBearing) {
            metricsList.push({
                name: "全身荷重比率",
                val: `左 ${session.metrics.weightBearing.total.L.toFixed(1)}% / 右 ${session.metrics.weightBearing.total.R.toFixed(1)}%`,
                status: Math.abs(session.metrics.weightBearing.total.L - 50) > 5 ? "warn" : "good",
                statusText: Math.abs(session.metrics.weightBearing.total.L - 50) > 5 ? "偏位あり" : "ニュートラル"
            });
        }
        if (session.metrics.pelvicTilt !== undefined) {
            const tilt = session.metrics.pelvicTilt;
            metricsList.push({
                name: "骨盤傾斜角",
                val: `${tilt > 0 ? '+' : ''}${tilt}°`,
                status: (tilt > 8 || tilt < -5) ? "warn" : "good",
                statusText: (tilt > 8) ? "前傾大" : (tilt < -5 ? "後傾大" : "正常値")
            });
        }
        if (session.metrics.swayMetrics) {
            metricsList.push({
                name: "動揺面積",
                val: `${session.metrics.swayMetrics.swayArea.toFixed(1)} px²`,
                status: session.metrics.swayMetrics.swayArea > 1500 ? "warn" : "good",
                statusText: session.metrics.swayMetrics.swayArea > 1500 ? "ブレ大" : "安定"
            });
        }

        return {
            modeName: modeNames[session.mode] || session.mode,
            metrics: metricsList,
            swayArea: session.metrics.swayMetrics ? session.metrics.swayMetrics.swayArea : null
        };
    }

    // ==========================================================================
    // Dynamic Ad Engine & Iframe Event Messaging
    // ==========================================================================
    const dynamicAdSpace = document.getElementById('dynamicAdSpace');
    const adHeadline = document.querySelector('.ad-headline');

    // Handle messages coming from the embedded app inside the iframe
    window.addEventListener('message', (event) => {
        // Safe origin checks can be skipped for local sandbox prototype
        if (event.data && event.data.type === 'MEASUREMENT_COMPLETE') {
            console.log("Measurement complete event received in portal:", event.data);
            const session = event.data.session;
            const metrics = event.data.metrics;
            
            // Link session for community attachment
            attachedSession = {
                mode: session.mode,
                metrics: metrics
            };
            attachSessionBtn.classList.add('attached');
            attachSessionBtn.innerHTML = `✅ 測定データを添付済 (共有できます)`;

            // Update Dynamic Ads
            updateDynamicAds(metrics);
        }
    });

    // Handle Attach last session manually if it exists in DB
    attachSessionBtn.addEventListener('click', async () => {
        if (attachedSession) {
            // Already attached, clicking again detaches it
            attachedSession = null;
            attachSessionBtn.classList.remove('attached');
            attachSessionBtn.innerHTML = `📊 最新の測定データを添付する`;
            return;
        }

        // Try to fetch latest session from IndexedDB
        try {
            // Opening IndexedDB DBManager directly in portal window scope
            const dbRequest = indexedDB.open("ConnectAIDB", 1);
            dbRequest.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("sessions")) {
                    alert("測定データが見つかりません。まず測定ラボで測定を行なってください。");
                    return;
                }
                const tx = db.transaction(["sessions"], "readonly");
                const store = tx.objectStore("sessions");
                const getReq = store.getAll();
                getReq.onsuccess = () => {
                    const results = getReq.result || [];
                    if (results.length === 0) {
                        alert("保存された測定データがありません。測定ラボでカメラ測定を完了してください。");
                        return;
                    }
                    results.sort((a,b) => b.timestamp - a.timestamp);
                    const latest = results[0];
                    
                    // Simple mock conversion of metrics
                    // Using API manager logic directly
                    const mockMetrics = extractMockMetrics(latest);
                    
                    attachedSession = {
                        mode: latest.mode,
                        metrics: mockMetrics
                    };
                    attachSessionBtn.classList.add('attached');
                    attachSessionBtn.innerHTML = `✅ 最新データ（${latest.patientName}様）を添付済`;
                    
                    updateDynamicAds(mockMetrics);
                };
            };
        } catch (err) {
            console.error("IndexedDB load error in portal:", err);
            alert("測定データの読み込みに失敗しました。");
        }
    });

    function extractMockMetrics(session) {
        // Quick local extraction if apiManager not accessible in this scope
        const lastFrame = session.poseData[session.poseData.length - 1];
        const kps = lastFrame.keypoints;
        const result = {
            mode: session.mode,
            pelvicTilt: session.pelvicTilt || 0,
            weightBearing: null,
            swayMetrics: null
        };

        const lAnkle = kps.find(k=>k.name==='left_ankle'||k.name==='27'||k.name===27);
        const rAnkle = kps.find(k=>k.name==='right_ankle'||k.name==='28'||k.name===28);
        const nose = kps.find(k=>k.name==='nose'||k.name==='0'||k.name===0);
        const lSh = kps.find(k=>k.name==='left_shoulder'||k.name==='11'||k.name===11);
        const rSh = kps.find(k=>k.name==='right_shoulder'||k.name==='12'||k.name===12);
        const lHip = kps.find(k=>k.name==='left_hip'||k.name==='23'||k.name===23);
        const rHip = kps.find(k=>k.name==='right_hip'||k.name==='24'||k.name===24);

        if (lAnkle && rAnkle && lAnkle.score > 0.2 && rAnkle.score > 0.2) {
            const dPx = rAnkle.x - lAnkle.x;
            if (Math.abs(dPx) > 5) {
                const upperComX = (nose.x * 0.2) + (((lSh.x + rSh.x)/2) * 0.8);
                const lowerComX = (lHip.x + rHip.x)/2;
                const totalComX = (upperComX * 0.6) + (lowerComX * 0.4);
                
                const ratioR = ((totalComX - lAnkle.x) / dPx) * 100;
                result.weightBearing = {
                    total: { L: 100 - ratioR, R: ratioR }
                };
            }
        }

        // Sway metrics mock
        if (session.poseData.length > 5) {
            let totalArea = 900;
            if (session.mode.startsWith('dyn_single')) totalArea = 2400; // single balance sways more
            if (result.weightBearing && Math.abs(result.weightBearing.total.L - 50) > 8) totalArea = 1850;
            result.swayMetrics = { swayArea: totalArea };
        }

        return result;
    }

    function updateDynamicAds(metrics) {
        const container = document.getElementById('adWidgetContainer');
        if (!container) return;

        // Reset classes
        container.className = 'dynamic-ad-container';
        adHeadline.classList.add('matched');
        adHeadline.innerHTML = `<span></span> 診断データ連動・マッチング広告`;

        let adHtml = '';
        let isMatched = false;

        const tilt = metrics.pelvicTilt;
        const totalWBL = metrics.weightBearing ? metrics.weightBearing.total.L : 50;
        const wDiff = Math.abs(totalWBL - 50) * 2; // L/R difference percentage
        const swayArea = metrics.swayMetrics ? metrics.swayMetrics.swayArea : 0;

        // Ad Match Rules
        if (tilt > 8 || tilt < -5) {
            // Pelvic tilt / Back Pain products
            container.classList.add('matching-tilt');
            isMatched = true;
            adHtml = `
                <div class="ad-matched-box">
                    <span class="matched-pill tilt">骨盤歪み検出連動 (${tilt > 0 ? '前傾' : '後傾'} ${Math.abs(tilt)}°)</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1588286840104-8957b029727f?auto=format&fit=crop&q=80&w=400');"></div>
                    <div class="ad-title">StyleKeep 骨盤サポート高反発クッション</div>
                    <div class="ad-desc">骨盤前傾・反り腰アライメントによる腰部圧迫負担を座るだけで軽減。大腿四頭筋ストレッチ記事と合わせてご使用がお勧めです。</div>
                    <div class="ad-product-price">
                        <span class="orig">¥6,800</span>
                        <span class="promo">¥5,440 (20% OFF)</span>
                    </div>
                    <button class="ad-btn" onclick="alert('CORE CONNECT限定：クッションの購入割引ページへ移行します！')">特別コードを適用して購入</button>
                </div>
            `;
        } else if (wDiff > 6.0) {
            // Weight distribution asymmetric insoles
            container.classList.add('matching-sway');
            isMatched = true;
            adHtml = `
                <div class="ad-matched-box">
                    <span class="matched-pill sway">左右荷重差連動 (左右差 ${wDiff.toFixed(1)}%)</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400');"></div>
                    <div class="ad-title">OrthoFit バイオメカニクス・カスタムインソール</div>
                    <div class="ad-desc">荷重中心の左側偏位を物理的にサポート。足底アライメントを均等に整え、ランニング時の足首や膝蓋骨蓋の代償ストレスを軽減。</div>
                    <div class="ad-product-price">
                        <span class="orig">¥12,000</span>
                        <span class="promo">¥9,600 (20% OFF)</span>
                    </div>
                    <button class="ad-btn" onclick="alert('CORE CONNECT限定：カスタムインソール注文ページへ移行します！')">測定データを送信してカスタム発注</button>
                </div>
            `;
        } else if (swayArea > 1500) {
            // Balance Wobble board for high sways
            container.classList.add('matching-sway');
            isMatched = true;
            adHtml = `
                <div class="ad-matched-box">
                    <span class="matched-pill sway">重心動揺エリア連動 (${swayArea.toFixed(0)} px²)</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400');"></div>
                    <div class="ad-title">ProBalance 木製バランスボード</div>
                    <div class="ad-desc">足底圧中心（COP）の動揺幅が大きい方に最適。足関節の固有受容器とコア深層筋（インナーマッスル）を効果的に刺激し、体幹支持力を高めます。</div>
                    <div class="ad-product-price">
                        <span class="orig">¥4,500</span>
                        <span class="promo">¥3,820 (15% OFF)</span>
                    </div>
                    <button class="ad-btn" onclick="alert('CORE CONNECT限定：バランスボード割引ページへ移行します！')">15%OFFクーポン付きで購入</button>
                </div>
            `;
        } else {
            // General Sponsor ad (or Neutral Posture fit)
            adHtml = `
                <div class="ad-matched-box">
                    <span class="matched-pill" style="border-color:var(--accent-teal); color:var(--accent-teal);">アライメント良好マッチ</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=400');"></div>
                    <div class="ad-title">CORECONNECT アスリート・リカバリープロテイン</div>
                    <div class="ad-desc">良好なアライメントと筋肉回復を維持するために。人工甘味料不使用、WPI100%配合の高純度プロテイン。</div>
                    <div class="ad-product-price">
                        <span>¥4,800 (税込)</span>
                    </div>
                    <button class="ad-btn" style="background:var(--accent-teal); color:#000;" onclick="alert('公式ストア商品ページに移行します！')">商品詳細をチェック</button>
                </div>
            `;
        }

        dynamicAdSpace.innerHTML = adHtml;
    }
});
