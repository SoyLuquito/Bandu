// Bandu - Sintonia (Wavelength-like)
// Modo 1 dispositivo + Modo Online (Firebase)

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
    getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc,
    onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import {
    getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

// ============================================================
// FIREBASE
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyBtTEr0O_CY1fwINvPyDAR0XxC2Y8P-abU",
    authDomain: "rally-ae562.firebaseapp.com",
    projectId: "rally-ae562",
    storageBucket: "rally-ae562.firebasestorage.app",
    messagingSenderId: "901583949711",
    appId: "1:901583949711:web:55361fdf42a828bf6305fa",
    measurementId: "G-NELGBWXQ81"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});

// ============================================================
// CONSTANTES
// ============================================================
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

// ============================================================
// TEMAS DO ESPECTRO
// ============================================================
const THEMES = [
    { left: 'Frio', right: 'Quente' },
    { left: 'Baixo', right: 'Alto' },
    { left: 'Feio', right: 'Bonito' },
    { left: 'Pobre', right: 'Rico' },
    { left: 'Vermelho', right: 'Azul' },
    { left: 'Brasil', right: 'Estados Unidos' },
    { left: 'Cachorro', right: 'Gato' },
    { left: 'Metal', right: 'Madeira' },
    { left: 'Hétero', right: 'Gay' },
    { left: 'Doce', right: 'Salgado' },
    { left: 'Fofo', right: 'Assustador' },
    { left: 'Útil', right: 'Inútil' },
    { left: 'Caro', right: 'Barato' },
    { left: 'Rápido', right: 'Lento' },
    { left: 'Cheiroso', right: 'Fedorento' },
    { left: 'Limpo', right: 'Sujo' },
    { left: 'Clássico', right: 'Moderno' },
    { left: 'Chique', right: 'Simples' },
    { left: 'Cidade', right: 'Campo' },
    { left: 'Verão', right: 'Inverno' },
    { left: 'Manhã', right: 'Madrugada' },
    { left: 'Sobremesa', right: 'Prato principal' },
    { left: 'Café', right: 'Cerveja' },
    { left: 'Romântico', right: 'Picante' },
    { left: 'Famoso', right: 'Desconhecido' },
    { left: 'Trabalho', right: 'Festa' },
    { left: 'Sério', right: 'Brincadeira' },
    { left: 'Fácil', right: 'Difícil' },
    { left: 'Triste', right: 'Feliz' },
    { left: 'Calmo', right: 'Estressante' },
    { left: 'Infantil', right: 'Adulto' },
    { left: 'Caseiro', right: 'Aventureiro' },
    { left: 'Cinema', right: 'Livro' },
    { left: 'Salgado doce', right: 'Azedo' },
    { left: 'Praia', right: 'Montanha' },
    { left: 'Santo', right: 'Pecador' },
    { left: 'Bêbado', right: 'Sóbrio' },
    { left: 'Fofoca', right: 'Verdade' },
    { left: 'Rir', right: 'Chorar' },
    { left: 'Silencioso', right: 'Barulhento' },
    { left: 'Curto', right: 'Longo' },
    { left: 'Redondo', right: 'Quadrado' },
    { left: 'Feliz pra cachorro', right: 'Triste pra caramba' },
    { left: 'Cringe', right: 'Descolado' },
    { left: 'Morno', right: 'Pegando fogo' }
];

// ============================================================
// ESTADO
// ============================================================
const state = {
    gameMode: null,

    local: {
        players: [],
        targetScore: 30,
        masterIndex: 0,
        currentTheme: null,
        currentTarget: null,
        currentHint: '',
        currentMaster: null,
        guesses: {},
        guessOrder: [],
        guessIndex: 0,
        fase: 'config'
    },

    online: {
        uid: null,
        playerName: null,
        roomCode: null,
        roomRef: null,
        roomData: null,
        unsubscribeRoom: null,
        isHost: false,
        pendingAction: null
    }
};

// ============================================================
// DOM
// ============================================================
const screens = {
    home: document.getElementById('homeScreen'),
    configLocal: document.getElementById('localConfigScreen'),
    lobby: document.getElementById('lobbyScreen'),
    master: document.getElementById('masterScreen'),
    guess: document.getElementById('guessScreen'),
    reveal: document.getElementById('revealScreen'),
    score: document.getElementById('scoreScreen')
};

const exitModal = document.getElementById('exitModal');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const scoreModal = document.getElementById('scoreModal');
const liveScoreBtn = document.getElementById('liveScoreBtn');

