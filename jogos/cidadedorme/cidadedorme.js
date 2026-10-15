// Bandu - Cidade Dorme (Party Game)
// Modo Online (cada um no seu) + Modo Local (1 dispositivo)

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

// ============================================================
// CONSTANTES
// ============================================================
const MAX_PLAYERS = 10;
const MIN_PLAYERS = 4;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

// Quantos assassinos cabem em X jogadores
function maxAssassinosPara(jogadores) {
    if (jogadores <= 5) return 1;
    if (jogadores <= 7) return 2;
    return 3;
}

// ============================================================
// ESTADO
// ============================================================
const state = {
    // Modo de jogo
    gameMode: null, // 'local' | 'online'

    // Online
    uid: null,
    playerName: null,
    roomCode: null,
    roomRef: null,
    roomData: null,
    unsubscribeRoom: null,
    isHost: false,
    myRole: null,
    myVote: null,
    roleConfirmed: false,
    voteTimerInterval: null,
    pendingAction: null,
    lastTransitionKey: null,
    voteLog: {},

    // Local (1 dispositivo)
    local: {
        players: [],
        config: {
            assassinos: 1,
            temAnjo: true
        },
        // Estado da partida
        currentRound: 0,
        fase: 'config', // config | setup | papel | noite | dia | votacao | resultado | fim
        ordemPassagem: [],
        passandoIndex: 0,
        revealed: false,
        deadIds: [],
        noite: null,
        votos: {},
        votacaoIniciada: null,
        vencedor: null
    }
};

// DOM
const screens = {
    home: document.getElementById('homeScreen'),
    configLocal: document.getElementById('localConfigScreen'),
    lobby: document.getElementById('lobbyScreen'),
    role: document.getElementById('roleScreen'),
    night: document.getElementById('nightScreen'),
    day: document.getElementById('dayScreen'),
    vote: document.getElementById('voteScreen'),
    roundResult: document.getElementById('roundResultScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

const exitModal = document.getElementById('exitModal');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const investigateModal = document.getElementById('investigateModal');
const investigateResult = document.getElementById('investigateResult');

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
        if (k === key) screens[k].classList.remove('hidden');
        else screens[k].classList.add('hidden');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getPlayersArray(roomData) {
    if (!roomData || !roomData.jogadores) return [];
    return Object.entries(roomData.jogadores)
        .filter(([uid, p]) => p && typeof p === 'object' && uid)
        .map(([uid, p]) => ({
            uid,
            nome: p.nome || 'Jogador',
            vivo: !!p.vivo,
            pronto: !!p.pronto,
            papel: p.papel || null,
            viuPapel: !!p.viuPapel,
            prontoDia: !!p.prontoDia
        }));
}

function getAlivePlayers(roomData) {
    return getPlayersArray(roomData).filter(p => p.vivo);
}

function getMyPlayer(roomData) {
    if (!roomData || !roomData.jogadores || !state.uid) return null;
    const p = roomData.jogadores[state.uid];
    if (!p) return null;
    return {
        uid: state.uid,
        nome: p.nome || 'Jogador',
        vivo: !!p.vivo,
        pronto: !!p.pronto,
        papel: p.papel || null,
        viuPapel: !!p.viuPapel,
        prontoDia: !!p.prontoDia
    };
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        state.uid = user.uid;
        if (state.pendingAction) {
            const act = state.pendingAction;
            state.pendingAction = null;
            if (act.type === 'create') doCreateRoom(act.name);
            else if (act.type === 'join') doJoinRoom(act.code, act.name);
        }
    }
});

async function ensureAuth() {
    if (auth.currentUser) {
        state.uid = auth.currentUser.uid;
        return true;
    }
    try {
        const cred = await signInAnonymously(auth);
        state.uid = cred.user.uid;
        return true;
    } catch (e) {
        alert('Erro de autenticação. Verifique se o login anônimo está ativado no Firebase.');
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
// MENU INICIAL — escolha do modo
// ============================================================
document.getElementById('modeLocalBtn').addEventListener('click', () => {
    state.gameMode = 'local';
    initLocalGame();
});

document.getElementById('modeOnlineBtn').addEventListener('click', () => {
    state.gameMode = 'online';
    showOnlineMenu();
});

function showOnlineMenu() {
    document.getElementById('onlineMenu').classList.remove('hidden');
    document.getElementById('modeChoice').classList.add('hidden');
}

function initLocalGame() {
    // Reseta estado local
    state.local = {
        players: [],
        config: { assassinos: 1, temAnjo: true },
        currentRound: 0,
        fase: 'config',
        ordemPassagem: [],
        passandoIndex: 0,
        revealed: false,
        deadIds: [],
        noite: null,
        votos: {},
        votacaoIniciada: null,
        vencedor: null
    };
    renderLocalConfig();
    showScreen('configLocal');
}

// ============================================================
// MODO LOCAL (1 dispositivo) — CONFIG
// ============================================================
function renderLocalConfig() {
    showScreen('configLocal');
    const L = state.local;

    const input = document.getElementById('localPlayerInput');
    const list = document.getElementById('localPlayerList');
    list.innerHTML = '';
    L.players.forEach((p, i) => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerHTML = `<span>${p.nome}</span><button type="button">&times;</button>`;
        li.querySelector('button').addEventListener('click', () => {
            L.players.splice(i, 1);
            renderLocalConfig();
        });
        list.appendChild(li);
    });

    document.getElementById('localPlayerCount').innerText = `${L.players.length} / ${MAX_PLAYERS}`;

    // Chips assassinos — limita pelo número de jogadores
    const maxAss = maxAssassinosPara(L.players.length);
    document.querySelectorAll('#localAssassinosGroup .chip-btn').forEach(btn => {
        const val = parseInt(btn.dataset.value, 10);
        const permitido = val <= maxAss;
        btn.disabled = !permitido;
        btn.style.opacity = permitido ? '1' : '0.35';
        btn.classList.toggle('active', L.config.assassinos === val);
    });

    // Chips anjo
    document.querySelectorAll('#localAnjoGroup .chip-btn').forEach(btn => {
        const val = btn.dataset.value === 'sim';
        btn.classList.toggle('active', L.config.temAnjo === val);
    });

    const startBtn = document.getElementById('localStartBtn');
    startBtn.disabled = L.players.length < MIN_PLAYERS;
}

document.getElementById('localAddPlayerBtn').addEventListener('click', () => {
    const input = document.getElementById('localPlayerInput');
    const nome = input.value.trim();
    if (!nome) return;
    if (state.local.players.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
        alert('Já tem alguém com esse nome');
        return;
    }
    if (state.local.players.length >= MAX_PLAYERS) return;
    state.local.players.push({ nome, vivo: true });
    input.value = '';
    renderLocalConfig();
    input.focus();
});

document.getElementById('localPlayerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('localAddPlayerBtn').click();
    }
});

document.querySelectorAll('#localAssassinosGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        state.local.config.assassinos = parseInt(btn.dataset.value, 10);
        renderLocalConfig();
    });
});

document.querySelectorAll('#localAnjoGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.local.config.temAnjo = btn.dataset.value === 'sim';
        renderLocalConfig();
    });
});

document.getElementById('localStartBtn').addEventListener('click', () => {
    if (state.local.players.length < MIN_PLAYERS) {
        alert(`Precisa de pelo menos ${MIN_PLAYERS} jogadores`);
        return;
    }
    startLocalRound();
});

// ============================================================
// MODO LOCAL — INICIAR RODADA
// ============================================================
function startLocalRound() {
    const L = state.local;
    const players = L.players;

    // Sorteia papéis
    const shuffled = shuffle(players.map((_, i) => i));
    const numAss = Math.min(L.config.assassinos, maxAssassinosPara(players.length));
    const assassinoIdx = shuffled.slice(0, numAss);
    const restantes = shuffled.slice(numAss);
    const detetiveIdx = restantes[0];
    let anjoIdx = null;
    if (L.config.temAnjo && restantes.length > 1) anjoIdx = restantes[1];

    players.forEach((p, i) => {
        p.vivo = true;
        if (assassinoIdx.includes(i)) p.papel = 'assassino';
        else if (i === detetiveIdx) p.papel = 'detetive';
        else if (i === anjoIdx) p.papel = 'anjo';
        else p.papel = 'cidadao';
    });

    L.currentRound = 0;
    L.deadIds = [];
    L.votos = {};
    L.vencedor = null;
    L.noite = null;
    L.assassinoMatadorIndex = 0;
    L.ordemAssassinos = assassinoIdx.map(i => players[i].nome);
    L.fase = 'papel';
    L.revealed = false;

    // Ordem de passagem — todos veem o papel
    L.ordemPassagem = players.map((_, i) => i);
    L.passandoIndex = 0;

    renderLocalRole();
}

