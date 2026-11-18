// Rally - Codinomes (Party Game)
// Modo Local (Juntos) + Modo Online (Firebase)

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
    getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc,
    onSnapshot, serverTimestamp, deleteField
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

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

// ============================================================
// LISTA DE PALAVRAS
// ============================================================
const WORDS_POOL = [
    "Agulha","África","Alecrim","Amazônia","Âncora","Anel","Aranha","Arca","Astronauta","Atlântida",
    "Avião","Azeite","Balão","Baleia","Banana","Bandeira","Barco","Baralho","Batata","Bateria",
    "Bico","Bola","Bomba","Boneco","Bota","Botão","Bússola","Cabo","Cachorro","Cadeado",
    "Café","Caixa","Calça","Cama","Camelo","Câmera","Caneta","Canguru","Capa","Caranguejo",
    "Carro","Carta","Carvão","Casa","Cavalo","Cebola","Cereja","Chapéu","Chave","Chocolate",
    "Chuva","Cinema","Cinto","Círculo","Cobra","Coco","Coelho","Colar","Colher","Computador",
    "Coração","Corda","Coroa","Cozinha","Cruz","Dado","Dedo","Dente","Deserto","Diamante",
    "Dinheiro","Dragão","Eclipse","Elefante","Elevador","Escada","Escola","Espada","Espelho","Estrela",
    "Faca","Fada","Fantasma","Fênix","Ferro","Festa","Fita","Flor","Fogo",
    "Foguete","Fonte","Formiga","Futebol","Gaiola","Galinha","Gato","Gelo","Girafa","Gota",
    "Grande","Guarda","Guitarra","Hélice","Igreja","Ilha","Ímã","Indio","Inseto","Inverno",
    "Jacaré","Jangada","Janela","Jardim","Jornal","Jogo","Jumento","Lago","Lâmpada","Lanterna",
    "Leão","Leite","Livro","Lobo","Lua","Macaco","Mala","Máquina","Mar","Martelo",
    "Máscara","Médico","Mel","Menino","Mesa","Meteoro","Minhoca","Moeda","Montanha","Morango",
    "Morte","Mudo","Múmia","Mundo","Música","Nariz","Navio","Neve","Noite","Nuvem",
    "Oceano","Olho","Onda","Ouro","Ovo","Padeiro","Palhaço","Panela","Pão","Papel",
    "Pássaro","Pé","Pedra","Pena","Pente","Pérola","Pescador","Piano","Piloto","Pimenta",
    "Pincel","Pipa","Pirata","Pistola","Planta","Pneu","Policia","Ponte","Porta","Praia",
    "Prata","Prato","Praça","Rainha","Raio","Raposa","Rato","Relógio","Remo","Roda",
    "Rosto","Rua","Sabão","Sangue","Sapo","Sereia","Serpente","Sol","Soldado","Sombra",
    "Sopa","Sorte","Suco","Tapete","Tartaruga","Teatro","Teia","Tesouro","Tigre","Tinta",
    "Trem","Trombeta","Tubarão","Urso","Uva","Vaca","Vassoura","Vela","Veneno","Vento",
    "Vermelho","Vidro","Vinho","Violino","Vulcão","Zebra","Zumbi",
    "Abacaxi","Abelha","Abismo","Abraço","Açúcar","Adaga","Agenda","Agente","Águia","Alarme",
    "Álbum","Alface","Algodão","Aliança","Almofada","Almoço","Altar","Ambulância","Amendoim","Amigo",
    "Amor","Anjo","Antena","Apito","Aquário","Arco","Areia","Armadura","Arroz","Arte",
    "Árvore","Asfalto","Atleta","Autor","Aventura","Balança","Balcão","Banco","Banheiro","Barba",
    "Barriga","Barril","Basquete","Batom","Bebê","Beijo","Berço","Biblioteca","Bigode","Bilhete",
    "Biscoito","Bolsa","Boi","Bolo","Borboleta","Bosque","Braço","Brasa","Brasil","Brinco",
    "Bruxa","Buraco","Cabana","Cabeça","Cabide","Cabelo","Caderno","Caldeirão","Calor","Camisa",
    "Campainha","Campo","Canela","Canoa","Canto","Capacete","Capitão","Caracol","Carimbo","Carpete",
    "Carteira","Castelo","Castanha","Catedral","Celular","Cérebro","Cerveja","Chaminé","Chaveiro","Cheiro",
    "Chiclete","Chifre","Chinelo","Chocalho","Churrasco","Ciclone","Cimento","Circo","Cisne","Clarão",
    "Cliente","Clima","Clube","Cobertor","Cofre","Cometa","Conselho","Conto","Convite","Copo",
    "Coral","Corrente","Coruja","Costela","Cratera","Creme","Criança","Cristal","Cruzeiro","Cubo",
    "Dama","Dança","Dardo","Debate","Decoração","Defesa","Delegado","Demônio","Desenho","Detetive",
    "Deusa","Diário","Disco","Doce","Dólar","Dourado","Duende","Dupla","Eco","Edifício",
    "Elástico","Embaixador","Encanto","Encontro","Energia","Engenheiro","Enigma","Escorpião","Escudo","Esqueleto",
    "Espaço","Espaguete","Espião","Esquilo","Estádio","Estátua","Estojo","Exército","Fábrica","Fagulha",
    "Faixa","Farol","Fazenda","Feijão","Feitiço","Ferradura","Filtro","Fio","Flecha","Floresta",
    "Floco","Fogão","Folha","Forno","Frango","Freio","Fronteira","Fruta","Funil","Furo",
    "Galo","Garagem","Garfo","Garganta","Garrafa","Gasolina","Gavião","Geladeira","Gênio","Gesto",
    "Ginásio","Giz","Globo","Gol","Goma","Gorila","Grama","Gravata","Gravidade","Grilo",
    "Gruta","Guerra","Hambúrguer","Harpa","Herói","Hipnose","História","Homem","Horizonte","Hospital",
    "Hotel","Humor","Iate","Identidade","Ilusão","Imagem","Imperador","Império","Incêndio","Índice",
    "Inimigo","Invenção","Irmão","Jabuti","Jaqueta","Jarra","Javali","Joia","Jogador","Juiz",
    "Justiça","Lagarta","Lagoa","Lanche","Lápis","Lareira","Lata","Lava","Legenda","Lenha",
    "Lenço","Lente","Leque","Letra","Liberdade","Limão","Linha","Língua","Lixeira","Litoral",
    "Lótus","Louça","Luar","Lucro","Machado","Maestro","Magia","Mamute","Manga","Mangueira",
    "Manhã","Mapa","Marfim","Marreta","Medo","Memória","Mensagem","Mercado","Mergulho","Milagre",
    "Milho","Mina","Mineral","Missão","Mistério","Modelo","Molho","Monstro","Mosca","Moto",
    "Motor","Muralha","Museu","Nascimento","Nave","Néctar","Nervo","Ninho","Nobre","Nó",
    "Nota","Novela","Número","Obra","Oficina","Operação","Orelha","Orgulho","Orquestra","Osso",
    "Padre","Paisagem","Palácio","Palco","Palito","Pandeiro","Pantanal","Paraíso","Parafuso","Parede",
    "Parque","Passagem","Passaporte","Patins","Patrão","Pavão","Pecado","Peixe","Pelicano","Pêndulo",
    "Perigo","Perfume","Perna","Personagem","Petróleo","Pião","Pijama","Pinheiro","Pinguim","Pintura",
    "Piscina","Planeta","Plástico","Pobreza","Poço","Poder","Polvo","Pombo","Porco","Pote",
    "Presente","Presidente","Primavera","Príncipe","Prisão","Professor","Programa","Pulga","Pulso","Queijo",
    "Quadro","Quarto","Quebra-cabeça","Queda","Quilo","Química","Quimono","Quintal","Rádio","Raiz",
    "Rancho","Rapadura","Receita","Rede","Refém","Regra","Rei","Remédio","Retrato","Rio",
    "Robô","Romance","Rosa","Rótulo","Roubo","Roupa","Ruína","Sabedoria","Saco","Sal",
    "Salada","Salão","Salto","Samba","Sandália","Sapato","Satélite","Sede","Segredo","Semente",
    "Senha","Sentença","Seringa","Sino","Sirene","Sistema","Skate","Sofá","Solda","Sonho",
    "Sorriso","Submarino","Suíte","Surpresa","Tambor","Tatu","Teclado","Telefone","Telhado","Temperatura",
    "Tempestade","Templo","Tênis","Tesoura","Testa","Texto","Tijolo","Tomate","Torneira","Torre",
    "Torta","Trabalho","Travesseiro","Tridente","Trilha","Trono","Truque","Tubo","Uniforme","Universo",
    "Vaga-lume","Válvula","Vampiro","Varanda","Vareta","Varinha","Vaso","Vegetal","Velocidade","Ventilador",
    "Verão","Verdade","Vestido","Viagem","Víbora","Vitória","Volante","Voto","Xadrez","Xícara",
    "Xilofone","Zíper","Zona","Zoológico"
];