// ============================================================
// LOADING
// ============================================================
function showLoading(text = 'Carregando...') {
    loadingText.innerText = text;
    loadingOverlay.classList.remove('hidden');
}
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateRoomCode() {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

function showScreen(key) {
    Object.keys(screens).forEach(k => {
        if (k === screens[k]) return;
    });
    Object.keys(screens).forEach(k => {
        if (k === key) screens[k].classList.remove('hidden');
        else screens[k].classList.add('hidden');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Pontuação por distância — MAIS RÍGIDA agora
function pontosPorDistancia(dist) {
    if (dist <= 0.5) return 3;   // certeiro
    if (dist <= 1.0) return 2;   // perto
    if (dist <= 1.5) return 1;   // médio
    return 0;                     // longe
}

// Pontuação do MESTRE: sempre 1 a menos que quem acertou melhor
// (2 para certeiro, 1 para perto, 0 para médio ou ninguém acertou)
function pontosMestre(melhorDistancia) {
    if (melhorDistancia <= 0.5) return 2;   // alguém acertou certeiro → mestre ganha 2
    if (melhorDistancia <= 1.0) return 1;   // alguém acertou perto → mestre ganha 1
    return 0;                                // médio ou ninguém → mestre ganha 0
}

function renderTicks(bar) {
    bar.innerHTML = '';
    for (let i = 0; i <= 10; i++) {
        const tick = document.createElement('div');
        tick.className = 'spectrum-tick' + (i % 5 === 0 ? ' major' : '');
        tick.style.left = (i * 10) + '%';
        bar.appendChild(tick);
    }
}

function applyModeClass(mode) {
    document.body.classList.remove('mode-local', 'mode-online');
    if (mode === 'local') document.body.classList.add('mode-local');
    if (mode === 'online') document.body.classList.add('mode-online');
}

function updateCoordsLabel(val) {
    const el = document.getElementById('guessCoords');
    if (el) el.innerText = `Posição: ${val.toFixed(1)}`;
}

// Mostra / esconde o botão de placar ao vivo
function setLiveScoreVisible(visible) {
    if (visible) liveScoreBtn.classList.remove('hidden');
    else liveScoreBtn.classList.add('hidden');
}

// ============================================================
// PLACAR AO VIVO
// ============================================================
liveScoreBtn.addEventListener('click', () => {
    renderLiveScore();
    scoreModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
});

document.getElementById('closeScoreModalBtn').addEventListener('click', () => {
    scoreModal.classList.add('hidden');
});

function renderLiveScore() {
    const content = document.getElementById('liveScoreContent');
    content.innerHTML = '';

    let players = [];
    let nextMaster = null;

    if (state.gameMode === 'local') {
        players = state.local.players;
        nextMaster = state.local.players[state.local.masterIndex]?.nome || null;
    } else if (state.gameMode === 'online' && state.online.roomData) {
        const room = state.online.roomData;
        players = Object.entries(room.jogadores).map(([uid, p]) => ({ nome: p.nome, pontos: p.pontos || 0, uid }));
        const masterUid = room.ordemJogadores[room.masterIndex % room.ordemJogadores.length];
        nextMaster = room.jogadores[masterUid]?.nome || null;
    }

    const sorted = [...players].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    sorted.forEach(p => {
        const isNext = p.nome === nextMaster;
        const row = document.createElement('div');
        row.className = 'score-row' + (isNext ? ' next-up' : '');
        row.innerHTML = `<span>${p.nome}${isNext ? ' <span class="next-badge">▶ Próximo mestre</span>' : ''}</span><span>${p.pontos || 0} pts</span>`;
        content.appendChild(row);
    });
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        state.online.uid = user.uid;
        if (state.online.pendingAction) {
            const act = state.online.pendingAction;
            state.online.pendingAction = null;
            if (act.type === 'create') doCreateRoom(act.name);
            else if (act.type === 'join') doJoinRoom(act.code, act.name);
        }
    }
});

async function ensureAuth() {
    if (auth.currentUser) {
        state.online.uid = auth.currentUser.uid;
        return true;
    }
    try {
        const cred = await signInAnonymously(auth);
        state.online.uid = cred.user.uid;
        return true;
    } catch (e) {
        alert('Erro de autenticação.');
        console.error(e);
        return false;
    }
}

// ============================================================
// MODAL DE NOME
// ============================================================
function askName(callback) {
    nameInput.value = '';
    nameModal.classList.remove('hidden');
    setTimeout(() => nameInput.focus(), 100);

    const cleanup = () => {
        nameModal.classList.add('hidden');
        nameInput.removeEventListener('keydown', onKey);
        document.getElementById('confirmNameBtn').removeEventListener('click', onConfirm);
        document.getElementById('cancelNameBtn').removeEventListener('click', onCancel);
    };
    const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); onConfirm(); } };
    const onConfirm = () => {
        const v = nameInput.value.trim();
        if (!v) { nameInput.focus(); return; }
        cleanup();
        callback(v);
    };
    const onCancel = () => { cleanup(); callback(null); };

    nameInput.addEventListener('keydown', onKey);
    document.getElementById('confirmNameBtn').addEventListener('click', onConfirm);
    document.getElementById('cancelNameBtn').addEventListener('click', onCancel);
}

// ============================================================
// MENU INICIAL
// ============================================================
document.getElementById('modeLocalBtn').addEventListener('click', () => {
    state.gameMode = 'local';
    applyModeClass('local');
    initLocalGame();
});

document.getElementById('modeOnlineBtn').addEventListener('click', () => {
    state.gameMode = 'online';
    applyModeClass('online');
    document.getElementById('onlineMenu').classList.remove('hidden');
    document.getElementById('modeChoice').classList.add('hidden');
});

// ============================================================
// ============================================================
// ============== MODO LOCAL (1 DISPOSITIVO) ==================
// ============================================================
// ============================================================

function initLocalGame() {
    if (state.gameMode !== 'local') return;
    state.local = {
        players: [],
        targetScore: 30,
        masterIndex: 0,
        currentTheme: null,
        currentTarget: null,
        currentHint: '',
        currentMaster: null,
        guesses: {},
        guessOrder: [],
        guessIndex: 0,
        fase: 'config'
    };
    renderLocalConfig();
    showScreen('configLocal');
    setLiveScoreVisible(false);
}

function renderLocalConfig() {
    if (state.gameMode !== 'local') return;
    showScreen('configLocal');
    const L = state.local;

    const list = document.getElementById('localPlayerList');
    list.innerHTML = '';
    L.players.forEach((p, i) => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerHTML = `<span>${p.nome}</span><button type="button">&times;</button>`;
        li.querySelector('button').addEventListener('click', () => {
            if (state.gameMode !== 'local') return;
            L.players.splice(i, 1);
            renderLocalConfig();
        });
        list.appendChild(li);
    });

    document.getElementById('localPlayerCount').innerText = `${L.players.length} / ${MAX_PLAYERS}`;
    document.querySelectorAll('#localScoreGroup .chip-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.value) === L.targetScore);
    });

    const startBtn = document.getElementById('localStartBtn');
    startBtn.disabled = L.players.length < MIN_PLAYERS;

    if (window.lucide) lucide.createIcons();
}

document.getElementById('localAddPlayerBtn').addEventListener('click', () => {
    if (state.gameMode !== 'local') return;
    const input = document.getElementById('localPlayerInput');
    const nome = input.value.trim();
    if (!nome) return;
    if (state.local.players.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
        alert('Já tem alguém com esse nome'); return;
    }
    if (state.local.players.length >= MAX_PLAYERS) return;
    state.local.players.push({ nome, pontos: 0 });
    input.value = '';
    renderLocalConfig();
    input.focus();
});

document.getElementById('localPlayerInput').addEventListener('keydown', (e) => {
    if (state.gameMode !== 'local') return;
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('localAddPlayerBtn').click(); }
});

document.querySelectorAll('#localScoreGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        state.local.targetScore = parseInt(btn.dataset.value, 10);
        renderLocalConfig();
    });
});

document.getElementById('localStartBtn').addEventListener('click', () => {
    if (state.gameMode !== 'local') return;
    if (state.local.players.length < MIN_PLAYERS) {
        alert(`Precisa de pelo menos ${MIN_PLAYERS} jogadores`); return;
    }
    state.local.masterIndex = 0;
    startLocalRound();
});