function renderLocalRole() {
    showScreen('role');
    const L = state.local;

    if (L.passandoIndex >= L.ordemPassagem.length) {
        // Todos viram, começa a noite
        startLocalNight();
        return;
    }

    const idx = L.ordemPassagem[L.passandoIndex];
    const player = L.players[idx];

    document.getElementById('roleTitle').innerText = player.nome;
    document.getElementById('roleSubtitle').innerText = 'Passe o celular para ele(a)';
    document.getElementById('roleDesc').innerText = 'Toque para revelar seu papel.';

    const iconWrap = document.getElementById('roleIconWrap');
    iconWrap.className = 'role-icon-wrap';
    const icon = document.getElementById('roleIcon');
    icon.setAttribute('data-lucide', 'eye-off');
    if (window.lucide) lucide.createIcons();

    const confirmBtn = document.getElementById('roleConfirmBtn');
    confirmBtn.innerHTML = '<i data-lucide="eye"></i> Revelar';
    confirmBtn.classList.remove('hidden');

    // Esconde counter no modo local
    const counter = document.getElementById('roleCounter');
    if (counter) counter.classList.add('hidden');

    // Remove listeners antigos clonando
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', () => {
        if (!L.revealed) {
            // Revela o papel
            L.revealed = true;
            newBtn.innerHTML = '<i data-lucide="arrow-right"></i> Entendi';
            document.getElementById('roleDesc').innerText = descricaoPapel(player.papel);
            icon.setAttribute('data-lucide', iconePapel(player.papel));
            iconWrap.className = 'role-icon-wrap ' + player.papel;
            if (window.lucide) lucide.createIcons();
        } else {
            // Avança para o próximo
            L.revealed = false;
            L.passandoIndex++;
            renderLocalRole();
        }
    });
}

function descricaoPapel(papel) {
    const map = {
        assassino: 'Junto com os outros assassinos (se houver), escolha alguém para eliminar durante a noite.',
        detetive: 'Escolha alguém para investigar. Você saberá se a pessoa é o assassino — mas só você verá o resultado.',
        anjo: 'Escolha alguém para proteger. Se essa pessoa for atacada, sobreviverá — e todos saberão.',
        cidadao: 'Não tem poderes especiais. Observe, discuta e vote com sabedoria durante o dia.'
    };
    return map[papel] || map.cidadao;
}
function iconePapel(papel) {
    return { assassino: 'skull', detetive: 'search', anjo: 'shield', cidadao: 'user' }[papel] || 'user';
}
function tituloPapel(papel) {
    return { assassino: 'Assassino', detetive: 'Detetive', anjo: 'Anjo', cidadao: 'Cidadão' }[papel] || 'Cidadão';
}

// ============================================================
// MODO LOCAL — NOITE
// ============================================================
function startLocalNight() {
    const L = state.local;
    L.fase = 'noite';
    L.votos = {};
    L.revealed = false;

    // Decide quem é o matador dessa noite
    const assVivos = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo && x.p.papel === 'assassino');
    const matadorIdx = assVivos.length > 0 ? (L.assassinoMatadorIndex % assVivos.length) : 0;
    const matador = assVivos[matadorIdx];

    L.noite = {
        assassinoEscolheu: null,
        anjoProtegeu: null,
        detetiveInvestigou: null,
        matadorNome: matador ? matador.p.nome : null,
        matadorIdx: matador ? matador.i : -1
    };

    // Ordem: matador → outros assassinos (sugerir) → detetive → anjo → cidadãos
    L.ordemNoite = [];

    // Matador
    if (matador) L.ordemNoite.push({ tipo: 'matador', idx: matador.i });

    // Outros assassinos (sugerir)
    assVivos.forEach((x, k) => {
        if (k !== matadorIdx) L.ordemNoite.push({ tipo: 'sugestor', idx: x.i });
    });

    // Detetive vivo
    const det = L.players.map((p, i) => ({ p, i })).find(x => x.p.vivo && x.p.papel === 'detetive');
    if (det) L.ordemNoite.push({ tipo: 'detetive', idx: det.i });

    // Anjo vivo
    const anjo = L.players.map((p, i) => ({ p, i })).find(x => x.p.vivo && x.p.papel === 'anjo');
    if (anjo) L.ordemNoite.push({ tipo: 'anjo', idx: anjo.i });

    // Cidadãos vivos
    L.players.forEach((p, i) => {
        if (p.vivo && p.papel === 'cidadao') {
            L.ordemNoite.push({ tipo: 'cidadao', idx: i });
        }
    });

    L.noiteIndex = 0;
    renderLocalNightStep();
}

function renderLocalNightStep() {
    const L = state.local;
    showScreen('night');

    if (L.noiteIndex >= L.ordemNoite.length) {
        // Fim da noite — resolve
        resolveLocalNight();
        return;
    }

    const step = L.ordemNoite[L.noiteIndex];
    const player = L.players[step.idx];

    const actionArea = document.getElementById('nightActionArea');
    const subtitle = document.getElementById('nightSubtitle');
    const waitingMsg = document.getElementById('waitingMsg');
    actionArea.innerHTML = '';
    waitingMsg.classList.add('hidden');

    document.querySelector('.display-title').innerText = `${player.nome}`;
    subtitle.innerText = `Passe o celular para ${player.nome}`;
    document.getElementById('nightCounter').classList.add('hidden');

    // Tela inicial: "Sou eu" para ninguém ver escondido
    if (!L.revealed) {
        subtitle.innerText = `${player.nome}, toque para continuar`;
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-block';
        btn.innerHTML = '<i data-lucide="eye"></i> Sou eu, mostrar ação';
        btn.addEventListener('click', () => {
            L.revealed = true;
            renderLocalNightStep();
        });
        actionArea.appendChild(btn);
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Ação
    if (step.tipo === 'matador') {
        subtitle.innerText = 'Escolha quem eliminar';
        const alvos = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo && x.i !== step.idx);
        renderTargetGrid(actionArea, alvos, (alvo) => {
            L.noite.assassinoEscolheu = alvo.i;
            advanceLocalNight();
        });
    } else if (step.tipo === 'sugestor') {
        subtitle.innerText = 'Sugira um alvo para o matador';
        const alvos = L.players.map((p, i) => ({ p, i })).filter(x =>
            x.p.vivo && x.i !== step.idx && x.p.nome !== L.noite.matadorNome
        );
        renderTargetGrid(actionArea, alvos, (alvo) => {
            L.noite.sugestao = alvo.p.nome;
            advanceLocalNight();
        });
    } else if (step.tipo === 'detetive') {
        subtitle.innerText = 'Escolha quem investigar';
        const alvos = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo && x.i !== step.idx);
        renderTargetGrid(actionArea, alvos, (alvo) => {
            L.noite.detetiveInvestigou = {
                detetiveNome: player.nome,
                alvoNome: alvo.p.nome,
                resultado: alvo.p.papel === 'assassino' ? 'assassino' : 'inocente'
            };
            showInvestigateModal(alvo.p.nome, alvo.p.papel === 'assassino');
        });
    } else if (step.tipo === 'anjo') {
        subtitle.innerText = 'Escolha quem proteger';
        const alvos = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo);
        renderTargetGrid(actionArea, alvos, (alvo) => {
            L.noite.anjoProtegeu = alvo.i;
            advanceLocalNight();
        });
    } else if (step.tipo === 'cidadao') {
        subtitle.innerText = `${player.nome}, complete o desafio`;
        renderCitizenMinigame(actionArea, () => {
            advanceLocalNight();
        });
    }

    if (window.lucide) lucide.createIcons();
}

function renderTargetGrid(container, alvos, onPick) {
    const grid = document.createElement('div');
    grid.className = 'target-grid';
    alvos.forEach(alvo => {
        const btn = document.createElement('button');
        btn.className = 'target-btn';
        btn.innerText = alvo.p.nome + (alvo.i === state.local.noite?.matadorIdx && alvo.p.nome !== undefined ? '' : '');
        btn.addEventListener('click', () => onPick(alvo));
        grid.appendChild(btn);
    });
    container.appendChild(grid);
}

function advanceLocalNight() {
    state.local.revealed = false;
    state.local.noiteIndex++;
    renderLocalNightStep();
}

function showInvestigateModal(alvoNome, ehAssassino) {
    const el = document.getElementById('investigateResult');
    el.innerHTML = ehAssassino
        ? `<strong>${alvoNome}</strong> é o <span style="color:#FA5252">ASSASSINO!</span>`
        : `<strong>${alvoNome}</strong> é inocente.`;
    document.getElementById('investigateModal').classList.remove('hidden');
}

document.getElementById('investigateCloseBtn').addEventListener('click', () => {
    document.getElementById('investigateModal').classList.add('hidden');
    advanceLocalNight();
});