// ============================================================
// CONSTANTES
// ============================================================
const WHITE_LIMIT = 3;
const SOLO_TOTAL_AZUL = 10;
const SOLO_TOTAL_BRANCO = 14;
const SOLO_TOTAL_PRETO = 1;
const TEAMS_TOTAL_AZUL = 10;
const TEAMS_TOTAL_VERMELHO = 10;
const TEAMS_TOTAL_BRANCO = 4;
const TEAMS_TOTAL_PRETO = 1;

const MAX_ONLINE_PLAYERS = 10;
const MIN_ONLINE_PLAYERS = 2;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;
const ONLINE_COLLECTION = 'codinomes_rooms';

// ============================================================
// ESTADO
// ============================================================
const state = {
    allPlayers: [],
    mode: null,
    teamA: [],
    teamB: [],
    decoder: null,

    board: [],
    currentTeam: 'A',
    phase: 'clue',
    currentClue: null,
    remainingGuesses: 0,
    justRevealedIndex: -1,

    teamA_score: 0,
    teamB_score: 0,
    whitesRevealed: 0,

    clueGiverIndex: 0,
    clueGiverPerTeam: { A: 0, B: 0 },

    winner: null,
    winReason: null,
    losingTeam: null,
    lastScreen: 'home',

    online: {
        uid: null,
        playerName: null,
        roomCode: null,
        roomRef: null,
        roomData: null,
        unsubscribeRoom: null,
        isHost: false,
        roomCodeVisible: false
    }
};

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
function generateRoomCode() {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return code;
}
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}
function detectModeFromCount(n) {
    if (n === 2) return 'dupla';
    if (n === 3) return 'trio';
    if (n >= 4) return 'equipes';
    return null;
}

// ============================================================
// DOM
// ============================================================
const screens = {
    home: document.getElementById('homeScreen'),
    config: document.getElementById('configScreen'),
    rolePick: document.getElementById('rolePickScreen'),
    handoffClue: document.getElementById('handoffClueScreen'),
    agentBoard: document.getElementById('agentBoardScreen'),
    handoffDecoder: document.getElementById('handoffDecoderScreen'),
    decoderBoard: document.getElementById('decoderBoardScreen'),
    gameOver: document.getElementById('gameOverScreen'),
    onlineMenu: document.getElementById('onlineMenuScreen'),
    lobby: document.getElementById('lobbyScreen'),
    onlineBoard: document.getElementById('onlineBoardScreen'),
    onlineGameOver: document.getElementById('onlineGameOverScreen')
};

function showScreen(key) {
    Object.keys(screens).forEach(k => {
        if (k === key) screens[k].classList.remove('hidden');
        else screens[k].classList.add('hidden');
    });
    state.lastScreen = key;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Modal de aviso (substitui alert)
const noticeModal = document.getElementById('noticeModal');
const noticeTitle = document.getElementById('noticeTitle');
const noticeMessage = document.getElementById('noticeMessage');
const noticeOkBtn = document.getElementById('noticeOkBtn');
function showNotice(message, title = 'Atenção') {
    noticeTitle.innerText = title;
    noticeMessage.innerText = message;
    noticeModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}
noticeOkBtn.addEventListener('click', () => noticeModal.classList.add('hidden'));

// Loading
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
function showLoading(text = 'Carregando...') {
    loadingText.innerText = text;
    loadingOverlay.classList.remove('hidden');
}
function hideLoading() { loadingOverlay.classList.add('hidden'); }

// ============================================================
// MENU
// ============================================================
document.getElementById('modeLocalBtn').addEventListener('click', () => {
    state.mode = null;
    state.allPlayers = [];
    state.teamA = [];
    state.teamB = [];
    renderConfigScreen();
    showScreen('config');
});

document.getElementById('modeOnlineBtn').addEventListener('click', async () => {
    const ok = await ensureAuth();
    if (!ok) {
        showNotice('Não foi possível conectar. Verifique sua internet e tente de novo.', 'Erro de conexão');
        return;
    }
    state.online.roomCodeVisible = false;
    showScreen('onlineMenu');
    if (window.lucide) lucide.createIcons();
});

// Back buttons
document.querySelectorAll('[data-back-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.dataset.backLevel;
        if (level === 'home') {
            document.getElementById('exitModal').classList.remove('hidden');
        } else if (level === 'config') {
            showScreen('home');
        } else if (level === 'rolePick') {
            renderConfigScreen();
            showScreen('config');
        } else if (level === 'handoff' || level === 'board') {
            renderRolePick();
            showScreen('rolePick');
        } else if (level === 'over') {
            showScreen('home');
        } else if (level === 'onlineMenu') {
            showScreen('home');
        } else if (level === 'lobby') {
            leaveOnlineRoom();
        } else if (level === 'onlineBoard') {
            document.getElementById('exitModal').classList.remove('hidden');
        } else if (level === 'onlineOver') {
            showScreen('home');
        }
    });
});

document.getElementById('cancelExitBtn').addEventListener('click', () => {
    document.getElementById('exitModal').classList.add('hidden');
});
document.getElementById('confirmExitBtn').addEventListener('click', async () => {
    document.getElementById('exitModal').classList.add('hidden');
    if (state.online.roomRef) {
        await leaveOnlineRoom();
    } else {
        window.location.href = '../../index.html';
    }
});

// ============================================================
// LOCAL — CONFIGURAÇÃO
// ============================================================
const playerInput = document.getElementById('playerInput');
const playerListEl = document.getElementById('playerList');
const configModeLabel = document.getElementById('configModeLabel');
const configHint = document.getElementById('configHint');
const teamSplitSection = document.getElementById('teamSplitSection');
const teamAListEl = document.getElementById('teamAList');
const teamBListEl = document.getElementById('teamBList');
const countA = document.getElementById('countA');
const countB = document.getElementById('countB');

function renderConfigScreen() {
    playerListEl.innerHTML = '';
    state.allPlayers.forEach((name, i) => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerHTML = `<span>${escapeHtml(name)}</span><button type="button">&times;</button>`;
        li.querySelector('button').addEventListener('click', () => {
            state.allPlayers.splice(i, 1);
            state.teamA = state.teamA.filter(n => n !== name);
            state.teamB = state.teamB.filter(n => n !== name);
            renderConfigScreen();
        });
        playerListEl.appendChild(li);
    });

    const n = state.allPlayers.length;
    const detected = detectModeFromCount(n);

    if (!detected) {
        configModeLabel.innerText = 'Adicione pelo menos 2 jogadores';
    } else {
        const labels = { dupla: 'Modo Dupla', trio: 'Modo Trio', equipes: 'Modo Equipes' };
        configModeLabel.innerText = labels[detected];
    }

    if (detected === 'equipes') {
        configHint.innerHTML = '<span class="mode-hint-line">Divida os jogadores entre as duas equipes abaixo.</span>';
    } else {
        configHint.innerHTML = `
            <span class="mode-hint-line"><strong>2 jogadores</strong> = Dupla</span>
            <span class="mode-hint-line"><strong>3 jogadores</strong> = Trio</span>
            <span class="mode-hint-line"><strong>4+ jogadores</strong> = Equipes</span>
        `;
    }

    if (detected === 'equipes') {
        teamSplitSection.classList.remove('hidden');
        state.allPlayers.forEach(name => {
            if (!state.teamA.includes(name) && !state.teamB.includes(name)) {
                if (state.teamA.length <= state.teamB.length) state.teamA.push(name);
                else state.teamB.push(name);
            }
        });
        state.teamA = state.teamA.filter(n => state.allPlayers.includes(n));
        state.teamB = state.teamB.filter(n => state.allPlayers.includes(n));
        renderTeamSplitBoxes();
    } else {
        teamSplitSection.classList.add('hidden');
    }

    let canStart = false;
    if (detected === 'dupla' || detected === 'trio') canStart = true;
    else if (detected === 'equipes') canStart = state.teamA.length >= 2 && state.teamB.length >= 2;

    document.getElementById('startGameBtn').disabled = !canStart;
    state.mode = detected;
    if (window.lucide) lucide.createIcons();
}

