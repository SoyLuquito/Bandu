// Bandu - Cidade Dorme (Party Game Online)

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

// ============================================================
// ESTADO LOCAL
// ============================================================
const state = {
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
    voteStartedAt: null,
    pendingAction: null,
    // lock pra evitar transições duplicadas no host
    lastTransitionKey: null
};

// DOM
const screens = {
    home: document.getElementById('homeScreen'),
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
        console.log('Anônimo logado:', user.uid);
        if (state.pendingAction) {
            const act = state.pendingAction;
            state.pendingAction = null;
            if (act.type === 'create') doCreateRoom(act.name);
            else if (act.type === 'join') doJoinRoom(act.code, act.name);
        }
    } else {
        console.warn('Aguardando autenticação...');
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

    const onKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); onConfirm(); }
    };

    const onConfirm = () => {
        const v = nameInput.value.trim();
        if (!v) { nameInput.focus(); return; }
        cleanup();
        callback(v);
    };

    const onCancel = () => {
        cleanup();
        callback(null);
    };

    nameInput.addEventListener('keydown', onKey);
    document.getElementById('confirmNameBtn').addEventListener('click', onConfirm);
    document.getElementById('cancelNameBtn').addEventListener('click', onCancel);
}

// ============================================================
// CRIAR SALA
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
        if (exists) {
            hideLoading();
            alert('Não foi possível gerar um código único. Tente de novo.');
            return;
        }

        const roomRef = doc(db, 'partidas', code);
        await setDoc(roomRef, {
            codigo: code,
            criadorId: state.uid,
            criadoEm: serverTimestamp(),
            status: 'lobby',
            config: {
                assassinos: 1,
                temAnjo: true,
                tempoVotacao: 60,
                votoAnonimo: false
            },
            jogadores: {
                [state.uid]: {
                    nome: state.playerName,
                    vivo: true,
                    pronto: false,
                    papel: null,
                    viuPapel: false,
                    prontoDia: false
                }
            },
            noite: null,
            votos: null,
            historico: [],
            vencedor: null
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

// ============================================================
// ENTRAR EM SALA
// ============================================================
document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code.length !== CODE_LENGTH) {
        alert('Digite um código de 6 caracteres');
        return;
    }
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
        if (nomeDuplicado) { hideLoading(); alert('Já tem alguém com esse nome na sala'); return; }

        await updateDoc(roomRef, {
            [`jogadores.${state.uid}`]: {
                nome: state.playerName,
                vivo: true,
                pronto: false,
                papel: null,
                viuPapel: false,
                prontoDia: false
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
// LISTENER DA SALA
// ============================================================
function listenToRoom(code) {
    if (state.unsubscribeRoom) state.unsubscribeRoom();

    const roomRef = doc(db, 'partidas', code);
    state.roomRef = roomRef;

    state.unsubscribeRoom = onSnapshot(roomRef, (snap) => {
        if (!snap.exists()) {
            alert('A sala foi encerrada');
            cleanupAndHome();
            return;
        }

        const oldData = state.roomData;
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

        // ---- HOST AVANÇA FASES AUTOMATICAMENTE ----
        if (state.isHost) {
            maybeAdvancePhase(status);
        }
    }, (err) => {
        console.error('Listener error:', err);
        alert('Erro de conexão: ' + err.message);
    });
}

// Host verifica se pode avançar da fase atual
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
            if (state.lastTransitionKey === 'noite-ok') return;
            state.lastTransitionKey = 'noite-ok';
            await resolveNight();
        }
    } else if (status === 'votacao') {
        const vivos = getAlivePlayers(room);
        const votos = room.votos || {};
        const todosVotaram = vivos.every(p => votos[p.uid]);
        if (todosVotaram && vivos.length > 0) {
            if (state.lastTransitionKey === 'voto-ok') return;
            state.lastTransitionKey = 'voto-ok';
            await resolveVote();
        }
    }
}

// Reseta a chave de transição quando muda de fase
function resetTransitionKey() {
    state.lastTransitionKey = null;
}

// ============================================================
// LOBBY
// ============================================================
function renderLobby() {
    showScreen('lobby');
    resetTransitionKey();
    const room = state.roomData;

    document.getElementById('lobbyRoomCode').innerText = state.roomCode;

    const hostConfig = document.getElementById('hostConfig');
    if (state.isHost) {
        hostConfig.classList.remove('hidden');
        setChipActive('assassinosGroup', String(room.config.assassinos));
        setChipActive('anjoGroup', room.config.temAnjo ? 'sim' : 'nao');
        setChipActive('tempoGroup', String(room.config.tempoVotacao));
        setChipActive('votoGroup', room.config.votoAnonimo ? 'anonimo' : 'aberto');
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
            if (!state.isHost) return;
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
    await updateDoc(state.roomRef, {
        [`jogadores.${state.uid}.pronto`]: !me.pronto
    });
});

document.getElementById('startGameBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
    const players = getPlayersArray(state.roomData);
    if (players.length < MIN_PLAYERS) {
        alert(`Precisa de pelo menos ${MIN_PLAYERS} jogadores`);
        return;
    }
    const convidados = players.filter(p => p.uid !== state.uid);
    if (!convidados.every(p => p.pronto)) {
        alert('Todos os convidados precisam estar prontos');
        return;
    }
    showLoading('Iniciando partida...');
    try {
        await startNewRound();
    } finally {
        hideLoading();
    }
});