// ============================================================
// MINIGAMES DO CIDADÃO
// ============================================================
function renderCitizenMinigame(container, onComplete) {
    const tipos = ['hold', 'drag', 'sequence'];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '1rem';
    wrap.style.alignItems = 'center';
    container.appendChild(wrap);

    if (tipo === 'hold') {
        const info = document.createElement('p');
        info.className = 'subtitle';
        info.innerText = 'Segure o botão por 3 segundos';
        wrap.appendChild(info);

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.width = '100%';
        btn.style.padding = '1.25rem';
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.innerHTML = '<span style="position:relative;z-index:1">Segure aqui</span>';

        const bar = document.createElement('div');
        bar.style.position = 'absolute';
        bar.style.left = '0';
        bar.style.top = '0';
        bar.style.height = '100%';
        bar.style.width = '0%';
        bar.style.background = 'rgba(81, 207, 102, 0.6)';
        bar.style.transition = 'width 0.1s linear';
        btn.appendChild(bar);

        wrap.appendChild(btn);

        let start = null, rafId = null, done = false;
        const update = () => {
            if (!start || done) return;
            const elapsed = Date.now() - start;
            const pct = Math.min(100, (elapsed / 3000) * 100);
            bar.style.width = pct + '%';
            if (pct >= 100 && !done) {
                done = true;
                btn.style.background = 'var(--verde-sucesso)';
                btn.innerHTML = '<span style="position:relative;z-index:1">Completo!</span>';
                setTimeout(onComplete, 400);
                return;
            }
            rafId = requestAnimationFrame(update);
        };
        const begin = () => { if (!done) { start = Date.now(); update(); } };
        const stop = () => { if (!done) { start = null; bar.style.width = '0%'; cancelAnimationFrame(rafId); } };
        btn.addEventListener('mousedown', begin);
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); begin(); });
        btn.addEventListener('mouseup', stop);
        btn.addEventListener('mouseleave', stop);
        btn.addEventListener('touchend', stop);
        btn.addEventListener('touchcancel', stop);
    } else if (tipo === 'drag') {
        const info = document.createElement('p');
        info.className = 'subtitle';
        info.innerText = 'Arraste o círculo até o fim da barra';
        wrap.appendChild(info);

        const track = document.createElement('div');
        track.style.width = '100%';
        track.style.height = '70px';
        track.style.background = 'var(--bege-escuro)';
        track.style.borderRadius = '35px';
        track.style.position = 'relative';
        track.style.overflow = 'hidden';

        const knob = document.createElement('div');
        knob.style.width = '60px';
        knob.style.height = '60px';
        knob.style.borderRadius = '50%';
        knob.style.background = 'var(--texto)';
        knob.style.position = 'absolute';
        knob.style.top = '5px';
        knob.style.left = '5px';
        knob.style.cursor = 'grab';
        knob.style.touchAction = 'none';
        knob.style.transition = 'background 0.2s';
        track.appendChild(knob);
        wrap.appendChild(track);

        let dragging = false, startX = 0, currentX = 0, maxX = 0;
        const onDown = (e) => {
            dragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            startX = clientX - currentX;
            maxX = track.offsetWidth - knob.offsetWidth - 10;
            knob.style.transition = 'none';
        };
        const onMove = (e) => {
            if (!dragging) return;
            e.preventDefault?.();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            currentX = Math.max(0, Math.min(maxX, clientX - startX));
            knob.style.left = (currentX + 5) + 'px';
            if (currentX >= maxX - 2) {
                dragging = false;
                knob.style.background = 'var(--verde-sucesso)';
                setTimeout(onComplete, 300);
            }
        };
        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            currentX = 0;
            knob.style.transition = 'left 0.3s ease';
            knob.style.left = '5px';
            setTimeout(() => { knob.style.transition = ''; }, 350);
        };
        knob.addEventListener('mousedown', onDown);
        knob.addEventListener('touchstart', onDown, { passive: true });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
    } else {
        const info = document.createElement('p');
        info.className = 'subtitle';
        info.innerText = 'Aperte os números na ordem (1 → 2 → 3 → 4)';
        wrap.appendChild(info);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr 1fr';
        grid.style.gap = '0.5rem';
        grid.style.width = '100%';

        // Embaralha posições
        const nums = [1, 2, 3, 4];
        const posicoes = shuffle(nums);
        let proximo = 1;

        posicoes.forEach(n => {
            const btn = document.createElement('button');
            btn.className = 'target-btn';
            btn.innerText = n;
            btn.style.padding = '1rem';
            btn.style.fontSize = '1.5rem';
            btn.addEventListener('click', () => {
                if (n === proximo) {
                    btn.style.background = 'var(--verde-sucesso)';
                    btn.style.color = '#FFF';
                    btn.disabled = true;
                    proximo++;
                    if (proximo > 4) {
                        setTimeout(onComplete, 300);
                    }
                } else {
                    btn.style.background = 'var(--vermelho)';
                    btn.style.color = '#FFF';
                    setTimeout(() => {
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 250);
                }
            });
            grid.appendChild(btn);
        });
        wrap.appendChild(grid);
    }
}

// ============================================================
// MODO LOCAL — RESOLVE NOITE
// ============================================================
function resolveLocalNight() {
    const L = state.local;
    const noite = L.noite;

    const vitimaIdx = noite.assassinoEscolheu;
    const protegida = vitimaIdx !== null && noite.anjoProtegeu === vitimaIdx;

    const eventos = [];
    if (vitimaIdx !== null && vitimaIdx !== undefined) {
        const vitima = L.players[vitimaIdx];
        if (protegida) {
            eventos.push({ tipo: 'salvo', texto: `Tentaram matar <strong>${vitima.nome}</strong>, mas o anjo protegeu.` });
        } else {
            vitima.vivo = false;
            eventos.push({ tipo: 'morte', texto: `<strong>${vitima.nome}</strong> foi assassinado durante a noite.` });
        }
    } else {
        eventos.push({ tipo: 'info', texto: 'A noite passou em paz. Ninguém foi atacado.' });
    }

    L.noiteEventos = eventos;
    L.assassinoMatadorIndex = (L.assassinoMatadorIndex || 0) + 1;

    // Checa fim
    const vivos = L.players.filter(p => p.vivo);
    const assVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAss = vivos.filter(p => p.papel !== 'assassino');
    if (assVivos.length === 0) {
        L.vencedor = 'cidade';
        return renderLocalGameOver();
    }
    if (assVivos.length >= naoAss.length) {
        L.vencedor = 'assassinos';
        return renderLocalGameOver();
    }

    // Vai para o dia
    L.fase = 'dia';
    renderLocalDay();
}

// ============================================================
// MODO LOCAL — DIA
// ============================================================
function renderLocalDay() {
    showScreen('day');
    const L = state.local;

    const eventsEl = document.getElementById('dayEvents');
    eventsEl.innerHTML = '';
    (L.noiteEventos || []).forEach(ev => {
        const div = document.createElement('div');
        div.className = 'day-event ' + ev.tipo;
        div.innerHTML = ev.texto;
        eventsEl.appendChild(div);
    });

    // Detetive que investigou vê o resultado novamente
    if (L.noite?.detetiveInvestigou) {
        const inv = L.noite.detetiveInvestigou;
        const div = document.createElement('div');
        div.className = 'day-event info';
        div.innerHTML = `<strong>Investigação de ${inv.detetiveNome}:</strong> ${inv.alvoNome} é <strong>${inv.resultado === 'assassino' ? 'o ASSASSINO!' : 'inocente'}</strong>.`;
        eventsEl.appendChild(div);
    }

    // Botão para ir à votação — só o "continuar" que passa o celular
    const toVoteBtn = document.getElementById('toVoteBtn');
    const waitMsg = document.getElementById('waitVoteMsg');
    toVoteBtn.classList.remove('hidden');
    waitMsg.classList.add('hidden');
    toVoteBtn.innerHTML = '<i data-lucide="vote"></i> Iniciar Votação';
    toVoteBtn.onclick = () => startLocalVote();

    if (window.lucide) lucide.createIcons();
}

// ============================================================
// MODO LOCAL — VOTAÇÃO
// ============================================================
function startLocalVote() {
    const L = state.local;
    L.fase = 'votacao';
    L.votos = {};
    L.votoIndex = 0;
    L.ordemVoto = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo);
    L.revealed = false;
    renderLocalVoteStep();
}

function renderLocalVoteStep() {
    showScreen('vote');
    const L = state.local;

    const timerEl = document.getElementById('voteTimer');
    timerEl.innerText = '';

    if (L.votoIndex >= L.ordemVoto.length) {
        resolveLocalVote();
        return;
    }

    const voter = L.ordemVoto[L.votoIndex];
    const grid = document.getElementById('voteGrid');
    grid.innerHTML = '';

    document.querySelector('#voteScreen h2').innerText = `${voter.p.nome} vota`;
    document.getElementById('voteInstruction').innerText = 'Escolha quem expulsar ou pule';

    const voteStatus = document.getElementById('voteStatus');
    voteStatus.classList.add('hidden');

    // Alvos vivos (exceto o votante)
    const alvos = L.players.map((p, i) => ({ p, i })).filter(x => x.p.vivo && x.i !== voter.i);
    alvos.forEach(alvo => {
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.innerText = alvo.p.nome;
        btn.addEventListener('click', () => {
            L.votos[voter.i] = alvo.i;
            advanceLocalVote();
        });
        grid.appendChild(btn);
    });

    // Botão de pular voto
    const skipBtn = document.createElement('button');
    skipBtn.className = 'vote-btn';
    skipBtn.style.gridColumn = '1 / -1';
    skipBtn.style.background = 'var(--bege-escuro)';
    skipBtn.innerHTML = '<i data-lucide="skip-forward"></i> Pular voto';
    skipBtn.addEventListener('click', () => {
        L.votos[voter.i] = 'skip';
        advanceLocalVote();
    });
    grid.appendChild(skipBtn);

    document.getElementById('voteProgress').innerText = `Votando: ${L.votoIndex + 1} / ${L.ordemVoto.length}`;

    if (window.lucide) lucide.createIcons();
}