function renderTeamSplitBoxes() {
    countA.innerText = state.teamA.length;
    countB.innerText = state.teamB.length;

    teamAListEl.innerHTML = '';
    state.teamA.forEach(name => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerText = name;
        li.addEventListener('click', () => {
            state.teamA = state.teamA.filter(n => n !== name);
            state.teamB.push(name);
            renderConfigScreen();
        });
        teamAListEl.appendChild(li);
    });

    teamBListEl.innerHTML = '';
    state.teamB.forEach(name => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerText = name;
        li.addEventListener('click', () => {
            state.teamB = state.teamB.filter(n => n !== name);
            state.teamA.push(name);
            renderConfigScreen();
        });
        teamBListEl.appendChild(li);
    });
}

function addPlayer() {
    const val = playerInput.value.trim();
    if (!val) return;
    if (state.allPlayers.some(n => n.toLowerCase() === val.toLowerCase())) {
        showNotice('Já tem alguém com esse nome.');
        return;
    }
    state.allPlayers.push(val);
    playerInput.value = '';
    renderConfigScreen();
    playerInput.focus();
}

document.getElementById('addPlayerBtn').addEventListener('click', addPlayer);
playerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addPlayer(); }
});

document.getElementById('randomizeTeamsBtn').addEventListener('click', () => {
    const all = [...state.allPlayers];
    const shuffled = shuffle(all);
    const mid = Math.floor(shuffled.length / 2);
    state.teamA = shuffled.slice(0, mid);
    state.teamB = shuffled.slice(mid);
    renderConfigScreen();
});

// ============================================================
// LOCAL — START
// ============================================================
document.getElementById('startGameBtn').addEventListener('click', () => {
    if (state.mode === 'equipes') {
        if (state.teamA.length < 2 || state.teamB.length < 2) {
            showNotice('Cada equipe precisa de pelo menos 2 jogadores.');
            return;
        }
    }
    state.decoder = null;
    renderRolePick();
    showScreen('rolePick');
});

// ============================================================
// LOCAL — ROLE PICK
// ============================================================
function renderRolePick() {
    const container = document.getElementById('rolePickContainer');
    container.innerHTML = '';

    document.getElementById('rolePickSub').innerText = state.mode === 'equipes'
        ? 'Cada equipe escolhe quem vai decifrar'
        : 'Quem vai decifrar as palavras?';

    const confirmBtn = document.getElementById('confirmRolesBtn');

    if (state.mode === 'dupla' || state.mode === 'trio') {
        const box = document.createElement('div');
        box.className = 'role-pick-team';
        box.innerHTML = `<h3>Decifrador</h3><p class="role-pick-sub">Quem vai decifrar?</p>`;
        const list = document.createElement('div');
        list.className = 'role-pick-list';

        const currentDecoder = state.decoder && state.decoder.solo ? state.decoder.solo : null;
        state.allPlayers.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'role-pick-btn' + (currentDecoder === name ? ' selected' : '');
            btn.innerText = name;
            btn.addEventListener('click', () => {
                state.decoder = { solo: name };
                renderRolePick();
            });
            list.appendChild(btn);
        });
        box.appendChild(list);
        container.appendChild(box);

        confirmBtn.disabled = !(state.decoder && state.decoder.solo);
    } else {
        const boxA = document.createElement('div');
        boxA.className = 'role-pick-team team-a';
        boxA.innerHTML = `<h3>Equipe Azul</h3><p class="role-pick-sub">Quem vai decifrar?</p>`;
        const listA = document.createElement('div');
        listA.className = 'role-pick-list';

        state.teamA.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'role-pick-btn' + (state.decoder && state.decoder.A === name ? ' selected' : '');
            btn.innerText = name;
            btn.addEventListener('click', () => {
                state.decoder = { ...(state.decoder || {}), A: name };
                renderRolePick();
            });
            listA.appendChild(btn);
        });
        boxA.appendChild(listA);
        container.appendChild(boxA);

        const boxB = document.createElement('div');
        boxB.className = 'role-pick-team team-b';
        boxB.innerHTML = `<h3>Equipe Vermelha</h3><p class="role-pick-sub">Quem vai decifrar?</p>`;
        const listB = document.createElement('div');
        listB.className = 'role-pick-list';

        state.teamB.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'role-pick-btn' + (state.decoder && state.decoder.B === name ? ' selected' : '');
            btn.innerText = name;
            btn.addEventListener('click', () => {
                state.decoder = { ...(state.decoder || {}), B: name };
                renderRolePick();
            });
            listB.appendChild(btn);
        });
        boxB.appendChild(listB);
        container.appendChild(boxB);

        confirmBtn.disabled = !(state.decoder && state.decoder.A && state.decoder.B);
    }

    if (window.lucide) lucide.createIcons();
}

document.getElementById('confirmRolesBtn').addEventListener('click', () => {
    if (state.mode === 'dupla' || state.mode === 'trio') {
        if (!state.decoder || !state.decoder.solo) return;
        startSoloGame();
    } else {
        if (!state.decoder || !state.decoder.A || !state.decoder.B) return;
        startTeamsGame();
    }
});

// ============================================================
// CONSTRUÇÃO DE TABULEIRO
// ============================================================
function pickUniqueWords(count) {
    const shuffled = [...WORDS_POOL].sort(() => Math.random() - 0.5);
    const unique = [];
    const seen = new Set();
    for (const w of shuffled) {
        if (!seen.has(w)) { seen.add(w); unique.push(w); }
        if (unique.length === count) break;
    }
    return unique;
}

function buildBoardColorsSolo() {
    const colors = [];
    for (let i = 0; i < SOLO_TOTAL_AZUL; i++) colors.push('azul');
    for (let i = 0; i < SOLO_TOTAL_BRANCO; i++) colors.push('branco');
    for (let i = 0; i < SOLO_TOTAL_PRETO; i++) colors.push('preto');
    return shuffle(colors);
}

function buildBoardColorsTeams() {
    const colors = [];
    for (let i = 0; i < TEAMS_TOTAL_AZUL; i++) colors.push('azul');
    for (let i = 0; i < TEAMS_TOTAL_VERMELHO; i++) colors.push('vermelho');
    for (let i = 0; i < TEAMS_TOTAL_BRANCO; i++) colors.push('branco');
    for (let i = 0; i < TEAMS_TOTAL_PRETO; i++) colors.push('preto');
    return shuffle(colors);
}

function buildSoloBoard() {
    const words = pickUniqueWords(25);
    const colors = buildBoardColorsSolo();
    state.board = words.map((word, i) => ({ word, color: colors[i], revealed: false }));
    state.teamA_score = 0;
    state.teamB_score = 0;
    state.whitesRevealed = 0;
    state.justRevealedIndex = -1;
}

function buildTeamsBoard() {
    const words = pickUniqueWords(25);
    const colors = buildBoardColorsTeams();
    state.board = words.map((word, i) => ({ word, color: colors[i], revealed: false }));
    state.teamA_score = 0;
    state.teamB_score = 0;
    state.justRevealedIndex = -1;
}

// ============================================================
// LOCAL — FLUXO
// ============================================================
function startSoloGame() {
    state.phase = 'clue';
    state.currentClue = null;
    state.remainingGuesses = 0;
    state.winner = null;
    state.winReason = null;
    state.clueGiverIndex = 0;
    state.currentTeam = 'A';
    buildSoloBoard();
    goToHandoffClue();
}

function startTeamsGame() {
    state.phase = 'clue';
    state.currentClue = null;
    state.remainingGuesses = 0;
    state.winner = null;
    state.winReason = null;
    state.currentTeam = Math.random() < 0.5 ? 'A' : 'B';
    state.clueGiverPerTeam = { A: 0, B: 0 };
    buildTeamsBoard();
    goToHandoffClue();
}

function getClueGiver() {
    if (state.mode === 'dupla' || state.mode === 'trio') {
        const candidates = state.allPlayers.filter(n => n !== state.decoder.solo);
        if (candidates.length === 0) return state.allPlayers[0];
        const i = state.clueGiverIndex % candidates.length;
        return candidates[i];
    } else {
        const team = state.currentTeam === 'A' ? state.teamA : state.teamB;
        const decoder = state.currentTeam === 'A' ? state.decoder.A : state.decoder.B;
        const candidates = team.filter(n => n !== decoder);
        if (candidates.length === 0) return team[0];
        const i = state.clueGiverPerTeam[state.currentTeam] % candidates.length;
        return candidates[i];
    }
}

function advanceClueGiver() {
    if (state.mode === 'dupla' || state.mode === 'trio') {
        state.clueGiverIndex++;
    } else {
        state.clueGiverPerTeam[state.currentTeam]++;
    }
}