function startLocalRound() {
    if (state.gameMode !== 'local') return;
    const L = state.local;

    L.currentTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    L.currentTarget = Math.round((Math.random() * 8 + 1) * 10) / 10;
    L.currentHint = '';
    L.currentMaster = L.players[L.masterIndex].nome;
    L.guesses = {};
    const order = [];
    for (let i = 1; i < L.players.length; i++) {
        order.push(L.players[(L.masterIndex + i) % L.players.length].nome);
    }
    L.guessOrder = order;
    L.guessIndex = 0;
    L.fase = 'master';

    setLiveScoreVisible(true);
    renderLocalMasterScreen();
}

function renderLocalMasterScreen() {
    if (state.gameMode !== 'local') return;
    showScreen('master');
    const L = state.local;

    document.getElementById('masterPlayerName').innerText = L.currentMaster;
    document.getElementById('masterSub').innerText = 'Passe o celular para ele(a)';

    const revealArea = document.getElementById('masterRevealArea');
    const revealBtn = document.getElementById('masterRevealBtn');
    const confirmBtn = document.getElementById('masterConfirmHintBtn');

    revealArea.classList.add('hidden');
    revealBtn.classList.remove('hidden');

    document.getElementById('masterInstructionText').innerText =
        'Dê uma dica em voz alta que fique perto do alvo — mas não óbvia demais!';

    document.getElementById('themeLeft').innerText = L.currentTheme.left;
    document.getElementById('themeRight').innerText = L.currentTheme.right;

    renderTicks(document.getElementById('masterSpectrumBar'));

    const newRevealBtn = revealBtn.cloneNode(true);
    revealBtn.parentNode.replaceChild(newRevealBtn, revealBtn);

    newRevealBtn.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        revealArea.classList.remove('hidden');
        newRevealBtn.classList.add('hidden');

        // Mostra a linha do alvo
        const targetLine = document.getElementById('masterTargetLine');
        targetLine.style.display = 'block';
        targetLine.style.left = (L.currentTarget * 10) + '%';

        if (window.lucide) lucide.createIcons();
    });

    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newConfirm.innerHTML = '<i data-lucide="arrow-right"></i> Dica dada — continuar';

    newConfirm.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        L.currentHint = '';
        L.fase = 'guess';
        L.guessIndex = 0;
        renderLocalGuessScreen();
    });

    if (window.lucide) lucide.createIcons();
}

function renderLocalGuessScreen() {
    if (state.gameMode !== 'local') return;
    showScreen('guess');
    const L = state.local;

    if (L.guessIndex >= L.guessOrder.length) {
        finalizeLocalRound();
        return;
    }

    const currentGuesser = L.guessOrder[L.guessIndex];
    document.getElementById('guessPlayerName').innerText = currentGuesser;
    document.getElementById('guessSub').innerText = `Passe o celular para ${currentGuesser}`;

    const revealArea = document.getElementById('guessRevealArea');
    const revealBtn = document.getElementById('guessRevealBtn');
    revealArea.classList.add('hidden');
    revealBtn.classList.remove('hidden');

    document.getElementById('guessThemeLeft').innerText = L.currentTheme.left;
    document.getElementById('guessThemeRight').innerText = L.currentTheme.right;
    document.getElementById('guessHintText').innerText = '';

    const bar = document.getElementById('guessSpectrumBar');
    renderTicks(bar);

    // Remove linhas fixas antigas
    revealArea.querySelectorAll('.fixed-line').forEach(el => el.remove());

    // Mostra linhas dos palpites já registrados
    Object.entries(L.guesses).forEach(([nome, pos]) => {
        const line = document.createElement('div');
        line.className = 'fixed-line pin-close';
        line.style.left = (pos * 10) + '%';
        line.innerHTML = `<span class="line-label">${nome.charAt(0).toUpperCase()}</span>`;
        line.title = nome;
        revealArea.appendChild(line);
    });

    document.getElementById('guessTargetLine').style.display = 'none';

    const newReveal = revealBtn.cloneNode(true);
    revealBtn.parentNode.replaceChild(newReveal, revealBtn);

    newReveal.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        revealArea.classList.remove('hidden');
        newReveal.classList.add('hidden');

        initDraggableLine(currentGuesser);
        if (window.lucide) lucide.createIcons();
    });

    if (window.lucide) lucide.createIcons();
}

function initDraggableLine(guesserName) {
    const L = state.local;
    const line = document.getElementById('draggableLine');
    const wrap = line.parentElement;

    line.dataset.pos = '5';
    line.style.left = '50%';
    updateCoordsLabel(5);

    const newLine = line.cloneNode(true);
    line.parentNode.replaceChild(newLine, line);
    const newLineEl = document.getElementById('draggableLine');

    const confirmBtn = document.getElementById('guessConfirmBtn');
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    newConfirm.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        const pos = parseFloat(newLineEl.dataset.pos || '5');
        L.guesses[guesserName] = pos;
        L.guessIndex++;
        renderLocalGuessScreen();
    });

    let dragging = false;
    const onDown = (e) => { dragging = true; e.preventDefault?.(); };
    const onMove = (e) => {
        if (!dragging) return;
        e.preventDefault?.();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = wrap.getBoundingClientRect();
        let pct = (clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        const val = pct * 10;
        newLineEl.dataset.pos = val.toFixed(2);
        newLineEl.style.left = (val * 10) + '%';
        updateCoordsLabel(val);
    };
    const onUp = () => { dragging = false; };

    newLineEl.addEventListener('mousedown', onDown);
    newLineEl.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);

    wrap.addEventListener('click', (e) => {
        if (e.target === newLineEl || newLineEl.contains(e.target)) return;
        const rect = wrap.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        const val = pct * 10;
        newLineEl.dataset.pos = val.toFixed(2);
        newLineEl.style.left = (val * 10) + '%';
        updateCoordsLabel(val);
    });
}

function finalizeLocalRound() {
    if (state.gameMode !== 'local') return;
    const L = state.local;
    const target = L.currentTarget;
    const masterName = L.currentMaster;

    const roundResults = [];
    let melhorDist = Infinity;

    Object.entries(L.guesses).forEach(([nome, pos]) => {
        const dist = Math.abs(pos - target);
        const pts = pontosPorDistancia(dist);
        roundResults.push({ nome, pos, dist, pts });
        if (dist < melhorDist) melhorDist = dist;
    });

    // Mestre ganha 1 a menos que quem acertou melhor
    const masterPoints = melhorDist === Infinity ? 0 : pontosMestre(melhorDist);

    // Aplica pontos
    roundResults.forEach(r => {
        const p = L.players.find(x => x.nome === r.nome);
        if (p) p.pontos += r.pts;
    });
    const master = L.players.find(x => x.nome === masterName);
    if (master) master.pontos += masterPoints;

    L.lastRoundResults = roundResults;
    L.lastMasterPoints = masterPoints;

    renderLocalRevealScreen();
}