function advanceLocalVote() {
    state.local.votoIndex++;
    renderLocalVoteStep();
}

function resolveLocalVote() {
    const L = state.local;
    const votos = L.votos || {};

    const contagem = {};
    Object.values(votos).forEach(v => {
        if (v === 'skip') return;
        contagem[v] = (contagem[v] || 0) + 1;
    });

    let maisVotado = null, max = 0, empate = false;
    Object.entries(contagem).forEach(([id, c]) => {
        id = parseInt(id, 10);
        if (c > max) { max = c; maisVotado = id; empate = false; }
        else if (c === max) empate = true;
    });
    if (empate) maisVotado = null;

    const eventos = [];
    if (maisVotado !== null) {
        L.players[maisVotado].vivo = false;
        eventos.push({
            tipo: 'morte',
            texto: `<strong>${L.players[maisVotado].nome}</strong> foi expulso da cidade (era <strong>${L.players[maisVotado].papel}</strong>).`
        });
    } else {
        eventos.push({ tipo: 'info', texto: 'A votação empatou. Ninguém foi expulso.' });
    }

    // Checa fim
    const vivos = L.players.filter(p => p.vivo);
    const assVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAss = vivos.filter(p => p.papel !== 'assassino');
    if (assVivos.length === 0) {
        L.vencedor = 'cidade';
        L.resultadoRodada = { eventos };
        return renderLocalGameOver();
    }
    if (assVivos.length >= naoAss.length) {
        L.vencedor = 'assassinos';
        L.resultadoRodada = { eventos };
        return renderLocalGameOver();
    }

    // Vai para resultado e depois próxima noite
    L.resultadoRodada = { eventos };
    L.fase = 'resultado';
    renderLocalRoundResult();
}

function renderLocalRoundResult() {
    showScreen('roundResult');
    const L = state.local;
    const reveal = document.getElementById('roundResultReveal');
    reveal.innerHTML = '';
    (L.resultadoRodada?.eventos || []).forEach(ev => {
        const div = document.createElement('div');
        div.className = 'day-event ' + ev.tipo;
        div.innerHTML = ev.texto;
        reveal.appendChild(div);
    });

    const btn = document.getElementById('continueBtn');
    btn.classList.remove('hidden');
    const wait = document.getElementById('waitContinueMsg');
    wait.classList.add('hidden');
    btn.onclick = () => startLocalNight();

    if (window.lucide) lucide.createIcons();
}

function renderLocalGameOver() {
    showScreen('gameOver');
    const L = state.local;
    const vencedor = L.vencedor;

    const title = document.getElementById('gameOverTitle');
    const sub = document.getElementById('gameOverSub');
    const icon = document.getElementById('gameOverIcon');

    if (vencedor === 'cidade') {
        title.innerText = 'A cidade venceu!';
        sub.innerText = 'Todos os assassinos foram expulsos';
        icon.className = 'result-icon win';
    } else {
        title.innerText = 'Os assassinos venceram!';
        sub.innerText = 'Eles dominaram a cidade';
        icon.className = 'result-icon';
    }

    const reveal = document.getElementById('finalReveal');
    reveal.innerHTML = '';
    L.players.forEach(p => {
        const line = document.createElement('div');
        line.className = 'result-line';
        line.innerHTML = `
            <span class="label">${p.nome}</span>
            <span class="value ${p.papel}">${p.papel}</span>
        `;
        reveal.appendChild(line);
    });

    // No modo local, sempre mostra as ações do fim
    document.getElementById('gameOverActions').classList.remove('hidden');
    document.getElementById('spectatorMsg').classList.add('hidden');

    if (window.confetti && vencedor === 'cidade') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    if (window.lucide) lucide.createIcons();
}

// Botões do fim no modo local
document.getElementById('rematchBtn').addEventListener('click', async () => {
    if (state.gameMode === 'local') {
        startLocalRound();
    } else if (state.isHost) {
        showLoading('Preparando nova partida...');
        try { await startNewRound(); } finally { hideLoading(); }
    }
});

document.getElementById('editConfigBtn').addEventListener('click', async () => {
    if (state.gameMode === 'local') {
        initLocalGame();
    } else if (state.isHost) {
        showLoading('Voltando ao lobby...');
        try {
            const jogadoresAtualizados = JSON.parse(JSON.stringify(state.roomData.jogadores));
            Object.keys(jogadoresAtualizados).forEach(uid => {
                jogadoresAtualizados[uid].pronto = false;
                jogadoresAtualizados[uid].viuPapel = false;
                jogadoresAtualizados[uid].prontoDia = false;
                jogadoresAtualizados[uid].papel = null;
                jogadoresAtualizados[uid].vivo = true;
            });
            await updateDoc(state.roomRef, {
                status: 'lobby',
                jogadores: jogadoresAtualizados,
                noite: null,
                votos: null,
                historico: [],
                vencedor: null,
                resultadoRodada: null
            });
        } finally { hideLoading(); }
    }
});

document.getElementById('closeRoomBtn').addEventListener('click', async () => {
    if (state.gameMode === 'local') {
        cleanupAndHome();
        return;
    }
    if (!state.isHost) return;
    if (!confirm('Encerrar a sala para todos?')) return;
    showLoading('Encerrando sala...');
    try { await deleteDoc(state.roomRef); } catch (e) { console.error(e); }
    hideLoading();
    cleanupAndHome();
});

// ============================================================
// MODO ONLINE — CRIAR / ENTRAR
// ============================================================
document.getElementById('createRoomBtn').addEventListener('click', () => {
    askName(async (name) => {
        if (!name) return;
        const ok = await ensureAuth();
        if (!ok) return;
        if (auth.currentUser) doCreateRoom(name);
        else state.pendingAction = { type: 'create', name };
    });
});

async function doCreateRoom(name) {
    showLoading('Criando sala...');
    try {
        state.playerName = name.slice(0, 15);
        let code, exists = true, tries = 0;
        while (exists && tries < 10) {
            code = generateRoomCode();
            const check = await getDoc(doc(db, 'partidas', code));
            exists = check.exists();
            tries++;
        }
        if (exists) { hideLoading(); alert('Não foi possível gerar um código único.'); return; }

        const roomRef = doc(db, 'partidas', code);
        await setDoc(roomRef, {
            codigo: code,
            criadorId: state.uid,
            criadoEm: serverTimestamp(),
            status: 'lobby',
            config: { assassinos: 1, temAnjo: true, tempoVotacao: 60, votoAnonimo: false },
            jogadores: {
                [state.uid]: {
                    nome: state.playerName, vivo: true, pronto: false,
                    papel: null, viuPapel: false, prontoDia: false
                }
            },
            noite: null, votos: null, historico: [], vencedor: null
        });

        state.roomCode = code;
        state.roomRef = roomRef;
        state.isHost = true;
        hideLoading();
        listenToRoom(code);
    } catch (err) {
        hideLoading();
        console.error(err);
        alert('Erro ao criar sala: ' + err.message);
    }
}

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code.length !== CODE_LENGTH) { alert('Digite um código de 6 caracteres'); return; }
    askName(async (name) => {
        if (!name) return;
        const ok = await ensureAuth();
        if (!ok) return;
        if (auth.currentUser) doJoinRoom(code, name);
        else state.pendingAction = { type: 'join', code, name };
    });
});

async function doJoinRoom(code, name) {
    showLoading('Entrando na sala...');
    try {
        state.playerName = name.slice(0, 15);
        const roomRef = doc(db, 'partidas', code);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) { hideLoading(); alert('Sala não encontrada'); return; }
        const roomData = snap.data();
        if (roomData.status !== 'lobby') { hideLoading(); alert('A partida já começou'); return; }
        const players = getPlayersArray(roomData);
        if (players.length >= MAX_PLAYERS) { hideLoading(); alert('Sala cheia'); return; }

        const meuNome = state.playerName.toLowerCase();
        const nomeDuplicado = players.some(p =>
            typeof p.nome === 'string' && p.nome.toLowerCase() === meuNome
        );
        if (nomeDuplicado) { hideLoading(); alert('Já tem alguém com esse nome'); return; }

        await updateDoc(roomRef, {
            [`jogadores.${state.uid}`]: {
                nome: state.playerName, vivo: true, pronto: false,
                papel: null, viuPapel: false, prontoDia: false
            }
        });
        state.roomCode = code;
        state.roomRef = roomRef;
        state.isHost = false;
        hideLoading();
        listenToRoom(code);
    } catch (err) {
        hideLoading();
        console.error(err);
        alert('Erro ao entrar: ' + err.message);
    }
}

