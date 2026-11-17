// Rally - Acerte o Tempo (Party Game)
// Modo Rei da Festa + Modo Impostor

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // ÁUDIO DE BEEP
    // ============================================================
    const BEEP_SRC = '../../sons/beep.mp3';

    let audioCtx = null;
    let beepBuffer = null;
    let audioReady = false;
    let audioUnlocked = false;

    async function loadBeepBuffer() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
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

    function playBeep() {
        if (!audioReady || !audioCtx || !beepBuffer) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
            const source = audioCtx.createBufferSource();
            source.buffer = beepBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        } catch (e) {
            console.warn('Erro ao tocar beep:', e);
        }
    }

    // ============================================================
    // ESTADO
    // ============================================================
    const state = {
        mode: 'party',
        players: [],
        targetScore: 5,

        // party
        round: 1,
        targetTimeMs: 0,
        roundQueue: [],
        queueIndex: 0,
        roundResults: [],
        timerRunning: false,
        timerStartTs: 0,
        revealedCount: 0,

        // impostor
        impImpostorCount: 1,
        impImpostorNames: [],
        impImpostorMargins: {},
        impRevealOrder: [],
        impRevealIndex: 0,
        impFirstSpeaker: null,
        impRound: 1,
        impMaxRounds: 3,
        impRoundResults: [],
        impRoundQueue: [],
        impQueueIndex: 0,
        impTimerRunning: false,
        impTimerStartTs: 0,
        impCurrentActor: null,
        impRoundTimes: [],
        impVotes: {},
        impPlayAgain: false
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        config: document.getElementById('configScreen'),
        draw: document.getElementById('drawScreen'),
        action: document.getElementById('actionScreen'),
        results: document.getElementById('resultsScreen'),
        winner: document.getElementById('winnerScreen'),
        impReveal: document.getElementById('impRevealScreen'),
        impSort: document.getElementById('impSortScreen'),
        impRoundEnd: document.getElementById('impRoundEndScreen'),
        impVote: document.getElementById('impVoteScreen'),
        impFinal: document.getElementById('impFinalScreen')
    };

    function showScreen(key) {
        Object.keys(screens).forEach(k => {
            if (k === key) screens[k].classList.remove('hidden');
            else screens[k].classList.add('hidden');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function formatTargetTime(ms) {
        const roundedMs = Math.round(ms / 100) * 100;
        const totalTenths = Math.round(roundedMs / 100);
        const seconds = Math.floor(totalTenths / 10);
        const tenths = totalTenths % 10;
        const tenthsStr = String(tenths) + '0';
        return `${String(seconds).padStart(2, '0')}:${tenthsStr}`;
    }

    function formatPlayedTime(ms) {
        const totalCentis = Math.floor(ms / 10);
        const seconds = Math.floor(totalCentis / 100);
        const centis = totalCentis % 100;
        return `${String(seconds).padStart(2, '0')}:${String(centis).padStart(2, '0')}`;
    }

    function getMaxImpostors(playerCount) {
        if (playerCount < 3) return 0;
        if (playerCount <= 3) return 1;
        if (playerCount <= 6) return 2;
        return 3;
    }

    // ============================================================
    // CONFIG — MODO
    // ============================================================
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;

            const scoreGroup = document.getElementById('scoreLimitGroup')?.closest('.form-group');
            if (scoreGroup) scoreGroup.classList.toggle('hidden', state.mode !== 'party');

            if (state.mode === 'party') {
                document.getElementById('partySetup').classList.remove('hidden');
                document.getElementById('impostorSetup').classList.add('hidden');
                document.getElementById('rulesParty').classList.remove('hidden');
                document.getElementById('rulesImpostor').classList.add('hidden');
            } else {
                document.getElementById('partySetup').classList.add('hidden');
                document.getElementById('impostorSetup').classList.remove('hidden');
                document.getElementById('rulesParty').classList.add('hidden');
                document.getElementById('rulesImpostor').classList.remove('hidden');
                refreshImpostorLimits();
            }
        });
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
    // CONFIG — JOGADORES (party)
    // ============================================================
    const playerInput = document.getElementById('playerInput');
    const playerList = document.getElementById('playerList');

    function renderPlayerList() {
        playerList.innerHTML = '';
        state.players.forEach((p, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `<span>${p.name}</span><button type="button" aria-label="Remover">&times;</button>`;
            li.querySelector('button').addEventListener('click', () => {
                state.players.splice(i, 1);
                renderPlayerList();
                renderPlayerListImp();
                refreshImpostorLimits();
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
        renderPlayerListImp();
        refreshImpostorLimits();
        playerInput.focus();
    }

    document.getElementById('addPlayerBtn').addEventListener('click', addPlayer);
    playerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addPlayer(); }
    });

    // ============================================================
    // CONFIG — JOGADORES (impostor)
    // ============================================================
    const playerInputImp = document.getElementById('playerInputImp');
    const playerListImp = document.getElementById('playerListImp');

    function renderPlayerListImp() {
        playerListImp.innerHTML = '';
        state.players.forEach((p, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `<span>${p.name}</span><button type="button" aria-label="Remover">&times;</button>`;
            li.querySelector('button').addEventListener('click', () => {
                state.players.splice(i, 1);
                renderPlayerList();
                renderPlayerListImp();
                refreshImpostorLimits();
            });
            playerListImp.appendChild(li);
        });
    }

    function addPlayerImp() {
        const val = playerInputImp.value.trim();
        if (!val) return;
        if (state.players.some(p => p.name.toLowerCase() === val.toLowerCase())) {
            alert('Já tem um jogador com esse nome!');
            return;
        }
        state.players.push({ name: val, score: 0 });
        playerInputImp.value = '';
        renderPlayerList();
        renderPlayerListImp();
        refreshImpostorLimits();
        playerInputImp.focus();
    }

    document.getElementById('addPlayerImpBtn').addEventListener('click', addPlayerImp);
    playerInputImp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addPlayerImp(); }
    });

    // ============================================================
    // CONFIG — IMPOSTOR COUNT (limites)
    // ============================================================
    function refreshImpostorLimits() {
        const maxImp = getMaxImpostors(state.players.length);
        const chips = document.querySelectorAll('#impostorCountGroup .chip-btn');
        const hint = document.getElementById('impostorLimitHint');

        chips.forEach(chip => {
            const value = parseInt(chip.dataset.value, 10);
            const available = value <= maxImp;
            chip.disabled = !available;
            chip.style.display = available ? '' : 'none';
            if (!available) chip.classList.remove('active');
        });

        if (state.impImpostorCount > maxImp) state.impImpostorCount = Math.max(1, maxImp);

        chips.forEach(chip => {
            const value = parseInt(chip.dataset.value, 10);
            chip.classList.toggle('active', value === state.impImpostorCount);
        });

        if (state.players.length < 3) {
            hint.textContent = 'Adicione pelo menos 3 jogadores para iniciar.';
        } else {
            let msg = `Limite atual: até ${maxImp} impostor${maxImp > 1 ? 'es' : ''}.`;
            if (maxImp === 1) msg += ' Adicione 4+ jogadores para liberar 2.';
            else if (maxImp === 2) msg += ' Adicione 7+ jogadores para liberar 3.';
            hint.textContent = msg;
        }
    }

    document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.impImpostorCount = parseInt(btn.dataset.value, 10);
        });
    });

    // ============================================================
    // INICIAR JOGO
    // ============================================================
    document.getElementById('startGameBtn').addEventListener('click', () => {
        if (state.mode === 'party') {
            if (state.players.length < 2) {
                alert('Adicione pelo menos 2 jogadores!');
                return;
            }
            state.players.forEach(p => p.score = 0);
            state.round = 1;
            startRound();
        } else {
            if (state.players.length < 3) {
                alert('Adicione pelo menos 3 jogadores!');
                return;
            }
            if (state.impImpostorCount >= state.players.length) {
                alert('O número de impostores deve ser menor que o número de jogadores!');
                return;
            }
            if (state.impImpostorCount > getMaxImpostors(state.players.length)) {
                alert('Número de impostores inválido.');
                return;
            }
            startImpostorGame();
        }
    });

    // ============================================================
    // ============== MODO REI DA FESTA ============================
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

    function showActionScreenForCurrentPlayer() {
        const player = state.roundQueue[state.queueIndex];
        document.getElementById('roundBadge').innerText = `Rodada ${state.round}`;
        document.getElementById('targetTimeDisplay').innerText = formatTargetTime(state.targetTimeMs);
        document.getElementById('turnActorName').innerText = player.name;
        document.getElementById('turnSub').innerText = 'Passe o celular para ele(a)';

        const timerBtn = document.getElementById('timerBtn');
        timerBtn.classList.remove('running');
        document.getElementById('timerBtnLabel').innerText = 'PLAY';
        document.getElementById('actionHint').innerText = 'Toque para iniciar o cronômetro';

        showScreen('action');
    }

    function startTimer() {
        playBeep();
        state.timerRunning = true;
        state.timerStartTs = performance.now();
        document.getElementById('timerBtn').classList.add('running');
        document.getElementById('timerBtnLabel').innerText = 'STOP';
        document.getElementById('actionHint').innerText = 'Toque para parar no momento certo!';
    }

    function stopTimer() {
        if (!state.timerRunning) return;
        const elapsed = performance.now() - state.timerStartTs;
        state.timerRunning = false;
        document.getElementById('timerBtn').classList.remove('running');
        document.getElementById('timerBtnLabel').innerText = 'PLAY';

        const player = state.roundQueue[state.queueIndex];
        state.roundResults.push({ name: player.name, ms: Math.round(elapsed) });

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

    document.getElementById('timerBtn').addEventListener('click', () => {
        if (!state.timerRunning) startTimer();
        else stopTimer();
    });

    // Transição
    let transitioning = false;
    function showTransition(label, name, sub, callback) {
        if (transitioning) return;
        transitioning = true;
        document.getElementById('transitionLabel').innerText = label;
        document.getElementById('transitionName').innerText = name;
        document.getElementById('transitionSub').innerText = sub;
        const overlay = document.getElementById('transitionOverlay');
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.classList.add('hidden');
                transitioning = false;
                if (callback) callback();
            }, 350);
        }, 1300);
    }

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
        if (state.revealedCount >= state.roundResults.length) finishRound();
    }

    function finishRound() {
        const target = state.targetTimeMs;
        const diffs = state.roundResults.map(r => ({
            name: r.name, ms: r.ms, diff: Math.abs(r.ms - target)
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

        document.getElementById('winnerBox').classList.remove('hidden');
        const winnerName = document.getElementById('roundWinnerName');
        const winnerDetail = document.getElementById('roundWinnerDetail');

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
            if (window.confetti) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            setTimeout(() => triggerFinalVictory(champion), 1500);
        } else {
            nextRoundBtn.classList.remove('hidden');
            nextRoundBtn.onclick = () => { state.round++; startRound(); };
        }
        if (window.lucide) lucide.createIcons();
    }

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
        if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        if (window.lucide) lucide.createIcons();
    }

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
    // ============== MODO IMPOSTOR ===============================
    // ============================================================
    function startImpostorGame() {
        state.impRound = 1;
        state.impPlayAgain = false;
        state.impRoundTimes = [];
        state.impRoundResults = [];
        state.impVotes = {};
        startImpostorRound();
    }

    function startImpostorRound() {
        // O alvo e os impostores são sorteados uma única vez por partida.
        const minMs = 100;
        const maxMs = 10000;
        const rawMs = minMs + Math.random() * (maxMs - minMs);
        state.targetTimeMs = Math.round(rawMs / 100) * 100;

        const shuffled = shuffle([...state.players.map(p => p.name)]);
        state.impImpostorNames = shuffled.slice(0, state.impImpostorCount);

        state.impImpostorMargins = {};
        state.impImpostorNames.forEach(name => {
            state.impImpostorMargins[name] = generateMarginForTarget(state.targetTimeMs);
        });

        state.impRevealOrder = shuffle([...state.players.map(p => p.name)]);
        state.impRevealIndex = 0;

        renderImpostorReveal();
        showScreen('impReveal');
    }

    function generateMarginForTarget(targetMs) {
        // A faixa mostrada ao impostor sempre contém o tempo verdadeiro.
        const targetSec = targetMs / 1000;
        const lo = Math.min(5, Math.max(0, Math.floor(targetSec) - 2));
        const hi = lo + 5;
        return { lo, hi };
    }

    function formatMargin(margin) {
        return `de ${margin.lo} a ${margin.hi}s`;
    }

    function renderImpostorReveal() {
        const actorName = state.impRevealOrder[state.impRevealIndex];
        const isLast = state.impRevealIndex === state.impRevealOrder.length - 1;

        document.getElementById('impRevealBadge').innerText = `Rodada ${state.impRound}`;
        document.getElementById('impRevealActorName').innerText = actorName;

        const cardSecret = document.getElementById('impCardSecret');
        cardSecret.classList.remove('flipped');
        const back = document.getElementById('impCardBack');
        back.classList.remove('is-impostor');
        const secretContent = document.getElementById('impSecretContent');
        secretContent.classList.remove('is-impostor-text');
        const secretLabel = document.getElementById('impSecretLabel');
        const oldHint = back.querySelector('.card-back-hint');
        if (oldHint) oldHint.remove();

        const isImpostor = state.impImpostorNames.includes(actorName);
        if (isImpostor) {
            back.classList.add('is-impostor');
            secretContent.classList.add('is-impostor-text');
            secretLabel.innerText = 'Você é';
            secretContent.innerText = 'IMPOSTOR';
            const hintEl = document.createElement('p');
            hintEl.className = 'card-back-hint';
            hintEl.innerText = `Faixa: ${formatMargin(state.impImpostorMargins[actorName])}`;
            back.appendChild(hintEl);
        } else {
            secretLabel.innerText = 'Tempo real';
            secretContent.innerText = formatTargetTime(state.targetTimeMs);
        }

        const nextBtn = document.getElementById('impNextPlayerBtn');
        nextBtn.classList.add('hidden');
        nextBtn.innerHTML = isLast
            ? '<i data-lucide="arrow-right"></i> Sortear quem começa'
            : '<i data-lucide="arrow-right"></i> Passar';
        if (window.lucide) lucide.createIcons();
    }

    // Click no card
    document.getElementById('impCardSecret').addEventListener('click', function() {
        if (this.classList.contains('flipped')) return;
        this.classList.add('flipped');
        document.getElementById('impNextPlayerBtn').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    let revealAdvancing = false;
    document.getElementById('impNextPlayerBtn').addEventListener('click', () => {
        if (revealAdvancing) return;
        revealAdvancing = true;

        const nextBtn = document.getElementById('impNextPlayerBtn');
        const card = document.getElementById('impCardSecret');
        nextBtn.classList.add('hidden');
        nextBtn.disabled = true;
        card.classList.remove('flipped');

        // A carta usa uma transição CSS de 0.6s.
        setTimeout(() => {
            state.impRevealIndex++;
            nextBtn.disabled = false;
            revealAdvancing = false;

            if (state.impRevealIndex >= state.impRevealOrder.length) {
                startImpostorSort();
            } else {
                renderImpostorReveal();
            }
        }, 650);
    });

    function startImpostorSort() {
        showScreen('impSort');
        const sortNameEl = document.getElementById('impSortName');
        const startBtn = document.getElementById('impStartRoundBtn');
        startBtn.classList.add('hidden');
        sortNameEl.classList.remove('picked');
        sortNameEl.classList.add('rolling');
        sortNameEl.innerText = '...';

        const totalDuration = 2500;
        const startTime = Date.now();
        let lastChange = 0;

        function roll() {
            const elapsed = Date.now() - startTime;
            if (elapsed >= totalDuration) {
                const picked = state.players[Math.floor(Math.random() * state.players.length)].name;
                state.impFirstSpeaker = picked;
                sortNameEl.classList.remove('rolling');
                sortNameEl.classList.add('picked');
                sortNameEl.innerText = picked;
                startBtn.classList.remove('hidden');
                if (window.confetti) confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                return;
            }
            const remaining = totalDuration - elapsed;
            const interval = remaining < 500 ? 200 : (remaining < 1200 ? 130 : 80);
            if (Date.now() - lastChange >= interval) {
                const randomName = state.players[Math.floor(Math.random() * state.players.length)].name;
                sortNameEl.innerText = randomName;
                lastChange = Date.now();
            }
            requestAnimationFrame(roll);
        }
        roll();
    }

    document.getElementById('impStartRoundBtn').addEventListener('click', () => {
        // Monta fila a partir do sorteado
        const names = state.players.map(p => p.name);
        const startIdx = names.indexOf(state.impFirstSpeaker);
        state.impRoundQueue = [];
        for (let i = 0; i < names.length; i++) {
            state.impRoundQueue.push(names[(startIdx + i) % names.length]);
        }
        state.impQueueIndex = 0;
        state.impTimerRunning = false;
        showImpostorActionScreen();
    });

    function showImpostorActionScreen() {
        const actorName = state.impRoundQueue[state.impQueueIndex];
        state.impCurrentActor = actorName;

        document.getElementById('roundBadge').innerText = `Rodada ${state.impRound}`;
        document.getElementById('targetTimeDisplay').innerText = '???';
        document.getElementById('turnActorName').innerText = actorName;
        document.getElementById('turnSub').innerText = 'Passe o celular para ele(a)';

        const timerBtn = document.getElementById('timerBtn');
        timerBtn.classList.remove('running');
        document.getElementById('timerBtnLabel').innerText = 'PLAY';
        document.getElementById('actionHint').innerText = 'Toque para iniciar o cronômetro';

        showScreen('action');
    }

    // Botão unificado do timer — detecta modo
    document.getElementById('timerBtn').addEventListener('click', () => {
        if (state.mode === 'party') return; // party usa o listener já registrado

        // Impostor
        if (!state.impTimerRunning) {
            playBeep();
            state.impTimerRunning = true;
            state.impTimerStartTs = performance.now();
            document.getElementById('timerBtn').classList.add('running');
            document.getElementById('timerBtnLabel').innerText = 'STOP';
            document.getElementById('actionHint').innerText = 'Toque para parar no momento certo!';
        } else {
            const elapsed = performance.now() - state.impTimerStartTs;
            state.impTimerRunning = false;
            document.getElementById('timerBtn').classList.remove('running');
            document.getElementById('timerBtnLabel').innerText = 'PLAY';

            const actorName = state.impRoundQueue[state.impQueueIndex];
            state.impRoundTimes.push({
                round: state.impRound,
                name: actorName,
                ms: Math.round(elapsed)
            });

            state.impQueueIndex++;

            if (state.impQueueIndex < state.impRoundQueue.length) {
                // Mostra o tempo que ele colocou antes de passar
                showImpTimeReveal(actorName, Math.round(elapsed), () => {
                    showImpostorActionScreen();
                });
            } else {
                showImpTimeReveal(actorName, Math.round(elapsed), () => {
                    showImpostorRoundEnd();
                });
            }
        }
    });

    function showImpTimeReveal(name, ms, callback) {
        // Reaproveita o overlay de transição com o tempo
        const overlay = document.getElementById('transitionOverlay');
        document.getElementById('transitionLabel').innerText = name;
        document.getElementById('transitionName').innerText = formatPlayedTime(ms);
        document.getElementById('transitionSub').innerText = 'Tempo que você colocou';
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.classList.add('hidden');
                if (callback) callback();
            }, 350);
        }, 1500);
    }

    function showImpostorRoundEnd() {
        showScreen('impRoundEnd');
        document.getElementById('impRoundEndBadge').innerText = `Rodada ${state.impRound}`;

        const list = document.getElementById('impResultsList');
        list.innerHTML = '';

        for (let round = 1; round <= state.impRound; round++) {
            const roundEntries = state.impRoundTimes.filter(t => t.round === round);
            if (!roundEntries.length) continue;

            const heading = document.createElement('p');
            heading.className = 'panel-subtitle';
            heading.style.marginTop = round === 1 ? '0' : '0.75rem';
            heading.innerText = `Rodada ${round}`;
            list.appendChild(heading);

            roundEntries.forEach(t => {
                const row = document.createElement('div');
                row.className = 'result-row revealed';
                row.innerHTML = `
                    <span class="result-name"></span>
                    <span class="result-time">${formatPlayedTime(t.ms)}</span>
                `;
                row.querySelector('.result-name').textContent = t.name;
                list.appendChild(row);
            });
        }

        const addBtn = document.getElementById('impAddRoundBtn');
        const hint = document.getElementById('impRoundEndHint');
        const canAddMore = state.impRound < state.impMaxRounds;

        addBtn.disabled = !canAddMore;
        addBtn.style.opacity = canAddMore ? '1' : '0.4';
        hint.innerText = `Rodada ${state.impRound} de ${state.impMaxRounds}`;
    }

    document.getElementById('impAddRoundBtn').addEventListener('click', () => {
        if (state.impRound >= state.impMaxRounds) return;

        state.impRound++;
        state.impRoundQueue = [];
        state.impQueueIndex = 0;
        state.impTimerRunning = false;

        // Mantém alvo, impostores e faixas. Só sorteia quem começa a nova tentativa.
        startImpostorSort();
    });

    document.getElementById('impVoteBtn').addEventListener('click', () => {
        state.impVotes = {};
        state.impVoteOrder = shuffle(state.players.map(p => p.name));
        state.impVoteIndex = 0;
        showScreen('impVote');
        renderImpostorVote();
    });

    function renderImpostorVote() {
        const grid = document.getElementById('impVoteGrid');
        const voter = state.impVoteOrder[state.impVoteIndex];
        const title = document.getElementById('impVoteTitle');
        const timer = document.getElementById('impVoteTimer');
        const status = document.getElementById('impVoteStatus');

        grid.innerHTML = '';
        title.innerText = `Vez de ${voter}`;
        timer.innerText = 'Passe o celular para essa pessoa e escolha quem ela suspeita ser o impostor.';
        status.classList.add('hidden');

        state.players
            .filter(p => p.name !== voter)
            .forEach(p => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'vote-btn';
                btn.textContent = p.name;
                btn.addEventListener('click', () => {
                    if (Object.prototype.hasOwnProperty.call(state.impVotes, voter)) return;

                    state.impVotes[voter] = p.name;
                    status.classList.remove('hidden');
                    status.querySelector('span').textContent = 'Voto registrado';

                    const isLastVote = state.impVoteIndex === state.impVoteOrder.length - 1;
                    if (isLastVote) {
                        setTimeout(resolveImpostorVote, 650);
                        return;
                    }

                    const nextVoter = state.impVoteOrder[state.impVoteIndex + 1];
                    setTimeout(() => {
                        showTransition(
                            'Voto registrado',
                            nextVoter,
                            'Passe o celular para a próxima pessoa',
                            () => {
                                state.impVoteIndex++;
                                renderImpostorVote();
                            }
                        );
                    }, 500);
                });
                grid.appendChild(btn);
            });
    }

    function resolveImpostorVote() {
        const counts = {};
        Object.values(state.impVotes).forEach(name => {
            counts[name] = (counts[name] || 0) + 1;
        });

        const highestVotes = Math.max(0, ...Object.values(counts));
        const leaders = Object.keys(counts).filter(name => counts[name] === highestVotes);
        const empate = leaders.length !== 1;
        const escolhidoNome = empate ? null : leaders[0];
        const acertou = !empate && state.impImpostorNames.includes(escolhidoNome);

        const icon = document.getElementById('impFinalIcon');
        const title = document.getElementById('impFinalTitle');
        const sub = document.getElementById('impFinalSub');

        const voteLabel = document.getElementById('impFinalVoteLabel');
        voteLabel.innerText = empate
            ? `Empate na votação: ${leaders.join(', ')}`
            : `Mais votado: ${escolhidoNome} (${highestVotes} ${highestVotes === 1 ? 'voto' : 'votos'})`;

        const check = document.getElementById('impFinalCheck');
        check.innerText = empate
            ? 'A votação terminou empatada'
            : (acertou ? 'Ele era um dos impostores' : 'Ele não era impostor');

        document.getElementById('impFinalRealTime').innerText = formatTargetTime(state.targetTimeMs);

        const impLabel = state.impImpostorNames.length === 1 ? 'O impostor era' : 'Os impostores eram';
        document.getElementById('impFinalImpostorLabel').innerText = impLabel;

        const impContainer = document.getElementById('impFinalImpostors');
        impContainer.innerHTML = '';
        state.impImpostorNames.forEach(name => {
            const chip = document.createElement('span');
            chip.className = 'result-impostor-chip';
            chip.innerText = `${name} (${formatMargin(state.impImpostorMargins[name])})`;
            impContainer.appendChild(chip);
        });

        if (acertou) {
            icon.className = 'result-icon win';
            title.innerText = 'Vitória dos jogadores!';
            sub.innerText = 'A maioria identificou um dos impostores 🎉';
            if (window.confetti) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else {
            icon.className = 'result-icon';
            title.innerText = 'Vitória do impostor!';
            sub.innerText = empate
                ? 'A votação empatou. O impostor venceu 😈'
                : 'O grupo escolheu a pessoa errada 😈';
        }

        showScreen('impFinal');
        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('impPlayAgainBtn').addEventListener('click', () => {
        // Reseta e volta pro config do impostor
        state.impRound = 1;
        state.impPlayAgain = false;
        state.impImpostorNames = [];
        state.impImpostorMargins = {};
        state.impRoundTimes = [];
        state.impRoundQueue = [];
        state.impQueueIndex = 0;
        state.impVotes = {};
        state.impVoteOrder = [];
        state.impVoteIndex = 0;
        showScreen('config');
        // Reativa o modo impostor
        document.querySelectorAll('.segment-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === 'impostor');
        });
        state.mode = 'impostor';
        document.getElementById('partySetup').classList.add('hidden');
        document.getElementById('impostorSetup').classList.remove('hidden');
        document.getElementById('rulesParty').classList.add('hidden');
        document.getElementById('rulesImpostor').classList.remove('hidden');
        refreshImpostorLimits();
        if (window.lucide) lucide.createIcons();
    });

    // ============================================================
    // SAIR
    // ============================================================
    const exitModal = document.getElementById('exitModal');
    document.querySelectorAll('[data-exit-btn]').forEach(btn => {
        btn.addEventListener('click', () => { exitModal.classList.remove('hidden'); });
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
        adPanels.forEach(p => p.classList.toggle('hidden', p.dataset.adPanel !== 'advertise'));
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
            adPanels.forEach(p => p.classList.toggle('hidden', p.dataset.adPanel !== tab.dataset.adTab));
        });
    });

    async function copyText(text) {
        try { await navigator.clipboard.writeText(text); return true; }
        catch {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); document.body.removeChild(ta); return true; }
            catch { document.body.removeChild(ta); return false; }
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
        const ok = await copyText(adEmailText.textContent.trim());
        if (ok) flashCopied(adCopyBtn, adCopiedMsg, 'Copiar');
        else {
            adCopiedMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedMsg.classList.add('show');
        }
    });
    adCopyPixBtn.addEventListener('click', async () => {
        const ok = await copyText(adPixText.textContent.trim());
        if (ok) flashCopied(adCopyPixBtn, adCopiedPixMsg, 'Copiar chave');
        else {
            adCopiedPixMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedPixMsg.classList.add('show');
        }
    });

    console.log('🎉 Acerte o Tempo carregado com sucesso!');
});