function renderLocalRevealScreen() {
    if (state.gameMode !== 'local') return;
    showScreen('reveal');
    const L = state.local;
    const target = L.currentTarget;

    document.getElementById('revealThemeTitle').innerText = `${L.currentTheme.left} ↔ ${L.currentTheme.right}`;
    document.getElementById('revealHintLine').innerHTML =
        `Mestre: <strong>${L.currentMaster}</strong> (dica falada)`;

    document.getElementById('revealThemeLeft').innerText = L.currentTheme.left;
    document.getElementById('revealThemeRight').innerText = L.currentTheme.right;

    renderTicks(document.getElementById('revealSpectrumBar'));

    // Linha do alvo
    const targetLine = document.getElementById('revealTargetLine');
    targetLine.style.display = 'block';
    targetLine.style.left = (target * 10) + '%';

    // Linhas dos palpites
    const pinsLayer = document.getElementById('revealPinsLayer');
    pinsLayer.innerHTML = '';
    L.lastRoundResults.forEach(r => {
        const line = document.createElement('div');
        const cls = r.dist <= 0.5 ? 'pin-close' : (r.dist <= 1.0 ? 'pin-close' : (r.dist <= 1.5 ? 'pin-med' : 'pin-far'));
        line.className = 'fixed-line ' + cls;
        line.style.left = (r.pos * 10) + '%';
        line.innerHTML = `<span class="line-label">${r.nome.charAt(0).toUpperCase()} +${r.pts}</span>`;
        line.title = `${r.nome} (+${r.pts})`;
        pinsLayer.appendChild(line);
    });

    const scoresDiv = document.getElementById('roundScores');
    scoresDiv.innerHTML = '';

    const masterRow = document.createElement('div');
    masterRow.className = 'round-score-row master-row';
    masterRow.innerHTML = `<span>${L.currentMaster} (mestre)</span><span class="pts">+${L.lastMasterPoints}</span>`;
    scoresDiv.appendChild(masterRow);

    L.lastRoundResults.forEach(r => {
        const row = document.createElement('div');
        row.className = 'round-score-row pts-' + r.pts;
        row.innerHTML = `<span>${r.nome} <small style="color:var(--texto-suave)">(dist. ${r.dist.toFixed(1)})</small></span><span class="pts">+${r.pts}</span>`;
        scoresDiv.appendChild(row);
    });

    const nextBtn = document.getElementById('nextRoundBtn');
    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    newNext.classList.remove('hidden');
    document.getElementById('waitNextRoundMsg').classList.add('hidden');

    newNext.addEventListener('click', () => {
        if (state.gameMode !== 'local') return;
        const winner = L.players.find(p => p.pontos >= L.targetScore);
        if (winner) {
            return renderLocalScoreScreen(true);
        }
        L.masterIndex = (L.masterIndex + 1) % L.players.length;
        startLocalRound();
    });

    if (window.lucide) lucide.createIcons();
}