// ============================================================
// NOVA RODADA
// ============================================================
async function startNewRound() {
    if (!state.isHost) return;

    const players = getPlayersArray(state.roomData);
    const config = state.roomData.config;

    const shuffled = shuffle(players.map(p => p.uid));
    const numAssassinos = Math.min(config.assassinos, Math.floor(players.length / 3));
    const assassinos = shuffled.slice(0, numAssassinos);
    const restantes = shuffled.slice(numAssassinos);

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
            nome: p.nome,
            vivo: true,
            pronto: true,
            papel,
            viuPapel: false,
            prontoDia: false
        };
    });

    // Ordem de revezamento dos assassinos (embaralhada)
    const ordemAssassinos = shuffle(assassinos);

    resetTransitionKey();
    state.myVote = null;
    state.roleConfirmed = false;

    await updateDoc(state.roomRef, {
        status: 'papel',
        jogadores: jogadoresAtualizados,
        noite: null,
        votos: {},
        historico: [],
        vencedor: null,
        resultadoRodada: null,
        assassinoMatadorIndex: 0,
        ordemAssassinos
    });
}

// ============================================================
// PAPEL
// ============================================================
function renderRole() {
    showScreen('role');
    const me = getMyPlayer(state.roomData);
    if (!me) return;

    state.myRole = me.papel;

    const roleInfo = {
        assassino: { title: 'Assassino', sub: 'Você mata durante a noite', icon: 'skull', desc: 'Junto com os outros assassinos (se houver), escolha alguém para eliminar durante a noite.' },
        detetive: { title: 'Detetive', sub: 'Você investiga durante a noite', icon: 'search', desc: 'Escolha alguém para investigar. Você saberá se a pessoa é o assassino — mas só você verá o resultado.' },
        anjo: { title: 'Anjo', sub: 'Você protege durante a noite', icon: 'shield', desc: 'Escolha alguém para proteger. Se essa pessoa for atacada, sobreviverá — e todos saberão que houve uma tentativa frustrada.' },
        cidadao: { title: 'Cidadão', sub: 'Você é uma pessoa comum', icon: 'user', desc: 'Não tem poderes especiais. Observe, discuta e vote com sabedoria durante o dia.' }
    };

    const info = roleInfo[me.papel] || roleInfo.cidadao;
    document.getElementById('roleTitle').innerText = info.title;
    document.getElementById('roleSubtitle').innerText = info.sub;
    document.getElementById('roleDesc').innerText = info.desc;

    const iconWrap = document.getElementById('roleIconWrap');
    iconWrap.className = 'role-icon-wrap ' + me.papel;
    const icon = document.getElementById('roleIcon');
    icon.setAttribute('data-lucide', info.icon);

    // Contador de quantos já viram
    const players = getPlayersArray(state.roomData);
    const viram = players.filter(p => p.viuPapel).length;
    const total = players.length;

    let counter = document.getElementById('roleCounter');
    if (!counter) {
        counter = document.createElement('p');
        counter.id = 'roleCounter';
        counter.className = 'subtitle';
        counter.style.marginTop = '-0.5rem';
        const confirmBtn = document.getElementById('roleConfirmBtn');
        confirmBtn.parentNode.insertBefore(counter, confirmBtn);
    }
    counter.innerText = `Aguardando: ${viram} / ${total} confirmaram`;

    const confirmBtn = document.getElementById('roleConfirmBtn');
    if (me.viuPapel) confirmBtn.classList.add('hidden');
    else confirmBtn.classList.remove('hidden');

    if (window.lucide) lucide.createIcons();
}