// ============================================================
// LISTENER DA SALA (ONLINE)
// ============================================================
function listenToRoom(code) {
    if (state.unsubscribeRoom) state.unsubscribeRoom();
    const roomRef = doc(db, 'partidas', code);
    state.roomRef = roomRef;

    state.unsubscribeRoom = onSnapshot(roomRef, (snap) => {
        if (!snap.exists()) { alert('A sala foi encerrada'); cleanupAndHome(); return; }
        state.roomData = snap.data();
        state.isHost = state.roomData.criadorId === state.uid;

        const status = state.roomData.status;
        if (status === 'lobby') renderLobby();
        else if (status === 'papel') renderRole();
        else if (status === 'noite') renderNight();
        else if (status === 'dia') renderDay();
        else if (status === 'votacao') renderVote();
        else if (status === 'resultado') renderRoundResult();
        else if (status === 'fim') renderGameOver();

        if (state.isHost) maybeAdvancePhase(status);
    }, (err) => {
        console.error('Listener error:', err);
        alert('Erro de conexão: ' + err.message);
    });
}

async function maybeAdvancePhase(status) {
    const room = state.roomData;
    if (!room) return;

    if (status === 'papel') {
        const players = getPlayersArray(room);
        if (players.length > 0 && players.every(p => p.viuPapel)) {
            if (state.lastTransitionKey === 'papel-' + players.length) return;
            state.lastTransitionKey = 'papel-' + players.length;
            await updateDoc(state.roomRef, { status: 'noite' });
        }
    } else if (status === 'noite') {
        const ok = await checkNightComplete();
        if (ok) {
            if (state.lastTransitionKey === 'noite-ok-' + (room.historico?.length || 0)) return;
            state.lastTransitionKey = 'noite-ok-' + (room.historico?.length || 0);
            await resolveNight();
        }
    } else if (status === 'dia') {
        // Mudança #3: transição automática para votação
        const players = getPlayersArray(room).filter(p => p.vivo);
        const todosProntos = players.every(p => p.prontoDia);
        if (todosProntos && players.length > 0) {
            if (state.lastTransitionKey === 'dia-' + (room.historico?.length || 0)) return;
            state.lastTransitionKey = 'dia-' + (room.historico?.length || 0);
            await updateDoc(state.roomRef, {
                status: 'votacao',
                votos: {},
                votacaoIniciadaEm: Date.now(),
                votacaoDuracao: room.config.tempoVotacao
            });
        }
    } else if (status === 'votacao') {
        const vivos = getAlivePlayers(room);
        const votos = room.votos || {};
        const todosVotaram = vivos.every(p => votos[p.uid] !== undefined);
        if (todosVotaram && vivos.length > 0) {
            if (state.lastTransitionKey === 'voto-ok-' + (room.historico?.length || 0)) return;
            state.lastTransitionKey = 'voto-ok-' + (room.historico?.length || 0);
            await resolveVote();
        }
    }
}

function resetTransitionKey() { state.lastTransitionKey = null; }

// ============================================================
// LOBBY (ONLINE)
// ============================================================
function renderLobby() {
    showScreen('lobby');
    resetTransitionKey();
    const room = state.roomData;

    document.getElementById('lobbyRoomCode').innerText = state.roomCode;

    const hostConfig = document.getElementById('hostConfig');
    if (state.isHost) {
        hostConfig.classList.remove('hidden');
        setChipActive('anjoGroup', room.config.temAnjo ? 'sim' : 'nao');
        setChipActive('tempoGroup', String(room.config.tempoVotacao));
        setChipActive('votoGroup', room.config.votoAnonimo ? 'anonimo' : 'aberto');

        // Mudança #4: chips de assassinos limitados
        const maxAss = maxAssassinosPara(getPlayersArray(room).length);
        document.querySelectorAll('#assassinosGroup .chip-btn').forEach(btn => {
            const val = parseInt(btn.dataset.value, 10);
            const permitido = val <= maxAss;
            btn.disabled = !permitido;
            btn.style.opacity = permitido ? '1' : '0.35';
            btn.classList.toggle('active', room.config.assassinos === val);
        });
    } else {
        hostConfig.classList.add('hidden');
    }

    const players = getPlayersArray(room);
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
    const me = getMyPlayer(room);

    if (state.isHost) {
        startBtn.classList.remove('hidden');
        readyBtn.classList.add('hidden');
        const convidados = players.filter(p => p.uid !== state.uid);
        const todosProntos = convidados.every(p => p.pronto);
        const temGenteSuficiente = players.length >= MIN_PLAYERS;
        startBtn.disabled = !(todosProntos && temGenteSuficiente);
    } else {
        startBtn.classList.add('hidden');
        readyBtn.classList.remove('hidden');
        if (me && me.pronto) {
            readyBtn.innerHTML = '<i data-lucide="x"></i> Cancelar Pronto';
            readyBtn.className = 'btn btn-secondary btn-block';
        } else {
            readyBtn.innerHTML = '<i data-lucide="check"></i> Estou Pronto';
            readyBtn.className = 'btn btn-primary btn-block';
        }
    }

    if (window.lucide) lucide.createIcons();
}

function setChipActive(groupId, value) {
    document.querySelectorAll(`#${groupId} .chip-btn`).forEach(b => {
        b.classList.toggle('active', b.dataset.value === value);
    });
}

['assassinosGroup', 'anjoGroup', 'tempoGroup', 'votoGroup'].forEach(groupId => {
    document.querySelectorAll(`#${groupId} .chip-btn`).forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!state.isHost || btn.disabled) return;
            const val = btn.dataset.value;
            const config = { ...state.roomData.config };
            if (groupId === 'assassinosGroup') config.assassinos = parseInt(val);
            else if (groupId === 'anjoGroup') config.temAnjo = val === 'sim';
            else if (groupId === 'tempoGroup') config.tempoVotacao = parseInt(val);
            else if (groupId === 'votoGroup') config.votoAnonimo = val === 'anonimo';
            await updateDoc(state.roomRef, { config });
        });
    });
});

document.getElementById('readyBtn').addEventListener('click', async () => {
    const me = getMyPlayer(state.roomData);
    if (!me) return;
    await updateDoc(state.roomRef, { [`jogadores.${state.uid}.pronto`]: !me.pronto });
});

document.getElementById('startGameBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
    const players = getPlayersArray(state.roomData);
    if (players.length < MIN_PLAYERS) { alert(`Precisa de pelo menos ${MIN_PLAYERS} jogadores`); return; }
    const convidados = players.filter(p => p.uid !== state.uid);
    if (!convidados.every(p => p.pronto)) { alert('Todos precisam estar prontos'); return; }
    showLoading('Iniciando partida...');
    try { await startNewRound(); } finally { hideLoading(); }
});

// ============================================================
// NOVA RODADA (ONLINE)
// ============================================================
async function startNewRound() {
    if (!state.isHost) return;
    const players = getPlayersArray(state.roomData);
    const config = state.roomData.config;

    const shuffled = shuffle(players.map(p => p.uid));
    const numAss = Math.min(config.assassinos, maxAssassinosPara(players.length));
    const assassinos = shuffled.slice(0, numAss);
    const restantes = shuffled.slice(numAss);
    const detetive = restantes[0];
    let anjo = null;
    if (config.temAnjo && restantes.length > 1) anjo = restantes[1];

    const jogadoresAtualizados = {};
    players.forEach(p => {
        let papel = 'cidadao';
        if (assassinos.includes(p.uid)) papel = 'assassino';
        else if (p.uid === detetive) papel = 'detetive';
        else if (p.uid === anjo) papel = 'anjo';
        jogadoresAtualizados[p.uid] = {
            nome: p.nome, vivo: true, pronto: true, papel,
            viuPapel: false, prontoDia: false
        };
    });

    const ordemAssassinos = shuffle(assassinos);
    resetTransitionKey();
    state.myVote = null;
    state.roleConfirmed = false;

    await updateDoc(state.roomRef, {
        status: 'papel',
        jogadores: jogadoresAtualizados,
        noite: null, votos: {}, historico: [], vencedor: null,
        resultadoRodada: null,
        assassinoMatadorIndex: 0,
        ordemAssassinos
    });
}

