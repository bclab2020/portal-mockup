// CORE CONNECT Portal Controller
document.addEventListener('DOMContentLoaded', () => {
    // Initial Tabs Navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    const iframe = document.getElementById('measurementIframe');
    
    let isPremiumUser = false;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled-btn')) return;
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });

    let currentVertical = 'sports';

    function switchTab(tabId) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
        panels.forEach(p => p.classList.toggle('active', p.id === `${tabId}Panel`));
        
        // Update theme class and logo badge based on the selected vertical portal
        if (tabId === 'sports' || tabId === 'health' || tabId === 'beauty') {
            currentVertical = tabId;
            document.body.className = `theme-${currentVertical}`;
            
            const badge = document.getElementById('portalLogoBadge');
            if (badge) {
                const names = {
                    sports: 'Sports Portal',
                    health: 'Health Check',
                    beauty: 'Beauty Portal'
                };
                badge.innerText = names[currentVertical];
            }
            // Update sidebar ads to match the active vertical context
            updateLabSidebarAds(currentVertical);
        }

        // Handle iframe focus/trigger
        if (tabId === 'lab') {
            iframe.contentWindow.focus();
            updateLabSidebarAds(currentVertical);
            
            // Sync theme in the embedded iframe
            const isLight = (currentVertical === 'health' || currentVertical === 'beauty');
            const currentSrc = iframe.src || '';
            if (isLight && !currentSrc.includes('theme=light')) {
                iframe.src = `./mock_app.html?theme=light`;
            } else if (!isLight && currentSrc.includes('theme=light')) {
                iframe.src = `./mock_app.html`;
            }
        }
    }

    // Expose switchTab to global window for click event handlers
    window.switchTab = switchTab;

    // Deep link and trigger mode in embedded app
    window.launchMeasurement = function(mode) {
        switchTab('lab');
        const isLight = (currentVertical === 'health' || currentVertical === 'beauty');
        const themeParam = isLight ? '&theme=light' : '';
        // Reload iframe with query parameters to trigger camera and mode
        iframe.src = `./mock_app.html?mode=${mode}&autoStart=true${themeParam}`;
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
                    role: isPremiumUser ? "👑 PREMIUM" : "アスリート",
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
                role: isPremiumUser ? "👑 PREMIUM" : "アスリート",
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

    let currentMetricsText = '';

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

            // Populate & Show Posture Report Card & SNS buttons
            showPostureReportCard(metrics);
        }
    });

    function showPostureReportCard(metrics) {
        const reportCard = document.getElementById('postureReportCard');
        const gradeBadge = document.getElementById('reportGrade');
        const wbVal = document.getElementById('reportWbVal');
        const tiltVal = document.getElementById('reportTiltVal');
        const swayVal = document.getElementById('reportSwayVal');
        if (!reportCard || !gradeBadge || !wbVal || !tiltVal || !swayVal) return;

        const tilt = metrics.pelvicTilt || 0;
        const totalWBL = metrics.weightBearing ? metrics.weightBearing.total.L : 50.2;
        const totalWBR = metrics.weightBearing ? metrics.weightBearing.total.R : 49.8;
        const wDiff = Math.abs(totalWBL - 50) * 2;
        const swayArea = metrics.swayMetrics ? metrics.swayMetrics.swayArea : 480;

        // Calculate Grade
        let grade = 'S';
        let tiltStatus = '正常';
        let swayStatus = '正常範囲';

        if (Math.abs(tilt) > 10 || wDiff > 12 || swayArea > 1800) {
            grade = 'C';
        } else if (Math.abs(tilt) > 6 || wDiff > 7 || swayArea > 1200) {
            grade = 'B';
        } else if (Math.abs(tilt) > 3 || wDiff > 4 || swayArea > 600) {
            grade = 'A';
        }

        if (Math.abs(tilt) > 3) {
            tiltStatus = tilt > 0 ? `骨盤前傾 (${tilt.toFixed(1)}°)` : `骨盤後傾 (${Math.abs(tilt).toFixed(1)}°)`;
        } else {
            tiltStatus = `正常 (${tilt.toFixed(1)}°)`;
        }

        if (swayArea > 1200) {
            swayStatus = `動揺大 (${swayArea.toFixed(0)}px²)`;
        } else {
            swayStatus = `正常範囲 (${swayArea.toFixed(0)}px²)`;
        }

        gradeBadge.innerText = grade;
        wbVal.innerText = `L ${totalWBL.toFixed(1)}% : R ${totalWBR.toFixed(1)}%`;
        tiltVal.innerText = tiltStatus;
        swayVal.innerText = swayStatus;

        reportCard.style.display = 'block';

        // Prepare sharing text template
        const modeNames = {
            dyn_overhead: 'スクワット動作アライメント',
            l_side: '側面姿勢アライメント',
            front: '左右荷重バランスチェック',
            dyn_flex_fwd: '健康動作バランス',
            default: '姿勢アライメント'
        };
        const modeLabel = modeNames[metrics.mode] || '姿勢アライメント';
        currentMetricsText = `【CORE CONNECT 姿勢測定結果】\n` +
            `測定項目: ${modeLabel}\n` +
            `総合判定: Grade 『${grade}』\n` +
            `・左右荷重比: L ${totalWBL.toFixed(1)}% : R ${totalWBR.toFixed(1)}%\n` +
            `・骨盤アライメント: ${tiltStatus}\n` +
            `・重心動揺エリア: ${swayStatus}\n` +
            `#CORECONNECT #姿勢改善 #アライメント測定`;
    }

    // Attach Event Listeners to SNS Share Buttons
    document.getElementById('shareXBtn').addEventListener('click', () => {
        if (!currentMetricsText) return;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentMetricsText)}&url=${encodeURIComponent('https://bclab2020.github.io/portal-mockup/')}`;
        window.open(url, '_blank');
    });

    document.getElementById('shareLineBtn').addEventListener('click', () => {
        if (!currentMetricsText) return;
        const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentMetricsText)}&text=${encodeURIComponent(currentMetricsText)}`;
        window.open(url, '_blank');
    });

    document.getElementById('copyReportBtn').addEventListener('click', () => {
        if (!currentMetricsText) return;
        navigator.clipboard.writeText(currentMetricsText).then(() => {
            alert('📋 測定結果テキストをコピーしました！\nLINEや他のSNSにそのまま貼り付けられます。');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    document.getElementById('shareInternalBtn').addEventListener('click', () => {
        switchTab('community');
        alert('💬 コミュニティへ移動しました。\n最新のデータが添付されていますので、このまま「相談・共有を投稿」ボタンを押して投稿できます！');
    });

    // Premium Subscription Modal Handlers
    const subscriptionModal = document.getElementById('subscriptionModal');
    const premiumReportBtn = document.getElementById('premiumReportBtn');
    const closeSubModalBtn = document.getElementById('closeSubModalBtn');
    const subStandardBtn = document.getElementById('subStandardBtn');
    const subPremiumBtn = document.getElementById('subPremiumBtn');

    if (premiumReportBtn) {
        premiumReportBtn.addEventListener('click', () => {
            if (isPremiumUser) {
                // If already premium, let them download the mock report
                alert('📥 【PREMIUM会員限定ダウンロード】\n「AI姿勢判定に基づく理学療法士直伝・改善運動プログラムPDFレポート」をダウンロードしました！\n（※本番環境では個人の弱点アライメントに合わせたカスタムリハビリトレーニング処方箋PDFが出力されます）');
            } else {
                // Open pricing plan modal
                if (subscriptionModal) subscriptionModal.style.display = 'flex';
            }
        });
    }

    if (closeSubModalBtn) {
        closeSubModalBtn.addEventListener('click', () => {
            if (subscriptionModal) subscriptionModal.style.display = 'none';
        });
    }

    // Close on overlay click
    if (subscriptionModal) {
        subscriptionModal.addEventListener('click', (e) => {
            if (e.target === subscriptionModal) {
                subscriptionModal.style.display = 'none';
            }
        });
    }

    function executeSubscriptionSim(planName) {
        isPremiumUser = true;
        if (subscriptionModal) subscriptionModal.style.display = 'none';
        
        // Show success alert with value explanation
        alert(`👑 【CORE CONNECT プレミアムプラン登録完了】\n\nスタンダードプラン（月額980円 / 初月無料）へのご登録ありがとうございます！\n\n🎁 会員限定特典獲得：\n1. ASICS/OrthoFit/StyleKeepで使える1,000円割引クーポンを発行しました！\n2. タイムラインで理学療法士などの専門家への「測定相談」が可能になりました！\n3. プレミアム限定詳細PDFレポートがダウンロード可能になりました！`);
        
        // Visual indicator in timeline composer
        const composerAvatar = document.querySelector('.post-composer .composer-avatar');
        if (composerAvatar) {
            // Append premium badge next to it, or style it gold
            composerAvatar.style.background = 'linear-gradient(45deg, #ffd700, #ffa500)';
            composerAvatar.title = 'PREMIUM MEMBER';
            // Also add badge in the HTML
            const composerHeader = document.querySelector('.post-composer .composer-header');
            if (composerHeader && !document.getElementById('composerPremiumBadge')) {
                const badge = document.createElement('span');
                badge.id = 'composerPremiumBadge';
                badge.className = 'premium-user-badge';
                badge.innerText = 'PREMIUM';
                composerHeader.appendChild(badge);
            }
        }
        
        // Change premium button label
        if (premiumReportBtn) {
            premiumReportBtn.innerHTML = '📥 改善指導PDFレポートをダウンロード (PREMIUM特典)';
            premiumReportBtn.style.background = 'linear-gradient(135deg, #ffd700, #ffa500)';
        }
    }

    if (subStandardBtn) {
        subStandardBtn.addEventListener('click', () => {
            executeSubscriptionSim('スタンダード');
        });
    }

    if (subPremiumBtn) {
        subPremiumBtn.addEventListener('click', () => {
            executeSubscriptionSim('プレミアム');
        });
    }

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

    function updateLabSidebarAds(vertical) {
        const adSpace = document.getElementById('dynamicAdSpace');
        const headline = document.querySelector('.ad-headline');
        const container = document.getElementById('adWidgetContainer');
        if (!adSpace || !container || !headline) return;

        // Reset classes
        container.className = 'dynamic-ad-container';
        headline.innerHTML = `<span></span> スポンサー企業協賛広告枠`;

        let adHtml = '';
        if (vertical === 'sports') {
            adHtml = `
                <!-- Ad 1: Health/Furniture -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill tilt" style="background:rgba(255,145,0,0.08); border-color:var(--accent-orange); color:var(--accent-orange);">骨盤ケア協賛: StyleKeep</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1588286840104-8957b029727f?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">StyleKeep 骨盤サポート高反発クッション</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">アライメントの崩れによる腰部・背中への座姿勢負担を軽減する特許取得サポートクッション。</div>
                    <div class="ad-product-price" style="font-size:13px;">特別価格: ¥5,440</div>
                </div>
                
                <!-- Ad 2: Orthotics/Apparel -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill sway" style="background:rgba(0,191,255,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">インソール協賛: OrthoFit</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">OrthoFit プレミアム・カスタムインソール</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">左右荷重バランスを足元から補正し、ランニング時の関節ブレを抑制するカスタムインソール。</div>
                    <div class="ad-product-price" style="font-size:13px;">特別価格: ¥9,600</div>
                </div>

                <!-- Ad 3: Sports Apparel -->
                <div class="ad-matched-box">
                    <span class="matched-pill" style="background:rgba(138,43,226,0.08); border-color:var(--accent-purple); color:var(--accent-purple);">リカバリー協賛: UNDER ARMOUR</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">UA Recovery 段階着圧リカバリータイツ</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">運動後のアライメント維持と筋肉疲労の回復を促進する特殊着圧コンプレッション。</div>
                    <div class="ad-product-price" style="font-size:13px;">販売価格: ¥7,800</div>
                </div>
            `;
        } else if (vertical === 'health') {
            adHtml = `
                <!-- Ad 1: Medical/Tech -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill tilt" style="background:rgba(16,185,129,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">ヘルスケア協賛: OMRON</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">OMRON スマート上腕式血圧計</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">Bluetooth通信機能搭載。毎日の血圧アライメントを測定し、グラフでスマートに健康管理。</div>
                    <div class="ad-product-price" style="font-size:13px;">販売価格: ¥9,800</div>
                </div>
                
                <!-- Ad 2: Medical/Scale -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill sway" style="background:rgba(16,185,129,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">健康測定協賛: TANITA</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">TANITA デュアルタイプ体組成計 インナースキャン</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">筋肉の「質」を分析する筋質点数を測定。全身のバランス指標を高精度に算出します。</div>
                    <div class="ad-product-price" style="font-size:13px;">特別価格: ¥14,800</div>
                </div>

                <!-- Ad 3: Nutrition -->
                <div class="ad-matched-box">
                    <span class="matched-pill" style="background:rgba(16,185,129,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">サプリ協賛: ファンケル</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1470468969717-61d5d548a04b?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">ファンケル グルコサミン＆コンドロイチン</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">毎日のアクティブな一歩をスムーズに。年齢とともに気になる関節可動域の健康をサポート。</div>
                    <div class="ad-product-price" style="font-size:13px;">販売価格: ¥2,400</div>
                </div>
            `;
        } else if (vertical === 'beauty') {
            adHtml = `
                <!-- Ad 1: Beauty Device -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill tilt" style="background:rgba(255,117,143,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">フェイスケア協賛: ReFa</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">ReFa CARAT RAY 美顔ローラー</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">プロの手技「ニーディング」を再現。姿勢の歪みによる血流滞留を整え、シャープなフェイスラインへ。</div>
                    <div class="ad-product-price" style="font-size:13px;">特別価格: ¥21,000</div>
                </div>
                
                <!-- Ad 2: Esthetic Apparel -->
                <div class="ad-matched-box" style="margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                    <span class="matched-pill sway" style="background:rgba(255,117,143,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">レッグケア協賛: スリムウォーク</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=300'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">メディキュット 骨盤サポート骨格タイツ</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">寝ながら骨盤アライメントを優しく補正し、翌朝すっきり軽やかな美脚ラインへと整える段階圧力設計。</div>
                    <div class="ad-product-price" style="font-size:13px;">特別価格: ¥3,200</div>
                </div>

                <!-- Ad 3: Cosmetics -->
                <div class="ad-matched-box">
                    <span class="matched-pill" style="background:rgba(255,117,143,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">スキンケア協賛: ELIXIR</span>
                    <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'); height: 80px;"></div>
                    <div class="ad-title" style="font-size:12px;">エリクシール シュペリエル デザインタイムセラム</div>
                    <div class="ad-desc" style="font-size:11px; line-height:1.4;">表情のベースとなる肌のハリに。アライメントマッサージと併せて豊かなハリ感を与えます。</div>
                    <div class="ad-product-price" style="font-size:13px;">販売価格: ¥4,950</div>
                </div>
            `;
        }
        adSpace.innerHTML = adHtml;
    }

    // ==========================================================================
    // Dynamic 10 Articles Render Engine
    // ==========================================================================
    const articlesData = {
    "sports": [
        {
            "isExternal": true,
            "source": "🌐 JOSPT (Journal of Orthopaedic & Sports Physical Therapy)",
            "title": "ランニング障害における大臀筋筋力と膝ニーイン動作（Knee Valgus）の相関関係",
            "desc": "【AI翻訳抄録】ランナーの膝蓋大腿部痛（PFPS）発症と股関節外転筋力、特に片脚スクワット時のニーイン角度には明確な相関があることが判明。股関節支持力強化による膝ブレ改善効果を裏付ける最新の臨床研究結果です。",
            "badge": "外部論文 (米国)",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 米国スポーツ物理療法学会",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://www.jospt.org/', '_blank'); alert('著作権遵守：引用元メディアのオリジナル論文詳細ページ（外部サイト）へ遷移します。')"
        },
        {
            "isExternal": false,
            "title": "スクワット動作における「ニーイン (Knee Valgus)」の危険性と修正",
            "desc": "スクワットや着地動作時に膝が内側に折れ曲がる「ニーイン」は、前十字靭帯（ACL）損傷や膝蓋腱炎の最大の要因です。大臀筋の活動低下や足関節の硬さをAI姿勢追跡でチェックしましょう。",
            "badge": "怪我予防",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "理学療法士 田中",
            "btnLabel": "📸 OHS動作をAIで測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_overhead')"
        },
        {
            "isExternal": false,
            "title": "腰部ストレスを増大させる「スウェイバック姿勢」の臨床メカニズム",
            "desc": "骨盤が前方にスライドし、胸椎が後弯するスウェイバック姿勢。このアライメント不良は、腰方形筋の過緊張と仙腸関節の圧縮負担を引き起こします。重力線に対するアライメントを測定しましょう。",
            "badge": "アライメント",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "トレーナー 佐藤",
            "btnLabel": "📸 側面アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": false,
            "title": "スイング動作やジャンプの土台：左右荷重均等性（COM）の重要性",
            "desc": "ゴルフのスイングやバスケットボールの着地において、身体の質量中心（COM）が左右どちらかに5%以上偏っていると、反対側の腰椎に数倍の代償ストレスが生じます。全身荷重バランスを可視化します。",
            "badge": "パフォーマンス",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "コーチ 鈴木",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": true,
            "source": "🌐 Journal of Biomechanics",
            "title": "変形性膝関節症（Knee OA）における歩行時の荷重線の偏位と力学負荷",
            "desc": "【AI翻訳抄録】歩行アライメントにおける内側荷重の増大（膝内反変形）が、大腿骨・脛骨関節軟骨の摩耗と骨棘形成を加速させるバイオメカニクス的証拠。初期段階でのアライメント補正インソールの有効性を実証。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 生体力学会誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://www.sciencedirect.com/journal/journal-of-biomechanics', '_blank');"
        },
        {
            "isExternal": false,
            "title": "野球の投球動作における「肩甲骨アライメント」と球速のバイオメカニクス",
            "desc": "テイクバックからリリースにかけて、肩甲胸郭関節の動きが制限されると、肩関節のインピンジメントや肘内側側副靭帯の過負荷を引き起こします。投球姿勢におけるアライメント異常をチェックします。",
            "badge": "投球分析",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1544045564-1480018f8576?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "コーチ 鈴木",
            "btnLabel": "📸 投球アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_overhead')"
        },
        {
            "isExternal": false,
            "title": "ランナー必見：ミッドフット着地と接地アライメントの最適化",
            "desc": "過度なヒールストライク（踵着地）はブレーキ力を生み、膝関節への衝撃荷重を増大させます。AIカメラによる走動作のアライメント測定から、エネルギー効率が高く怪我の少ない着地姿勢を導き出します。",
            "badge": "ランニング科学",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "トレーナー 佐藤",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": true,
            "source": "🌐 Foot & Ankle International",
            "title": "アキレス腱炎（Achilles Tendinopathy）と足関節背屈可動域・回内偏位の相関",
            "desc": "【AI翻訳抄録】足関節背屈制限および接地時の過回内（プロネーション）がアキレス腱に非対称な緊張を与え、慢性炎症を引き起こす要因となることを臨床的に解明。インソールによる距骨下関節サポートの効果。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 米国足の外科学会誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://journals.sagepub.com/home/fai', '_blank');"
        },
        {
            "isExternal": false,
            "title": "体幹のブレを抑制する：プランク動作時の左右対称アライメントチェック",
            "desc": "体幹トレーニングの基本であるプランクですが、肩甲骨の安定性不足や骨盤のねじれが生じていると、効果が半減するどころか腰痛を引き起こします。AIによるアライメント分析で正しいフォームを習得しましょう。",
            "badge": "体幹強化",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "理学療法士 田中",
            "btnLabel": "📸 体幹動作をAIで測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_flex_fwd')"
        },
        {
            "isExternal": false,
            "title": "自転車競技ロードレースにおけるペダリング中の骨盤回転アライメント",
            "desc": "サドル高や前後位置のズレは、ペダリング時に骨盤の過度な傾斜や左右への逃げを生み出し、パワーロスと下背部痛を招きます。左右大腿骨の軌道を正面から測定し、理想のフィッティングを追求します。",
            "badge": "バイクフィット",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "トレーナー 佐藤",
            "btnLabel": "📸 側面アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        }
    ],
    "health": [
        {
            "isExternal": true,
            "source": "📰 厚生労働省プレスリリース",
            "title": "高齢者の転倒・骨折が年々増加、厚生労働省が予防ガイドラインで「身体バランスチェック」の推奨を強化",
            "desc": "【記事抜粋】厚生労働省の最新の国民健康調査によると、65歳以上の転倒による骨折件数は過去最高を記録。予防ガイドラインでは、自宅で簡単に行える片脚立ちや立ち上がり測定などの身体重心アライメント評価の重要性が指摘されています。",
            "badge": "ニュース配信",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 厚生労働省広報",
            "btnLabel": "📖 配信元で全文を読む (厚生労働省) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://www.mhlw.go.jp/', '_blank'); alert('著作権遵守：引用元官庁のオリジナルリリース詳細ページ（外部サイト）へ遷移します。')"
        },
        {
            "isExternal": false,
            "title": "健康寿命を延ばす：立ち上がりテスト（CS-30）によるロコモ判定",
            "desc": "30秒間の椅子立ち上がりテストは、下肢の運動機能や将来の転倒リスクを測るための国際的な指標です。AIカメラによる姿勢動作追跡で、ご自宅で手軽に運動能力をチェックしてみましょう。",
            "badge": "ロコモ予防",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "理学療法士 田中",
            "btnLabel": "📸 動作チェックをAIで測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_flex_fwd')"
        },
        {
            "isExternal": false,
            "title": "隠れメタボ・内臓下垂を防ぐ「骨盤ニュートラル」の健康効果",
            "desc": "骨盤が後傾すると内臓が押し下げられ、下腹部がぽっこり出るだけでなく、消化吸収効率の低下や基礎代謝の悪化を招きます。正しい骨盤アライメント（傾き角）を測定し、生活習慣病を予防しましょう。",
            "badge": "生活習慣",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "内科医師 渡辺",
            "btnLabel": "📸 骨盤傾きアライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": true,
            "source": "🌐 JAMA Internal Medicine",
            "title": "一日の歩数（ステップ数）と安静時心拍数および心血管疾患死リスクの長期的相関",
            "desc": "【AI翻訳抄録】数万人のウェアラブルデータを分析した結果、毎日の歩数増加と歩行バランスの安定性が心拍数の安定をもたらし、心筋梗塞や脳卒中の死亡リスクを最大30%低下させることを疫学的に立証。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 米国医師会雑誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://jamanetwork.com/journals/jamainternalmedicine', '_blank');"
        },
        {
            "isExternal": false,
            "title": "デスクワーカーの現代病：「スマホ首（ストレートネック）」を予防する胸椎可動性",
            "desc": "PC作業中の前かがみ姿勢は、頭部を前方に数センチメートル突出させ、頸椎に最大3倍の静的負荷をかけます。胸椎の丸みを測定し、背骨の生理的弯曲を取り戻すセルフストレッチをアドバイスします。",
            "badge": "姿勢ケア",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "内科医師 渡辺",
            "btnLabel": "📸 側面アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": true,
            "source": "🌐 International Osteoporosis Foundation",
            "title": "骨密度（BMD）維持における重力負荷・荷重トレーニングの生理的エビデンス",
            "desc": "【AI翻訳抄録】骨芽細胞を刺激し骨形成を促進するには、自重を利用した適度な衝撃荷重（片脚立ちやステップ運動）が必要であることを検証。筋骨格アライメントが歪んでいると力学刺激が不均等になる問題点を指摘。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 国際骨粗鬆症財団",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://www.osteoporosis.foundation/', '_blank');"
        },
        {
            "isExternal": false,
            "title": "朝起きたときの腰痛を改善：背骨への負担を減らす「理想の寝姿勢」アライメント",
            "desc": "朝起きたときに腰が痛むのは、就寝時の骨盤後傾や背骨のねじれが原因かもしれません。適切な枕の高さや寝姿勢ごとの背骨ニュートラル位置を測定し、良質な睡眠習慣をサポートします。",
            "badge": "睡眠姿勢",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "理学療法士 田中",
            "btnLabel": "📸 側面アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": true,
            "source": "🌐 BJSM (British Journal of Sports Medicine)",
            "title": "高血圧症におけるアイソメトリック（等尺性）筋力トレーニングの降圧効果メタ分析",
            "desc": "【AI翻訳抄録】空気椅子や壁押しなど、筋肉の長さを変えずに力を発揮するトレーニングが、有酸素運動を上回る血管柔軟性改善・血圧低下作用を持つことを証明。アライメントを維持した静的トレーニングが推奨される理由。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 英国スポーツ医学雑誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://bjsm.bmj.com/', '_blank');"
        },
        {
            "isExternal": false,
            "title": "脳卒中リスクと関連する「片脚立ち時間」の短縮を防ぐ重心制御機能",
            "desc": "片脚立ち測定における動揺面積の増大は、脳内の微小血管障害や前庭感覚の衰えを示す重要なヘルスインジケーターです。左右均等な筋力と重心アライメントを保ち、健康な神経系を維持しましょう。",
            "badge": "重心バランス",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "理学療法士 田中",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": false,
            "title": "慢性腰痛に挑む：インナーマッスル（腹横筋）の収縮アライメントと体幹保護",
            "desc": "動作を起こす直前に腹横筋が先行して収縮しないと、腰椎に直接的なせん断力がかかり急性痛を誘発します。前屈時の体幹アライメント軌跡をAIでチェックし、コアの連動性を取り戻しましょう。",
            "badge": "腰痛対策",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "内科医師 渡辺",
            "btnLabel": "📸 動作チェックをAIで測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_flex_fwd')"
        }
    ],
    "beauty": [
        {
            "isExternal": true,
            "source": "🌐 Vogue Aesthetics (NY Edition)",
            "title": "ニューヨークのトップモデルが実践する、骨格アライメント調整とリンパ循環・美肌のディープリレーション",
            "desc": "【AI翻訳抄録】モデル業界で重要視される「立ち姿の垂直アライメント」。姿勢の崩れは頸部リンパ節の圧迫を招き、顔のくすみやターンオーバー遅延の主要因になることが最新美容医学で実証。アライメントケアと美容液導入の相乗効果が注目されています。",
            "badge": "海外美容誌",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: Vogue Aesthetics誌",
            "btnLabel": "📖 配信元で全文を読む (Vogue) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://www.vogue.com/', '_blank'); alert('著作権遵守：引用元メディアのオリジナルニュース詳細ページ（外部サイト）へ遷移します。')"
        },
        {
            "isExternal": false,
            "title": "3大骨格スタイルタイプ（ストレート・ウェーブ・ナチュラル）と美脚度アセスメント",
            "desc": "骨格タイプによって骨盤の傾きや脂肪・筋肉の付き方の特徴は異なります。姿勢アライメント測定から「O脚・X脚の偏位」を数値化し、あなたに最適な美脚アプローチを見つけましょう。",
            "badge": "骨格診断",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "スタイリスト Rin",
            "btnLabel": "📸 骨格タイプと美脚アライメント測定 <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": false,
            "title": "太もも前側の張りを解消する：美歩行と骨盤アライメントの鍵",
            "desc": "歩くたびに太ももの前側が張ってしまうのは、骨盤の前傾によって反り腰になり、大腿直筋に頼った歩き方をしているからです。美しい歩行アライメントの基準ラインをAIで測定・可視化します。",
            "badge": "美ボディ",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "美容カイロプラクター 小林",
            "btnLabel": "📸 歩行・骨盤アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": true,
            "source": "🌐 Aesthetic Plastic Surgery",
            "title": "顔面非対称（Facial Asymmetry）と頸椎アライメント・顎関節症（TMD）の臨床相関",
            "desc": "【AI翻訳抄録】頸椎のわずかな傾斜や肩のラインの左右非対称が、咬筋の緊張差を引き起こし、顔の輪郭の歪みをもたらすメカニズム。全身の骨格アライメントを正すことでフェイスラインの対称性が改善することを示す臨床的結論。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 美容形成外科学会誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://link.springer.com/journal/266', '_blank');"
        },
        {
            "isExternal": false,
            "title": "デコルテを美しく見せる：胸鎖乳突筋の過緊張と「前肩（丸肩）」の補正ケア",
            "desc": "スマートフォンやPCの見すぎで首が前に突き出ると、胸側の筋肉が縮み、美しい鎖骨ラインが埋もれてしまいます。首から肩にかけてのアライメント角度を測定し、デコルテがすっきり際立つ姿勢へ導きます。",
            "badge": "デコルテ美",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "美容カイロプラクター 小林",
            "btnLabel": "📸 側面アライメントを測定する <span>▶</span>",
            "action": "launchMeasurement('l_side')"
        },
        {
            "isExternal": false,
            "title": "ヒップの横幅をすっきり整える：中臀筋のポジショニングと美骨格アライメント",
            "desc": "「ヒップラインの下垂や横広がり」は、骨格アライメントの歪みによる中臀筋の緩みが影響しています。骨盤幅と大腿骨大転子の偏位を測定し、丸みのある美しいヒップをつくるアライメントアプローチを解説。",
            "badge": "ヒップメイク",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "スタイリスト Rin",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": true,
            "source": "🌐 Journal of Cosmetic Dermatology",
            "title": "高ヒール着用時の歩行動作における足弓（アーチ）への負担と腰椎前弯（反り腰）の変化",
            "desc": "【AI翻訳抄録】7cm以上のヒールシューズを履いた歩行では、踵骨のクッション機能が使えず骨盤が強制的に前傾し、反り腰アライメントを形成することをモーションキャプチャにて証明。日常のフットベッドケアの必要性。",
            "badge": "外部論文",
            "badgeBg": "var(--accent-purple)",
            "badgeColor": "#fff",
            "imageUrl": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=300",
            "metaTime": "外部サイト遷移",
            "metaAuthor": "出所: 美容皮膚科学会誌",
            "btnLabel": "📖 論文元で全文を読む (英語) <span>↗</span>",
            "btnStyle": "background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);",
            "action": "window.open('https://onlinelibrary.wiley.com/journal/14732165', '_blank');"
        },
        {
            "isExternal": false,
            "title": "アンダーバストを引き締める：リブケージ（肋骨）の広がりと呼吸アライメント",
            "desc": "反り腰傾向がある方は、肋骨が前方へ浮き上がる「リブフレア」になりやすく、ウエストが太く見える原因になります。呼吸時における肋骨下部のアライメント動作をチェックし、くびれが引き立つ呼吸法をマスターしましょう。",
            "badge": "美骨盤・肋骨",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "美容カイロプラクター 小林",
            "btnLabel": "📸 動作チェックをAIで測定する <span>▶</span>",
            "action": "launchMeasurement('dyn_flex_fwd')"
        },
        {
            "isExternal": false,
            "title": "肩のラインを一直線に整える：鎖骨アライメントとすっきり美しいデコルテ",
            "desc": "いかり肩やなで肩は、僧帽筋上部や肩甲挙筋の緊張バランスから生じる骨格アライメント変位です。鎖骨の水平度を正面カメラで測定し、緊張した首すじラインをほぐす美バランスアプローチを実践しましょう。",
            "badge": "肩ライン",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400",
            "metaTime": "所要時間: 3分",
            "metaAuthor": "スタイリスト Rin",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        },
        {
            "isExternal": false,
            "title": "美足首をつくる：踵骨（アキレス腱）の垂直アライメントとアーチサポート",
            "desc": "靴の内側ばかりがすり減る方は、足首が内側に倒れる「オーバープロネーション（過回内）」の可能性があります。これは足首を太く見せるだけでなくO脚の原因にも。アキレス腱の傾きを測定・補正します。",
            "badge": "足首スリム",
            "badgeBg": "var(--accent-blue)",
            "badgeColor": "#000",
            "imageUrl": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=300",
            "metaTime": "所要時間: 4分",
            "metaAuthor": "美容カイロプラクター 小林",
            "btnLabel": "📸 左右荷重バランスを測定する <span>▶</span>",
            "action": "launchMeasurement('front')"
        }
    ]
};

    function renderArticles(vertical) {
        const container = document.getElementById(`${vertical}ArticleList`);
        if (!container) return;
        
        const list = articlesData[vertical] || [];
        container.innerHTML = list.map(art => {
            const borderStyle = art.isExternal ? 'style="border-style: dashed; border-color: var(--border-color);"' : '';
            const sourceHtml = art.source ? `<div style="font-size:10px; color:var(--accent-blue); font-weight:700; margin-bottom:5px;">${art.source}</div>` : '';
            return `
                <div class="article-card" ${borderStyle}>
                    <div class="article-image" style="background-image: url('${art.imageUrl}');">
                        <span class="article-badge" style="background:${art.badgeBg}; color:${art.badgeColor};">${art.badge}</span>
                    </div>
                    <div class="article-content">
                        <div class="article-body">
                            ${sourceHtml}
                            <h3>${art.title}</h3>
                            <p>${art.desc}</p>
                        </div>
                        <div class="article-footer">
                            <div class="article-meta">
                                <span>⏱️ ${art.metaTime}</span>
                                <span>✍️ ${art.metaAuthor}</span>
                            </div>
                            <button class="btn-hook" style="${art.btnStyle || ''}" onclick="${art.action}">
                                ${art.btnLabel}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render articles on initialization
    renderArticles('sports');
    renderArticles('health');
    renderArticles('beauty');
});