document.getElementById('roleConfirmBtn').addEventListener('click', async () => {
    state.roleConfirmed = true;
    await updateDoc(state.roomRef, {
        [`jogadores.${state.uid}.viuPapel`]: true
    });
    // Não precisa checar — o onSnapshot do host vai avançar
});

// ============================================================
// NOITE
// ============================================================
function renderNight() {
    showScreen('night');
    const me = getMyPlayer(state.roomData);
    if (!me) return;

    const isDead = !me.vivo;
    const actionArea = document.getElementById('nightActionArea');
    const waitingMsg = document.getElementById('waitingMsg');
    const subtitle = document.getElementById('nightSubtitle');

    actionArea.innerHTML = '';
    waitingMsg.classList.add('hidden');

    if (isDead) {
        subtitle.innerText = 'Você está morto. Apenas observe.';
        waitingMsg.classList.remove('hidden');
        renderNightCounter();
        return;
    }

    const noite = state.roomData.noite || {};
    const room = state.roomData;

    // Cidadão
    if (me.papel === 'cidadao') {
        subtitle.innerText = 'A cidade dorme...';
        if (me.prontoDia) {
            waitingMsg.classList.remove('hidden');
            renderNightCounter();
            return;
        }
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-block';
        btn.innerHTML = '<i data-lucide="eye"></i> Estou pronto';
        btn.addEventListener('click', async () => {
            await updateDoc(state.roomRef, {
                [`jogadores.${state.uid}.prontoDia`]: true
            });
        });
        actionArea.appendChild(btn);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Assassino
    if (me.papel === 'assassino') {
        renderAssassinoActions(actionArea, subtitle, waitingMsg, me);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Detetive
    if (me.papel === 'detetive') {
        const jaAgiu = !!noite.detetiveInvestigou;
        if (jaAgiu) {
            subtitle.innerText = 'Ação registrada. Aguardando...';
            waitingMsg.classList.remove('hidden');
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
                        resultado
                    }
                });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
        renderNightCounter();
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Anjo
    if (me.papel === 'anjo') {
        const jaAgiu = !!noite.anjoProtegeu;
        if (jaAgiu) {
            subtitle.innerText = 'Ação registrada. Aguardando...';
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
                    'noite.anjoProtegeu': alvo.uid
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

// Lógica específica dos assassinos com revezamento
function renderAssassinoActions(actionArea, subtitle, waitingMsg, me) {
    const room = state.roomData;
    const noite = room.noite || {};
    const config = room.config;

    // Se só tem 1 assassino, é o comportamento clássico
    const ordemAssassinos = room.ordemAssassinos || [];
    const matadorIndex = room.assassinoMatadorIndex || 0;
    const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];
    const souMatador = matadorUid === state.uid;

    const escolhas = noite.assassinoEscolheu || {};
    const sugestoes = noite.assassinoSugeriu || {};

    // Bloco 1: mostra quem é o matador da noite
    const infoDiv = document.createElement('div');
    infoDiv.className = 'day-event info';
    if (ordemAssassinos.length > 1) {
        infoDiv.innerHTML = souMatador
            ? '<strong>É a sua vez de matar!</strong>'
            : `O matador desta noite é <strong>${room.jogadores[matadorUid]?.nome || '?'}</strong>`;
        actionArea.appendChild(infoDiv);
    }

    // Bloco 2: se sou o matador, mostro os alvos + sugestões recebidas
    if (souMatador) {
        const jaEscolheu = !!escolhas[state.uid];

        // Sugestões dos outros assassinos
        const sugestoesOutros = Object.entries(sugestoes)
            .filter(([uid]) => uid !== state.uid)
            .map(([, alvoId]) => room.jogadores[alvoId]?.nome || '?')
            .filter(Boolean);

        if (sugestoesOutros.length > 0 && !jaEscolheu) {
            const sugDiv = document.createElement('div');
            sugDiv.className = 'day-event info';
            sugDiv.innerHTML = `<strong>Sugestão dos outros assassinos:</strong> ${sugestoesOutros.join(', ')}`;
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
                await updateDoc(state.roomRef, {
                    'noite.assassinoEscolheu': novas
                });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
    } else {
        // Sou o "sugestor" — só marco um alvo para o matador ver
        const jaSugeriu = !!sugestoes[state.uid];

        if (jaSugeriu) {
            subtitle.innerText = 'Sugestão enviada. Aguardando o matador...';
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
                await updateDoc(state.roomRef, {
                    'noite.assassinoSugeriu': novas
                });
            });
            grid.appendChild(btn);
        });
        actionArea.appendChild(grid);
    }
}

// Contador de "Aguardando X / Y" durante a noite
function renderNightCounter() {
    const room = state.roomData;
    const vivos = getAlivePlayers(room);
    const noite = room.noite || {};

    let feitos = 0;
    let total = 0;

    vivos.forEach(p => {
        if (p.papel === 'assassino') {
            total++;
            // Matador escolheu?
            const ordemAssassinos = room.ordemAssassinos || [];
            const matadorIndex = room.assassinoMatadorIndex || 0;
            const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];

            const escolhas = noite.assassinoEscolheu || {};
            const sugestoes = noite.assassinoSugeriu || {};

            if (p.uid === matadorUid) {
                if (escolhas[p.uid]) feitos++;
            } else {
                if (sugestoes[p.uid]) feitos++;
            }
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
    counter.innerText = `Aguardando: ${feitos} / ${total}`;
}

// Verifica se a noite pode terminar
async function checkNightComplete() {
    if (!state.isHost) return false;
    const snap = await getDoc(state.roomRef);
    if (!snap.exists()) return false;
    const room = snap.data();

    const noite = room.noite || {};
    const vivos = getAlivePlayers(room);

    // Assassinos: apenas o matador precisa ter escolhido
    const ordemAssassinos = room.ordemAssassinos || [];
    const matadorIndex = room.assassinoMatadorIndex || 0;
    const matadorUid = ordemAssassinos[matadorIndex % ordemAssassinos.length];
    const escolhasAssassinos = noite.assassinoEscolheu || {};
    const assassinoOk = matadorUid ? !!escolhasAssassinos[matadorUid] : true;

    const detetiveVivo = vivos.find(p => p.papel === 'detetive');
    const detetiveOk = !detetiveVivo || !!noite.detetiveInvestigou;

    const anjoVivo = vivos.find(p => p.papel === 'anjo');
    const anjoOk = !anjoVivo || !!noite.anjoProtegeu;

    const cidadaosVivos = vivos.filter(p => p.papel === 'cidadao');
    const cidadaosOk = cidadaosVivos.every(c => c.prontoDia);

    return assassinoOk && detetiveOk && anjoOk && cidadaosOk;
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
        eventos.push({
            tipo: 'morte',
            texto: `<strong>${jogadoresAtualizados[vitimaId].nome}</strong> foi assassinado durante a noite.`
        });
    } else if (vitimaId && protegida) {
        eventos.push({
            tipo: 'salvo',
            texto: 'Tentaram matar alguém, mas o anjo protegeu. Ninguém morreu.'
        });
    } else {
        eventos.push({ tipo: 'info', texto: 'A noite passou em paz. Ninguém foi atacado.' });
    }

    let investigacao = null;
    if (noite.detetiveInvestigou) {
        investigacao = {
            detetiveId: noite.detetiveInvestigou.detetiveId,
            alvoNome: jogadoresAtualizados[noite.detetiveInvestigou.alvoId].nome,
            resultado: noite.detetiveInvestigou.resultado
        };
    }

    const vivos = Object.entries(jogadoresAtualizados)
        .filter(([, p]) => p.vivo)
        .map(([uid, p]) => ({ uid, ...p }));
    const assassinosVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAssassinos = vivos.filter(p => p.papel !== 'assassino');

    let jogoAcabou = false, vencedor = null;
    if (assassinosVivos.length === 0) { jogoAcabou = true; vencedor = 'cidade'; }
    else if (assassinosVivos.length >= naoAssassinos.length) { jogoAcabou = true; vencedor = 'assassinos'; }

    // Próximo matador (revezamento)
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
// DIA
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

    const toVoteBtn = document.getElementById('toVoteBtn');
    const waitMsg = document.getElementById('waitVoteMsg');
    if (state.isHost) {
        toVoteBtn.classList.remove('hidden');
        waitMsg.classList.add('hidden');
    } else {
        toVoteBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

document.getElementById('toVoteBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
    await updateDoc(state.roomRef, {
        status: 'votacao',
        votos: {},
        votacaoIniciadaEm: Date.now(),
        votacaoDuracao: state.roomData.config.tempoVotacao
    });
});

// ============================================================
// VOTAÇÃO
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
        }
    }, 500);

    const grid = document.getElementById('voteGrid');
    grid.innerHTML = '';
    const vivos = getAlivePlayers(room);
    const votos = room.votos || {};

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
    } else if (myVoteNow) {
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
    }

    const progressEl = document.getElementById('voteProgress');
    const votantesVivos = vivos.filter(p => p.vivo && p.uid !== undefined);
    const jaVotaram = votantesVivos.filter(p => votos[p.uid]).length;
    progressEl.innerText = `Aguardando: ${jaVotaram} / ${votantesVivos.length}`;

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
    Object.values(votos).forEach(id => { contagem[id] = (contagem[id] || 0) + 1; });

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
        const papel = jogadoresAtualizados[maisVotado].papel;
        eventos.push({
            tipo: 'morte',
            texto: `<strong>${jogadoresAtualizados[maisVotado].nome}</strong> foi expulso da cidade (era <strong>${papel}</strong>).`
        });
    } else {
        eventos.push({ tipo: 'info', texto: 'A votação empatou. Ninguém foi expulso.' });
    }

    const vivos = Object.entries(jogadoresAtualizados)
        .filter(([, p]) => p.vivo)
        .map(([uid, p]) => ({ uid, ...p }));
    const assassinosVivos = vivos.filter(p => p.papel === 'assassino');
    const naoAssassinos = vivos.filter(p => p.papel !== 'assassino');

    let jogoAcabou = false, vencedor = null;
    if (assassinosVivos.length === 0) { jogoAcabou = true; vencedor = 'cidade'; }
    else if (assassinosVivos.length >= naoAssassinos.length) { jogoAcabou = true; vencedor = 'assassinos'; }

    resetTransitionKey();

    await updateDoc(state.roomRef, {
        jogadores: jogadoresAtualizados,
        status: jogoAcabou ? 'fim' : 'resultado',
        vencedor: vencedor || null,
        resultadoRodada: { eventos, maisVotado }
    });
}