function renderLocalScoreScreen(finished) {
    if (state.gameMode !== 'local') return;
    showScreen('score');
    const L = state.local;

    const title = document.getElementById('scoreTitle');
    const sub = document.getElementById('scoreSubtitle');
    const trophy = document.getElementById('scoreTrophyIcon');
    const trophyWrap = document.getElementById('scoreTrophyWrap');

    if (finished) {
        const winner = [...L.players].sort((a, b) => b.pontos - a.pontos)[0];
        title.innerText = `${winner.nome} venceu!`;
        sub.innerText = `Chegou a ${winner.pontos} pontos`;
        trophyWrap.classList.add('finished');
        trophy.setAttribute('data-lucide', 'trophy');
        if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
        title.innerText = 'Placar';
        sub.innerText = `Continue até alguém chegar a ${L.targetScore}`;
        trophyWrap.classList.remove('finished');
    }

    const board = document.getElementById('scoreBoard');
    board.innerHTML = '';
    const sorted = [...L.players].sort((a, b) => b.pontos - a.pontos);
    const nextMaster = L.players[L.masterIndex];
    sorted.forEach(p => {
        const isNext = p.nome === nextMaster?.nome && !finished;
        const row = document.createElement('div');
        row.className = 'score-row' + (isNext ? ' next-up' : '');
        row.innerHTML = `<span>${p.nome}${isNext ? ' <span class="next-badge">▶ Próximo mestre</span>' : ''}</span><span>${p.pontos} pts</span>`;
        board.appendChild(row);
    });

    const actions = document.getElementById('gameOverActions');
    const spectator = document.getElementById('spectatorMsg');
    if (finished) {
        actions.classList.remove('hidden');
        spectator.classList.add('hidden');
    } else {
        actions.classList.add('hidden');
        spectator.classList.add('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

document.getElementById('rematchBtn').addEventListener('click', () => {
    if (state.gameMode !== 'local') return;
    state.local.players.forEach(p => p.pontos = 0);
    state.local.masterIndex = 0;
    startLocalRound();
});

document.getElementById('editConfigBtn').addEventListener('click', () => {
    if (state.gameMode !== 'local') return;
    initLocalGame();
});

document.getElementById('closeRoomBtn').addEventListener('click', () => {
    if (state.gameMode !== 'local') return;
    cleanupAndHome();
});

// ============================================================
// ============================================================
// ================= MODO ONLINE (FIREBASE) ===================
// ============================================================
// ============================================================

document.getElementById('createRoomBtn').addEventListener('click', () => {
    if (state.gameMode !== 'online') return;
    askName(async (name) => {
        if (!name) return;
        const ok = await ensureAuth();
        if (!ok) return;
        if (auth.currentUser) doCreateRoom(name);
        else state.online.pendingAction = { type: 'create', name };
    });
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    if (state.gameMode !== 'online') return;
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code.length !== CODE_LENGTH) { alert('Digite um código de 6 caracteres'); return; }
    askName(async (name) => {
        if (!name) return;
        const ok = await ensureAuth();
        if (!ok) return;
        if (auth.currentUser) doJoinRoom(code, name);
        else state.online.pendingAction = { type: 'join', code, name };
    });
});

async function doCreateRoom(name) {
    if (state.gameMode !== 'online') return;
    showLoading('Criando sala...');
    try {
        state.online.playerName = name.slice(0, 15);
        let code, exists = true, tries = 0;
        while (exists && tries < 10) {
            code = generateRoomCode();
            const check = await getDoc(doc(db, 'partidas_sintonia', code));
            exists = check.exists();
            tries++;
        }
        if (exists) { hideLoading(); alert('Não foi possível gerar um código.'); return; }

        const roomRef = doc(db, 'partidas_sintonia', code);
        await setDoc(roomRef, {
            codigo: code,
            criadorId: state.online.uid,
            criadoEm: serverTimestamp(),
            status: 'lobby',
            config: { metaPontos: 30 },
            jogadores: {
                [state.online.uid]: {
                    nome: state.online.playerName,
                    pronto: false,
                    pontos: 0,
                    palpite: null
                }
            },
            ordemJogadores: [state.online.uid],
            masterIndex: 0,
            currentTheme: null,
            currentTarget: null,
            currentHint: '',
            guesses: {},
            guessOrder: [],
            guessIndex: 0
        });

        state.online.roomCode = code;
        state.online.roomRef = roomRef;
        state.online.isHost = true;
        hideLoading();
        listenToRoom(code);
    } catch (err) {
        hideLoading();
        console.error(err);
        alert('Erro ao criar sala: ' + err.message);
    }
}

async function doJoinRoom(code, name) {
    if (state.gameMode !== 'online') return;
    showLoading('Entrando na sala...');
    try {
        state.online.playerName = name.slice(0, 15);
        const roomRef = doc(db, 'partidas_sintonia', code);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) { hideLoading(); alert('Sala não encontrada'); return; }
        const roomData = snap.data();
        if (roomData.status !== 'lobby') { hideLoading(); alert('A partida já começou'); return; }
        const players = Object.entries(roomData.jogadores || {});
        if (players.length >= MAX_PLAYERS) { hideLoading(); alert('Sala cheia'); return; }

        const meuNome = state.online.playerName.toLowerCase();
        const dup = players.some(([, p]) => p.nome?.toLowerCase() === meuNome);
        if (dup) { hideLoading(); alert('Já tem alguém com esse nome'); return; }

        const ordemAtual = roomData.ordemJogadores || [];
        await updateDoc(roomRef, {
            [`jogadores.${state.online.uid}`]: {
                nome: state.online.playerName,
                pronto: false,
                pontos: 0,
                palpite: null
            },
            ordemJogadores: [...ordemAtual, state.online.uid]
        });

        state.online.roomCode = code;
        state.online.roomRef = roomRef;
        state.online.isHost = false;
        hideLoading();
        listenToRoom(code);
    } catch (err) {
        hideLoading();
        console.error(err);
        alert('Erro ao entrar: ' + err.message);
    }
}

function listenToRoom(code) {
    if (state.online.unsubscribeRoom) state.online.unsubscribeRoom();
    const roomRef = doc(db, 'partidas_sintonia', code);
    state.online.roomRef = roomRef;

    state.online.unsubscribeRoom = onSnapshot(roomRef, (snap) => {
        if (state.gameMode !== 'online') return;
        if (!snap.exists()) { alert('A sala foi encerrada'); cleanupAndHome(); return; }
        state.online.roomData = snap.data();
        state.online.isHost = state.online.roomData.criadorId === state.online.uid;

        const status = state.online.roomData.status;
        if (status === 'lobby') {
            renderOnlineLobby();
            setLiveScoreVisible(false);
        } else {
            setLiveScoreVisible(true);
            if (status === 'master') renderOnlineMaster();
            else if (status === 'guess') renderOnlineGuess();
            else if (status === 'reveal') renderOnlineReveal();
            else if (status === 'score') renderOnlineScore();
        }
    }, (err) => {
        console.error('Listener error:', err);
    });
}

function renderOnlineLobby() {
    if (state.gameMode !== 'online') return;
    showScreen('lobby');
    const room = state.online.roomData;

    document.getElementById('lobbyRoomCode').innerText = state.online.roomCode;

    const hostConfig = document.getElementById('hostConfig');
    if (state.online.isHost) {
        hostConfig.classList.remove('hidden');
        document.querySelectorAll('#onlineScoreGroup .chip-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.value) === room.config.metaPontos);
        });
    } else {
        hostConfig.classList.add('hidden');
    }

    const players = Object.entries(room.jogadores).map(([uid, p]) => ({ uid, ...p }));
    document.getElementById('playerCount').innerText = `${players.length} / ${MAX_PLAYERS}`;

    const list = document.getElementById('playersList');
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.className = 'player-item' + (p.uid === room.criadorId ? ' host' : '');
        li.innerHTML = `
            <span>${p.nome}${p.uid === room.criadorId ? ' 👑' : ''}</span>
            <span class="player-ready ${p.pronto ? 'ready' : 'not-ready'}">${p.pronto ? 'Pronto' : 'Aguardando'}</span>
        `;
        list.appendChild(li);
    });

    const startBtn = document.getElementById('startGameBtn');
    const readyBtn = document.getElementById('readyBtn');
    const me = room.jogadores[state.online.uid];

    if (state.online.isHost) {
        startBtn.classList.remove('hidden');
        readyBtn.classList.add('hidden');
        const convidados = players.filter(p => p.uid !== state.online.uid);
        const todosProntos = convidados.every(p => p.pronto);
        startBtn.disabled = !(todosProntos && players.length >= MIN_PLAYERS);
    } else {
        startBtn.classList.add('hidden');
        readyBtn.classList.remove('hidden');
        if (me?.pronto) {
            readyBtn.innerHTML = '<i data-lucide="x"></i> Cancelar Pronto';
            readyBtn.className = 'btn btn-secondary btn-block';
        } else {
            readyBtn.innerHTML = '<i data-lucide="check"></i> Estou Pronto';
            readyBtn.className = 'btn btn-primary btn-block';
        }
    }

    if (window.lucide) lucide.createIcons();
}

document.querySelectorAll('#onlineScoreGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (state.gameMode !== 'online' || !state.online.isHost) return;
        await updateDoc(state.online.roomRef, { 'config.metaPontos': parseInt(btn.dataset.value, 10) });
    });
});

document.getElementById('readyBtn').addEventListener('click', async () => {
    if (state.gameMode !== 'online') return;
    const me = state.online.roomData.jogadores[state.online.uid];
    if (!me) return;
    await updateDoc(state.online.roomRef, { [`jogadores.${state.online.uid}.pronto`]: !me.pronto });
});

