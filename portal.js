// CORE CONNECT Portal Controller
document.addEventListener('DOMContentLoaded', () => {
    // Initial Tabs Navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    const iframe = document.getElementById('measurementIframe');
    
    let isPremiumUser = false;
    
    // Category subtabs filtering (Sports, Health, Beauty) - Dynamic Version
    const subtabButtons = document.querySelectorAll('.subtab-btn');
    subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentPanel = btn.closest('.tab-panel');
            if (!parentPanel) return;
            
            // Toggle active class on buttons within the same panel
            parentPanel.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedCategory = btn.getAttribute('data-sport');
            const panelId = parentPanel.id; // e.g. "sportsPanel"
            const vertical = panelId.replace('Panel', '');
            
            activeFilters[vertical] = selectedCategory;
            visibleCounts[vertical] = 10; // Reset paging
            renderFeed(vertical);
        });
    });
    
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
            
            // Sync theme in the embedded iframe and set default page based on active portal vertical
            const isLight = (currentVertical === 'health' || currentVertical === 'beauty');
            const themeParam = isLight ? '&theme=light' : '';
            const currentSrc = iframe.src || '';
            
            if (currentVertical === 'beauty') {
                if (!currentSrc.includes('face_analyzer.html')) {
                    iframe.src = `./face_analyzer.html?vertical=${currentVertical}${themeParam}`;
                }
                setTimeout(() => {
                    const btnBody = document.getElementById('btnModeBody');
                    const btnFace = document.getElementById('btnModeFace');
                    if (btnBody && btnFace) {
                        btnBody.classList.remove('active');
                        btnBody.style.background = 'transparent';
                        btnBody.style.borderColor = 'var(--border-color)';
                        btnBody.style.color = 'var(--text-secondary)';
                        btnFace.classList.add('active');
                        btnFace.style.background = 'rgba(255, 20, 147, 0.15)';
                        btnFace.style.borderColor = 'rgba(255, 20, 147, 0.3)';
                        btnFace.style.color = 'var(--accent-pink)';
                    }
                }, 50);
            } else {
                if (!currentSrc.includes('mock_app.html')) {
                    iframe.src = `./mock_app.html${themeParam}`;
                }
                setTimeout(() => {
                    const btnBody = document.getElementById('btnModeBody');
                    const btnFace = document.getElementById('btnModeFace');
                    if (btnBody && btnFace) {
                        btnFace.classList.remove('active');
                        btnFace.style.background = 'transparent';
                        btnFace.style.borderColor = 'var(--border-color)';
                        btnFace.style.color = 'var(--text-secondary)';
                        btnBody.classList.add('active');
                        btnBody.style.background = 'rgba(0, 191, 255, 0.15)';
                        btnBody.style.borderColor = 'rgba(0, 191, 255, 0.3)';
                        btnBody.style.color = 'var(--accent-blue)';
                    }
                }, 50);
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
        
        if (mode === 'face_rppg') {
            iframe.src = `./face_analyzer.html?mode=face_rppg&autoStart=true&vertical=${currentVertical}${themeParam}`;
            setTimeout(() => {
                const btnBody = document.getElementById('btnModeBody');
                const btnFace = document.getElementById('btnModeFace');
                if (btnBody && btnFace) {
                    btnBody.classList.remove('active');
                    btnBody.style.background = 'transparent';
                    btnBody.style.borderColor = 'var(--border-color)';
                    btnBody.style.color = 'var(--text-secondary)';
                    btnFace.classList.add('active');
                    btnFace.style.background = 'rgba(255, 20, 147, 0.15)';
                    btnFace.style.borderColor = 'rgba(255, 20, 147, 0.3)';
                    btnFace.style.color = 'var(--accent-pink)';
                }
            }, 50);
        } else {
            // Reload iframe with query parameters to trigger camera and mode
            iframe.src = `./mock_app.html?mode=${mode}&autoStart=true${themeParam}`;
            setTimeout(() => {
                const btnBody = document.getElementById('btnModeBody');
                const btnFace = document.getElementById('btnModeFace');
                if (btnBody && btnFace) {
                    btnFace.classList.remove('active');
                    btnFace.style.background = 'transparent';
                    btnFace.style.borderColor = 'var(--border-color)';
                    btnFace.style.color = 'var(--text-secondary)';
                    btnBody.classList.add('active');
                    btnBody.style.background = 'rgba(0, 191, 255, 0.15)';
                    btnBody.style.borderColor = 'rgba(0, 191, 255, 0.3)';
                    btnBody.style.color = 'var(--accent-blue)';
                }
            }, 50);
        }
    };

    // Click listeners for Lab Tab toggles
    setTimeout(() => {
        const btnBody = document.getElementById('btnModeBody');
        const btnFace = document.getElementById('btnModeFace');
        if (btnBody && btnFace) {
            btnBody.addEventListener('click', () => {
                const isLight = (currentVertical === 'health' || currentVertical === 'beauty');
                const themeParam = isLight ? '?theme=light' : '';
                iframe.src = `./mock_app.html${themeParam}`;
                
                btnFace.classList.remove('active');
                btnFace.style.background = 'transparent';
                btnFace.style.borderColor = 'var(--border-color)';
                btnFace.style.color = 'var(--text-secondary)';
                btnBody.classList.add('active');
                btnBody.style.background = 'rgba(0, 191, 255, 0.15)';
                btnBody.style.borderColor = 'rgba(0, 191, 255, 0.3)';
                btnBody.style.color = 'var(--accent-blue)';
            });

            btnFace.addEventListener('click', () => {
                const isLight = (currentVertical === 'health' || currentVertical === 'beauty');
                const themeParam = isLight ? '&theme=light' : '';
                iframe.src = `./face_analyzer.html?vertical=${currentVertical}${themeParam}`;
                
                btnBody.classList.remove('active');
                btnBody.style.background = 'transparent';
                btnBody.style.borderColor = 'var(--border-color)';
                btnBody.style.color = 'var(--text-secondary)';
                btnFace.classList.add('active');
                btnFace.style.background = 'rgba(255, 20, 147, 0.15)';
                btnFace.style.borderColor = 'rgba(255, 20, 147, 0.3)';
                btnFace.style.color = 'var(--accent-pink)';
            });
        }
    }, 100);

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
            const triggerAutoReply = true;
            if (triggerAutoReply) {
                setTimeout(() => {
                    let expertName = "田中 誠 (理学療法士)";
                    let expertAvatar = "誠";
                    let replyContent = "ご投稿ありがとうございます！測定結果を拝見しました。アライメントの崩れに対するセルフエクササイズとして、当ポータルの「ストレッチ動画セッション」の受講が有効です。希望があれば45分の個別指導予約も枠が空いていますよ！";
                    
                    if (newPost.sharedMetric && newPost.sharedMetric.modeName.includes("顔")) {
                        expertName = "Rin (ビューティアドバイザー)";
                        expertAvatar = "凛";
                        if (newPost.sharedMetric.userAgeSegment === '10') {
                            replyContent = "中高生メンバーさん、測定結果の共有ありがとう！✨ 校則が厳しくてもバレにくい超自然なスクールメイクのコツや、放課後のお出かけにぴったりなプチプラ（キャンメイクやケイト）を使った簡単コントゥアリングをアドバイスカードに載せておいたよ！テスト前の息抜きや、スマホの見すぎで疲れたときは深呼吸してみてね。応援してるよ！";
                        } else {
                            replyContent = "顔骨格とrPPG脈拍測定の共有ありがとうございます！ご希望の顔立ちに向けたコントゥアリングメイクと併せて、デコルテ付近のリンパマッサージを行うと、血流がさらに良くなりrPPG指標や肌のトーンが向上しますよ。おすすめ化粧品もぜひ試してみてくださいね！";
                        }
                    }

                    newPost.replies.push({
                        author: expertName,
                        avatar: expertAvatar,
                        role: "専門家メンター",
                        time: "たった今",
                        content: replyContent
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
        if (session.mode === 'face_rppg') {
            const metricsList = [];
            metricsList.push({
                name: "判定顔骨格型",
                val: session.metrics.detectedFaceType,
                status: "good",
                statusText: "測定完了"
            });
            metricsList.push({
                name: "左右対称性",
                val: `${session.metrics.symmetry}%`,
                status: session.metrics.symmetry < 85 ? "warn" : "good",
                statusText: session.metrics.symmetry < 85 ? "非対称" : "対称性良好"
            });
            metricsList.push({
                name: "心拍数(rPPG)",
                val: `${session.metrics.heartRate} bpm`,
                status: "good",
                statusText: "安定"
            });
            metricsList.push({
                name: "HRV心拍変動",
                val: `${session.metrics.hrvIndex || 38} ms`,
                status: (session.metrics.hrvIndex && session.metrics.hrvIndex < 25) ? "warn" : "good",
                statusText: (session.metrics.hrvIndex && session.metrics.hrvIndex < 25) ? "ストレス有" : "自律神経安定"
            });
            metricsList.push({
                name: "ストレスレベル",
                val: session.metrics.stressLevel,
                status: session.metrics.stressLevel.includes("高") ? "warn" : "good",
                statusText: "測定完了"
            });

            return {
                modeName: "✨ 顔アライメント＆rPPGメイク",
                metrics: metricsList,
                swayArea: null,
                userAgeSegment: session.metrics.userAgeSegment
            };
        }

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

    let currentFaceMetricsText = '';

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
            if (metrics.mode === 'face_rppg') {
                showFaceReportCard(metrics);
            } else {
                showPostureReportCard(metrics);
            }
        }
    });

    function showFaceReportCard(metrics) {
        const reportCard = document.getElementById('faceReportCard');
        const postureCard = document.getElementById('postureReportCard');
        const typeVal = document.getElementById('faceReportType');
        const symmetryVal = document.getElementById('faceReportSymmetry');
        const hrVal = document.getElementById('faceReportHeartRate');
        const stressVal = document.getElementById('faceReportStress');
        const hrvVal = document.getElementById('faceReportHrv');
        const adviceVal = document.getElementById('faceReportAdvice');
        const gradeBadge = document.getElementById('faceReportGrade');
        if (!reportCard || !typeVal || !symmetryVal || !hrVal || !stressVal || !adviceVal || !gradeBadge) return;

        // Hide posture card, show face card
        if (postureCard) postureCard.style.display = 'none';
        
        typeVal.innerText = metrics.detectedFaceType;
        symmetryVal.innerText = `${metrics.symmetry}%`;
        hrVal.innerText = `${metrics.heartRate} bpm`;
        stressVal.innerText = metrics.stressLevel;
        if (hrvVal) {
            const val = metrics.hrvIndex || 38;
            let rating = "通常";
            if (val >= 50) rating = "良好";
            else if (val < 30) rating = "注意";
            hrvVal.innerText = `${val} ms (${rating})`;
        }
        
        // Populate step-by-step advice summary
        let adviceHtml = '';
        if (metrics.makeupGuide) {
            adviceHtml = `<strong>目標イメージ: ${metrics.makeupGuide.title}</strong><br><br>`;
            metrics.makeupGuide.steps.forEach(step => {
                adviceHtml += `・ ${step}<br>`;
            });
        }
        adviceVal.innerHTML = adviceHtml;

        // Grade calculation
        let grade = 'S';
        if (metrics.symmetry < 85 || metrics.stressLevel.includes("高")) {
            grade = 'A';
        }
        gradeBadge.innerText = grade;

        // Toggle visibility of beauty elements based on active portal vertical
        const typeBox = document.getElementById('faceReportTypeBox');
        const symmetryBox = document.getElementById('faceReportSymmetryBox');
        const adviceBox = document.getElementById('faceReportAdviceBox');
        const isHealth = (currentVertical === 'health' || currentVertical === 'sports');

        if (typeBox) typeBox.style.display = isHealth ? 'none' : 'block';
        if (symmetryBox) symmetryBox.style.display = isHealth ? 'none' : 'block';
        if (adviceBox) adviceBox.style.display = isHealth ? 'none' : 'block';

        // Adjust title and badge color based on mode
        const titleEl = reportCard.querySelector('.report-header h3');
        if (isHealth) {
            if (titleEl) {
                titleEl.innerText = "📊 自律神経＆ストレス診断レポート";
                titleEl.style.color = "var(--accent-blue)";
            }
            gradeBadge.style.background = "var(--accent-blue)";
            gradeBadge.style.color = "#000";
            reportCard.style.borderColor = "rgba(0, 191, 255, 0.3)";
            reportCard.style.background = "linear-gradient(180deg, var(--bg-card) 0%, rgba(0, 191, 255, 0.02) 100%)";
        } else {
            if (titleEl) {
                titleEl.innerText = "📊 美容顔アライメント＆健康診断レポート";
                titleEl.style.color = "var(--accent-pink)";
            }
            gradeBadge.style.background = "var(--accent-pink)";
            gradeBadge.style.color = "#000";
            reportCard.style.borderColor = "rgba(255, 20, 147, 0.3)";
            reportCard.style.background = "linear-gradient(180deg, var(--bg-card) 0%, rgba(255, 20, 147, 0.02) 100%)";
        }

        reportCard.style.display = 'block';

        // Prepare sharing text template
        currentFaceMetricsText = `【CORE CONNECT 美容顔＆健康測定結果】\n` +
            `判定顔型: ${metrics.detectedFaceType}\n` +
            `左右対称性: ${metrics.symmetry}%\n` +
            `測定心拍数 (rPPG): ${metrics.heartRate} bpm\n` +
            `HRV心拍変動指標: ${metrics.hrvIndex || 38} ms\n` +
            `ストレスレベル: ${metrics.stressLevel}\n` +
            `なりたい顔: ${metrics.targetFaceType.toUpperCase()}メイクアドバイス適用中！\n` +
            `#CORECONNECT #顔アライメント #rPPGスキャン #美容メイク`;
    }

    // Attach Event Listeners to Face SNS Share Buttons
    setTimeout(() => {
        const faceShareXBtn = document.getElementById('faceShareXBtn');
        const faceShareLineBtn = document.getElementById('faceShareLineBtn');
        const faceCopyReportBtn = document.getElementById('faceCopyReportBtn');
        const faceShareInternalBtn = document.getElementById('faceShareInternalBtn');

        if (faceShareXBtn) {
            faceShareXBtn.addEventListener('click', () => {
                if (!currentFaceMetricsText) return;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentFaceMetricsText)}&url=${encodeURIComponent('https://bclab2020.github.io/portal-mockup/')}`;
                window.open(url, '_blank');
            });
        }
        if (faceShareLineBtn) {
            faceShareLineBtn.addEventListener('click', () => {
                if (!currentFaceMetricsText) return;
                const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentFaceMetricsText)}&text=${encodeURIComponent(currentFaceMetricsText)}`;
                window.open(url, '_blank');
            });
        }
        if (faceCopyReportBtn) {
            faceCopyReportBtn.addEventListener('click', () => {
                if (!currentFaceMetricsText) return;
                navigator.clipboard.writeText(currentFaceMetricsText).then(() => {
                    alert('📋 顔測定結果テキストをコピーしました！\nLINEや他のSNSにそのまま貼り付けられます。');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        }
        if (faceShareInternalBtn) {
            faceShareInternalBtn.addEventListener('click', () => {
                switchTab('community');
                alert('💬 コミュニティへ移動しました。\n最新のデータが添付されていますので、このまま「相談・共有を投稿」ボタンを押して投稿できます！');
            });
        }
    }, 100);

    function showPostureReportCard(metrics) {
        const reportCard = document.getElementById('postureReportCard');
        const faceCard = document.getElementById('faceReportCard');
        const gradeBadge = document.getElementById('reportGrade');
        const wbVal = document.getElementById('reportWbVal');
        const tiltVal = document.getElementById('reportTiltVal');
        const swayVal = document.getElementById('reportSwayVal');
        if (!reportCard || !gradeBadge || !wbVal || !tiltVal || !swayVal) return;

        // Hide face card, show posture card
        if (faceCard) faceCard.style.display = 'none';

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

        // Special check: Face rPPG dynamic ads
        if (metrics.mode === 'face_rppg') {
            // Style matches the portal vertical
            const isHealthMode = (currentVertical === 'health' || currentVertical === 'sports');
            
            if (isHealthMode) {
                container.classList.add('matching-sway'); // Cyan theme styling matching health
                const hrv = metrics.hrvIndex || 38;
                
                if (hrv < 25) {
                    adHtml = `
                        <div class="ad-matched-box">
                            <span class="matched-pill sway" style="background:rgba(0,191,255,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">自律神経ストレス連動 (HRV: ${hrv} ms)</span>
                            <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1511367461989-f85a21fda168?auto=format&fit=crop&q=80&w=400');"></div>
                            <div class="ad-title">大塚製薬 ネイチャーメイド GABA + ビタミンB群</div>
                            <div class="ad-desc">検出された高ストレス・自律神経負荷（心拍変動 ${hrv}ms）に対応。副交感神経の働きを内側からサポートし、疲労回復と上質な睡眠を促します。</div>
                            <div class="ad-product-price">
                                <span class="orig">¥1,850</span>
                                <span class="promo">¥1,480 (20% OFF)</span>
                            </div>
                            <button class="ad-btn" onclick="alert('公式ストアへ遷移します！ストレス軽減モニタークーポン【GABA20】適用済')">特別クーポンで購入する</button>
                        </div>
                    `;
                } else {
                    adHtml = `
                        <div class="ad-matched-box">
                            <span class="matched-pill sway" style="background:rgba(0,191,255,0.08); border-color:var(--accent-blue); color:var(--accent-blue);">自律神経コンディション良好 (HRV: ${hrv} ms)</span>
                            <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300');"></div>
                            <div class="ad-title">明治 VAAM スマートフィットウォーター</div>
                            <div class="ad-desc">良好な自律神経バランス状態での脂肪燃焼効率をさらに最大化。独自のアミノ酸（ARF）配合で、有酸素運動時の持久力と基礎代謝を向上させます。</div>
                            <div class="ad-product-price">
                                <span class="orig">¥2,400</span>
                                <span class="promo">¥1,920 (20% OFF)</span>
                            </div>
                            <button class="ad-btn" onclick="alert('明治VAAM公式ストアへ遷移します！アライメントチェックメンバー優待適用済')">特別優待価格で購入する</button>
                        </div>
                    `;
                }
            } else {
                container.classList.add('matching-tilt'); // Pink border/shadow styling matching beauty
                const target = metrics.targetFaceType;
                const isTeen = (metrics.userAgeSegment === '10');
                
                if (target === 'cute') {
                    if (isTeen) {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">学生向けスクールメイク連動 (毛穴・テカリカバー)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">CANMAKE マシュマロフィニッシュパウダー</div>
                                <div class="ad-desc">中高生に絶大な人気を誇るふんわり肌パウダー。テカリを抑えて自然な毛穴カバーを叶え、スクールメイクにも最適！</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥1,034</span>
                                    <span class="promo">¥930 (学割 10% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('マツモトキヨシ公式オンラインへ遷移します！学生割引クーポン【TEENCUTE】適用済')">学割クーポンで購入する</button>
                            </div>
                        `;
                    } else {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">甘口キュートメイク連動 (丸顔強調)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">ELIXIR メルティシフォンパウダーチーク</div>
                                <div class="ad-desc">丸顔アライメントをふんわり可愛らしく引き立てるピーチピンク。AIメイクガイドラインの位置にのせるだけで自然な血色感に。</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥2,750</span>
                                    <span class="promo">¥2,200 (20% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('資生堂ELIXIR公式ショップへ遷移します！クーポンコード【CUTE20】適用済')">特別クーポンで購入する</button>
                            </div>
                        `;
                    }
                } else if (target === 'cool') {
                    if (isTeen) {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">学生向けプチプラメイク連動 (デカ目シェーディング)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">KATE ダブルラインエキスパート</div>
                                <div class="ad-desc">涙袋の影や二重線をくっきり強調する極薄カラーライナー。デカ目効果＆ハンサムな目元づくりをプチプラで実現。</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥935</span>
                                    <span class="promo">¥840 (学割 10% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('ココカラファイン公式オンラインへ遷移します！学生割引クーポン【TEENCOOL】適用済')">学割クーポンで購入する</button>
                            </div>
                        `;
                    } else {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">クールハンサムメイク連動 (シェーディング)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">KATE 3Dクリエイトコントゥア</div>
                                <div class="ad-desc">頬骨の下やエラ骨格を補正してシャープに引き締める影色。AIのガイド座標に沿ってブラシを滑らせるだけで陰影をコントロール。</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥1,920</span>
                                    <span class="promo">¥1,540 (20% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('KATE公式ショップへ遷移します！クーポンコード【COOL20】適用済')">特別クーポンで購入する</button>
                            </div>
                        `;
                    }
                } else { // elegant
                    if (isTeen) {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">学生向けトレンドリップ連動 (落ちない大人色)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">KATE リップモンスター</div>
                                <div class="ad-desc">落ちにくさと発色の良さでバズり続ける伝説リップ。大人っぽい表情を作る抜け感カラーで、背伸びしたい日のメイクに。</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥1,540</span>
                                    <span class="promo">¥1,380 (学割 10% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('アットコスメショッピングへ遷移します！学生割引クーポン【TEENELEGANT】適用済')">学割クーポンで購入する</button>
                            </div>
                        `;
                    } else {
                        adHtml = `
                            <div class="ad-matched-box">
                                <span class="matched-pill tilt" style="background:rgba(255,20,147,0.08); border-color:var(--accent-pink); color:var(--accent-pink);">エレガント大人顔連動 (ハリ肌美容液)</span>
                                <div class="ad-img-box" style="background-image: url('https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400');"></div>
                                <div class="ad-title">ELIXIR デザインタイムセラム</div>
                                <div class="ad-desc">表情の動きと肌アライメント（ハリ）に着目した先進美容液。顔の血流巡りを整え、リフトアップメイクの効果を引き出します。</div>
                                <div class="ad-product-price">
                                    <span class="orig">¥6,180</span>
                                    <span class="promo">¥4,950 (20% OFF)</span>
                                </div>
                                <button class="ad-btn" style="background:var(--accent-pink); color:#000;" onclick="alert('資生堂ELIXIR公式ショップへ遷移します！クーポンコード【ELEGANT20】適用済')">特別クーポンで購入する</button>
                            </div>
                        `;
                    }
                }
            }
            dynamicAdSpace.innerHTML = adHtml;
            return;
        }

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
                    <button class="ad-btn" onclick="alert('CORE CONNECT限定：クッション of の購入割引ページへ移行します！')">特別コードを適用して購入</button>
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

        initDatabase();
});


// ==========================================================================
// Dynamic Article Feed & Capping System
// ==========================================================================

let articlesDb = null;

// Fallback database declaration (UTF-8 encoded JSON object)
const FALLBACK_DB = {
    "day1": {
        "sports": [
            {
                "sport": "soccer",
                "badge": "サッカー",
                "title": "サッカーにおけるキック時の股関節屈曲可動域とプレースキック精度の相関",
                "p": "キック精度を高めるには、インサイド・インステップそれぞれのインパクト時に骨盤の前傾角度と大腿骨の回旋可動域が理想的な状態にある必要があります。AIカメラで股関節アライメントを測定しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 股関節可動域を測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "baseball",
                "badge": "野球",
                "title": "投球フォームにおける下肢から体幹へのインパルス伝達と「開き」の防止",
                "p": "ステップ脚が接地した際、骨盤の開きが早いと腕の振りだけで投げる「手投げ」になり、肩・肘に過剰な負荷がかかります。踏み出し脚の接地荷重バランスをAIカメラでリアルタイム測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 左右接地荷重を測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "tennis",
                "badge": "テニス",
                "title": "テニスのストロークにおける体幹回旋角度とラケットヘッドスピードの最大化",
                "p": "フォアハンドの打球時に骨盤と肩甲骨の回旋運動が非対称になると、手首（腱鞘炎）や肘（テニス肘）への慢性障害に繋がります。左右の肩甲骨アライメントをスキャンしてスイングバランスを補正しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 スイングアライメントを測定",
                "btn_hook": "launchMeasurement('dyn_overhead')"
            },
            {
                "sport": "basketball",
                "badge": "バスケ",
                "title": "バスケットボールのシュート動作における肘・手関節アライメントとリリース制御",
                "p": "フリースローやスリーポイントの確率を安定させるには、シュートリリース時の肘の伸展角と手首の背屈角が一直線に並ぶアライメントが重要です。AIでシュート腕の角度軌跡を測定しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 シュートアライメントを測定",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "volleyball",
                "badge": "バレー",
                "title": "バレーボールのレシーブ姿勢における膝・股関節アライメントと素早い切り返し",
                "p": "低いレシーブ姿勢をとる際、つま先に対して膝が内側に入る「ニーイン」が生じると、内側側副靭帯を痛めやすくなります。レシーブ構え姿勢における膝の重心アライメントを測定・修正しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 構えアライメントを測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "soccer baseball track",
                "badge": "スポーツ歯科",
                "title": "インパクト時の『奥歯の噛み合わせアライメント』と体幹の瞬発力・筋出力向上",
                "p": "インパクトやダッシュの瞬間、奥歯を正しく噛み合わせる（左右対称アライメント）ことで、三叉神経を介して体幹のインナーマッスルが活性化し、瞬発力が向上します。AIカメラで全身バランスをチェックしましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツ歯科医師 / 噛み合わせアドバイザー",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')"
            }
        ],
        "health": [
            {
                "sport": "stress",
                "badge": "ストレス管理",
                "title": "マインドフルネス瞑想が自律神経（HRV指標）に与える即時的なリラックス効果",
                "p": "3分間の呼吸瞑想は、副交感神経を高め、心拍変動の指標であるRMSSD値を上昇させることが科学的に実証されています。カメラに顔をかざし、あなたの瞑想前後の自律神経バランス変化をスキャンしてみましょう。",
                "time": "⏱️ 所要時間: 30秒スキャン",
                "author": "✍️ 自律神経ヘルスアドバイザー",
                "btn_text": "📸 自律神経ストレス測定を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "sleep",
                "badge": "睡眠科学",
                "title": "スマートデバイスで観測する「深い睡眠（徐波睡眠）」を増やすための体温アプローチ",
                "p": "入浴によって一時的に深部体温を上げ、その後の急激な低下を利用することで入眠直後のノンレム睡眠を深くすることができます。睡眠の質の向上と、日々のバイタル（安静時脈拍）の関連をチェックしましょう。",
                "time": "⏱️ 所要時間: 1分",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 安静時心拍・HRVを測定",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "nutrition",
                "badge": "栄養医学",
                "title": "血管老化を防ぐ「抗糖化（AGEs）食事法」と末梢血管血流の健康的な維持",
                "p": "過剰な糖質摂取は血管のコラーゲンと結合し、血管壁を硬くします。緑黄色野菜の摂取や低GI食品の選択が、末梢血管の弾力性と良好な血流に与える影響。rPPGによる顔面血流解析とバイタル数値を測定します。",
                "time": "⏱️ 所要時間: 30秒スキャン",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 血管血流巡りチェックを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "pain",
                "badge": "肩こり予防",
                "title": "デスクワークによる「いかり肩・巻き肩」を解消する肩甲挙筋リリース法",
                "p": "肩甲骨が外側に開き、前方に倒れ込むアライメントは慢性肩こりの元凶です。正面および側面のアライメント角度をAIで判定し、緊張した肩まわりをニュートラルに整えるセルフケアを指導します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 肩ラインアライメント測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "check",
                "badge": "重心チェック",
                "title": "閉眼片脚立ちテストで測定する「前庭感覚と身体バランス」のエイジングケア",
                "p": "目をつぶった状態での片脚立ちは、内耳の前庭系や足裏の固有受容感覚の若々しさを測る鏡です。AIで片脚立ち時の体幹ブレ軌跡を可視化し、バランスアライメントの弱点を克服しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 バランス動揺性をAI測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "sleep stress",
                "badge": "睡眠歯科",
                "title": "睡眠中の『歯ぎしり（ブラキシズム）』が自律神経（HRV）に与える悪影響とセルフケア",
                "p": "就寝中の無意識の歯ぎしりは、交感神経を異常に高め、深い睡眠を阻害して翌朝の疲労感に直結します。非接触バイタルチェックで、睡眠の質（自律神経バランス）をスキャン測定してみましょう。",
                "time": "⏱️ 所要時間: 30秒固定",
                "author": "✍️ 歯科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 自律神経ストレス測定を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            }
        ],
        "beauty": [
            {
                "sport": "makeup",
                "badge": "顔タイプメイク",
                "title": "逆三角形顔・ベース型さんのためのシャープさを和らげるチーク位置の黄金比率",
                "p": "シャープな顎ラインの逆三角形顔や、知的なベース型さんは、チークを丸くふんわり入れることで優しくフェミニンな印象を作れます。AI顔特徴トラッキングで、あなたの顔型に合わせた最適メイク位置をガイドマップで確認しましょう。",
                "time": "⏱️ 所要時間: 2分",
                "author": "✍️ メイクアップインストラクター",
                "btn_text": "📸 顔アライメント診断を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "cosmetics",
                "badge": "プチプラコスメ",
                "title": "【CEZANNE・CANMAKE】800円以下で叶う崩れにくい「毛穴レス・陶器肌」ベース作り",
                "p": "セザンヌやキャンメイクなどの名品プチプラ下地とパウダーのみを使い、マスクでもヨレない透明感のあるベースメイクを解説。骨格診断と血流測定結果に基づき、あなたのお肌に最適なスキンケア・下地選びをおすすめします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍ ️ ビューティ＆骨格アドバイザー",
                "btn_text": "📸 お肌の血色＆骨格診断を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "hairstyle",
                "badge": "前髪デザイン",
                "title": "【顔アライメント比較】「シースルー vs 重め前髪」あなたに似合う額の露出バランス",
                "p": "額の広さと眉から顎までの縦横比バランスによって、似合う前髪の「抜け感」は決まります。正面カメラで顔のパーツ配置をトラッキングし、最も小顔に見える前髪デザインをシミュレーションします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ビューティ＆骨格アドバイザー",
                "btn_text": "📸 似合う髪型アライメントを測定",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "styling",
                "badge": "スクールメイク",
                "title": "【スクールメイク】リップクリーム感覚でうるおう、学校で絶対に浮かない「血色粘膜リップ」の選び方",
                "p": "ティントや口紅は校則で禁止されていても、ほんのり血色感をプラスする粘膜色リップなら自然で健康的な美しさを演出できます。カメラ測定から、あなたの唇の本来の血色度合い（冷えやくすみ）を血流スキャンして判定します。",
                "time": "⏱️ 所要時間: 2分",
                "author": "✍️ ビューティAIアドバイザー",
                "btn_text": "📸 リップ血色スキャンを起動する",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "bodymake",
                "badge": "ウエスト引き締め",
                "title": "反り腰からくるぽっこりお腹を解消する「ドローイン（腹圧）」骨格ケア",
                "p": "いくらダイエットしても下腹が出るのは、骨盤の前傾により腹直筋が引き伸ばされ緩んでいるからです。寝た状態での呼吸骨格バランスを測定し、インナーマッスルを呼び覚ますトレーニングを実践しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 姿勢・カイロプラクティックガイド",
                "btn_text": "📸 骨盤アライメント測定を起動",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "makeup bodymake",
                "badge": "デンタル美容",
                "title": "『舌の位置（ミューイング）』で変わる！顎ラインの引き締めと二重顎の根本解消",
                "p": "舌の先端が上顎の裏に正しく密着（舌アライメント）していないと、顎下の筋肉が弛緩し二重顎の原因になります。正面カメラで顔の468特徴点を測定し、フェイスラインの対称性と顎位置を評価しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 歯科医師 / ビューティAIアドバイザー",
                "btn_text": "📸 顔アライメント診断を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            }
        ]
    },
    "day2": {
        "sports": [
            {
                "sport": "soccer",
                "badge": "サッカー",
                "title": "サッカーのヘディング動作における頸部アライメントと脳震盪（ concussion ）リスク軽減",
                "p": "ヘディング時に首が前に出ていると、衝撃圧を分散できず頸椎や脳に強いダメージが伝わります。側面アライメントスキャンで、頸椎がニュートラルに固定された正しい打点フォームを確立しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')"
            },
            {
                "sport": "baseball",
                "badge": "野球",
                "title": "打撃における骨盤の回旋スピードとフォロースルー時の足首アライメントの安定性",
                "p": "バッティングスイング時に、インパクト後の後足の骨盤連動と、前足首の過回外（外側への逃げ）を防ぐ接地バランス。AIカメラで打撃姿勢における左右荷重を測定・可視化しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 スイング荷重バランスを測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "tennis",
                "badge": "テニス",
                "title": "テニスにおけるフットワーク動作と足首アーチ低下（扁平足）による膝への影響",
                "p": "クレーやハードコートで素早くストップ＆ゴーを繰り返す際、足部アーチがつぶれていると膝が内側に入り半月板を痛めます。片脚立ちアライメント測定で、膝関節ブレを検知・補正しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 接地安定アライメントを測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "basketball",
                "badge": "バスケ",
                "title": "バスケットボールのディフェンススライドステップにおける質量中心（COM）の制御",
                "p": "オフェンスの揺さぶりに素早く反応するためには、股関節を深く曲げて重心（COM）を一定の高さに維持したまま水平移動する必要があります。ディフェンス姿勢の骨盤高をスキャン測定しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 動作姿勢アライメントを測定",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "volleyball",
                "badge": "バレー",
                "title": "バレーボールのブロックジャンプ時の着地アライメントと足首捻挫の慢性化防止",
                "p": "ブロック後の着地時に他選手の足を踏まないための制御力と、自身の距骨下関節のアライメント安定性が捻挫予防に繋がります。着地時の骨盤のブレと左右対称バランスを測定評価します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 着地バランスアライメント測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "soccer baseball",
                "badge": "スポーツ歯科",
                "title": "カスタムマウスガードの噛み合わせ角度が頭部重心ブレとアジリティ速度に与える影響",
                "p": "噛み合わせのわずかな左右差は、頸部筋肉の緊張の非対称性を生み、ダッシュ時の頭部のブレを引き起こします。アライメントを測定し、最適なマウスガード調整に繋げましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツ歯科医師 / 噛み合わせアドバイザー",
                "btn_text": "📸 動作アライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            }
        ],
        "health": [
            {
                "sport": "stress",
                "badge": "ストレス管理",
                "title": "慢性的な精神ストレスによる血管の収縮とrPPGによる顔面皮膚血流温度の低下",
                "p": "ストレスを受けると交感神経が緊張し、顔面や末梢の血管が細く収縮して冷え（血流低下）をもたらします。AI血管血流測定を使い、あなたの日常のストレスによる血流変化を科学的にセルフスキャンします。",
                "time": "⏱️ 所要時間: 30秒スキャン",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 ストレス血流スキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "sleep",
                "badge": "睡眠科学",
                "title": "睡眠負債が招く自律神経RMSSD値の低下と血中バイタルバランスの長期悪化",
                "p": "睡眠不足（6時間未満）が続くと、心臓の鼓動リズムのゆらぎ（HRV）が低下し、慢性疲労状態から高血圧リスクが高まります。カメラでのバイタルスキャンを活用し、あなたの自律神経の回復力を毎日記録しましょう。",
                "time": "⏱️ 所要時間: 30秒固定",
                "author": "✍️ 自律神経ヘルスアドバイザー",
                "btn_text": "📸 自律神経チェックを起動する",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "nutrition",
                "badge": "栄養医学",
                "title": "鉄分不足による「かくれ貧血（フェリチン低下）」と日中の倦怠感・末梢冷え",
                "p": "血液中のヘモグロビン値が正常でも、貯蔵鉄（フェリチン）が枯渇していると細胞内の酸素不足が起き、手足が冷えて頭痛が起きます。血流巡りのチェックから、鉄分補給メニューと体質アプローチを提案します。",
                "time": "⏱️ 所要時間: 2分",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 血流巡りセルフスキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "pain",
                "badge": "腰痛対策",
                "title": "骨盤前傾（反り腰）に起因する「脊柱起立筋」の過緊張と腰椎圧迫のセルフ解消法",
                "p": "ヒールの高い靴や長時間の立位によって骨盤が過度に前傾すると、背中の筋肉が常に収縮して腰椎に負担をかけます。側面アライメント（骨盤の傾き角）をAIスキャンし、背中を緩める筋膜ケアをお伝えします。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 骨盤傾きアライメントを測定",
                "btn_hook": "launchMeasurement('l_side')"
            },
            {
                "sport": "check",
                "badge": "体力測定",
                "title": "【自宅で簡単】30秒椅子立ち上がりテストによる「サルコペニア（筋力低下）」早期検知",
                "p": "30秒間で椅子から何回立ち上がれるかは、下肢筋力（大腿四頭筋）の若々しさを示す強力なバイオマーカーです。AIカメラによる姿勢モーション検出で、自宅で安全に下肢体力を評価しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 立ち上がり筋力をAI測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "stress check",
                "badge": "口腔ヘルス",
                "title": "『口呼吸』から『鼻呼吸』へのアライメント改善がもたらす自律神経の安定と免疫向上",
                "p": "口呼吸は口腔内を乾燥させ、自律神経の乱れや風邪の原因になります。舌の位置を正して鼻呼吸アライメントを促すことで、安静時の脈拍や心拍変動（HRV）を良好な状態へ整えましょう。",
                "time": "⏱️ 所要時間: 30秒固定",
                "author": "✍️ 歯科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 静的バイタルスキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            }
        ],
        "beauty": [
            {
                "sport": "makeup",
                "badge": "骨格別メイク",
                "title": "面長さん必見！顔の縦ラインを縮めて見せる「下まぶた強調」アイメイクマジック",
                "p": "額や中顔面（目から口まで）が長い面長さんは、下まぶたに涙袋や影を描くことで、目線が下がり顔の余白を減らせます。AI顔特徴トラッキングで顔の縦横比を精密にスキャンし、あなたの面長補正メイクをナビゲーションします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ メイクアップインストラクター",
                "btn_text": "📸 顔立ち比率スキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "cosmetics",
                "badge": "プチプラコスメ",
                "title": "【KATE・CANMAKE】1,000円以下でつくる「自然な涙袋＆うるみ目」最新メイク術",
                "p": "ケイトのダブルラインエキスパートやキャンメイクの涙袋用ペンシルなどを使い、派手すぎず自然なぷっくり涙袋を作るステップ。測定された顔の肌トーンに合わせて、最適なアイシャドウの色味をご提案します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ ビューティ＆骨格アドバイザー",
                "btn_text": "📸 メイク連動コスメ提案を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "hairstyle",
                "badge": "ヘアスタイル",
                "title": "丸顔をすっきりカバーする！「前髪センターパート ＆ サイドレイヤー」の相乗効果",
                "p": "丸顔さんの柔らかい輪郭には、前髪を中央で分けておでこを見せることで縦長効果が得られます。サイドの髪を顎ラインに優しく沿わせることでさらにすっきり。AI輪郭判定のデータから似合う髪型を比較・評価します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ヘアビューティ＆骨格アドバイザー",
                "btn_text": "📸 輪郭アライメント髪型判定",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "styling",
                "badge": "スクールメイク",
                "title": "【スクールメイク】校則OK！テカり・油分を抑えて透明感を保つ「ノーカラー皮脂崩れ防止パウダー」活用術",
                "p": "学校生活でニキビや毛穴のテカリが気になる方に。白浮きせずすっぴんのように見せるノーカラーのクリアパウダー（キャンメイクやセザンヌなど）の使い方。肌の血流・コンディションを測定してアドバイスします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ビューティアドバイザー",
                "btn_text": "📸 肌血流診断を起動する",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "bodymake",
                "badge": "美尻・脚長",
                "title": "骨格ウェーブさんの「下半身太り・大転子の張り」を解消する美ヒップ骨格ワーク",
                "p": "骨格ウェーブ特有の下半身ボリュームは、股関節のねじれ（大転子の張り出し）が影響しています。正面荷重バランスをAIでチェックし、中臀筋と骨盤のアライメントを整えるヒップアップエクササイズを紹介します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ ビューティ＆骨格アドバイザー",
                "btn_text": "📸 下半身アライメントを測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "makeup hairstyle",
                "badge": "デンタル美容",
                "title": "顎関節症（TMD）と左右の咀嚼筋バランスの偏りが引き起こすフェイスラインの左右非対称",
                "p": "片側ばかりで噛む習慣や顎関節の歪みは、咬筋の太さに左右差を生み、顔全体の非対称性を強調します。AIカメラで顔の対称性を測定し、筋肉バランスを整えるストレッチ法をマスターしましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 歯科医師 / フェイシャルアドバイザー",
                "btn_text": "📸 AI顔アライメント測定を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            }
        ]
    },
    "day3": {
        "sports": [
            {
                "sport": "soccer",
                "badge": "サッカー",
                "title": "サッカーにおける高速ダッシュ・方向転換（アジリティ）と足底接地アライメントの関連",
                "p": "ドリブル時や急激なカッティング時のステップ安定は、足裏の3つのアーチが正しく機能しているかにかかっています。AIで着地動作時の膝と足首の角度ブレを測定し、怪我のリスクを低減させましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 ステップアライメントを測定",
                "btn_hook": "launchMeasurement('dyn_overhead')"
            },
            {
                "sport": "baseball",
                "badge": "野球",
                "title": "走塁（ベースランニング）におけるコーナリング姿勢と重心バランスの最適化",
                "p": "一塁から二塁を回る際、インコースを鋭く回るには体幹を大きく内側に傾けて遠心力に対抗する必要があります。AI骨格スキャンで、効率的なコーナリングランの重心傾きアライメントを測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 重心アライメントを測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "tennis",
                "badge": "テニス",
                "title": "テニスのバックハンドにおける左右肩関節アライメントとリーチの最大化",
                "p": "両手バックハンドでは左右の肩甲骨が対称に動かないと、利き腕に頼りすぎて打点が不安定になります。スイング時の肩水平度と骨盤のアライメント角をスキャン測定し、スイング軸を安定させましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 肩ラインアライメントを測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "basketball",
                "badge": "バスケ",
                "title": "バスケットボールのジャンプシュートにおける空中ボディ・アライメントと空中安定性",
                "p": "ブロックを交わしながらシュートを射抜くには、ジャンプの最高到達点で体幹軸が垂直（アライメント）に維持されている必要があります。ジャンプ時における体幹ブレ角をAI測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツトレーナー / コンディショニングコーチ",
                "btn_text": "📸 ジャンプ姿勢を測定する",
                "btn_hook": "launchMeasurement('dyn_overhead')"
            },
            {
                "sport": "volleyball",
                "badge": "バレー",
                "title": "バレーボールのトスアップ（セッター）における肩甲帯アライメントとトス精度",
                "p": "安定したトスを上げるには、両肘・両肩の水平度と、指先に力を伝えるための背骨（胸椎）アライメントの柔軟性が重要です。トスアップ準備姿勢の肩ライン左右対称バランスを測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 トスアライメントを測定する",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "soccer volleyball",
                "badge": "スポーツ歯科",
                "title": "コンタクトスポーツにおける噛み合わせ圧アライメントと頸部外傷（脳震盪）予防効果",
                "p": "ラグビーやサッカーでの衝突の瞬間、しっかり顎を固定（噛み合わせアライメント）することで、衝撃が首から脳に伝わるのを大幅に軽減します。骨格と重心バランスの安定度を測定しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツ歯科医師",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')"
            }
        ],
        "health": [
            {
                "sport": "stress",
                "badge": "ストレス管理",
                "title": "朝日の光浴と体内時計のリセットによる自律神経（交感神経）の健康的な始動",
                "p": "起床後すぐに日光を浴びることで、セロトニン分泌が活性化し日中の交感神経アライメントが整います。一日のストレス耐性を生み出す自律神経スキャンと、脈拍リズム変化を記録して体調管理を行いましょう。",
                "time": "⏱️ 所要時間: 30秒固定",
                "author": "✍️ 自律神経ヘルスアドバイザー",
                "btn_text": "📸 自律神経脈拍スキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "sleep",
                "badge": "睡眠姿勢",
                "title": "ストレートネック（スマホ首）を悪化させない理想的な「枕の高さ」アライメント",
                "p": "枕が高すぎると就寝中も常に頸椎が曲がった状態になり、首や肩甲骨周囲の筋肉が凝って中途覚醒の原因になります。側面アライメント角をAI測定し、正しい寝返り高さを判定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 首・側面アライメント測定",
                "btn_hook": "launchMeasurement('l_side')"
            },
            {
                "sport": "nutrition",
                "badge": "食生活改善",
                "title": "【腸内環境と疲労】「水溶性食物繊維」による短鎖脂肪酸産生と全身血流の巡り向上",
                "p": "腸内環境が整うと自律神経が安定し、全身の血流状態（rPPGなどで測定する皮膚表面血流循環）が劇的に改善します。腸活食生活と日々の血管血流コンディションの関連を、非接触で測定しましょう。",
                "time": "⏱️ 所要時間: 30秒スキャン",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 自律神経血流スキャンを起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "pain",
                "badge": "腰痛・姿勢",
                "title": "【前屈ストレッチ】骨盤前傾不足（ハムストリングスの硬さ）による腰痛の改善",
                "p": "前屈時に背中ばかりが曲がり骨盤が起きないのは、ハムストリングスが硬いためです。これが前屈動作時の腰椎に過剰なせん断力をかけます。AIで前屈動作のアライメント推移を測定しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 動作アライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')"
            },
            {
                "sport": "check",
                "badge": "左右バランス",
                "title": "【セルフチェック】日常生活の「片寄った座り方・立ち方」を検出する骨格アライメントスキャン",
                "p": "気づかないうちに足を組んだり、片側に荷重をかけて立つクセは、骨盤の傾きを生み、全身の関節負荷を歪ませます。AIカメラによる正面荷重・姿勢アライメント判定で、あなたの日常バランス度を測定しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 左右荷重アライメント測定",
                "btn_hook": "launchMeasurement('front')"
            },
            {
                "sport": "sleep pain",
                "badge": "口腔ヘルス",
                "title": "朝の口の渇き・偏頭痛を防ぐ：就寝時における「顎関節ニュートラル位置」の作り方",
                "p": "寝ている間に顎が後退したり口が開いたりすると、睡眠時無呼吸のリスクが高まり偏頭痛の原因になります。寝姿勢の背骨アライメントと顎の位置関係を把握し、健康な朝を迎えましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 歯科医師",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')"
            }
        ],
        "beauty": [
            {
                "sport": "makeup",
                "badge": "メイクテク",
                "title": "丸顔さんのフェイスラインを引き締める「3の字シェーディング」立体アプローチ",
                "p": "丸顔さんの輪郭をシャープに見せるには、こめかみ・頬骨下・エラにかけて数字の「3」を描くようにブロンザーを入れるのが鉄則です。AI顔特徴トラッキングで、あなたの輪郭タイプに最もなじむシェーディングラインを描画ガイドします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ メイクアップインストラクター",
                "btn_text": "📸 顔輪郭アライメント診断起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "cosmetics",
                "badge": "プチプラコスメ",
                "title": "【KATE・CEZANNE】800円以下で作る、にじまない＆自然な「眉メイク・アイブロウ」立体キープ法",
                "p": "ケイトのデザイニングアイブロウやセザンヌの超細芯ペンシルなどを使い、左右対称で美しい眉ラインをキープするテクニック。AI骨格スキャンで、あなたの左右の眉山バランスのズレをチェックし補正します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ビューティ＆骨格アドバイザー",
                "btn_text": "📸 左右眉毛アライメント診断",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "hairstyle",
                "badge": "ヘアスタイル",
                "title": "【面長タイプ向け】横顔美人に変身する「ふんわりひし形シルエット」と「顔周りウェーブ」",
                "p": "面長さんを小顔に見せるヘアスタイルの鍵は、サイドにボリュームを持たせた「ひし形」シルエットの形成です。正面カメラで髪を含めた顔全体のシルエットラインをトラッキングし、最適なフォルムを評価します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ヘアビューティ＆骨格アドバイザー",
                "btn_text": "📸 輪郭ヘアアライメントを測定",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "styling",
                "badge": "スクールメイク",
                "title": "【スクールメイク】ノーファンデで肌トーンUP！学校でばれない「UVカラーコントロール下地（グリーン vs ピンク）」活用法",
                "p": "ニキビ跡や赤みが気になるならグリーン、血色感を出したいならピンク。ファンデーションを使わず透明感のある肌をつくるコントロール下地の選び方。お肌の本来の明るさと赤みを血流測定で判定し提案します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ ビューティアドバイザー",
                "btn_text": "📸 肌コンディション測定を起動",
                "btn_hook": "launchMeasurement('face_rppg')"
            },
            {
                "sport": "bodymake",
                "badge": "くびれ・肋骨",
                "title": "骨格ストレートさん特有の「アンダーバストの厚み」を解消する姿勢リフレッシュストレッチ",
                "p": "骨格ストレートの方は上半身に厚みが出やすく、猫背アライメントになるとさらにウエストが寸胴に見えてしまいます。背中（胸椎）を真っ直ぐ伸ばし、デコルテとウエストをすっきり見せる美姿勢ストレッチを紹介します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 姿勢・カイロプラクティックガイド",
                "btn_text": "📸 側面姿勢アライメント測定",
                "btn_hook": "launchMeasurement('l_side')"
            },
            {
                "sport": "makeup bodymake",
                "badge": "デンタル美容",
                "title": "『歯並び・噛み合わせアライメント』が頭部の前後傾斜（スマホ首）に与える姿勢影響",
                "p": "不正咬合（噛み合わせの歪み）は、頭頸部の筋肉を引っ張り、ストレートネックを悪化させる一因になります。側面姿勢スキャンと口腔ケアの連携で、根本からの美姿勢アライメントを目指します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 姿勢改善アドバイザー",
                "btn_text": "📸 側面姿勢アライメント測定",
                "btn_hook": "launchMeasurement('l_side')"
            }
        ]
    },
    "day4": {
        "sports": [
            {
                "sport": "tennis",
                "badge": "スポーツ",
                "title": "テニスのサービス動作における肩甲骨可動域とトスアップアライメント",
                "p": "トスアップ時の肩関節外旋と、インパクトまでの肩甲骨上方回旋アライメントの安定性。AI姿勢追跡でサーブフォームの左右のバランスのズレをチェックしましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 サーブアライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1595435934249-5df7ed86e1c0"
            },
            {
                "sport": "basketball",
                "badge": "スポーツ",
                "title": "バスケットボールのリバウンド動作における足関節底屈力とジャンプ着地安定性",
                "p": "空中戦を制する跳躍時におけるインナーマッスルと骨盤アライメントの連動。AIカメラにより、ジャンプ直前と着地直後の足首の傾きとブレを可視化・分析します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 ジャンプアライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1546519638-68e109498ffc"
            },
            {
                "sport": "track",
                "badge": "スポーツ",
                "title": "陸上スプリントにおける骨盤の前傾角度と股関節伸展アライメントの関係",
                "p": "スタートダッシュから中間疾走にかけての推進力を最大化する股関節可動域。AI姿勢分析を用いて前傾姿勢時の骨盤角度と膝関節・足首の連動バランスをチェックします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツトレーナー",
                "btn_text": "📸 スプリントアライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1476480862126-209bfaa8edc8"
            },
            {
                "sport": "soccer",
                "badge": "スポーツ",
                "title": "サッカーのヘディング動作における頸椎安定性と体幹連動アライメント",
                "p": "空中戦での強さと正確なミートを生み出すための、首元から体幹にかけての筋力連動アライメント。姿勢測定機能を用いて、軸ブレのないヘディング姿勢を可視化します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツドクター / 理学療法士",
                "btn_text": "📸 体幹アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1551958219-acbc608c6377"
            },
            {
                "sport": "soccer baseball check",
                "badge": "スポーツ歯科",
                "title": "スポーツ歯科と競技パフォーマンス：カスタムマウスガードがもたらす重心アライメントの安定",
                "p": "瞬発力やパワーを発揮する際の一瞬の食いしばりと、首・肩の筋肉緊張アライメントの関係。奥歯の噛み込み圧が頭部重心バランスを整え、測定エラーを低減します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / スポーツデンタルアドバイザー",
                "btn_text": "📸 噛み込み圧アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516738901171-8eb4fc13bd20"
            }
        ],
        "health": [
            {
                "sport": "nutrition",
                "badge": "健康チェック",
                "title": "自律神経調整と食事アライメント：腸内環境を整える発酵食品と食物繊維のミネラル摂取",
                "p": "腸内フローラの乱れと自律神経（交感神経・副交感神経）のバランス異常。栄養食事アプローチによる内臓血流循環の活性化と、非接触カメラによる血流変化の測定方法。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 管理栄養士 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 血流循環アライメントを測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1490645935967-10de6ba17061"
            },
            {
                "sport": "sleep check",
                "badge": "睡眠歯科",
                "title": "睡眠時無呼吸症候群と口腔環境：いびき防止マウスピースによる睡眠アライメントの改善",
                "p": "就寝中の舌根沈下と気道の狭窄を防ぐ下顎前方誘導（スリープスプリント）の効果。呼吸アライメントを整えることで、心肺負担を軽減し睡眠効率を劇的に向上させます。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 睡眠認定医",
                "btn_text": "📸 睡眠アライメントをチェックする",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1506126613408-eca07ce68773"
            },
            {
                "sport": "check",
                "badge": "健康チェック",
                "title": "呼吸機能と胸郭拡張性：AIカメラで見る安静時心拍数と呼吸アライメントの乱れ",
                "p": "浅い呼吸や口呼吸が招く酸素摂取効率の低下と、自律神経バランスの乱れ。AI姿勢追跡を用いて息を吸った際の胸郭の広がりと肩の挙上アライメントを測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 内科医師 / 呼吸器専門アドバイザー",
                "btn_text": "📸 呼吸アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1505751172876-fa1923c5c528"
            },
            {
                "sport": "stress",
                "badge": "健康チェック",
                "title": "日常のストレス要因と自律神経バランス：心拍変動（HRV）を用いた非接触バイタルチェックの活用",
                "p": "心理的ストレス下で活発化する交感神経の緊張度と末梢毛細血管の血流変化。AI顔骨格追跡による10秒間の非接触rPPG血流測定を用いてストレス指数をチェックします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 臨床心理士 / ストレスマネジメント指導員",
                "btn_text": "📸 自律神経ストレス測定",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1544367567-0f2fcb009e0b"
            },
            {
                "sport": "check",
                "badge": "健康チェック",
                "title": "骨密度維持に向けた荷重アライメント：微細振動刺激が骨芽細胞に与える生理学的アプローチ",
                "p": "骨粗鬆症予防において重要となる重力負荷の方向と左右骨盤の対称性。AI重心アライメント測定により、日常生活における左右均等な接地荷重バランスをチェックします。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 整形外科医師",
                "btn_text": "📸 荷重アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1505751172876-fa1923c5c528"
            }
        ],
        "beauty": [
            {
                "sport": "bodymake",
                "badge": "美容骨格",
                "title": "美ボディラインをつくる骨盤の前傾・後傾アライメント：ヒップアップのための臀筋アプローチ",
                "p": "反り腰（骨盤前傾）や猫背（骨盤後傾）がもたらす下半身太りの根本原因。AI側面アライメント測定で、耳・肩・大転子・外くるぶしを通る直線バランスを可視化します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ ビューティボディメイクアドバイザー",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1518310383802-640c2de311b2"
            },
            {
                "sport": "makeup",
                "badge": "デンタル美容",
                "title": "小顔アライメントと噛み合わせ：咀嚼筋（咬筋）の左右アンバランスと顔面非対称の根本ケア",
                "p": "片噛み習慣や噛み合わせ不良がもたらす左右の口角の高さのズレとエラ張り。AI顔アライメント認識を用いて、顎関節の位置と顔の対称バランスを測定・分析します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 美容口腔アドバイザー",
                "btn_text": "📸 顔骨格アライメントを測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            },
            {
                "sport": "bodymake",
                "badge": "美容骨格",
                "title": "デコルテラインを整える肩甲骨の「内転」アライメントと巻き肩改善姿勢メイク",
                "p": "肩が前方に入り込む「巻き肩」によるデコルテの痩せやバストラインの乱れ。AIアライメント分析を用いて、肩甲骨の間隔と胸郭の垂直バランスを測定・可視化します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 美容カイロプラクター",
                "btn_text": "📸 デコルテアライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1518310383802-640c2de311b2"
            },
            {
                "sport": "cosmetics",
                "badge": "美容骨格",
                "title": "美肌と血流循環アライメント：rPPGカメラ測定でわかる毛細血管の血流状況とターンオーバー効果",
                "p": "自律神経の乱れから起こるお肌の血流低下・くすみ・乾燥。AIカメラの非接触rPPG血流分析により、フェイスゾーンの末梢血管の活動状況と肌ストレス状態を測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ メイク＆スキンケアアドバイザー",
                "btn_text": "📸 肌ストレス・血流を測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1596462502278-27bfdc403348"
            },
            {
                "sport": "bodymake",
                "badge": "美容骨格",
                "title": "美脚を目指すO脚アライメント補正：大腿四頭筋と内転筋群のバランス姿勢メイク",
                "p": "膝が外に逃げるO脚変形がもたらす太ももの横張りと足首のゆがみ。AI正面重心測定により、足裏から骨盤へ突き上げる荷重アライメントのブレを可視化します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ ビューティボディメイクアドバイザー",
                "btn_text": "📸 美脚アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1515886657613-9f3515b0c78f"
            }
        ]
    },
    "day5": {
        "sports": [
            {
                "sport": "baseball",
                "badge": "スポーツ",
                "title": "野球の捕球・スローイング動作における股関節の割れと骨盤アライメント",
                "p": "内野手の捕球から送球への一連の動作において安定性を生む「股関節の割れ」。AI動作認識を用いて前屈姿勢時の骨盤平行アライメントと肩のラインのズレを分析します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 送球アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516738901171-8eb4fc13bd20"
            },
            {
                "sport": "volleyball",
                "badge": "スポーツ",
                "title": "バレーボールのトス動作における手首アライメントと指の接地・リリーステクニック",
                "p": "セッターの正確なボールミートに必要となる左右の手首の柔軟性とアライメント。AIスロモーション動作追跡を用いて、トスを上げる瞬間の胸椎と腕のアライメントを測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スポーツトレーナー",
                "btn_text": "📸 トスアライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1612872087720-bb876e2e67d1"
            },
            {
                "sport": "track",
                "badge": "スポーツ",
                "title": "トレイルランニングにおける足元アライメントと不整地での足関節ねじれ予防",
                "p": "山道を駆け抜ける際、足首の過回内（土踏まずの潰れ）を防止するアーチアライメントの効果。AI正面荷重チェックで、左右の不均等な荷重逃げパターンを検証します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士",
                "btn_text": "📸 接地荷重アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1476480862126-209bfaa8edc8"
            },
            {
                "sport": "tennis",
                "badge": "スポーツ",
                "title": "バドミントンのフットワークにおける前足部接地と膝関節の「Knee-in」回避法",
                "p": "シャトルへ飛び込む際の急停止動作で膝が内側に折れる危険な姿勢アライメント。AI動作追跡で膝から足先（つま先）の進行ラインのアライメントブレを測定します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ アスレティックトレーナー",
                "btn_text": "📸 膝アライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1595435934249-5df7ed86e1c0"
            },
            {
                "sport": "swim check",
                "badge": "スポーツ",
                "title": "水泳における骨盤アライメントと水中姿勢（ストリームライン）の流体力学的効果",
                "p": "けのび動作における骨盤の後傾バランスと、腰椎の反り（腰痛予防）アライメント。AI側面姿勢分析を用いて、体幹ラインが水平一直線に維持されているかを測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スポーツ動作研究員",
                "btn_text": "📸 ストリームラインを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1518310383802-640c2de311b2"
            }
        ],
        "health": [
            {
                "sport": "stress check",
                "badge": "口腔ヘルス",
                "title": "歯ぎしり（ブラキシズム）が自律神経に与えるストレス反応と口腔・全身アライメントの歪み",
                "p": "就寝中の過度な食いしばりが招く頭痛、首こり、自律神経（交感神経過緊張）への悪影響。AIカメラによるバイタルストレス測定を用いて、起床時の心拍自律神経をチェックします。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 口腔外科医",
                "btn_text": "📸 自律神経ストレス測定",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1544367567-0f2fcb009e0b"
            },
            {
                "sport": "stress",
                "badge": "健康チェック",
                "title": "眼精疲労と自律神経失調：デスクワーク環境における頭部アライメントと視線入力の改善",
                "p": "ディスプレイを見つめる姿勢から起こるストレートネックと、頸部神経の圧迫による自律神経失調。AI側面アライメント測定により、耳と肩を通る垂直線の位置ズレをチェックします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 自律神経ヘルスアドバイザー",
                "btn_text": "📸 ストレートネック測定",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1544367567-0f2fcb009e0b"
            },
            {
                "sport": "check",
                "badge": "健康チェック",
                "title": "更年期における骨盤重心バランスと体温調節機能の自律神経バイオチェック",
                "p": "骨盤底筋群の低下と骨盤アライメントの不安定化。これが招く自律神経（ホットフラッシュ）症状と体幹バランスの乱れを、AI正面荷重アライメントを用いて測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 婦人科医師",
                "btn_text": "📸 骨盤バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1505751172876-fa1923c5c528"
            },
            {
                "sport": "check stress",
                "badge": "健康チェック",
                "title": "冷え性と血流循環アライメント：rPPG非接触血流測定で見る末梢血管の活動状況",
                "p": "手足の冷えが自律神経の交感神経過緊張（血管収縮）によるものであるかを検証。AI顔カメラを用いた血流波形（rPPG）測定から、顔面部血流動態を10秒でチェックします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 内科医師",
                "btn_text": "📸 末梢血流を測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1505751172876-fa1923c5c528"
            },
            {
                "sport": "nutrition check",
                "badge": "健康チェック",
                "title": "高血圧症予防とアイソメトリック運動における呼吸リズムと動脈硬化アプローチ",
                "p": "筋肉を動かさずに負荷をかけるアイソメトリック（静的）筋トレと、呼吸アライメントの効果。AI姿勢カメラでスクワット姿勢のアライメントバランスを測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 自律神経ヘルスアドバイザー",
                "btn_text": "📸 姿勢アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1490645935967-10de6ba17061"
            }
        ],
        "beauty": [
            {
                "sport": "makeup bodymake",
                "badge": "デンタル美容",
                "title": "ミューイング（Mewing）による舌位置アライメントと美しいフェイスライン・口呼吸の改善",
                "p": "正しい舌の位置（上顎への吸着）が引き締めるフェイスラインと二重顎の根本改善。AI顔骨格分析を用いて、アゴ下のたるみや骨格のゆがみを測定・分析します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 口腔筋機能療法士",
                "btn_text": "📸 舌アライメントをチェックする",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            },
            {
                "sport": "hairstyle",
                "badge": "美容骨格",
                "title": "顔の縦横比アライメントで選ぶ！卵型・丸顔・面長にマッチする小顔ヘアスタイル診断",
                "p": "AI顔アライメント分析を用いて、おでこから眉、鼻下、あご先までの縦比率と横幅の黄金比アライメントを計測。骨格タイプに最も調和する髪型アプローチを提案します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 美容師 / 顔骨格アライメントスタイリスト",
                "btn_text": "📸 顔タイプ骨格を測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1562322140-8baeececf3df"
            },
            {
                "sport": "styling",
                "badge": "美容骨格",
                "title": "骨格ウェーブ・ストレート・ナチュラル別！アライメントを際立たせる春のファッション骨格メイク",
                "p": "鎖骨や腰の位置、関節の目立ちやすさから分類する「3大骨格タイプ」。AIアライメント計測から、あなたの肩幅・骨盤・ヒップの黄金アライメント比率を可視化します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 骨格アライメントスタイリスト",
                "btn_text": "📸 骨格比率アライメントを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1596462502278-27bfdc403348"
            },
            {
                "sport": "bodymake",
                "badge": "美容骨格",
                "title": "ハイヒール歩行時の重心アライメントと骨盤前傾を防ぐ足弓（アーチ）保護トレーニング",
                "p": "ヒールの高さがもたらす重心位置の前方移動と骨盤のアンバランス。AI側面アライメント測定を用いて、正しい「膝立ち姿勢」時の重心垂直線を可視化します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 美容歩行インストラクター",
                "btn_text": "📸 重心アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1515886657613-9f3515b0c78f"
            },
            {
                "sport": "makeup styling",
                "badge": "デンタル美容",
                "title": "顎関節症（TMJ）と顔骨格のゆがみ：咀嚼バランス改善による輪郭の対称性メイク",
                "p": "顎がカクカク鳴る顎関節症と、咀嚼筋の過緊張による骨格バランスの非対称化。AI顔アライメント追跡を用いて、開口動作時のアゴのスライド軌道を測定します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 美容口腔アドバイザー",
                "btn_text": "📸 咀嚼アライメントを測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            }
        ]
    },
    "current_day": "day1",
    "baseline": {
        "sports": [
            {
                "sport": "sports",
                "badge": "外部論文 (米国)",
                "title": "ランニング障害における大臀筋筋力と膝ニーイン動作（Knee Valgus）の相関関係",
                "p": "【AI翻訳抄録】ランナーの膝蓋大腿部痛（PFPS）発症と股関節外転筋力、特に片脚スクワット時のニーイン角度には明確な相関があることが判明。股関節支持力強化による膝ブレ改善効果を裏付ける最新の臨床研究結果です。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 米国スポーツ物理療法学会",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1517649763962-0c623066013b"
            },
            {
                "sport": "sports",
                "badge": "怪我予防",
                "title": "スクワット動作における「ニーイン (Knee Valgus)」の危険性と修正",
                "p": "スクワットや着地動作時に膝が内側に折れ曲がる「ニーイン」は、前十字靭帯（ACL）損傷や膝蓋腱炎の最大の要因です。大臀筋の活動低下や足関節の硬さをAI姿勢追跡でチェックしましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 OHS動作をAIで測定する",
                "btn_hook": "launchMeasurement('dyn_overhead')",
                "img_id": "photo-1571019614242-c5c5dee9f50b"
            },
            {
                "sport": "sports",
                "badge": "アライメント",
                "title": "腰部ストレスを増大させる「スウェイバック姿勢」の臨床メカニズム",
                "p": "骨盤が前方にスライドし、胸椎が後弯するスウェイバック姿勢。このアライメント不良は、腰方形筋の過緊張と仙腸関節の圧縮負担を引き起こします。重力線に対するアライメントを測定しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ トレーナー 佐藤",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1476480862126-209bfaa8edc8"
            },
            {
                "sport": "sports",
                "badge": "パフォーマンス",
                "title": "スイング動作やジャンプの土台：左右荷重均等性（COM）の重要性",
                "p": "ゴルフのスイングやバスケットボールの着地において、身体の質量中心（COM）が左右どちらかに5%以上偏っていると、反対側の腰椎に数倍の代償ストレスが生じます。全身荷重バランスを可視化します。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ コーチ 鈴木",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1535131749006-b7f58c99034b"
            },
            {
                "sport": "sports",
                "badge": "外部論文",
                "title": "変形性膝関節症（Knee OA）における歩行時の荷重線の偏位と力学負荷",
                "p": "【AI翻訳抄録】歩行アライメントにおける内側荷重の増大（膝内反変形）が、大腿骨・脛骨関節軟骨 of の摩耗と骨棘形成を加速させるバイオメカニクス的証拠。初期段階でのアライメント補正インソールの有効性を実証。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 生体力学会誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1506126613408-eca07ce68773"
            },
            {
                "sport": "sports",
                "badge": "投球分析",
                "title": "野球の投球動作における「肩甲骨アライメント」と球速のバイオメカニクス",
                "p": "テイクバックからリリースにかけて、肩甲胸郭関節の動きが制限されると、肩関節のインピンジメントや肘内側側副靭帯の過負荷を引き起こします。投球姿勢におけるアライメント異常をチェックします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ コーチ 鈴木",
                "btn_text": "📸 投球アライメントを測定する",
                "btn_hook": "launchMeasurement('dyn_overhead')",
                "img_id": "photo-1516738901171-8eb4fc13bd20"
            },
            {
                "sport": "sports",
                "badge": "ランニング科学",
                "title": "ランナー必見：ミッドフット着地と接地アライメントの最適化",
                "p": "過度なヒールストライク（踵着地）はブレーキ力を生み、膝関節への衝撃荷重を増大させます。AIカメラによる走動作のアライメント測定から、エネルギー効率が高く怪我の少ない着地姿勢を導き出します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ トレーナー 佐藤",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1476480862126-209bfaa8edc8"
            },
            {
                "sport": "sports",
                "badge": "外部論文",
                "title": "アキレス腱炎（Achilles Tendinopathy）と足関節背屈可動域・回内偏位の相関",
                "p": "【AI翻訳抄録】足関節背屈制限および接地時の過回内（プロネーション）がアキレス腱に非対称な緊張を与え、慢性炎症を引き起こす要因となることを臨床的に解明。インソールによる距骨下関節サポートの効果。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 米国足の外科学会誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1542291026-7eec264c27ff"
            },
            {
                "sport": "sports",
                "badge": "体幹強化",
                "title": "体幹のブレを抑制する：プランク動作時の左右対称アライメントチェック",
                "p": "体幹トレーニングの基本であるプランクですが、肩甲骨の安定性不足や骨盤のねじれが生じていると、効果が半減するどころか腰痛を引き起こします。AIによるアライメント分析で正しいフォームを習得しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 体幹動作をAIで測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1571019614242-c5c5dee9f50b"
            },
            {
                "sport": "soccer baseball check",
                "badge": "スポーツ歯科",
                "title": "競技力向上と噛み合わせ：奥歯の噛み込み圧が瞬発力を生み出すアライメント効果",
                "p": "パワーを発揮する瞬間における噛み合わせ圧と頭部・重心アライメントの連動性。カスタムマウスガードがもたらす体幹の安定効果について解説します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / スポーツデンタルアドバイザー",
                "btn_text": "📸 噛み込み重心を測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516738901171-8eb4fc13bd20"
            }
        ],
        "health": [
            {
                "sport": "health",
                "badge": "ニュース配信",
                "title": "高齢者の転倒・骨折が年々増加、厚生労働省が予防ガイドラインで「身体バランスチェック」の推奨を強化",
                "p": "【記事抜粋】厚生労働省の最新の国民健康調査によると、65歳以上の転倒による骨折件数は過去最高を記録。予防ガイドラインでは、自宅で簡単に行える片脚立ちや立ち上がり測定などの身体重心アライメント評価の重要性が指摘されています。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 厚生労働省広報",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516062423079-7ca13cdc7f5a"
            },
            {
                "sport": "health",
                "badge": "ロコモ予防",
                "title": "健康寿命を延ばす：立ち上がりテスト（CS-30）によるロコモ判定",
                "p": "30秒間の椅子立ち上がりテストは、下肢の運動機能や将来の転倒リスクを測るための国際的な指標です。AIカメラによる姿勢動作追跡で、ご自宅で手軽に運動能力をチェックしてみましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 動作チェックをAIで測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1576091160550-2173dba999ef"
            },
            {
                "sport": "health",
                "badge": "生活習慣",
                "title": "隠れメタボ・内臓下垂を防ぐ「骨盤ニュートラル」の健康効果",
                "p": "骨盤が後傾すると内臓が押し下げられ、下腹部がぽっこり出るだけでなく、消化吸収効率の低下や基礎代謝の悪化を招きます。正しい骨盤アライメント（傾き角）を測定し、生活習慣病を予防しましょう。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 骨盤傾きアライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1506126613408-eca07ce68773"
            },
            {
                "sport": "health",
                "badge": "外部論文",
                "title": "一日の歩数（ステップ数）と安静時心拍数および心血管疾患死リスクの長期的相関",
                "p": "【AI翻訳抄録】数万人のウェアラブルデータを分析した結果、毎日の歩数増加と歩行バランスの安定性が心拍数の安定をもたらし、心筋梗塞や脳卒中の死亡リスクを最大30%低下させることを疫学的に立証。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 米国医師会雑誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516062423079-7ca13cdc7f5a"
            },
            {
                "sport": "health",
                "badge": "姿勢ケア",
                "title": "デスクワーカーの現代病：「スマホ首（ストレートネック）」を予防する胸椎可動性",
                "p": "PC作業中の前かがみ姿勢は、頭部を前方に数センチメートル突出させ、頸椎に最大3倍の静的負荷をかけます。胸椎の丸みを測定し、背骨の生理的弯曲を取り戻すセルフストレッチをアドバイスします。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 内科医師 / 自律神経ヘルスアドバイザー",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1576091160550-2173dba999ef"
            },
            {
                "sport": "health",
                "badge": "外部論文",
                "title": "骨密度（BMD）維持における重力負荷・荷重トレーニングの生理的エビデンス",
                "p": "【AI翻訳抄録】骨芽細胞を刺激し骨形成を促進するには、自重を利用した適度な衝撃荷重（片脚立ちやステップ運動）が必要であることを検証。筋骨格アライメントが歪んでいると力学刺激が不均等になる問題点を指摘。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 国際骨粗鬆症財団",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1506126613408-eca07ce68773"
            },
            {
                "sport": "health",
                "badge": "睡眠姿勢",
                "title": "朝起きたときの腰痛を改善：背骨への負担を減らす「理想の寝姿勢」アライメント",
                "p": "朝起きたときに腰が痛むのは、就寝時の骨盤後傾や背骨のねじれが原因かもしれません。適切な枕の高さや寝姿勢ごとの背骨ニュートラル位置を測定し、良質な睡眠習慣をサポートします。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1506126613408-eca07ce68773"
            },
            {
                "sport": "health",
                "badge": "外部論文",
                "title": "高血圧症におけるアイソメトリック（等尺性）筋力トレーニングの降圧効果メタ分析",
                "p": "【AI翻訳抄録】空気椅子や壁押しなど、筋肉の長さを変えずに力を発揮するトレーニングが、有酸素運動を上回る血管柔軟性改善・血圧低下作用を持つことを証明。アライメントを維持した静的トレーニングが推奨される理由。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 英国スポーツ医学雑誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1516062423079-7ca13cdc7f5a"
            },
            {
                "sport": "health",
                "badge": "重心バランス",
                "title": "脳卒中リスクと関連する「片脚立ち時間」の短縮を防ぐ重心制御機能",
                "p": "片脚立ち測定における動揺面積の増大は、脳内の微小血管障害や前庭感覚の衰えを示す重要なヘルスインジケーターです。左右均等な筋力と重心アライメントを保ち、健康な神経系を維持しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 理学療法士 / 動作分析アドバイザー",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1576091160550-2173dba999ef"
            },
            {
                "sport": "sleep check",
                "badge": "口腔ヘルス",
                "title": "自律神経を整える呼吸アライメント：口呼吸が引き起こす自律神経の乱れと対策",
                "p": "浅い口呼吸がもたらす酸素吸入効率の低下と脳機能への影響。鼻呼吸へと促すアゴ・舌の位置アライメントを測定し、睡眠の質を根本から改善します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 睡眠認定医",
                "btn_text": "📸 呼吸ストレスを測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1506126613408-eca07ce68773"
            }
        ],
        "beauty": [
            {
                "sport": "beauty",
                "badge": "海外美容誌",
                "title": "ニューヨークのトップモデルが実践する、骨格アライメント調整とリンパ循環・美肌のディープリレーション",
                "p": "【AI翻訳抄録】モデル業界で重要視される「立ち姿の垂直アライメント」。姿勢の崩れは頸部リンパ節の圧迫を招き、顔のくすみやターンオーバー遅延の主要因になることが最新美容医学で実証。アライメントケアと美容液導入の相乗効果が注目されています。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: Vogue Aesthetics誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            },
            {
                "sport": "beauty",
                "badge": "骨格診断",
                "title": "3大骨格スタイルタイプ（ストレート・ウェーブ・ナチュラル）と美脚度アセスメント",
                "p": "骨格タイプによって骨盤の傾きや脂肪・筋肉の付き方の特徴は異なります。姿勢アライメント測定から「O脚・X脚の偏位」を数値化し、あなたに最適な美脚アプローチを見つけましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スタイリスト Rin",
                "btn_text": "📸 骨格タイプと美脚アライメント測定",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1512290923902-8a9f81dc236c"
            },
            {
                "sport": "beauty",
                "badge": "美ボディ",
                "title": "太もも前側の張りを解消する：美歩行と骨盤アライメントの鍵",
                "p": "歩くたびに太ももの前側が張ってしまうのは、骨盤の前傾によって反り腰になり、大腿直筋に頼った歩き方をしているからです。美しい歩行アライメントの基準ラインをAIで測定・可視化します。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 美容カイロプラクター 小林",
                "btn_text": "📸 歩行・骨盤アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1515886657613-9f3515b0c78f"
            },
            {
                "sport": "beauty",
                "badge": "外部論文",
                "title": "顔面非対称（Facial Asymmetry）と頸椎アライメント・顎関節症（TMD）の臨床相関",
                "p": "【AI翻訳抄録】頸椎のわずかな傾斜や肩のラインの左右非対称が、咬筋の緊張差を引き起こし、顔の輪郭の歪みをもたらすメカニズム。全身の骨格アライメントを正すことでフェイスラインの対称性が改善することを示す臨床的結論。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 美容形成外科学会誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            },
            {
                "sport": "beauty",
                "badge": "デコルテ美",
                "title": "デコルテを美しく見せる：胸鎖乳突筋の過緊張と「前肩（丸肩）」の補正ケア",
                "p": "スマートフォンやPCの見すぎで首が前に突き出ると、胸側の筋肉が縮み、美しい鎖骨ラインが埋もれてしまいます。首から肩にかけてのアライメント角度を測定し、デコルテがすっきり際立つ姿勢へ導きます。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 美容カイロプラクター 小林",
                "btn_text": "📸 側面アライメントを測定する",
                "btn_hook": "launchMeasurement('l_side')",
                "img_id": "photo-1512290923902-8a9f81dc236c"
            },
            {
                "sport": "beauty",
                "badge": "ヒップメイク",
                "title": "ヒップの横幅をすっきり整える：中臀筋のポジショニングと美骨格アライメント",
                "p": "「ヒップラインの下垂や横広がり」は、骨格アライメントの歪みによる中臀筋の緩みが影響しています。骨盤幅と大腿骨大転子の偏位を測定し、丸みのある美しいヒップをつくるアライメントアプローチを解説。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ スタイリスト Rin",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1515886657613-9f3515b0c78f"
            },
            {
                "sport": "beauty",
                "badge": "外部論文",
                "title": "高ヒール着用時の歩行動作における足弓（アーチ）への負担と腰椎前弯（反り腰）の変化",
                "p": "【AI翻訳抄録】7cm以上のヒールシューズを履いた歩行では、踵骨のクッション機能が使えず骨盤が強制的に前傾し、反り腰アライメントを形成することをモーションキャプチャにて証明。日常のフットベッドケアの必要性。",
                "time": "⏱️ 外部サイト遷移",
                "author": "✍️ 出所: 美容皮膚科学会誌",
                "btn_text": "📸 測定を開始する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1485230895905-ec40ba36b9bc"
            },
            {
                "sport": "beauty",
                "badge": "美骨盤・肋骨",
                "title": "アンダーバストを引き締める：リブケージ（肋骨）の広がりと呼吸アライメント",
                "p": "反り腰傾向がある方は、肋骨が前方へ浮き上がる「リブフレア」になりやすく、ウエストが太く見える原因になります。呼吸時における肋骨下部のアライメント動作をチェックし、くびれが引き立つ呼吸法をマスターしましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ 美容カイロプラクター 小林",
                "btn_text": "📸 動作チェックをAIで測定する",
                "btn_hook": "launchMeasurement('dyn_flex_fwd')",
                "img_id": "photo-1512290923902-8a9f81dc236c"
            },
            {
                "sport": "beauty",
                "badge": "肩ライン",
                "title": "肩のラインを一直線に整える：鎖骨アライメントとすっきり美しいデコルテ",
                "p": "いかり肩やなで肩は、僧帽筋上部や肩甲挙筋の緊張バランスから生じる骨格アライメント変位です。鎖骨の水平度を正面カメラで測定し、緊張した首すじラインをほぐす美バランスアプローチを実践しましょう。",
                "time": "⏱️ 所要時間: 3分",
                "author": "✍️ スタイリスト Rin",
                "btn_text": "📸 左右荷重バランスを測定する",
                "btn_hook": "launchMeasurement('front')",
                "img_id": "photo-1515886657613-9f3515b0c78f"
            },
            {
                "sport": "makeup styling",
                "badge": "デンタル美容",
                "title": "顔のたるみ・二重顎を根本ケア：咀嚼バランスと顔骨格アライメント効果",
                "p": "片噛み習慣や顎関節のゆがみがもたらすフェイスラインの非対称。AI顔追跡による咀嚼筋アプローチで、スッキリとした輪郭と美しい対称性を手に入れます。",
                "time": "⏱️ 所要時間: 4分",
                "author": "✍️ 歯科医師 / 美容口腔アドバイザー",
                "btn_text": "📸 顔骨格アライメントを測定する",
                "btn_hook": "launchMeasurement('face_rppg')",
                "img_id": "photo-1522335789203-aabd1fc54bc9"
            }
        ]
    }
};

const activeFilters = {
    sports: 'all',
    health: 'all',
    beauty: 'all'
};

const visibleCounts = {
    sports: 10,
    health: 10,
    beauty: 10
};

async function initDatabase() {
    try {
        const response = await fetch('articles_db.json');
        if (!response.ok) throw new Error("Status " + response.status);
        articlesDb = await response.json();
        console.log("Database loaded from server JSON successfully.");
    } catch (e) {
        console.warn("Failed to fetch articles_db.json, using embedded fallback database:", e);
        articlesDb = FALLBACK_DB;
    }
    renderAllFeeds();
    setupLoadMoreListeners();
}

function renderFeed(vertical) {
    const listContainer = document.getElementById(vertical + 'List');
    const loadMoreBtn = document.getElementById(vertical + 'LoadMore');
    if (!listContainer || !articlesDb) return;

    // 1. Gather all published articles for this vertical
    let list = [];
    
    // Baseline articles
    if (articlesDb.baseline && articlesDb.baseline[vertical]) {
        list = list.concat(articlesDb.baseline[vertical]);
    }
    
    // Daily published articles up to current_day
    const currentDay = articlesDb.current_day || 'day1';
    const currentDayNum = parseInt(currentDay.replace('day', '')) || 1;

    for (let i = 1; i <= currentDayNum; i++) {
        const dKey = 'day' + i;
        if (articlesDb[dKey] && articlesDb[dKey][vertical]) {
            // Prepend new days to the beginning of list (newest first)
            list = articlesDb[dKey][vertical].concat(list);
        }
    }

    // 2. Filter list by active subcategory
    const activeTag = activeFilters[vertical];
    let filteredList = list;
    if (activeTag !== 'all') {
        filteredList = list.filter(art => {
            const tags = (art.sport || '').split(/\s+/);
            return tags.includes(activeTag);
        });
    }

    // 3. Render the visible subset
    const visibleCount = visibleCounts[vertical];
    const visibleList = filteredList.slice(0, visibleCount);

    listContainer.innerHTML = '';
    
    if (visibleList.length === 0) {
        listContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary); background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color)">該当するコラムは現在ありません。</div>`;
        loadMoreBtn.style.display = 'none';
        return;
    }

    visibleList.forEach(art => {
        // Build image URL
        let imgUrl = "";
        if (art.img_id && art.img_id.trim()) {
            const val = art.img_id.trim();
            if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("images/") || val.startsWith("assets/") || val.startsWith("./") || val.match(/\.(png|jpg|jpeg|webp|gif|svg)/i)) {
                imgUrl = val;
            } else {
                const match = val.match(/(photo-[0-9a-zA-Z\-]+)/);
                const cleanId = match ? match[1] : val;
                imgUrl = `https://images.unsplash.com/${cleanId}?auto=format&fit=crop&q=80&w=400`;
            }
        } else {
            // Fallback resolver
            const tags = (art.sport || "").split(/\s+/);
            let fallbackId = "photo-1506126613408-eca07ce68773";
            const fallbacks = {
                "soccer": "photo-1551958219-acbc608c6377",
                "baseball": "photo-1516738901171-8eb4fc13bd20",
                "volleyball": "photo-1612872087720-bb876e2e67d1",
                "stress": "photo-1544367567-0f2fcb009e0b",
                "sleep": "photo-1506126613408-eca07ce68773",
                "nutrition": "photo-1490645935967-10de6ba17061",
                "check": "photo-1505751172876-fa1923c5c528",
                "bodymake": "photo-1518310383802-640c2de311b2",
                "makeup": "photo-1522335789203-aabd1fc54bc9",
                "hairstyle": "photo-1562322140-8baeececf3df"
            };
            for (let t of tags) {
                if (fallbacks[t]) {
                    fallbackId = fallbacks[t];
                    break;
                }
            }
            imgUrl = `https://images.unsplash.com/${fallbackId}?auto=format&fit=crop&q=80&w=400`;
        }

        // Determine badge styling based on panel vertical type
        let badgeStyle = "";
        if (vertical === 'sports') {
            badgeStyle = "background: var(--accent-blue); color: #000; font-weight: 700;";
        } else if (vertical === 'health') {
            badgeStyle = "background: var(--accent-teal); color: #000; font-weight: 700;";
        } else if (vertical === 'beauty') {
            badgeStyle = "background: var(--accent-pink); color: #fff; font-weight: 700;";
        }

        const cardHtml = `
            <div class="article-card" data-sport="${art.sport || ''}">
                <div class="article-image" style="background-image: url('${imgUrl}');">
                    <span class="article-badge" style="${badgeStyle}">${art.badge || 'コラム'}</span>
                </div>
                <div class="article-content">
                    <div class="article-body">
                        <h3>${art.title || ''}</h3>
                        <p>${art.p || ''}</p>
                    </div>
                    <div class="article-footer">
                        <div class="article-meta">
                            <span>${art.time || ''}</span>
                            <span>${art.author || ''}</span>
                        </div>
                        <button class="btn-hook" onclick="${art.btn_hook || ''}">
                            ${art.btn_text || '📸 測定を開始する'} <span>▶</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    // 4. Show/Hide load more button
    if (filteredList.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function renderAllFeeds() {
    renderFeed('sports');
    renderFeed('health');
    renderFeed('beauty');
}

function setupLoadMoreListeners() {
    const sBtn = document.getElementById('sportsLoadMore');
    const hBtn = document.getElementById('healthLoadMore');
    const bBtn = document.getElementById('beautyLoadMore');
    
    if (sBtn) {
        sBtn.addEventListener('click', () => {
            visibleCounts.sports += 10;
            renderFeed('sports');
        });
    }
    if (hBtn) {
        hBtn.addEventListener('click', () => {
            visibleCounts.health += 10;
            renderFeed('health');
        });
    }
    if (bBtn) {
        bBtn.addEventListener('click', () => {
            visibleCounts.beauty += 10;
            renderFeed('beauty');
        });
    }
}