// ============================================================
// RESULTADO DA RODADA
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
    } else {
        continueBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
}

document.getElementById('continueBtn').addEventListener('click', async () => {
    if (!state.isHost) return;

    const vivos = getAlivePlayers(state.roomData);

    const jogadoresAtualizados = JSON.parse(JSON.stringify(state.roomData.jogadores));
    Object.keys(jogadoresAtualizados).forEach(uid => {
        jogadoresAtualizados[uid].prontoDia = false;
    });

    // Próximo matador
    const proximoMatadorIndex = state.roomData.assassinoMatadorIndex || 0;

    resetTransitionKey();

    await updateDoc(state.roomRef, {
        status: 'noite',
        jogadores: jogadoresAtualizados,
        noite: {
            assassinoEscolheu: {},
            assassinoSugeriu: {},
            anjoProtegeu: null,
            detetiveInvestigou: null
        },
        votos: {},
        resultadoRodada: null,
        votacaoIniciadaEm: null
    });
});

// ============================================================
// FIM DE JOGO
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

document.getElementById('rematchBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
    showLoading('Preparando nova partida...');
    try { await startNewRound(); } finally { hideLoading(); }
});

document.getElementById('editConfigBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
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
});

document.getElementById('closeRoomBtn').addEventListener('click', async () => {
    if (!state.isHost) return;
    if (!confirm('Encerrar a sala para todos?')) return;
    showLoading('Encerrando sala...');
    try { await deleteDoc(state.roomRef); } catch (e) { console.error(e); }
    hideLoading();
    cleanupAndHome();
});

// ============================================================
// SAIR
// ============================================================
document.getElementById('exitBtn').addEventListener('click', () => {
    // Se não está em sala, volta para o index
    if (!state.roomCode) {
        window.location.href = '../../index.html';
        return;
    }
    // Se está em sala, abre o modal pra confirmar
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
                await updateDoc(state.roomRef, {
                    [`jogadores.${state.uid}`]: null
                });
            }
        }
    } catch (e) { console.error(e); }
    cleanupAndHome();
}

function cleanupAndHome() {
    if (state.unsubscribeRoom) { state.unsubscribeRoom(); state.unsubscribeRoom = null; }
    if (state.voteTimerInterval) { clearInterval(state.voteTimerInterval); state.voteTimerInterval = null; }

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
    hideLoading();

    showScreen('home');
    document.getElementById('joinCodeInput').value = '';
}

window.addEventListener('beforeunload', () => {
    if (state.roomRef && state.roomData) {
        const players = getPlayersArray(state.roomData);
        if (players.length <= 1) {
            deleteDoc(state.roomRef).catch(() => {});
        } else {
            updateDoc(state.roomRef, {
                [`jogadores.${state.uid}`]: null
            }).catch(() => {});
        }
    }
});

console.log('🎉 Cidade Dorme carregado!');