document.getElementById('startGameBtn').addEventListener('click', async () => {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    const room = state.online.roomData;
    const players = Object.entries(room.jogadores);
    if (players.length < MIN_PLAYERS) { alert(`Precisa de pelo menos ${MIN_PLAYERS}`); return; }
    const convidados = players.filter(([uid]) => uid !== state.online.uid);
    if (!convidados.every(([, p]) => p.pronto)) { alert('Todos precisam estar prontos'); return; }
    showLoading('Iniciando partida...');
    try {
        await startOnlineRound();
    } finally { hideLoading(); }
});

async function startOnlineRound() {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    const room = state.online.roomData;
    const ordem = room.ordemJogadores;
    const masterUid = ordem[room.masterIndex % ordem.length];

    const tema = THEMES[Math.floor(Math.random() * THEMES.length)];
    const alvo = Math.round((Math.random() * 8 + 1) * 10) / 10;

    const idx = room.masterIndex % ordem.length;
    const guessOrder = [];
    for (let i = 1; i < ordem.length; i++) {
        guessOrder.push(ordem[(idx + i) % ordem.length]);
    }

    const jogadoresAtualizados = { ...room.jogadores };
    Object.keys(jogadoresAtualizados).forEach(uid => {
        jogadoresAtualizados[uid].palpite = null;
    });

    await updateDoc(state.online.roomRef, {
        status: 'master',
        currentTheme: tema,
        currentTarget: alvo,
        currentHint: '',
        guesses: {},
        guessOrder,
        guessIndex: 0,
        jogadores: jogadoresAtualizados
    });
}

function renderOnlineMaster() {
    if (state.gameMode !== 'online') return;
    showScreen('master');
    const room = state.online.roomData;
    const ordem = room.ordemJogadores;
    const masterUid = ordem[room.masterIndex % ordem.length];
    const masterNome = room.jogadores[masterUid]?.nome || '?';
    const euSouMestre = masterUid === state.online.uid;

    document.getElementById('masterPlayerName').innerText = masterNome;

    const revealArea = document.getElementById('masterRevealArea');
    const revealBtn = document.getElementById('masterRevealBtn');
    const hintInput = document.getElementById('masterHintInput');
    const confirmBtn = document.getElementById('masterConfirmHintBtn');

    document.getElementById('masterInstructionText').innerText =
        'Este é o alvo secreto. Digite uma dica que fique perto dele — mas não óbvia demais!';

    document.getElementById('themeLeft').innerText = room.currentTheme.left;
    document.getElementById('themeRight').innerText = room.currentTheme.right;
    renderTicks(document.getElementById('masterSpectrumBar'));

    if (!euSouMestre) {
        revealArea.classList.add('hidden');
        revealBtn.classList.remove('hidden');
        revealBtn.disabled = true;
        revealBtn.innerHTML = `<i data-lucide="hourglass"></i> ${masterNome} está pensando...`;
        document.getElementById('masterSub').innerText = `${masterNome} está escolhendo a dica`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    document.getElementById('masterSub').innerText = 'Você é o mestre!';

    revealArea.classList.add('hidden');
    revealBtn.classList.remove('hidden');
    revealBtn.disabled = false;
    revealBtn.innerHTML = '<i data-lucide="eye"></i> Revelar alvo secreto';

    hintInput.value = '';
    hintInput.disabled = false;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i data-lucide="arrow-right"></i> Enviar dica';

    const newReveal = revealBtn.cloneNode(true);
    revealBtn.parentNode.replaceChild(newReveal, revealBtn);

    newReveal.addEventListener('click', () => {
        if (state.gameMode !== 'online') return;
        revealArea.classList.remove('hidden');
        newReveal.classList.add('hidden');

        const targetLine = document.getElementById('masterTargetLine');
        targetLine.style.display = 'block';
        targetLine.style.left = (room.currentTarget * 10) + '%';

        if (window.lucide) lucide.createIcons();
        hintInput.focus();
    });

    const newInput = hintInput.cloneNode(true);
    hintInput.parentNode.replaceChild(newInput, hintInput);

    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    newInput.addEventListener('input', () => {
        newConfirm.disabled = newInput.value.trim().length < 1;
    });
    newInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !newConfirm.disabled) {
            e.preventDefault();
            newConfirm.click();
        }
    });

    newConfirm.addEventListener('click', async () => {
        if (state.gameMode !== 'online') return;
        const v = newInput.value.trim();
        if (!v) return;
        await updateDoc(state.online.roomRef, {
            currentHint: v,
            status: 'guess',
            guessIndex: 0
        });
    });

    if (window.lucide) lucide.createIcons();
}