function goToHandoffClue() {
    const giver = getClueGiver();
    const isTeams = state.mode === 'equipes';
    const teamName = isTeams
        ? (state.currentTeam === 'A' ? 'Equipe Azul' : 'Equipe Vermelha')
        : (state.mode === 'dupla' ? 'Dupla' : 'Trio');

    const badge = document.getElementById('handoffClueTeam');
    badge.className = 'handoff-badge' + (isTeams ? ' team-' + state.currentTeam.toLowerCase() : '');
    badge.innerText = teamName;

    document.getElementById('handoffClueSub').innerText =
        isTeams ? 'Para quem vai dar a dica' : 'Para quem vai dar a próxima dica';
    document.getElementById('handoffClueName').innerText = giver;

    state.phase = 'clue';
    showScreen('handoffClue');
    if (window.lucide) lucide.createIcons();
}

document.getElementById('confirmClueBtn').addEventListener('click', () => {
    renderAgentBoard();
    showScreen('agentBoard');
});

function renderAgentBoard() {
    const isTeams = state.mode === 'equipes';
    const giver = getClueGiver();

    const turnBar = document.getElementById('agentTurnBar');
    const teamLabel = document.getElementById('agentTeamLabel');
    const roleLabel = document.getElementById('agentRoleLabel');

    if (isTeams) {
        turnBar.className = 'turn-bar team-' + state.currentTeam.toLowerCase();
        teamLabel.innerText = state.currentTeam === 'A' ? 'Equipe Azul' : 'Equipe Vermelha';
    } else {
        turnBar.className = 'turn-bar';
        teamLabel.innerText = state.mode === 'dupla' ? 'Dupla' : 'Trio';
    }
    roleLabel.innerText = `Dando dica: ${giver}`;

    const scoreLabelA = document.getElementById('scoreLabelA');
    const scoreLabelB = document.getElementById('scoreLabelB');
    const scoreMiniB = document.getElementById('scoreMiniB');
    const agentScoreA = document.getElementById('agentScoreA');
    const agentScoreB = document.getElementById('agentScoreB');

    if (isTeams) {
        scoreLabelA.innerText = 'Azul';
        scoreLabelB.innerText = 'Vermelho';
        scoreMiniB.classList.remove('neutral');
        scoreMiniB.classList.add('team-b');
        agentScoreA.innerText = `${state.teamA_score}/${TEAMS_TOTAL_AZUL}`;
        agentScoreB.innerText = `${state.teamB_score}/${TEAMS_TOTAL_VERMELHO}`;
    } else {
        scoreLabelA.innerText = 'Acertos';
        scoreLabelB.innerText = 'Brancas';
        scoreMiniB.classList.remove('team-b');
        scoreMiniB.classList.add('neutral');
        agentScoreA.innerText = `${state.teamA_score}/${SOLO_TOTAL_AZUL}`;
        agentScoreB.innerText = `${state.whitesRevealed}/${WHITE_LIMIT}`;
    }

    const grid = document.getElementById('agentBoardGrid');
    grid.innerHTML = '';
    state.board.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'board-card color-' + card.color;
        if (card.revealed) {
            div.classList.add('revealed', card.color);
            if (index === state.justRevealedIndex) div.classList.add('just-revealed');
        }
        div.innerText = card.word;
        grid.appendChild(div);
    });

    document.getElementById('clueWordInput').value = '';
    document.getElementById('clueNumberSelect').value = '1';

    if (window.lucide) lucide.createIcons();
}

document.getElementById('giveClueBtn').addEventListener('click', () => {
    if (state.phase !== 'clue') return;
    const wordInput = document.getElementById('clueWordInput');
    const numberInput = document.getElementById('clueNumberSelect');
    const clueWord = wordInput.value.trim();
    const clueNum = parseInt(numberInput.value, 10);

    if (!clueWord) { showNotice('Digite uma dica.'); return; }
    if (!Number.isFinite(clueNum) || clueNum < 1 || clueNum > 5) {
        showNotice('Escolha um número entre 1 e 5.');
        return;
    }

    state.currentClue = { word: clueWord, number: clueNum };
    state.remainingGuesses = clueNum;
    state.phase = 'guess';

    goToHandoffDecoder();
});

function goToHandoffDecoder() {
    const isTeams = state.mode === 'equipes';
    const decoder = isTeams
        ? (state.currentTeam === 'A' ? state.decoder.A : state.decoder.B)
        : state.decoder.solo;

    const teamName = isTeams
        ? (state.currentTeam === 'A' ? 'Equipe Azul' : 'Equipe Vermelha')
        : (state.mode === 'dupla' ? 'Dupla' : 'Trio');

    const badge = document.getElementById('handoffDecoderTeam');
    badge.className = 'handoff-badge' + (isTeams ? ' team-' + state.currentTeam.toLowerCase() : '');
    badge.innerText = teamName;

    document.getElementById('handoffDecoderSub').innerText = 'Para o decifrador';
    document.getElementById('handoffDecoderName').innerText = decoder;
    document.getElementById('handoffClueWord').innerText = state.currentClue.word;
    document.getElementById('handoffClueNumber').innerText = state.currentClue.number;

    showScreen('handoffDecoder');
    if (window.lucide) lucide.createIcons();
}

document.getElementById('confirmDecoderBtn').addEventListener('click', () => {
    renderDecoderBoard();
    showScreen('decoderBoard');
});

function renderDecoderBoard() {
    const isTeams = state.mode === 'equipes';
    const decoder = isTeams
        ? (state.currentTeam === 'A' ? state.decoder.A : state.decoder.B)
        : state.decoder.solo;

    const turnBar = document.getElementById('decoderTurnBar');
    const teamLabel = document.getElementById('decoderTeamLabel');
    const roleLabel = document.getElementById('decoderRoleLabel');

    if (isTeams) {
        turnBar.className = 'turn-bar team-' + state.currentTeam.toLowerCase();
        teamLabel.innerText = state.currentTeam === 'A' ? 'Equipe Azul' : 'Equipe Vermelha';
    } else {
        turnBar.className = 'turn-bar';
        teamLabel.innerText = state.mode === 'dupla' ? 'Dupla' : 'Trio';
    }
    roleLabel.innerText = `Decifrador: ${decoder}`;

    document.getElementById('clueText').innerText = state.currentClue.word;
    document.getElementById('clueNumber').innerText = state.currentClue.number;

    document.getElementById('decoderInstruction').innerText = state.phase === 'revealing'
        ? 'A carta foi revelada! Veja a cor…'
        : 'Clique nas cartas que você acha que combinam com a dica.';

    const decScoreLabelA = document.getElementById('decScoreLabelA');
    const decScoreLabelB = document.getElementById('decScoreLabelB');
    const decScoreMiniB = document.getElementById('decScoreMiniB');
    const decoderScoreA = document.getElementById('decoderScoreA');
    const decoderScoreB = document.getElementById('decoderScoreB');

    if (isTeams) {
        decScoreLabelA.innerText = 'Azul';
        decScoreLabelB.innerText = 'Vermelho';
        decScoreMiniB.classList.remove('neutral');
        decScoreMiniB.classList.add('team-b');
        decoderScoreA.innerText = `${state.teamA_score}/${TEAMS_TOTAL_AZUL}`;
        decoderScoreB.innerText = `${state.teamB_score}/${TEAMS_TOTAL_VERMELHO}`;
    } else {
        decScoreLabelA.innerText = 'Acertos';
        decScoreLabelB.innerText = 'Brancas';
        decScoreMiniB.classList.remove('team-b');
        decScoreMiniB.classList.add('neutral');
        decoderScoreA.innerText = `${state.teamA_score}/${SOLO_TOTAL_AZUL}`;
        decoderScoreB.innerText = `${state.whitesRevealed}/${WHITE_LIMIT}`;
    }

    const grid = document.getElementById('decoderBoardGrid');
    grid.innerHTML = '';
    grid.classList.add('decoder-board');

    state.board.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        if (card.revealed) {
            let classes = 'board-card revealed ' + card.color;
            if (index === state.justRevealedIndex) classes += ' just-revealed';
            btn.className = classes;
            btn.innerText = card.word;
            btn.disabled = true;
        } else {
            btn.className = 'board-card';
            btn.innerText = card.word;
            if (state.phase === 'guess') {
                btn.addEventListener('click', () => handleGuess(index));
            } else {
                btn.disabled = true;
            }
        }
        grid.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons();
}

