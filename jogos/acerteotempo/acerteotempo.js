// Rally - Acerte o Tempo (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // ÁUDIO DE "BEEP" — Web Audio API (buffer decodificado em memória)
    // Toca com latência mínima (sem decoding delay do <audio>).
    // ============================================================
    const BEEP_SRC = '../../sons/beep.mp3';

    let audioCtx = null;
    let beepBuffer = null;
    let audioReady = false;
    let audioUnlocked = false;

    // Carrega e decodifica o MP3 em um AudioBuffer (em background)
    async function loadBeepBuffer() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) {
                console.warn('Web Audio API não suportada neste navegador.');
                return;
            }
            audioCtx = new Ctx();

            const response = await fetch(BEEP_SRC);
            const arrayBuffer = await response.arrayBuffer();
            beepBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            audioReady = true;
        } catch (e) {
            console.warn('Falha ao carregar beep.mp3:', e);
        }
    }
    loadBeepBuffer();

    // Destrava o AudioContext no primeiro toque (política dos navegadores)
    function unlockAudio() {
        if (audioUnlocked) return;
        audioUnlocked = true;

        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }

        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    }

    document.addEventListener('touchstart', unlockAudio, { once: false, passive: true });
    document.addEventListener('click', unlockAudio, { once: false });
    document.addEventListener('keydown', unlockAudio, { once: false });

    // Toca o beep IMEDIATAMENTE (usa o buffer já decodificado)
    function playBeep() {
        if (!audioReady || !audioCtx || !beepBuffer) return;

        try {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }

            const source = audioCtx.createBufferSource();
            source.buffer = beepBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        } catch (e) {
            console.warn('Erro ao tocar beep:', e);
        }
    }

    // ============================================================
    // ESTADO DO JOGO
    // ============================================================
    const state = {
        mode: 'party',
        players: [],
        targetScore: 5,

        round: 1,
        targetTimeMs: 0,

        roundQueue: [],
        queueIndex: 0,

        roundResults: [],

        timerRunning: false,
        timerStartTs: 0,

        revealedCount: 0
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        config: document.getElementById('configScreen'),
        draw: document.getElementById('drawScreen'),
        action: document.getElementById('actionScreen'),
        results: document.getElementById('resultsScreen'),
        winner: document.getElementById('winnerScreen')
    };

    const playerInput = document.getElementById('playerInput');
    const playerList = document.getElementById('playerList');
    const startGameBtn = document.getElementById('startGameBtn');

    const timerBtn = document.getElementById('timerBtn');
    const timerBtnLabel = document.getElementById('timerBtnLabel');
    const actionHint = document.getElementById('actionHint');

    const transitionOverlay = document.getElementById('transitionOverlay');
    const transitionLabel = document.getElementById('transitionLabel');
    const transitionName = document.getElementById('transitionName');
    const transitionSub = document.getElementById('transitionSub');

    // ============================================================
    // NAVEGAÇÃO
    // ============================================================
    function showScreen(screenKey) {
        Object.keys(screens).forEach(key => {
            if (key === screenKey) {
                screens[key].classList.remove('hidden');
            } else {
                screens[key].classList.add('hidden');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================================
    // CONFIG — MODO DE JOGO
    // ============================================================
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;

            if (mode === 'impostor') {
                document.getElementById('comingSoonModal').classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
                return;
            }

            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = mode;
        });
    });

    document.getElementById('comingSoonCloseBtn').addEventListener('click', () => {
        document.getElementById('comingSoonModal').classList.add('hidden');
    });

    // ============================================================
    // CONFIG — META DE PONTOS
    // ============================================================
    document.querySelectorAll('#scoreLimitGroup .chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#scoreLimitGroup .chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.targetScore = parseInt(btn.dataset.value, 10);
        });
    });

    // ============================================================
    // CONFIG — JOGADORES
    // ============================================================
    function renderPlayerList() {
        playerList.innerHTML = '';
        state.players.forEach((p, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `<span>${p.name}</span><button type="button" aria-label="Remover">&times;</button>`;
            li.querySelector('button').addEventListener('click', () => {
                state.players.splice(i, 1);
                renderPlayerList();
            });
            playerList.appendChild(li);
        });
    }

    function addPlayer() {
        const val = playerInput.value.trim();
        if (!val) return;
        if (state.players.some(p => p.name.toLowerCase() === val.toLowerCase())) {
            alert('Já tem um jogador com esse nome!');
            return;
        }
        state.players.push({ name: val, score: 0 });
        playerInput.value = '';
        renderPlayerList();
        playerInput.focus();
    }

    document.getElementById('addPlayerBtn').addEventListener('click', addPlayer);

    playerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlayer();
        }
    });

    // ============================================================
    // INICIAR JOGO
    // ============================================================
    startGameBtn.addEventListener('click', () => {
        if (state.players.length < 2) {
            alert('Adicione pelo menos 2 jogadores!');
            return;
        }

        state.players.forEach(p => p.score = 0);
        state.round = 1;

        startRound();
    });

    // ============================================================
    // FORMATAÇÃO — ALVO (sempre termina em 0, ex: 08:50)
    // ============================================================
    function formatTargetTime(ms) {
        const roundedMs = Math.round(ms / 100) * 100;
        const totalTenths = Math.round(roundedMs / 100);
        const seconds = Math.floor(totalTenths / 10);
        const tenths = totalTenths % 10;
        const tenthsStr = String(tenths) + '0';
        return `${String(seconds).padStart(2, '0')}:${tenthsStr}`;
    }

    // ============================================================
    // FORMATAÇÃO — TEMPO JOGADO (centésimos reais, ex: 03:27)
    // ============================================================
    function formatPlayedTime(ms) {
        const totalCentis = Math.floor(ms / 10);
        const seconds = Math.floor(totalCentis / 100);
        const centis = totalCentis % 100;
        return `${String(seconds).padStart(2, '0')}:${String(centis).padStart(2, '0')}`;
    }

    // ============================================================
    // INÍCIO DE RODADA
    // ============================================================
    function startRound() {
        const minMs = 100;
        const maxMs = 10000;
        const rawMs = minMs + Math.random() * (maxMs - minMs);
        state.targetTimeMs = Math.round(rawMs / 100) * 100;

        const n = state.players.length;
        const startIdx = Math.floor(Math.random() * n);
        state.roundQueue = [];
        for (let i = 0; i < n; i++) {
            state.roundQueue.push(state.players[(startIdx + i) % n]);
        }
        state.queueIndex = 0;
        state.roundResults = [];
        state.revealedCount = 0;
        state.timerRunning = false;

        document.getElementById('drawRoundBadge').innerText = `Rodada ${state.round}`;
        document.getElementById('drawTimeDisplay').innerText = formatTargetTime(state.targetTimeMs);
        showScreen('draw');

        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('startRoundBtn').addEventListener('click', () => {
        showActionScreenForCurrentPlayer();
    });

    // ============================================================
    // TELA DE AÇÃO — jogador da vez
    // ============================================================
    function showActionScreenForCurrentPlayer() {
        const player = state.roundQueue[state.queueIndex];

        document.getElementById('roundBadge').innerText = `Rodada ${state.round}`;
        document.getElementById('targetTimeDisplay').innerText = formatTargetTime(state.targetTimeMs);
        document.getElementById('turnActorName').innerText = player.name;

        timerBtn.classList.remove('running');
        timerBtnLabel.innerText = 'PLAY';
        actionHint.innerText = 'Toque para iniciar o cronômetro';

        showScreen('action');
    }

    // ============================================================
    // CRONÔMETRO
    // ============================================================
    function startTimer() {
        // Toca o beep IMEDIATAMENTE (buffer em memória → latência mínima)
        playBeep();

        state.timerRunning = true;
        state.timerStartTs = performance.now();
        timerBtn.classList.add('running');
        timerBtnLabel.innerText = 'STOP';
        actionHint.innerText = 'Toque para parar no momento certo!';
    }

    function stopTimer() {
        if (!state.timerRunning) return;
        const elapsed = performance.now() - state.timerStartTs;
        state.timerRunning = false;
        timerBtn.classList.remove('running');
        timerBtnLabel.innerText = 'PLAY';

        const player = state.roundQueue[state.queueIndex];
        state.roundResults.push({
            name: player.name,
            ms: Math.round(elapsed)
        });

        state.queueIndex++;

        if (state.queueIndex < state.roundQueue.length) {
            const nextPlayer = state.roundQueue[state.queueIndex];
            showTransition('A seguir', nextPlayer.name, 'Passe o celular', () => {
                showActionScreenForCurrentPlayer();
            });
        } else {
            showTransition('Todos jogaram!', 'Vamos ver os tempos', 'Ir para resultados', () => {
                showResults();
            });
        }
    }

    timerBtn.addEventListener('click', () => {
        if (!state.timerRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    });

    // ============================================================
    // OVERLAY DE TRANSIÇÃO
    // ============================================================
    let transitioning = false;

    function showTransition(label, name, sub, callback) {
        if (transitioning) return;
        transitioning = true;

        transitionLabel.innerText = label;
        transitionName.innerText = name;
        transitionSub.innerText = sub;
        transitionOverlay.classList.remove('hidden');
        void transitionOverlay.offsetWidth;
        transitionOverlay.classList.add('visible');

        setTimeout(() => {
            transitionOverlay.classList.remove('visible');
            setTimeout(() => {
                transitionOverlay.classList.add('hidden');
                transitioning = false;
                if (callback) callback();
            }, 350);
        }, 1300);
    }

    // ============================================================
    // TELA DE RESULTADOS
    // ============================================================
    function showResults() {
        document.getElementById('resultsRoundBadge').innerText = `Rodada ${state.round}`;

        const list = document.getElementById('resultsList');
        list.innerHTML = '';

        document.getElementById('winnerBox').classList.add('hidden');
        document.getElementById('nextRoundBtn').classList.add('hidden');

        state.revealedCount = 0;

        state.roundResults.forEach((result, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'result-row';
            btn.dataset.index = index;
            btn.innerHTML = `
                <span class="result-name">${result.name}</span>
                <span class="result-time"><span class="hidden-time">⏱ ••:••</span></span>
            `;
            btn.addEventListener('click', () => revealResult(index, btn));
            list.appendChild(btn);
        });

        showScreen('results');
        if (window.lucide) lucide.createIcons();
    }

    function revealResult(index, btnElement) {
        if (btnElement.classList.contains('revealed')) return;

        const result = state.roundResults[index];
        btnElement.classList.add('revealed');
        btnElement.querySelector('.result-time').innerHTML = formatPlayedTime(result.ms);

        state.revealedCount++;

        if (state.revealedCount >= state.roundResults.length) {
            finishRound();
        }
    }

    // ============================================================
    // FIM DA RODADA — calcula vencedor(es)
    // ============================================================
    function finishRound() {
        const target = state.targetTimeMs;

        const diffs = state.roundResults.map(r => ({
            name: r.name,
            ms: r.ms,
            diff: Math.abs(r.ms - target)
        }));

        const minDiff = Math.min(...diffs.map(d => d.diff));
        const winners = diffs.filter(d => d.diff === minDiff);

        winners.forEach(w => {
            const p = state.players.find(pl => pl.name === w.name);
            if (p) p.score += 1;
        });

        document.querySelectorAll('.result-row').forEach(row => {
            const idx = parseInt(row.dataset.index, 10);
            const r = state.roundResults[idx];
            if (winners.some(w => w.name === r.name)) {
                row.classList.add('is-winner');
                const timeEl = row.querySelector('.result-time');
                if (!timeEl.querySelector('.result-pts')) {
                    const pts = document.createElement('span');
                    pts.className = 'result-pts';
                    pts.innerText = '+1 pt';
                    timeEl.appendChild(pts);
                }
            }
        });

        const winnerBox = document.getElementById('winnerBox');
        const winnerName = document.getElementById('roundWinnerName');
        const winnerDetail = document.getElementById('roundWinnerDetail');

        winnerBox.classList.remove('hidden');

        if (winners.length === 1) {
            winnerName.innerText = winners[0].name;
            winnerDetail.innerText = `Parou a ${formatPlayedTime(winners[0].ms)} — alvo era ${formatTargetTime(target)}`;
        } else {
            winnerName.innerText = winners.map(w => w.name).join(' & ');
            winnerDetail.innerText = `Empate! Ambos pararam a ${formatPlayedTime(winners[0].ms)} — alvo era ${formatTargetTime(target)}`;
        }

        const champion = state.players.find(p => p.score >= state.targetScore);

        const nextRoundBtn = document.getElementById('nextRoundBtn');

        if (champion) {
            if (window.confetti) {
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            }
            setTimeout(() => {
                triggerFinalVictory(champion);
            }, 1500);
        } else {
            nextRoundBtn.classList.remove('hidden');
            nextRoundBtn.onclick = () => {
                state.round++;
                startRound();
            };
        }

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // VITÓRIA FINAL
    // ============================================================
    function triggerFinalVictory(champion) {
        showScreen('winner');

        document.getElementById('finalWinnerName').innerText = champion.name;

        const board = document.getElementById('finalScoreboard');
        board.innerHTML = '';

        const sorted = [...state.players].sort((a, b) => b.score - a.score);

        sorted.forEach(p => {
            const row = document.createElement('div');
            row.className = 'score-row' + (p.name === champion.name ? ' is-champion' : '');
            row.innerHTML = `<span>${p.name}</span><span>${p.score} pts</span>`;
            board.appendChild(row);
        });

        if (window.confetti) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // BOTÕES DE FIM DE JOGO
    // ============================================================
    document.getElementById('restartGameBtn').addEventListener('click', () => {
        state.players.forEach(p => p.score = 0);
        state.round = 1;
        startRound();
    });

    document.getElementById('backToConfigBtn').addEventListener('click', () => {
        state.players.forEach(p => p.score = 0);
        state.round = 1;
        state.roundQueue = [];
        state.queueIndex = 0;
        state.roundResults = [];
        state.timerRunning = false;
        showScreen('config');
    });

    // ============================================================
    // SAIR
    // ============================================================
    const exitModal = document.getElementById('exitModal');

    document.querySelectorAll('[data-exit-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
            exitModal.classList.remove('hidden');
        });
    });

    document.getElementById('cancelExitBtn').addEventListener('click', () => {
        exitModal.classList.add('hidden');
    });

    document.getElementById('confirmExitBtn').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // ============================================================
    // MODAL "Apoie ou anuncie aqui"
    // ============================================================
    const adBanners = document.querySelectorAll('[data-ad-banner]');
    const adOverlay = document.getElementById('adOverlay');
    const adModal = document.getElementById('adModal');
    const adModalClose = document.getElementById('adModalClose');

    const adTabs = document.querySelectorAll('.ad-tab');
    const adPanels = document.querySelectorAll('.ad-tab-panel');

    const adEmailText = document.getElementById('adEmailText');
    const adCopyBtn = document.getElementById('adCopyBtn');
    const adCopiedMsg = document.getElementById('adCopiedMsg');

    const adPixText = document.getElementById('adPixText');
    const adCopyPixBtn = document.getElementById('adCopyPixBtn');
    const adCopiedPixMsg = document.getElementById('adCopiedPixMsg');

    function openAdModal() {
        adOverlay.classList.add('open');
        adModal.classList.add('open');
    }

    function closeAdModal() {
        adOverlay.classList.remove('open');
        adModal.classList.remove('open');

        adTabs.forEach(t => {
            const active = t.dataset.adTab === 'advertise';
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        adPanels.forEach(p => {
            p.classList.toggle('hidden', p.dataset.adPanel !== 'advertise');
        });

        adCopyBtn.textContent = 'Copiar';
        adCopyBtn.classList.remove('copied');
        adCopiedMsg.classList.remove('show');
        adCopyPixBtn.textContent = 'Copiar chave';
        adCopyPixBtn.classList.remove('copied');
        adCopiedPixMsg.classList.remove('show');
    }

    adBanners.forEach(btn => btn.addEventListener('click', openAdModal));
    adModalClose.addEventListener('click', closeAdModal);
    adOverlay.addEventListener('click', closeAdModal);

    adTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adTabs.forEach(t => {
                const active = t === tab;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            adPanels.forEach(p => {
                p.classList.toggle('hidden', p.dataset.adPanel !== tab.dataset.adTab);
            });
        });
    });

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (e) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    function flashCopied(btn, msgEl, originalLabel) {
        btn.textContent = 'Copiado!';
        btn.classList.add('copied');
        msgEl.classList.add('show');
        setTimeout(() => {
            btn.textContent = originalLabel;
            btn.classList.remove('copied');
            msgEl.classList.remove('show');
        }, 2200);
    }

    adCopyBtn.addEventListener('click', async () => {
        const email = adEmailText.textContent.trim();
        const ok = await copyText(email);
        if (ok) {
            flashCopied(adCopyBtn, adCopiedMsg, 'Copiar');
        } else {
            adCopiedMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedMsg.classList.add('show');
        }
    });

    adCopyPixBtn.addEventListener('click', async () => {
        const pix = adPixText.textContent.trim();
        const ok = await copyText(pix);
        if (ok) {
            flashCopied(adCopyPixBtn, adCopiedPixMsg, 'Copiar chave');
        } else {
            adCopiedPixMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedPixMsg.classList.add('show');
        }
    });

    console.log('🎉 Acerte o Tempo carregado com sucesso!');
});