// ============================================================
// PAPEL (ONLINE)
// ============================================================
function renderRole() {
    showScreen('role');
    const me = getMyPlayer(state.roomData);
    if (!me) return;
    state.myRole = me.papel;

    const info = {
        assassino: { title: 'Assassino', sub: 'Você mata durante a noite', icon: 'skull', desc: descricaoPapel('assassino') },
        detetive: { title: 'Detetive', sub: 'Você investiga durante a noite', icon: 'search', desc: descricaoPapel('detetive') },
        anjo: { title: 'Anjo', sub: 'Você protege durante a noite', icon: 'shield', desc: descricaoPapel('anjo') },
        cidadao: { title: 'Cidadão', sub: 'Você é uma pessoa comum', icon: 'user', desc: descricaoPapel('cidadao') }
    }[me.papel] || { title: 'Cidadão', sub: '', icon: 'user', desc: descricaoPapel('cidadao') };

    document.getElementById('roleTitle').innerText = info.title;
    document.getElementById('roleSubtitle').innerText = info.sub;
    document.getElementById('roleDesc').innerText = info.desc;

    const iconWrap = document.getElementById('roleIconWrap');
    iconWrap.className = 'role-icon-wrap ' + me.papel;
    const icon = document.getElementById('roleIcon');
    icon.setAttribute('data-lucide', info.icon);

    const players = getPlayersArray(state.roomData);
    const viram = players.filter(p => p.viuPapel).length;

    let counter = document.getElementById('roleCounter');
    if (!counter) {
        counter = document.createElement('p');
        counter.id = 'roleCounter';
        counter.className = 'subtitle';
        counter.style.marginTop = '-0.5rem';
        const confirmBtn = document.getElementById('roleConfirmBtn');
        confirmBtn.parentNode.insertBefore(counter, confirmBtn);
    }
    counter.classList.remove('hidden');
    counter.innerText = `Aguardando: ${viram} / ${players.length} confirmaram`;

    const confirmBtn = document.getElementById('roleConfirmBtn');
    confirmBtn.innerHTML = '<i data-lucide="eye"></i> Entendi';
    if (me.viuPapel) confirmBtn.classList.add('hidden');
    else confirmBtn.classList.remove('hidden');

    if (window.lucide) lucide.createIcons();
}

document.getElementById('roleConfirmBtn').addEventListener('click', async () => {
    if (state.gameMode === 'local') return;
    state.roleConfirmed = true;
    await updateDoc(state.roomRef, { [`jogadores.${state.uid}.viuPapel`]: true });
});