function handleGuess(index) {
    if (state.phase !== 'guess') return;
    const card = state.board[index];
    if (!card || card.revealed) return;

    state.phase = 'revealing';
    card.revealed = true;
    state.justRevealedIndex = index;

    const isTeams = state.mode === 'equipes';
    const currentTeam = isTeams ? state.currentTeam : 'A';

    if (isTeams) {
        if (card.color === 'azul') state.teamA_score++;
        if (card.color === 'vermelho') state.teamB_score++;
    } else {
        if (card.color === 'azul') state.teamA_score++;
        if (card.color === 'branco') state.whitesRevealed++;
    }

    renderDecoderBoard();

    if (card.color === 'preto') {
        state.phase = 'over';
        state.justRevealedIndex = -1;
        if (isTeams) {
            state.winner = currentTeam === 'A' ? 'B' : 'A';
            state.winReason = 'black';
            state.losingTeam = currentTeam;
        } else {
            state.winner = 'derrota';
            state.winReason = 'black';
        }
        setTimeout(() => renderGameOver(), 1500);
        return;
    }

    if (isTeams) {
        if (state.teamA_score >= TEAMS_TOTAL_AZUL) {
            state.winner = 'A'; state.winReason = 'all'; state.phase = 'over';
            setTimeout(() => { state.justRevealedIndex = -1; renderGameOver(); }, 1500);
            return;
        }
        if (state.teamB_score >= TEAMS_TOTAL_VERMELHO) {
            state.winner = 'B'; state.winReason = 'all'; state.phase = 'over';
            setTimeout(() => { state.justRevealedIndex = -1; renderGameOver(); }, 1500);
            return;
        }
    }

    if (!isTeams && state.whitesRevealed >= WHITE_LIMIT) {
        state.winner = 'derrota';
        state.winReason = 'whites';
        state.phase = 'over';
        setTimeout(() => { state.justRevealedIndex = -1; renderGameOver(); }, 1500);
        return;
    }
    if (!isTeams && state.teamA_score >= SOLO_TOTAL_AZUL) {
        state.winner = 'vitoria';
        state.winReason = 'all';
        state.phase = 'over';
        setTimeout(() => { state.justRevealedIndex = -1; renderGameOver(); }, 1500);
        return;
    }

    const ownColor = isTeams ? (currentTeam === 'A' ? 'azul' : 'vermelho') : 'azul';
    if (card.color === ownColor) {
        setTimeout(() => {
            if (state.phase === 'revealing') {
                state.phase = 'guess';
                state.justRevealedIndex = -1;
                renderDecoderBoard();
            }
        }, 700);
    } else {
        setTimeout(() => {
            if (state.phase === 'revealing') {
                state.justRevealedIndex = -1;
                endTurn();
            }
        }, 1200);
    }
}

document.getElementById('passTurnBtn').addEventListener('click', () => {
    if (state.phase !== 'guess') return;
    endTurn();
});

function endTurn() {
    if (state.mode === 'equipes') {
        state.currentTeam = state.currentTeam === 'A' ? 'B' : 'A';
    }
    advanceClueGiver();
    state.currentClue = null;
    state.remainingGuesses = 0;
    state.phase = 'clue';
    state.justRevealedIndex = -1;
    goToHandoffClue();
}

function renderGameOver() {
    showScreen('gameOver');
    const title = document.getElementById('resultTitle');
    const sub = document.getElementById('resultSub');
    const icon = document.getElementById('resultIcon');

    function setResultIcon(type) {
        icon.className = 'result-icon';
        if (type === 'skull') {
            icon.classList.add('derrota');
            icon.innerHTML = '<i data-lucide="skull"></i>';
        } else if (type === 'trophy') {
            icon.classList.add('vitoria');
            icon.innerHTML = '<i data-lucide="trophy"></i>';
        }
    }

    if (state.mode === 'equipes') {
        if (state.winner === 'A' || state.winner === 'B') {
            const winningTeam = state.winner === 'A' ? 'Azul' : 'Vermelha';
            const losingTeam = state.winner === 'A' ? 'Vermelha' : 'Azul';
            if (state.winReason === 'black') {
                title.innerText = `Equipe ${winningTeam} venceu!`;
                sub.innerText = `A Equipe ${losingTeam} escolheu a palavra proibida.`;
            } else {
                title.innerText = `Equipe ${winningTeam} venceu!`;
                sub.innerText = `Revelaram todas as cartas da equipe.`;
            }
            icon.className = 'result-icon ' + (state.winner === 'A' ? 'azul' : 'vermelho');
            icon.innerHTML = '<i data-lucide="trophy"></i>';
            if (window.confetti) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
    } else {
        if (state.winner === 'vitoria') {
            title.innerText = 'Vocês venceram!';
            sub.innerText = `Revelaram as ${SOLO_TOTAL_AZUL} cartas do time sem estourar as ${WHITE_LIMIT} brancas!`;
            setResultIcon('trophy');
            if (window.confetti) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        } else if (state.winner === 'derrota') {
            title.innerText = 'Perderam!';
            if (state.winReason === 'black') sub.innerText = 'Vocês escolheram a palavra proibida.';
            else sub.innerText = `Vocês viraram as ${WHITE_LIMIT} cartas brancas.`;
            setResultIcon('skull');
        }
    }
    if (window.lucide) lucide.createIcons();
}

document.getElementById('rematchBtn').addEventListener('click', () => {
    state.decoder = null;
    renderRolePick();
    showScreen('rolePick');
});
document.getElementById('backToConfigBtn').addEventListener('click', () => {
    renderConfigScreen();
    showScreen('config');
});

// Placar ao vivo
function openLiveScore() {
    const content = document.getElementById('liveScoreContent');
    if (state.mode === 'equipes') {
        content.innerHTML = `
            <div class="live-score-row team-a"><span>Equipe Azul</span><span>${state.teamA_score}/${TEAMS_TOTAL_AZUL}</span></div>
            <div class="live-score-row team-b"><span>Equipe Vermelha</span><span>${state.teamB_score}/${TEAMS_TOTAL_VERMELHO}</span></div>
            <div class="live-score-row" style="color:var(--texto-suave);font-size:0.8rem;margin-top:0.5rem">
                <span>Vez de</span><span>${state.currentTeam === 'A' ? 'Azul' : 'Vermelha'}</span>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="live-score-row team-a"><span>Acertos</span><span>${state.teamA_score}/${SOLO_TOTAL_AZUL}</span></div>
            <div class="live-score-row team-b"><span>Brancas viradas</span><span>${state.whitesRevealed}/${WHITE_LIMIT}</span></div>
        `;
    }
    document.getElementById('scoreModal').classList.remove('hidden');
}
document.getElementById('liveScoreBtn').addEventListener('click', openLiveScore);
document.getElementById('liveScoreBtnDecoder').addEventListener('click', openLiveScore);
document.getElementById('closeScoreModalBtn').addEventListener('click', () => {
    document.getElementById('scoreModal').classList.add('hidden');
});

// ============================================================
// ONLINE — AUTH
// ============================================================
let authPromise = null;
function ensureAuth() {
    if (state.online.uid) return Promise.resolve(true);
    if (authPromise) return authPromise;
    authPromise = new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                state.online.uid = user.uid;
                unsub();
                resolve(true);
            } else {
                signInAnonymously(auth).catch(err => {
                    console.error('Auth falhou:', err);
                    unsub();
                    resolve(false);
                });
            }
        });
    });
    return authPromise;
}

// ============================================================
// ONLINE — NOME
// ============================================================
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');

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
        cleanup(); callback(v);
    };
    const onCancel = () => { cleanup(); callback(null); };
    nameInput.addEventListener('keydown', onKey);
    document.getElementById('confirmNameBtn').addEventListener('click', onConfirm);
    document.getElementById('cancelNameBtn').addEventListener('click', onCancel);
}

// ============================================================
// ONLINE — CRIAR / ENTRAR
// ============================================================
document.getElementById('createRoomBtn').addEventListener('click', () => {
    askName(async (name) => {
        if (!name) return;
        state.online.playerName = name;
        await createOnlineRoom();
    });
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const input = document.getElementById('joinCodeInput');
    const code = input.value.trim().toUpperCase();
    if (code.length !== CODE_LENGTH) {
        showNotice(`O código deve ter ${CODE_LENGTH} caracteres.`);
        return;
    }
    askName(async (name) => {
        if (!name) return;
        state.online.playerName = name;
        await joinOnlineRoom(code);
    });
});

document.getElementById('joinCodeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('joinRoomBtn').click();
    }
});

async function createOnlineRoom() {
    showLoading('Criando sala...');
    try {
        let code, roomRef, exists = true, attempts = 0;
        while (exists && attempts < 10) {
            code = generateRoomCode();
            roomRef = doc(db, ONLINE_COLLECTION, code);
            const snap = await getDoc(roomRef);
            exists = snap.exists();
            attempts++;
        }
        if (exists) {
            hideLoading();
            showNotice('Não foi possível gerar um código único. Tente novamente.', 'Erro');
            return;
        }

        const roomData = {
            code,
            hostUid: state.online.uid,
            status: 'lobby',
            createdAt: serverTimestamp(),
            settings: {
                clueTime: 45,
                guessTime: 45
            },
            jogadores: {
                [state.online.uid]: {
                    nome: state.online.playerName,
                    ready: true,
                    joinedAt: Date.now()
                }
            },
            game: null
        };

        await setDoc(roomRef, roomData);
        state.online.roomCode = code;
        state.online.roomRef = roomRef;
        state.online.isHost = true;
        state.online.roomCodeVisible = false;
        listenToRoom();
        hideLoading();
        showScreen('lobby');
    } catch (err) {
        console.error('Erro criando sala:', err);
        hideLoading();
        showNotice('Não foi possível criar a sala. Tente de novo.', 'Erro');
    }
}