function renderOnlineGuess() {
    if (state.gameMode !== 'online') return;
    showScreen('guess');
    const room = state.online.roomData;

    if (room.guessIndex >= room.guessOrder.length) {
        if (state.online.isHost) finalizeOnlineRound();
        return;
    }

    const currentUid = room.guessOrder[room.guessIndex];
    const currentName = room.jogadores[currentUid]?.nome || '?';
    const euSouVez = currentUid === state.online.uid;

    document.getElementById('guessPlayerName').innerText = currentName;
    document.getElementById('guessThemeLeft').innerText = room.currentTheme.left;
    document.getElementById('guessThemeRight').innerText = room.currentTheme.right;
    document.getElementById('guessHintText').innerText = `"${room.currentHint}"`;
    renderTicks(document.getElementById('guessSpectrumBar'));

    const revealArea = document.getElementById('guessRevealArea');
    revealArea.querySelectorAll('.fixed-line').forEach(el => el.remove());

    Object.entries(room.guesses || {}).forEach(([uid, pos]) => {
        const nome = room.jogadores[uid]?.nome || '?';
        const line = document.createElement('div');
        line.className = 'fixed-line pin-close';
        line.style.left = (pos * 10) + '%';
        line.innerHTML = `<span class="line-label">${nome.charAt(0).toUpperCase()}</span>`;
        line.title = nome;
        revealArea.appendChild(line);
    });

    document.getElementById('guessTargetLine').style.display = 'none';

    const revealBtn = document.getElementById('guessRevealBtn');

    if (!euSouVez) {
        revealArea.classList.add('hidden');
        revealBtn.classList.remove('hidden');
        revealBtn.disabled = true;
        revealBtn.innerHTML = `<i data-lucide="hourglass"></i> Vez de ${currentName}...`;
        document.getElementById('guessSub').innerText = `Aguarde ${currentName} palpitar`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    document.getElementById('guessSub').innerText = 'Sua vez de palpitar!';
    revealArea.classList.add('hidden');
    revealBtn.classList.remove('hidden');
    revealBtn.disabled = false;
    revealBtn.innerHTML = '<i data-lucide="eye"></i> Ver dica e palpitar';

    const newReveal = revealBtn.cloneNode(true);
    revealBtn.parentNode.replaceChild(newReveal, revealBtn);

    newReveal.addEventListener('click', () => {
        if (state.gameMode !== 'online') return;
        revealArea.classList.remove('hidden');
        newReveal.classList.add('hidden');
        initOnlineDraggableLine();
        if (window.lucide) lucide.createIcons();
    });

    if (window.lucide) lucide.createIcons();
}

function initOnlineDraggableLine() {
    const line = document.getElementById('draggableLine');
    const wrap = line.parentElement;

    line.dataset.pos = '5';
    line.style.left = '50%';
    updateCoordsLabel(5);

    const newLine = line.cloneNode(true);
    line.parentNode.replaceChild(newLine, line);
    const newLineEl = document.getElementById('draggableLine');

    const confirmBtn = document.getElementById('guessConfirmBtn');
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    newConfirm.addEventListener('click', async () => {
        if (state.gameMode !== 'online') return;
        const pos = parseFloat(newLineEl.dataset.pos || '5');
        const room = state.online.roomData;
        const guesses = { ...(room.guesses || {}) };
        guesses[state.online.uid] = pos;
        await updateDoc(state.online.roomRef, {
            guesses,
            guessIndex: room.guessIndex + 1
        });
    });

    let dragging = false;
    const onDown = (e) => { dragging = true; e.preventDefault?.(); };
    const onMove = (e) => {
        if (!dragging) return;
        e.preventDefault?.();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = wrap.getBoundingClientRect();
        let pct = (clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        const val = pct * 10;
        newLineEl.dataset.pos = val.toFixed(2);
        newLineEl.style.left = (val * 10) + '%';
        updateCoordsLabel(val);
    };
    const onUp = () => { dragging = false; };

    newLineEl.addEventListener('mousedown', onDown);
    newLineEl.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);

    wrap.addEventListener('click', (e) => {
        if (e.target === newLineEl || newLineEl.contains(e.target)) return;
        const rect = wrap.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        const val = pct * 10;
        newLineEl.dataset.pos = val.toFixed(2);
        newLineEl.style.left = (val * 10) + '%';
        updateCoordsLabel(val);
    });
}

async function finalizeOnlineRound() {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    const room = state.online.roomData;
    const target = room.currentTarget;

    const masterUid = room.ordemJogadores[room.masterIndex % room.ordemJogadores.length];
    const masterName = room.jogadores[masterUid]?.nome || '?';

    const roundResults = [];
    let melhorDist = Infinity;

    Object.entries(room.guesses || {}).forEach(([uid, pos]) => {
        const nome = room.jogadores[uid]?.nome || '?';
        const dist = Math.abs(pos - target);
        const pts = pontosPorDistancia(dist);
        roundResults.push({ uid, nome, pos, dist, pts });
        if (dist < melhorDist) melhorDist = dist;
    });

    // Mestre ganha 1 a menos que quem acertou melhor
    const masterPoints = melhorDist === Infinity ? 0 : pontosMestre(melhorDist);

    const jogadoresAtualizados = JSON.parse(JSON.stringify(room.jogadores));
    roundResults.forEach(r => {
        jogadoresAtualizados[r.uid].pontos = (jogadoresAtualizados[r.uid].pontos || 0) + r.pts;
    });
    jogadoresAtualizados[masterUid].pontos = (jogadoresAtualizados[masterUid].pontos || 0) + masterPoints;

    const meta = room.config.metaPontos;
    const winner = Object.entries(jogadoresAtualizados).find(([, p]) => p.pontos >= meta);

    await updateDoc(state.online.roomRef, {
        jogadores: jogadoresAtualizados,
        status: 'reveal',
        lastRoundResults: roundResults,
        lastMasterPoints: masterPoints,
        lastMasterName: masterName,
        vencedor: winner ? winner[1].nome : null
    });
}

function renderOnlineReveal() {
    if (state.gameMode !== 'online') return;
    showScreen('reveal');
    const room = state.online.roomData;

    document.getElementById('revealThemeTitle').innerText = `${room.currentTheme.left} ↔ ${room.currentTheme.right}`;
    document.getElementById('revealHintLine').innerHTML =
        `Dica: "<strong>${room.currentHint}</strong>" — ${room.lastMasterName || '?'}`;

    document.getElementById('revealThemeLeft').innerText = room.currentTheme.left;
    document.getElementById('revealThemeRight').innerText = room.currentTheme.right;

    renderTicks(document.getElementById('revealSpectrumBar'));

    const targetLine = document.getElementById('revealTargetLine');
    targetLine.style.display = 'block';
    targetLine.style.left = (room.currentTarget * 10) + '%';

    const pinsLayer = document.getElementById('revealPinsLayer');
    pinsLayer.innerHTML = '';
    (room.lastRoundResults || []).forEach(r => {
        const line = document.createElement('div');
        const cls = r.dist <= 1.0 ? 'pin-close' : (r.dist <= 1.5 ? 'pin-med' : 'pin-far');
        line.className = 'fixed-line ' + cls;
        line.style.left = (r.pos * 10) + '%';
        line.innerHTML = `<span class="line-label">${r.nome.charAt(0).toUpperCase()} +${r.pts}</span>`;
        line.title = `${r.nome} (+${r.pts})`;
        pinsLayer.appendChild(line);
    });

    const scoresDiv = document.getElementById('roundScores');
    scoresDiv.innerHTML = '';

    const masterRow = document.createElement('div');
    masterRow.className = 'round-score-row master-row';
    masterRow.innerHTML = `<span>${room.lastMasterName} (mestre)</span><span class="pts">+${room.lastMasterPoints}</span>`;
    scoresDiv.appendChild(masterRow);

    (room.lastRoundResults || []).forEach(r => {
        const row = document.createElement('div');
        row.className = 'round-score-row pts-' + r.pts;
        row.innerHTML = `<span>${r.nome} <small style="color:var(--texto-suave)">(dist. ${r.dist.toFixed(1)})</small></span><span class="pts">+${r.pts}</span>`;
        scoresDiv.appendChild(row);
    });

    const nextBtn = document.getElementById('nextRoundBtn');
    const waitMsg = document.getElementById('waitNextRoundMsg');

    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    if (state.online.isHost) {
        newNext.classList.remove('hidden');
        waitMsg.classList.add('hidden');
        newNext.addEventListener('click', async () => {
            if (state.gameMode !== 'online') return;
            const room2 = state.online.roomData;
            if (room2.vencedor) {
                await updateDoc(state.online.roomRef, { status: 'score' });
                return;
            }
            const proximoIndex = (room2.masterIndex + 1) % room2.ordemJogadores.length;
            await updateDoc(state.online.roomRef, { masterIndex: proximoIndex });
            await startOnlineRound();
        });
    } else {
        newNext.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

function renderOnlineScore() {
    if (state.gameMode !== 'online') return;
    showScreen('score');
    const room = state.online.roomData;

    const players = Object.entries(room.jogadores).map(([uid, p]) => ({ uid, ...p }));
    const sorted = [...players].sort((a, b) => (b.pontos || 0) - (a.pontos || 0));
    const winner = sorted[0];

    const title = document.getElementById('scoreTitle');
    const sub = document.getElementById('scoreSubtitle');
    const trophyWrap = document.getElementById('scoreTrophyWrap');

    title.innerText = `${winner.nome} venceu!`;
    sub.innerText = `Chegou a ${winner.pontos} pontos`;
    trophyWrap.classList.add('finished');

    const board = document.getElementById('scoreBoard');
    board.innerHTML = '';
    sorted.forEach(p => {
        const row = document.createElement('div');
        row.className = 'score-row';
        row.innerHTML = `<span>${p.nome}</span><span>${p.pontos || 0} pts</span>`;
        board.appendChild(row);
    });

    const actions = document.getElementById('gameOverActions');
    const spectator = document.getElementById('spectatorMsg');
    if (state.online.isHost) {
        actions.classList.remove('hidden');
        spectator.classList.add('hidden');
    } else {
        actions.classList.add('hidden');
        spectator.classList.remove('hidden');
    }

    if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (window.lucide) lucide.createIcons();
}

document.getElementById('rematchBtn').addEventListener('click', async () => {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    const room = state.online.roomData;
    const jogadoresAtualizados = JSON.parse(JSON.stringify(room.jogadores));
    Object.keys(jogadoresAtualizados).forEach(uid => {
        jogadoresAtualizados[uid].pontos = 0;
        jogadoresAtualizados[uid].palpite = null;
    });
    await updateDoc(state.online.roomRef, {
        jogadores: jogadoresAtualizados,
        masterIndex: 0,
        vencedor: null
    });
    await startOnlineRound();
});

document.getElementById('editConfigBtn').addEventListener('click', async () => {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    const room = state.online.roomData;
    const jogadoresAtualizados = JSON.parse(JSON.stringify(room.jogadores));
    Object.keys(jogadoresAtualizados).forEach(uid => {
        jogadoresAtualizados[uid].pontos = 0;
        jogadoresAtualizados[uid].pronto = false;
        jogadoresAtualizados[uid].palpite = null;
    });
    await updateDoc(state.online.roomRef, {
        status: 'lobby',
        jogadores: jogadoresAtualizados,
        masterIndex: 0,
        vencedor: null
    });
});

document.getElementById('closeRoomBtn').addEventListener('click', async () => {
    if (state.gameMode !== 'online' || !state.online.isHost) return;
    if (!confirm('Encerrar a sala para todos?')) return;
    showLoading('Encerrando...');
    try { await deleteDoc(state.online.roomRef); } catch (e) {}
    hideLoading();
    cleanupAndHome();
});

// ============================================================
// SAIR
// ============================================================
document.getElementById('exitBtn').addEventListener('click', () => {
    if (state.gameMode === 'local') {
        if (confirm('Voltar ao menu principal?')) cleanupAndHome();
        return;
    }
    if (state.gameMode === 'online' && !state.online.roomCode) {
        window.location.href = '../../index.html';
        return;
    }
    if (state.gameMode === 'online' && state.online.roomCode) {
        exitModal.classList.remove('hidden');
        return;
    }
    window.location.href = '../../index.html';
});

document.getElementById('cancelExitBtn').addEventListener('click', () => {
    exitModal.classList.add('hidden');
});

document.getElementById('confirmExitBtn').addEventListener('click', async () => {
    exitModal.classList.add('hidden');
    if (state.gameMode !== 'online') { cleanupAndHome(); return; }
    try {
        if (state.online.roomRef && state.online.roomData) {
            const players = Object.entries(state.online.roomData.jogadores || {});
            if (players.length <= 1) {
                await deleteDoc(state.online.roomRef);
            } else if (state.online.isHost) {
                const outros = players.filter(([uid]) => uid !== state.online.uid);
                if (outros.length > 0) {
                    await updateDoc(state.online.roomRef, {
                        criadorId: outros[0][0],
                        [`jogadores.${state.online.uid}`]: null,
                        ordemJogadores: state.online.roomData.ordemJogadores.filter(u => u !== state.online.uid)
                    });
                }
            } else {
                await updateDoc(state.online.roomRef, {
                    [`jogadores.${state.online.uid}`]: null,
                    ordemJogadores: state.online.roomData.ordemJogadores.filter(u => u !== state.online.uid)
                });
            }
        }
    } catch (e) { console.error(e); }
    cleanupAndHome();
});

function cleanupAndHome() {
    if (state.online.unsubscribeRoom) { state.online.unsubscribeRoom(); state.online.unsubscribeRoom = null; }

    state.gameMode = null;
    state.online.roomCode = null;
    state.online.roomData = null;
    state.online.roomRef = null;
    state.online.isHost = false;

    exitModal.classList.add('hidden');
    nameModal.classList.add('hidden');
    scoreModal.classList.add('hidden');
    hideLoading();
    setLiveScoreVisible(false);

    document.body.classList.remove('mode-local', 'mode-online');
    document.getElementById('modeChoice').classList.remove('hidden');
    document.getElementById('onlineMenu').classList.add('hidden');
    document.getElementById('joinCodeInput').value = '';

    showScreen('home');
    if (window.lucide) lucide.createIcons();
}

window.addEventListener('beforeunload', () => {
    if (state.gameMode === 'online' && state.online.roomRef && state.online.roomData) {
        const players = Object.entries(state.online.roomData.jogadores || {});
        if (players.length <= 1) {
            deleteDoc(state.online.roomRef).catch(() => {});
        } else {
            updateDoc(state.online.roomRef, {
                [`jogadores.${state.online.uid}`]: null
            }).catch(() => {});
        }
    }
});

console.log('🎉 Sintonia carregado!');