// ============================================================
// NOITE (ONLINE)
// ============================================================
function renderNight() {
    showScreen('night');
    const me = getMyPlayer(state.roomData);
    if (!me) return;

    const actionArea = document.getElementById('nightActionArea');
    const subtitle = document.getElementById('nightSubtitle');
    const waitingMsg = document.getElementById('waitingMsg');
    actionArea.innerHTML = '';
    waitingMsg.classList.add('hidden');
    document.querySelector('#nightScreen .display-title').innerText = 'A cidade dorme...';

    if (!me.vivo) {
        subtitle.innerText = 'Você está morto. Apenas observe.';
        waitingMsg.classList.remove('hidden');
        renderNightCounter();
        return;
    }

    const noite = state.roomData.noite || {};
    const room = state.roomData;

    if (me.papel === 'cidadao') {
        subtitle.innerText = 'Complete o desafio para passar a noite';
        if (me.prontoDia) {
            waitingMsg.classList.remove('hidden');
            renderNightCounter();
            return;
        }
        renderCitizenMinigame(actionArea, async () => {
            await updateDoc(state.roomRef, { [`jogadores.${state.uid}.prontoDia`]: true });
        });
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (me.papel === 'assassino') {
        renderAssassinoActions(actionArea, subtitle, waitingMsg, me);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (me.papel === 'detetive') {
        if (noite.detetiveInvestigou) {
            // Já investigou — mostra resultado persistente se for ele
            if (noite.detetiveInvestigou.detetiveId === state.uid) {
                subtitle.innerText = 'Você já investigou';
                const div = document.createElement('div');
                div.className = 'day-event info';
                div.innerHTML = `<strong>${noite.detetiveInvestigou.alvoNome}</strong> é <strong>${noite.detetiveInvestigou.resultado === 'assassino' ? 'o ASSASSINO!' : 'inocente'}</strong>.`;
                actionArea.appendChild(div);
                waitingMsg.classList.remove('hidden');
            } else {
                waitingMsg.classList.remove('hidden');
            }
            renderNightCounter();
            return;
        }
        subtitle.innerText = 'Escolha quem investigar';
        const alvos = getAlivePlayers(room).filter(p => p.uid !== state.uid);
        const grid = document.createElement('div');
        grid.className = 'target-grid';
        alvos.forEach(alvo => {
            const btn = document.createElement('button');
            btn.className = 'target-btn';
            btn.innerText = alvo.nome;
            btn.addEventListener('click', async () => {
                const alvoPapel = room.jogadores[alvo.uid].papel;
                const resultado = alvoPapel === 'assassino' ? 'assassino' : 'inocente';
                await updateDoc(state.roomRef, {
                    'noite.detetiveInvestigou': {
                        detetiveId: state.uid,
                        alvoId: alvo.uid,
                        alvoNome: alvo.nome,
                        resultado
                    }
                });
                // Mudança #2: mostra imediatamente
                showInvestigateModal(alvo.nome, resultado === 'assassino');
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (me.papel === 'anjo') {
        if (noite.anjoProtegeu) {
            waitingMsg.classList.remove('hidden');
            renderNightCounter();
            return;
        }
        subtitle.innerText = 'Escolha quem proteger';
        const allAlive = getAlivePlayers(room);
        const grid = document.createElement('div');
        grid.className = 'target-grid';
        allAlive.forEach(alvo => {
            const btn = document.createElement('button');
            btn.className = 'target-btn';
            btn.innerText = alvo.uid === state.uid ? 'Você mesmo' : alvo.nome;
            btn.addEventListener('click', async () => {
                await updateDoc(state.roomRef, {
                    'noite.anjoProtegeu': alvo.uid,
                    'noite.anjoProtegeuNome': alvo.nome
                });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }
}

function renderAssassinoActions(actionArea, subtitle, waitingMsg, me) {
    const room = state.roomData;
    const noite = room.noite || {};
    const ordemAssassinos = room.ordemAssassinos || [];
    const matadorIndex = room.assassinoMatadorIndex || 0;
    const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];
    const souMatador = matadorUid === state.uid;
    const escolhas = noite.assassinoEscolheu || {};
    const sugestoes = noite.assassinoSugeriu || {};

    if (ordemAssassinos.length > 1) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'day-event info';
        infoDiv.innerHTML = souMatador
            ? '<strong>É a sua vez de matar!</strong>'
            : `O matador desta noite é <strong>${room.jogadores[matadorUid]?.nome || '?'}</strong>`;
        actionArea.appendChild(infoDiv);
    }

    if (souMatador) {
        const jaEscolheu = !!escolhas[state.uid];
        const sugestoesOutros = Object.entries(sugestoes)
            .filter(([uid]) => uid !== state.uid)
            .map(([, alvoId]) => room.jogadores[alvoId]?.nome || '?')
            .filter(Boolean);

        if (sugestoesOutros.length > 0 && !jaEscolheu) {
            const sugDiv = document.createElement('div');
            sugDiv.className = 'day-event info';
            sugDiv.innerHTML = `<strong>Sugestão:</strong> ${sugestoesOutros.join(', ')}`;
            actionArea.appendChild(sugDiv);
        }

        if (jaEscolheu) {
            subtitle.innerText = 'Alvo escolhido. Aguardando...';
            waitingMsg.classList.remove('hidden');
            return;
        }
        subtitle.innerText = 'Escolha quem eliminar';
        const alvos = getAlivePlayers(room).filter(p => p.uid !== state.uid);
        const grid = document.createElement('div');
        grid.className = 'target-grid';
        alvos.forEach(alvo => {
            const btn = document.createElement('button');
            btn.className = 'target-btn';
            btn.innerText = alvo.nome;
            btn.addEventListener('click', async () => {
                const novas = { ...escolhas };
                novas[state.uid] = alvo.uid;
                await updateDoc(state.roomRef, { 'noite.assassinoEscolheu': novas });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
    } else {
        const jaSugeriu = !!sugestoes[state.uid];
        if (jaSugeriu) {
            subtitle.innerText = 'Sugestão enviada. Aguardando...';
            waitingMsg.classList.remove('hidden');
            return;
        }
        subtitle.innerText = 'Sugira um alvo para o matador';
        const alvos = getAlivePlayers(room).filter(p => p.uid !== state.uid && p.uid !== matadorUid);
        const grid = document.createElement('div');
        grid.className = 'target-grid';
        alvos.forEach(alvo => {
            const btn = document.createElement('button');
            btn.className = 'target-btn';
            btn.innerText = alvo.nome;
            btn.addEventListener('click', async () => {
                const novas = { ...sugestoes };
                novas[state.uid] = alvo.uid;
                await updateDoc(state.roomRef, { 'noite.assassinoSugeriu': novas });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
    }
}

function renderNightCounter() {
    const room = state.roomData;
    if (!room || !room.noite) return;
    const vivos = getAlivePlayers(room);
    const noite = room.noite || {};
    let feitos = 0, total = 0;

    const ordemAssassinos = room.ordemAssassinos || [];
    const matadorIndex = room.assassinoMatadorIndex || 0;
    const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];

    vivos.forEach(p => {
        if (p.papel === 'assassino') {
            total++;
            const escolhas = noite.assassinoEscolheu || {};
            const sugestoes = noite.assassinoSugeriu || {};
            if (p.uid === matadorUid) { if (escolhas[p.uid]) feitos++; }
            else { if (sugestoes[p.uid]) feitos++; }
        } else if (p.papel === 'detetive') {
            total++;
            if (noite.detetiveInvestigou) feitos++;
        } else if (p.papel === 'anjo') {
            total++;
            if (noite.anjoProtegeu) feitos++;
        } else if (p.papel === 'cidadao') {
            total++;
            if (p.prontoDia) feitos++;
        }
    });

    let counter = document.getElementById('nightCounter');
    if (!counter) {
        counter = document.createElement('p');
        counter.id = 'nightCounter';
        counter.className = 'subtitle';
        counter.style.marginTop = '-0.5rem';
        const waitingMsg = document.getElementById('waitingMsg');
        waitingMsg.parentNode.insertBefore(counter, waitingMsg);
    }
    counter.classList.remove('hidden');
    counter.innerText = `Aguardando: ${feitos} / ${total}`;
}

async function checkNightComplete() {
    if (!state.isHost) return false;
    const snap = await getDoc(state.roomRef);
    if (!snap.exists()) return false;
    const room = snap.data();
    const noite = room.noite || {};
    const vivos = getAlivePlayers(room);

    const ordemAssassinos = room.ordemAssassinos || [];
    const matadorIndex = room.assassinoMatadorIndex || 0;
    const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];
    const escolhas = noite.assassinoEscolheu || {};
    const assassinoOk = matadorUid ? !!escolhas[matadorUid] : true;

    const detVivo = vivos.find(p => p.papel === 'detetive');
    const detOk = !detVivo || !!noite.detetiveInvestigou;
    const anjoVivo = vivos.find(p => p.papel === 'anjo');
    const anjoOk = !anjoVivo || !!noite.anjoProtegeu;
    const cidVivos = vivos.filter(p => p.papel === 'cidadao');
    const cidOk = cidVivos.every(c => c.prontoDia);

    return assassinoOk && detOk && anjoOk && cidOk;
}

async function resolveNight() {
    const snap = await getDoc(state.roomRef);
    if (!snap.exists()) return;
    const room = snap.data();
    if (room.status !== 'noite') return;

    const noite = room.noite || {};
    const escolhas = Object.values(noite.assassinoEscolheu || {});
    const contagem = {};
    escolhas.forEach(id => { contagem[id] = (contagem[id] || 0) + 1; });

    let vitimaId = null, max = 0, empate = false;
    Object.entries(contagem).forEach(([id, c]) => {
        if (c > max) { max = c; vitimaId = id; empate = false; }
        else if (c === max) empate = true;
    });
    if (empate) vitimaId = null;

    const protegida = vitimaId && noite.anjoProtegeu === vitimaId;
    const jogadoresAtualizados = JSON.parse(JSON.stringify(room.jogadores));
    const eventos = [];

    if (vitimaId && !protegida) {
        jogadoresAtualizados[vitimaId].vivo = false;
        eventos.push({ tipo: 'morte', texto: `<strong>${jogadoresAtualizados[vitimaId].nome}</strong> foi assassinado durante a noite.` });
    } else if (vitimaId && protegida) {
        // Mudança #1: mostra o nome do salvo
        eventos.push({ tipo: 'salvo', texto: `Tentaram matar <strong>${jogadoresAtualizados[vitimaId].nome}</strong>, mas o anjo protegeu.` });
    } else {
        eventos.push({ tipo: 'info', texto: 'A noite passou em paz. Ninguém foi atacado.' });
    }

    let investigacao = null;
    if (noite.detetiveInvestigou) {
        investigacao = {
            detetiveId: noite.detetiveInvestigou.detetiveId,
            alvoNome: noite.detetiveInvestigou.alvoNome || jogadoresAtualizados[noite.detetiveInvestigou.alvoId]?.nome || '?',
            resultado: noite.detetiveInvestigou.resultado
        };
    }

    const vivos = Object.entries(jogadoresAtualizados).filter(([, p]) => p.vivo).map(([uid, p]) => ({ uid, ...p }));
    const assVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAss = vivos.filter(p => p.papel !== 'assassino');

    let jogoAcabou = false, vencedor = null;
    if (assVivos.length === 0) { jogoAcabou = true; vencedor = 'cidade'; }
    else if (assVivos.length >= naoAss.length) { jogoAcabou = true; vencedor = 'assassinos'; }

    const proximoMatadorIndex = (room.assassinoMatadorIndex || 0) + 1;
    resetTransitionKey();

    await updateDoc(state.roomRef, {
        jogadores: jogadoresAtualizados,
        'noite.investigacaoDetetive': investigacao,
        'noite.eventos': eventos,
        status: jogoAcabou ? 'fim' : 'dia',
        vencedor: vencedor || null,
        historico: [...(room.historico || []), { rodada: (room.historico || []).length + 1, eventos }],
        assassinoMatadorIndex: proximoMatadorIndex
    });
}

// ============================================================
// DIA (ONLINE)
// ============================================================
function renderDay() {
    showScreen('day');
    resetTransitionKey();
    const room = state.roomData;
    const eventos = room.noite?.eventos || [];

    const eventsEl = document.getElementById('dayEvents');
    eventsEl.innerHTML = '';
    eventos.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'day-event ' + ev.tipo;
        div.innerHTML = ev.texto;
        eventsEl.appendChild(div);
    });

    const me = getMyPlayer(room);
    if (me && me.papel === 'detetive' && me.vivo && room.noite?.investigacaoDetetive) {
        const inv = room.noite.investigacaoDetetive;
        if (inv.detetiveId === state.uid) {
            const div = document.createElement('div');
            div.className = 'day-event info';
            div.innerHTML = `<strong>Investigação:</strong> ${inv.alvoNome} é <strong>${inv.resultado === 'assassino' ? 'o ASSASSINO!' : 'inocente'}</strong>.`;
            eventsEl.appendChild(div);
        }
    }

    // Mudança #3: botão "Já discutimos" para todos
    const toVoteBtn = document.getElementById('toVoteBtn');
    const waitMsg = document.getElementById('waitVoteMsg');
    toVoteBtn.classList.remove('hidden');
    waitMsg.classList.add('hidden');

    if (me && me.vivo) {
        if (me.prontoDia) {
            toVoteBtn.innerHTML = '<i data-lucide="hourglass"></i> Aguardando os outros...';
            toVoteBtn.disabled = true;
        } else {
            toVoteBtn.innerHTML = '<i data-lucide="check"></i> Já discutimos';
            toVoteBtn.disabled = false;
            toVoteBtn.onclick = async () => {
                await updateDoc(state.roomRef, { [`jogadores.${state.uid}.prontoDia`]: true });
            };
        }
    } else {
        toVoteBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

// ============================================================
// VOTAÇÃO (ONLINE)
// ============================================================
function renderVote() {
    showScreen('vote');
    const room = state.roomData;
    const me = getMyPlayer(room);

    if (state.voteTimerInterval) clearInterval(state.voteTimerInterval);
    const timerEl = document.getElementById('voteTimer');
    const started = room.votacaoIniciadaEm || Date.now();
    const duracao = room.votacaoDuracao || 60;

    state.voteTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        const restante = Math.max(0, duracao - elapsed);
        timerEl.innerText = restante + 's';
        if (restante <= 0) {
            clearInterval(state.voteTimerInterval);
            if (state.isHost) resolveVote();
        }
    }, 500);

    const grid = document.getElementById('voteGrid');
    grid.innerHTML = '';
    const vivos = getAlivePlayers(room);
    const votos = room.votos || {};

    document.querySelector('#voteScreen h2').innerText = 'Votação';
    const instruction = document.getElementById('voteInstruction');
    instruction.innerText = room.config.votoAnonimo
        ? 'Escolha quem expulsar (voto anônimo)'
        : 'Escolha quem expulsar (voto aberto)';

    const voteStatus = document.getElementById('voteStatus');
    const myVoteNow = votos[state.uid];

    if (!me || !me.vivo) {
        voteStatus.classList.add('hidden');
        const msg = document.createElement('div');
        msg.className = 'waiting-msg';
        msg.innerHTML = '<i data-lucide="eye"></i><span>Você está morto. Apenas observe.</span>';
        grid.appendChild(msg);
    } else if (myVoteNow !== undefined) {
        voteStatus.classList.remove('hidden');
    } else {
        voteStatus.classList.add('hidden');
        vivos.filter(p => p.uid !== state.uid).forEach(alvo => {
            const btn = document.createElement('button');
            btn.className = 'vote-btn';
            btn.innerText = alvo.nome;
            btn.addEventListener('click', async () => {
                state.myVote = alvo.uid;
                await updateDoc(state.roomRef, { [`votos.${state.uid}`]: alvo.uid });
            });
            grid.appendChild(btn);
        });

        // Mudança #6: botão pular voto
        const skipBtn = document.createElement('button');
        skipBtn.className = 'vote-btn';
        skipBtn.style.gridColumn = '1 / -1';
        skipBtn.style.background = 'var(--bege-escuro)';
        skipBtn.innerHTML = '<i data-lucide="skip-forward"></i> Pular voto';
        skipBtn.addEventListener('click', async () => {
            state.myVote = 'skip';
            await updateDoc(state.roomRef, { [`votos.${state.uid}`]: 'skip' });
        });
        grid.appendChild(skipBtn);
    }

    // Progresso
    const progressEl = document.getElementById('voteProgress');
    const votantesVivos = vivos.filter(p => p.vivo);
    const jaVotaram = votantesVivos.filter(p => votos[p.uid] !== undefined).length;
    progressEl.innerText = `Aguardando: ${jaVotaram} / ${votantesVivos.length}`;

    // Mudança #5: log de votos no modo aberto
    let logEl = document.getElementById('voteLog');
    if (!logEl) {
        logEl = document.createElement('div');
        logEl.id = 'voteLog';
        logEl.className = 'day-events';
        logEl.style.marginTop = '1rem';
        progressEl.parentNode.insertBefore(logEl, progressEl.nextSibling);
    }
    logEl.innerHTML = '';
    if (!room.config.votoAnonimo) {
        Object.entries(votos).forEach(([voterUid, alvo]) => {
            const voterNome = room.jogadores[voterUid]?.nome || '?';
            const alvoNome = alvo === 'skip' ? '— (pulou)' : (room.jogadores[alvo]?.nome || '?');
            const div = document.createElement('div');
            div.className = 'day-event info';
            div.innerHTML = `<strong>${voterNome}</strong> votou em <strong>${alvoNome}</strong>`;
            logEl.appendChild(div);
        });
    }

    if (window.lucide) lucide.createIcons();
}

async function resolveVote() {
    if (!state.isHost) return;
    const snap = await getDoc(state.roomRef);
    if (!snap.exists()) return;
    const room = snap.data();
    if (room.status !== 'votacao') return;

    const votos = room.votos || {};
    const contagem = {};
    Object.values(votos).forEach(v => {
        if (v === 'skip') return;
        contagem[v] = (contagem[v] || 0) + 1;
    });

    let maisVotado = null, max = 0, empate = false;
    Object.entries(contagem).forEach(([id, c]) => {
        if (c > max) { max = c; maisVotado = id; empate = false; }
        else if (c === max) empate = true;
    });
    if (empate) maisVotado = null;

    const jogadoresAtualizados = JSON.parse(JSON.stringify(room.jogadores));
    const eventos = [];
    if (maisVotado) {
        jogadoresAtualizados[maisVotado].vivo = false;
        eventos.push({ tipo: 'morte', texto: `<strong>${jogadoresAtualizados[maisVotado].nome}</strong> foi expulso da cidade (era <strong>${jogadoresAtualizados[maisVotado].papel}</strong>).` });
    } else {
        eventos.push({ tipo: 'info', texto: 'A votação empatou. Ninguém foi expulso.' });
    }

    const vivos = Object.entries(jogadoresAtualizados).filter(([, p]) => p.vivo).map(([uid, p]) => ({ uid, ...p }));
    const assVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAss = vivos.filter(p => p.papel !== 'assassino');

    let jogoAcabou = false, vencedor = null;
    if (assVivos.length === 0) { jogoAcabou = true; vencedor = 'cidade'; }
    else if (assVivos.length >= naoAss.length) { jogoAcabou = true; vencedor = 'assassinos'; }

    resetTransitionKey();

    await updateDoc(state.roomRef, {
        jogadores: jogadoresAtualizados,
        status: jogoAcabou ? 'fim' : 'resultado',
        vencedor: vencedor || null,
        resultadoRodada: { eventos, maisVotado }
    });
}

// ============================================================
// RESULTADO (ONLINE)
// ============================================================
function renderRoundResult() {
    showScreen('roundResult');
    resetTransitionKey();
    const room = state.roomData;
    const resultado = room.resultadoRodada || {};

    const reveal = document.getElementById('roundResultReveal');
    reveal.innerHTML = '';
    (resultado.eventos || []).forEach(ev => {
        const div = document.createElement('div');
        div.className = 'day-event ' + ev.tipo;
        div.innerHTML = ev.texto;
        reveal.appendChild(div);
    });

    const continueBtn = document.getElementById('continueBtn');
    const waitMsg = document.getElementById('waitContinueMsg');
    if (state.isHost) {
        continueBtn.classList.remove('hidden');
        waitMsg.classList.add('hidden');
        continueBtn.onclick = async () => {
            const jogadoresAtualizados = JSON.parse(JSON.stringify(state.roomData.jogadores));
            Object.keys(jogadoresAtualizados).forEach(uid => {
                jogadoresAtualizados[uid].prontoDia = false;
            });
            const proximoMatadorIndex = state.roomData.assassinoMatadorIndex || 0;
            resetTransitionKey();
            await updateDoc(state.roomRef, {
                status: 'noite',
                jogadores: jogadoresAtualizados,
                noite: { assassinoEscolheu: {}, assassinoSugeriu: {}, anjoProtegeu: null, detetiveInvestigou: null },
                votos: {},
                resultadoRodada: null,
                votacaoIniciadaEm: null
            });
        };
    } else {
        continueBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

// ============================================================
// FIM DE JOGO (ONLINE)
// ============================================================
function renderGameOver() {
    showScreen('gameOver');
    resetTransitionKey();
    const room = state.roomData;
    const vencedor = room.vencedor;

    const title = document.getElementById('gameOverTitle');
    const sub = document.getElementById('gameOverSub');
    const icon = document.getElementById('gameOverIcon');

    if (vencedor === 'cidade') {
        title.innerText = 'A cidade venceu!';
        sub.innerText = 'Todos os assassinos foram expulsos';
        icon.className = 'result-icon win';
    } else {
        title.innerText = 'Os assassinos venceram!';
        sub.innerText = 'Eles dominaram a cidade';
        icon.className = 'result-icon';
    }

    const reveal = document.getElementById('finalReveal');
    reveal.innerHTML = '';
    getPlayersArray(room).forEach(p => {
        const line = document.createElement('div');
        line.className = 'result-line';
        line.innerHTML = `
            <span class="label">${p.nome}</span>
            <span class="value ${p.papel || 'cidadao'}">${p.papel || '—'}</span>
        `;
        reveal.appendChild(line);
    });

    const actions = document.getElementById('gameOverActions');
    const spectatorMsg = document.getElementById('spectatorMsg');
    if (state.isHost) {
        actions.classList.remove('hidden');
        spectatorMsg.classList.add('hidden');
    } else {
        actions.classList.add('hidden');
        spectatorMsg.classList.remove('hidden');
    }

    if (window.confetti && vencedor === 'cidade') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    if (window.lucide) lucide.createIcons();
}

// ============================================================
// SAIR
// ============================================================
document.getElementById('exitBtn').addEventListener('click', () => {
    // Se está na tela de config local ou home, volta para o index
    if (state.gameMode === 'local' && screens.configLocal.classList.contains('hidden') === false) {
        cleanupAndHome();
        return;
    }
    if (!state.roomCode && state.gameMode !== 'local') {
        window.location.href = '../../index.html';
        return;
    }
    if (state.gameMode === 'local') {
        if (confirm('Voltar ao menu principal? A partida atual será cancelada.')) {
            cleanupAndHome();
        }
        return;
    }
    exitModal.classList.remove('hidden');
});

document.getElementById('cancelExitBtn').addEventListener('click', () => {
    exitModal.classList.add('hidden');
});

document.getElementById('confirmExitBtn').addEventListener('click', async () => {
    exitModal.classList.add('hidden');
    await leaveRoom();
});

async function leaveRoom() {
    try {
        if (state.roomRef && state.roomData) {
            const players = getPlayersArray(state.roomData);
            if (players.length <= 1) {
                await deleteDoc(state.roomRef);
            } else if (state.isHost) {
                const outros = players.filter(p => p.uid !== state.uid);
                if (outros.length > 0) {
                    await updateDoc(state.roomRef, {
                        criadorId: outros[0].uid,
                        [`jogadores.${state.uid}`]: null
                    });
                }
            } else {
                await updateDoc(state.roomRef, { [`jogadores.${state.uid}`]: null });
            }
        }
    } catch (e) { console.error(e); }
    cleanupAndHome();
}

function cleanupAndHome() {
    if (state.unsubscribeRoom) { state.unsubscribeRoom(); state.unsubscribeRoom = null; }
    if (state.voteTimerInterval) { clearInterval(state.voteTimerInterval); state.voteTimerInterval = null; }

    state.gameMode = null;
    state.roomCode = null;
    state.roomData = null;
    state.roomRef = null;
    state.isHost = false;
    state.myRole = null;
    state.myVote = null;
    state.roleConfirmed = false;
    state.lastTransitionKey = null;

    exitModal.classList.add('hidden');
    nameModal.classList.add('hidden');
    investigateModal.classList.add('hidden');
    hideLoading();

    // Volta para a escolha de modo
    document.getElementById('modeChoice').classList.remove('hidden');
    document.getElementById('onlineMenu').classList.add('hidden');
    document.getElementById('joinCodeInput').value = '';

    showScreen('home');
}

window.addEventListener('beforeunload', () => {
    if (state.roomRef && state.roomData) {
        const players = getPlayersArray(state.roomData);
        if (players.length <= 1) {
            deleteDoc(state.roomRef).catch(() => {});
        } else {
            updateDoc(state.roomRef, { [`jogadores.${state.uid}`]: null }).catch(() => {});
        }
    }
});

console.log('🎉 Cidade Dorme carregado!');