async function joinOnlineRoom(code) {
    showLoading('Entrando na sala...');
    try {
        const roomRef = doc(db, ONLINE_COLLECTION, code);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) {
            hideLoading();
            showNotice('Sala não encontrada. Confira o código.', 'Sala não encontrada');
            return;
        }
        const data = snap.data();
        if (data.status !== 'lobby') {
            hideLoading();
            showNotice('Essa partida já começou. Peça pro host criar outra sala.', 'Partida em andamento');
            return;
        }
        const players = data.jogadores || {};
        const validPlayers = Object.values(players).filter(p => p && typeof p.nome === 'string');
        if (validPlayers.length >= MAX_ONLINE_PLAYERS) {
            hideLoading();
            showNotice(`A sala está cheia (${MAX_ONLINE_PLAYERS} jogadores).`, 'Sala cheia');
            return;
        }
        const nameTaken = validPlayers.some(p =>
            p.nome.toLowerCase() === state.online.playerName.toLowerCase()
        );
        if (nameTaken) {
            hideLoading();
            showNotice('Já tem alguém com esse nome na sala. Escolha outro.', 'Nome em uso');
            return;
        }

        await updateDoc(roomRef, {
            [`jogadores.${state.online.uid}`]: {
                nome: state.online.playerName,
                ready: false,
                joinedAt: Date.now()
            }
        });

        state.online.roomCode = code;
        state.online.roomRef = roomRef;
        state.online.isHost = (data.hostUid === state.online.uid);
        state.online.roomCodeVisible = false;
        listenToRoom();
        hideLoading();
        showScreen('lobby');
    } catch (err) {
        console.error('Erro entrando na sala:', err);
        hideLoading();
        showNotice('Não foi possível entrar na sala. Tente de novo.', 'Erro');
    }
}

async function leaveOnlineRoom() {
    try {
        if (state.online.roomRef && state.online.uid) {
            const snap = await getDoc(state.online.roomRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.hostUid === state.online.uid) {
                    await deleteDoc(state.online.roomRef);
                } else {
                    const update = {};
                    update[`jogadores.${state.online.uid}`] = deleteField();
                    await updateDoc(state.online.roomRef, update);
                }
            }
        }
    } catch (e) {
        console.warn('Erro ao sair da sala:', e);
    }
    if (state.online.unsubscribeRoom) {
        state.online.unsubscribeRoom();
        state.online.unsubscribeRoom = null;
    }
    stopOnlineTimer();
    state.online.roomCode = null;
    state.online.roomRef = null;
    state.online.roomData = null;
    state.online.isHost = false;
    state.online.playerName = null;
    state.online.lastPhaseKey = null;
    showScreen('home');
    if (window.lucide) lucide.createIcons();
}

// ============================================================
// ONLINE — SNAPSHOT
// ============================================================
function listenToRoom() {
    if (state.online.unsubscribeRoom) state.online.unsubscribeRoom();
    state.online.unsubscribeRoom = onSnapshot(state.online.roomRef, (snap) => {
        if (!snap.exists()) {
            showNotice('A sala foi fechada pelo host.', 'Sala encerrada');
            leaveOnlineRoom();
            return;
        }
        state.online.roomData = snap.data();
        const data = state.online.roomData;
        state.online.isHost = (data.hostUid === state.online.uid);

        if (data.status === 'lobby') {
            if (state.lastScreen !== 'lobby') showScreen('lobby');
            renderLobby();
        } else if (data.status === 'playing' || data.status === 'over') {
            renderOnlineBoard();
        }
    }, (err) => {
        console.error('Erro no snapshot:', err);
    });
}

// ============================================================
// ONLINE — LOBBY
// ============================================================
function renderLobby() {
    const data = state.online.roomData;
    if (!data) return;

    const codeEl = document.getElementById('lobbyRoomCode');
    codeEl.innerText = data.code;
    codeEl.classList.toggle('masked', !state.online.roomCodeVisible);
    const toggleBtn = document.getElementById('roomCodeToggle');
    toggleBtn.innerHTML = state.online.roomCodeVisible
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';

    const players = Object.entries(data.jogadores || {})
        .filter(([, p]) => p && typeof p.nome === 'string')
        .map(([uid, p]) => ({ uid, ...p }));
    players.sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0));
    const count = players.length;
    document.getElementById('playerCount').innerText = `${count} / ${MAX_ONLINE_PLAYERS}`;

    const detected = detectModeFromCount(count);
    const modeLabels = { dupla: 'Dupla', trio: 'Trio', equipes: 'Equipes' };
    document.getElementById('lobbyModeLabel').innerText = detected
        ? `Modo ${modeLabels[detected]}`
        : 'Adicione pelo menos 2 jogadores';

    const list = document.getElementById('playersList');
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.className = 'player-item' + (p.uid === data.hostUid ? ' host' : '');
        const isMe = p.uid === state.online.uid;
        li.innerHTML = `
            <span class="player-name">${escapeHtml(p.nome)}</span>
            ${p.uid === data.hostUid ? '<span class="player-tag host-tag">Host</span>' : ''}
            ${isMe ? '<span class="player-tag me-tag">Você</span>' : ''}
        `;
        list.appendChild(li);
    });

    const hostConfig = document.getElementById('hostConfig');
    hostConfig.classList.toggle('hidden', !state.online.isHost);
    if (state.online.isHost && data.settings) {
        document.querySelectorAll('#clueTimeGroup .chip-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.value, 10) === data.settings.clueTime);
        });
        document.querySelectorAll('#guessTimeGroup .chip-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.value, 10) === data.settings.guessTime);
        });
    }

    const startBtn = document.getElementById('startGameOnlineBtn');
    const waitMsg = document.getElementById('waitingHostMsg');
    const canStart = detected !== null;
    if (state.online.isHost) {
        startBtn.classList.toggle('hidden', !canStart);
        waitMsg.classList.add('hidden');
    } else {
        startBtn.classList.add('hidden');
        waitMsg.classList.remove('hidden');
    }

    document.getElementById('lobbyModeHint').innerText = detected
        ? (detected === 'equipes'
            ? 'No modo Equipes, as equipes serão sorteadas automaticamente.'
            : `Vocês vão jogar contra o tabuleiro.`)
        : '2 jogadores = Dupla • 3 = Trio • 4+ = Equipes';

    if (window.lucide) lucide.createIcons();
}

document.getElementById('roomCodeToggle').addEventListener('click', () => {
    state.online.roomCodeVisible = !state.online.roomCodeVisible;
    renderLobby();
});

document.querySelectorAll('#clueTimeGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.online.isHost || !state.online.roomRef) return;
        const val = parseInt(btn.dataset.value, 10);
        try {
            await updateDoc(state.online.roomRef, { 'settings.clueTime': val });
        } catch (e) { console.error(e); }
    });
});
document.querySelectorAll('#guessTimeGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.online.isHost || !state.online.roomRef) return;
        const val = parseInt(btn.dataset.value, 10);
        try {
            await updateDoc(state.online.roomRef, { 'settings.guessTime': val });
        } catch (e) { console.error(e); }
    });
});

// ============================================================
// ONLINE — START DA PARTIDA
// ============================================================
document.getElementById('startGameOnlineBtn').addEventListener('click', async () => {
    const data = state.online.roomData;
    if (!data || !state.online.isHost) return;
    const players = Object.entries(data.jogadores || {})
        .filter(([, p]) => p && typeof p.nome === 'string')
        .map(([uid, p]) => ({ uid, ...p }));
    if (players.length < MIN_ONLINE_PLAYERS) {
        showNotice('Precisa de pelo menos 2 jogadores para começar.');
        return;
    }
    const detected = detectModeFromCount(players.length);
    if (!detected) {
        showNotice('Número de jogadores inválido.');
        return;
    }

    showLoading('Iniciando partida...');
    try {
        const sorted = shuffle(players);

        let teamA = [], teamB = [];
        if (detected === 'equipes') {
            const mid = Math.floor(sorted.length / 2);
            teamA = sorted.slice(0, mid).map(p => p.uid);
            teamB = sorted.slice(mid).map(p => p.uid);
        } else {
            teamA = sorted.map(p => p.uid);
        }

        const boardWords = pickUniqueWords(25);
        const colors = detected === 'equipes' ? buildBoardColorsTeams() : buildBoardColorsSolo();
        const board = boardWords.map((word, i) => ({
            word,
            color: colors[i],
            revealed: false
        }));

        const startingTeam = detected === 'equipes'
            ? (Math.random() < 0.5 ? 'A' : 'B')
            : 'A';

        const nowMs = Date.now();
        const gameState = {
            mode: detected,
            board,
            teams: { A: teamA, B: teamB },
            currentTeam: startingTeam,
            phase: 'clue',
            clue: null,
            clueGiverUid: null,
            decoderUids: detected === 'equipes'
                ? { A: teamA[0], B: teamB[0] }
                : { solo: teamA[0] },
            scores: { A: 0, B: 0, whitesRevealed: 0 },
            winner: null,
            winReason: null,
            losingTeam: null,
            turnStartedAtMs: nowMs,
            clueStartedAtMs: nowMs,
            guessStartedAtMs: null
        };

        const currentTeamPlayers = detected === 'equipes'
            ? (startingTeam === 'A' ? teamA : teamB)
            : teamA;
        const currentDecoderUid = detected === 'equipes'
            ? gameState.decoderUids[startingTeam]
            : gameState.decoderUids.solo;
        const candidates = currentTeamPlayers.filter(uid => uid !== currentDecoderUid);
        gameState.clueGiverUid = candidates[0] || currentTeamPlayers[0];

        await updateDoc(state.online.roomRef, {
            status: 'playing',
            game: gameState
        });
        hideLoading();
    } catch (e) {
        console.error(e);
        hideLoading();
        showNotice('Erro ao iniciar partida.', 'Erro');
    }
});

// ============================================================
// ONLINE — TIMER
// ============================================================
let onlineTimerTick = null;

function stopOnlineTimer() {
    if (onlineTimerTick) {
        clearInterval(onlineTimerTick);
        onlineTimerTick = null;
    }
}

function formatTime(sec) {
    if (sec < 0) sec = 0;
    return `${sec}s`;
}

// ============================================================
// ONLINE — RENDER DO TABULEIRO
// ============================================================
function renderOnlineBoard() {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;
    const uid = state.online.uid;

    if (g.phase === 'over' || data.status === 'over') {
        renderOnlineGameOver();
        return;
    }

    if (state.lastScreen !== 'onlineBoard') showScreen('onlineBoard');

    const isTeams = g.mode === 'equipes';
    const currentTeam = g.currentTeam;
    const isMyTurnAsClue = (g.clueGiverUid === uid);
    const myDecoderUid = isTeams
        ? g.decoderUids[currentTeam]
        : g.decoderUids.solo;
    const isMyTurnAsDecoder = (myDecoderUid === uid);

    const turnBar = document.getElementById('onlineTurnBar');
    if (isTeams) {
        turnBar.className = 'turn-bar team-' + currentTeam.toLowerCase();
    } else {
        turnBar.className = 'turn-bar';
    }
    document.getElementById('onlineTeamLabel').innerText = isTeams
        ? (currentTeam === 'A' ? 'Equipe Azul' : 'Equipe Vermelha')
        : (g.mode === 'dupla' ? 'Dupla' : 'Trio');

    const allPlayers = data.jogadores || {};
    const clueGiverName = allPlayers[g.clueGiverUid]?.nome || '???';
    const decoderName = allPlayers[myDecoderUid]?.nome || '???';
    document.getElementById('onlineRoleLabel').innerText = `Dando dica: ${clueGiverName}`;

    const scoreLabelA = document.getElementById('onlineScoreLabelA');
    const scoreLabelB = document.getElementById('onlineScoreLabelB');
    const scoreMiniB = document.getElementById('onlineScoreMiniB');
    const scoreA = document.getElementById('onlineScoreA');
    const scoreB = document.getElementById('onlineScoreB');

    if (isTeams) {
        scoreLabelA.innerText = 'Azul';
        scoreLabelB.innerText = 'Vermelho';
        scoreMiniB.classList.remove('neutral');
        scoreMiniB.classList.add('team-b');
        scoreA.innerText = `${g.scores.A}/${TEAMS_TOTAL_AZUL}`;
        scoreB.innerText = `${g.scores.B}/${TEAMS_TOTAL_VERMELHO}`;
    } else {
        scoreLabelA.innerText = 'Acertos';
        scoreLabelB.innerText = 'Brancas';
        scoreMiniB.classList.remove('team-b');
        scoreMiniB.classList.add('neutral');
        scoreA.innerText = `${g.scores.A}/${SOLO_TOTAL_AZUL}`;
        scoreB.innerText = `${g.scores.whitesRevealed}/${WHITE_LIMIT}`;
    }

    const clueDisp = document.getElementById('onlineClueDisplay');
    if (g.clue && g.phase === 'guess') {
        clueDisp.classList.remove('hidden');
        document.getElementById('onlineClueText').innerText = g.clue.word;
        document.getElementById('onlineClueNumber').innerText = g.clue.number;
    } else {
        clueDisp.classList.add('hidden');
    }

    const statusBanner = document.getElementById('onlineStatusBanner');
    const statusText = document.getElementById('onlineStatusText');
    const instruction = document.getElementById('onlineInstruction');
    statusBanner.className = 'online-status-banner';

    if (g.phase === 'clue') {
        if (isMyTurnAsClue) {
            statusBanner.classList.add('highlight');
            statusText.innerText = `É a sua vez de dar a dica!`;
            instruction.innerText = 'Escolha uma palavra e um número de 1 a 5.';
        } else {
            statusText.innerText = `Vez de ${clueGiverName} dar a dica.`;
            instruction.innerText = 'Esperem ele(a) dar a dica...';
        }
    } else if (g.phase === 'guess') {
        if (isMyTurnAsDecoder) {
            statusBanner.classList.add('highlight');
            statusText.innerText = `É a sua vez de decifrar!`;
            instruction.innerText = `Dica: "${g.clue.word}" — clique nas cartas.`;
        } else {
            statusText.innerText = `${decoderName} está decifrando...`;
            instruction.innerText = 'Aguarde a vez do decifrador.';
        }
    }

    document.getElementById('onlineClueActions').classList.toggle('hidden', !(isMyTurnAsClue && g.phase === 'clue'));
    document.getElementById('onlinePassActions').classList.toggle('hidden', !(isMyTurnAsDecoder && g.phase === 'guess'));

    const grid = document.getElementById('onlineBoardGrid');
    grid.innerHTML = '';
    grid.classList.add('decoder-board');
    const isDecoderView = isMyTurnAsDecoder;

    g.board.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';

        const revealed = card.revealed;

        if (revealed) {
            btn.className = `board-card revealed ${card.color}` + (index === state.justRevealedIndex ? ' just-revealed' : '');
            btn.innerText = card.word;
            btn.disabled = true;
        } else if (isDecoderView) {
            btn.className = 'board-card';
            btn.innerText = card.word;
            if (isMyTurnAsDecoder && g.phase === 'guess') {
                btn.addEventListener('click', () => handleOnlineGuess(index));
            } else {
                btn.disabled = true;
            }
        } else {
            btn.className = 'board-card color-' + card.color;
            btn.innerText = card.word;
            btn.disabled = true;
        }

        grid.appendChild(btn);
    });

    startOnlineTimerForPhase(g);

    if (window.lucide) lucide.createIcons();
}

function startOnlineTimerForPhase(g) {
    stopOnlineTimer();
    const timerEl = document.getElementById('onlineTimerDisplay');
    const data = state.online.roomData;
    if (!data) return;

    let duration = 0;
    let startedMs = null;

    if (g.phase === 'clue') {
        duration = data.settings?.clueTime || 0;
        startedMs = g.clueStartedAtMs || g.turnStartedAtMs;
    } else if (g.phase === 'guess') {
        duration = data.settings?.guessTime || 0;
        startedMs = g.guessStartedAtMs;
    }

    if (!duration || duration === 0 || !startedMs) {
        timerEl.classList.add('hidden');
        return;
    }
    timerEl.classList.remove('hidden');

    function tick() {
        const elapsed = Math.floor((Date.now() - startedMs) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        timerEl.innerText = formatTime(remaining);
        timerEl.classList.toggle('urgent', remaining <= 10);
        if (remaining <= 0) {
            stopOnlineTimer();
            if (state.online.isHost) {
                forceEndTurnOnline();
            }
        }
    }
    tick();
    onlineTimerTick = setInterval(tick, 500);
}

async function forceEndTurnOnline() {
    const data = state.online.roomData;
    if (!data || !data.game || data.status !== 'playing') return;
    if (data.game.phase === 'over') return;
    try {
        await advanceOnlineTurn();
    } catch (e) { console.error(e); }
}

// ============================================================
// ONLINE — DAR DICA
// ============================================================
document.getElementById('onlineGiveClueBtn').addEventListener('click', async () => {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;
    if (g.clueGiverUid !== state.online.uid || g.phase !== 'clue') return;

    const input = document.getElementById('onlineClueWordInput');
    const select = document.getElementById('onlineClueNumSelect');
    const word = input.value.trim();
    const number = parseInt(select.value, 10);

    if (!word) { showNotice('Digite uma dica.'); return; }
    if (!Number.isFinite(number) || number < 1 || number > 5) {
        showNotice('Número inválido.');
        return;
    }

    try {
        await updateDoc(state.online.roomRef, {
            'game.clue': { word, number },
            'game.phase': 'guess',
            'game.guessStartedAtMs': Date.now()
        });
        input.value = '';
    } catch (e) {
        console.error(e);
        showNotice('Erro ao enviar dica.');
    }
});

// ============================================================
// ONLINE — PALPITE DO DECIFRADOR
// ============================================================
async function handleOnlineGuess(index) {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;
    if (g.phase !== 'guess') return;
    const myDecoderUid = g.mode === 'equipes'
        ? g.decoderUids[g.currentTeam]
        : g.decoderUids.solo;
    if (myDecoderUid !== state.online.uid) return;
    const card = g.board[index];
    if (!card || card.revealed) return;

    state.justRevealedIndex = index;
    card.revealed = true;

    const isTeams = g.mode === 'equipes';
    const currentTeam = g.currentTeam;

    const newScores = { ...g.scores };
    if (isTeams) {
        if (card.color === 'azul') newScores.A++;
        if (card.color === 'vermelho') newScores.B++;
    } else {
        if (card.color === 'azul') newScores.A++;
        if (card.color === 'branco') newScores.whitesRevealed++;
    }

    let winner = null, winReason = null, losingTeam = null, newPhase = g.phase;
    if (card.color === 'preto') {
        newPhase = 'over';
        if (isTeams) {
            winner = currentTeam === 'A' ? 'B' : 'A';
            losingTeam = currentTeam;
        } else {
            winner = 'derrota';
        }
        winReason = 'black';
    } else if (isTeams) {
        if (newScores.A >= TEAMS_TOTAL_AZUL) { winner = 'A'; winReason = 'all'; newPhase = 'over'; }
        else if (newScores.B >= TEAMS_TOTAL_VERMELHO) { winner = 'B'; winReason = 'all'; newPhase = 'over'; }
    } else {
        if (newScores.whitesRevealed >= WHITE_LIMIT) { winner = 'derrota'; winReason = 'whites'; newPhase = 'over'; }
        else if (newScores.A >= SOLO_TOTAL_AZUL) { winner = 'vitoria'; winReason = 'all'; newPhase = 'over'; }
    }

    try {
        if (newPhase === 'over') {
            await updateDoc(state.online.roomRef, {
                [`game.board`]: g.board,
                'game.scores': newScores,
                'game.phase': 'over',
                'game.winner': winner,
                'game.winReason': winReason,
                'game.losingTeam': losingTeam,
                status: 'over'
            });
            return;
        }

        const ownColor = isTeams ? (currentTeam === 'A' ? 'azul' : 'vermelho') : 'azul';
        if (card.color === ownColor) {
            await updateDoc(state.online.roomRef, {
                [`game.board`]: g.board,
                'game.scores': newScores
            });
            setTimeout(() => { state.justRevealedIndex = -1; }, 700);
        } else {
            await updateDoc(state.online.roomRef, {
                [`game.board`]: g.board,
                'game.scores': newScores
            });
            setTimeout(async () => {
                state.justRevealedIndex = -1;
                await advanceOnlineTurn();
            }, 1200);
        }
    } catch (e) {
        console.error(e);
        showNotice('Erro ao revelar carta.');
    }
}

// ============================================================
// ONLINE — PASSAR A VEZ
// ============================================================
document.getElementById('onlinePassBtn').addEventListener('click', async () => {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;
    if (g.phase !== 'guess') return;
    const myDecoderUid = g.mode === 'equipes'
        ? g.decoderUids[g.currentTeam]
        : g.decoderUids.solo;
    if (myDecoderUid !== state.online.uid) return;
    await advanceOnlineTurn();
});

async function advanceOnlineTurn() {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;
    const isTeams = g.mode === 'equipes';

    let nextTeam = g.currentTeam;
    if (isTeams) {
        nextTeam = g.currentTeam === 'A' ? 'B' : 'A';
    } else {
        nextTeam = 'A';
    }

    const currentTeamPlayers = isTeams ? g.teams[nextTeam] : g.teams.A;
    const currentDecoderUid = isTeams ? g.decoderUids[nextTeam] : g.decoderUids.solo;
    const candidates = currentTeamPlayers.filter(uid => uid !== currentDecoderUid);

    const prevClueGiver = g.clueGiverUid;
    const prevIdx = candidates.indexOf(prevClueGiver);
    const nextClueGiver = candidates.length > 0
        ? candidates[(prevIdx + 1) % candidates.length]
        : currentTeamPlayers[0];

    const nowMs = Date.now();
    try {
        await updateDoc(state.online.roomRef, {
            'game.currentTeam': nextTeam,
            'game.phase': 'clue',
            'game.clue': null,
            'game.clueGiverUid': nextClueGiver,
            'game.turnStartedAtMs': nowMs,
            'game.clueStartedAtMs': nowMs,
            'game.guessStartedAtMs': null
        });
        state.justRevealedIndex = -1;
    } catch (e) {
        console.error(e);
    }
}

// ============================================================
// ONLINE — FIM DE JOGO
// ============================================================
function renderOnlineGameOver() {
    const data = state.online.roomData;
    if (!data || !data.game) return;
    const g = data.game;

    showScreen('onlineGameOver');
    stopOnlineTimer();

    const title = document.getElementById('onlineResultTitle');
    const sub = document.getElementById('onlineResultSub');
    const icon = document.getElementById('onlineResultIcon');

    if (g.mode === 'equipes' && (g.winner === 'A' || g.winner === 'B')) {
        const winningTeam = g.winner === 'A' ? 'Azul' : 'Vermelha';
        const losingTeam = g.winner === 'A' ? 'Vermelha' : 'Azul';
        if (g.winReason === 'black') {
            title.innerText = `Equipe ${winningTeam} venceu!`;
            sub.innerText = `A Equipe ${losingTeam} escolheu a palavra proibida.`;
        } else {
            title.innerText = `Equipe ${winningTeam} venceu!`;
            sub.innerText = `Revelaram todas as cartas da equipe.`;
        }
        icon.className = 'result-icon ' + (g.winner === 'A' ? 'azul' : 'vermelho');
        icon.innerHTML = '<i data-lucide="trophy"></i>';
        if (window.confetti) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } else if (g.winner === 'vitoria') {
        title.innerText = 'Vocês venceram!';
        sub.innerText = `Revelaram as ${SOLO_TOTAL_AZUL} cartas sem estourar as ${WHITE_LIMIT} brancas!`;
        icon.className = 'result-icon vitoria';
        icon.innerHTML = '<i data-lucide="trophy"></i>';
        if (window.confetti) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } else if (g.winner === 'derrota') {
        title.innerText = 'Perderam!';
        if (g.winReason === 'black') sub.innerText = 'Vocês escolheram a palavra proibida.';
        else sub.innerText = `Vocês viraram as ${WHITE_LIMIT} cartas brancas.`;
        icon.className = 'result-icon derrota';
        icon.innerHTML = '<i data-lucide="skull"></i>';
    }

    if (window.lucide) lucide.createIcons();
}

document.getElementById('onlineRematchBtn').addEventListener('click', async () => {
    if (!state.online.isHost) {
        showNotice('Só o host pode iniciar uma nova partida.', 'Aguarde o host');
        return;
    }
    try {
        await updateDoc(state.online.roomRef, {
            status: 'lobby',
            game: null
        });
    } catch (e) {
        console.error(e);
    }
});
document.getElementById('onlineBackLobbyBtn').addEventListener('click', async () => {
    if (state.online.isHost) {
        try {
            await updateDoc(state.online.roomRef, {
                status: 'lobby',
                game: null
            });
        } catch (e) { console.error(e); }
    } else {
        showScreen('lobby');
    }
});

// ============================================================
// AD MODAL
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
        const a = t.dataset.adTab === 'advertise';
        t.classList.toggle('active', a);
        t.setAttribute('aria-selected', a ? 'true' : 'false');
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
            const a = t === tab;
            t.classList.toggle('active', a);
            t.setAttribute('aria-selected', a ? 'true' : 'false');
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
});
adCopyPixBtn.addEventListener('click', async () => {
    const ok = await copyText(adPixText.textContent.trim());
    if (ok) flashCopied(adCopyPixBtn, adCopiedPixMsg, 'Copiar chave');
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});