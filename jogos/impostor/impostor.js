// Rally - Impostor (Party Game)
// Modo Local (1 dispositivo) + Modo Online (Cada um no seu — Firebase)

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

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

// ============================================================
// BANCO DE PALAVRAS
// ============================================================
const HINT_GROUPS = {
    animais: {
        "Animal do frio": ["Foca","Morsa","Urso-polar","Pinguim","Orca","Leopardo-das-neves","Rena","Lobo-do-ártico","Lebre-ártica","Narval"],
        "Animal peludo": ["Ovelha","Macaco","Cavalo","Porquinho-da-índia","Hamster","Morcego","Gambá","Canguru","Lhama","Doninha"],
        "Animal voador": ["Andorinha","Beija-flor","Pombo","Gaivota","Cegonha","Gavião","Mariposa","Libélula","Mosca","Vespa"],
        "Animal marinho": ["Estrela-do-mar","Água-viva","Cavalo-marinho","Tartaruga-marinha","Lontra","Foca","Mexilhão","Ouriço-do-mar","Peixe-palhaço","Arraia"],
        "Animal grande": ["Boi","Alce","Crocodilo","Canguru","Avestruz","Leão-marinho","Baleia-azul","Orangotango","Javali"],
        "Animal pequeno": ["Pulga","Cupim","Grilo","Besouro","Lagartixa","Rato","Sapo","Pintinho","Pardal","Percevejo"],
        "Animal da selva": ["Guepardo","Hiena","Rinoceronte","Zebra","Hipopótamo","Babuíno","Anta","Jaguatirica","Arara","Bicho-preguiça"],
        "Animal com pena": ["Pinguim","Pombo","Canário","Peru","Ganso","Cisne","Urubu","Falcão","Arara","Avestruz","Ema","Pavão"],
        "Animal com chifre": ["Vaca","Cabra","Antílope","Boi","Veado","Cervo","Rena","Alce","Búfalo"]
    },
    profissoes: {
        "Profissional da saúde": ["Médico","Enfermeiro","Dentista","Veterinário","Psicólogo","Fisioterapeuta","Farmacêutico","Nutricionista","Cuidador"],
        "Profissão de risco": ["Bombeiro","Policial","Soldado","Segurança","Soldador","Eletricista","Mergulhador"],
        "Profissional da construção": ["Pedreiro","Pintor","Eletricista","Encanador","Marceneiro","Arquiteto","Engenheiro","Soldador","Mestre de obras","Carpinteiro"],
        "Profissional da cozinha": ["Padeiro","Confeiteiro","Cozinheiro","Garçom","Barista","Churrasqueiro","Sushiman","Sommelier","Açougueiro","Pizzaiolo"],
        "Profissão de transporte": ["Motorista","Piloto","Taxista","Entregador","Caminhoneiro","Maquinista","Marinheiro","Comissário","Motoboy"],
        "Profissão artística": ["Ator","Cantor","Dançarino","Palhaço","Mágico","Dublador","Fotógrafo","Escultor"],
        "Profissional de estética": ["Cabeleireiro","Barbeiro","Maquiador","Tatuador","Costureiro","Manicure","Designer de sobrancelhas","Modelo"],
        "Profissional do esporte": ["Treinador","Árbitro","Personal trainer","Jogador","Nadador","Atleta","Ginasta","Ciclista","Instrutor"],
        "Atendimento ao público": ["Vendedor","Garçom","Recepcionista","Comissário","Guia","Corretor"]
    },
    objetos: {
        "Objeto Quente": ["Fogueira","Fogão","Vela","Fósforo","Churrasqueira","Chaleira","Torradeira","Secador de Cabelo","Ferro de Passar","Aquecedor","Lareira","Forno"],
        "Eletrônico": ["Celular","Televisão","Computador","Notebook","Tablet","Caixa de Som","Microfone","Fone de Ouvido"],
        "Objeto de Bolso": ["Celular","Moeda","Chave","Carteira","Clipe de Papel","Chaveiro","Isqueiro","Cartão de Crédito","Fone de Ouvido","Pen Drive"],
        "Objeto de Limpeza": ["Vassoura","Rodo","Balde","Aspirador de Pó","Detergente","Sabão","Esponja","Pano de Chão","Luva de Borracha","Escova de Limpeza","Desinfetante"],
        "Objeto de Cozinha": ["Panela","Frigideira","Micro-ondas","Liquidificador","Fogão","Saca-rolhas","Tábua de Corte","Colher de Pau","Espátula","Ralador","Faca","Garfo","Concha","Peneira","Batedeira","Cafeteira","Chaleira","Torradeira"],
        "Eletrodoméstico": ["Geladeira","Televisão","Computador","Ventilador","Liquidificador","Micro-ondas","Máquina de Lavar","Aspirador de Pó","Fogão"],
        "Banheiro": ["Sabonete","Toalha","Escova de Dentes","Pente","Secador de Cabelo","Espelho","Batom","Shampoo","Condicionador","Papel Higiênico","Desodorante","Pasta de dente","Toalha de Rosto"]
    },
    comidas: {
        "Comida Doce": ["Brigadeiro","Pudim","Sorvete","Açaí","Bolo de Chocolate","Torta de Limão","Donut","Churros","Chocolate","Bala","Pirulito","Biscoito","Gelatina","Goiabada","Doce de Leite","Cocada","Pé de Moleque","Milk-shake"],
        "Comida Salgada": ["Pizza","Hambúrguer","Batata Frita","Cachorro-quente","Pastel","Coxinha","Pão de Queijo","Empada","Kibe","Churrasco","Frango Assado","Peixe Frito","Salgadinho","Amendoim","Castanha"],
        "Comida Gelada": ["Sorvete","Açaí","Milk-shake","Refrigerante","Cerveja","Limonada","Iogurte"],
        "Comida Brasileira": ["Feijoada","Brigadeiro","Coxinha","Pão de Queijo","Pamonha","Canjica","Cocada","Pé de Moleque","Goiabada","Açaí","Tapioca","Farofa","Caipirinha"],
        "Fruta": ["Maçã","Banana","Laranja","Morango","Uva","Melancia","Melão","Abacaxi","Manga","Maracujá","Limão","Pêssego","Coco","Mexerica","Kiwi","Cereja","Goiaba","Mamão"],
        "Bebida": ["Café","Chá","Refrigerante","Milk-shake","Vinho","Cerveja","Água de Coco","Limonada","Suco de Laranja"],
        "Comida de Festa": ["Brigadeiro","Pipoca","Bolo","Coxinha","Pastel","Salgadinho","Pirulito","Bala"]
    },
    filmes: {
        "Super-Herói": ["Homem-Aranha","Batman","Superman","Homem de Ferro","Vingadores","Pantera Negra","Coringa","Thor","Capitão América","Doutor Estranho","Guardiões da Galáxia","Mulher-Maravilha","Flash","Aquaman","Lanterna Verde","Deadpool","Wolverine","Hulk","Viúva Negra","Homem-Formiga","Cyborg","Demolidor","Motoqueiro Fantasma","Surfista Prateado"],
        "Animação": ["O Rei Leão","Toy Story","Shrek","Procurando Nemo","Os Incríveis","Frozen","Moana","Detona Ralph","Monstros S.A.","Carros","Divertida Mente","Encanto","Kung Fu Panda","Madagascar","Meu Malvado Favorito","A Era do Gelo","Aladdin","A Bela e a Fera","Cinderela","A Pequena Sereia","Mulan","Pocahontas","Hercules","Tarzan","Up - Altas Aventuras","WALL-E","Ratatouille","Coraline"],
        "Série": ["Stranger Things","Round 6","Game of Thrones","Breaking Bad","La Casa de Papel","The Walking Dead","Friends","The Office","Os Simpsons","Chaves"],
        "Filme de Terror": ["Pânico","A Hora do Pesadelo","Sexta-Feira 13","O Iluminado","It - A Coisa","Atividade Paranormal","Invocação do Mal","Coraline","O Exorcista","O Massacre da Serra Elétrica","Annabelle","O Chamado","O Grito"],
        "Filme de Ficção": ["Star Wars","Matrix","Avatar","Jurassic Park","De Volta para o Futuro","Transformers","Interestelar","Harry Potter","Jogos Vorazes","Divergente","O Senhor dos Anéis"],
        "Filme de Comédia": ["Shrek","As Branquelas","Se Beber, Não Case!","O Máskara","Debi & Lóide","Todo Mundo em Pânico","Superbad","Esqueceram de Mim"]
    },
    futebol: {
        "Brasileiro em atividade": ["Neymar","Vinícius Júnior","Rodrygo","Raphinha","Richarlison","Endrick","Gabriel Jesus","Bruno Guimarães","Alisson","Ederson","Thiago Silva","Marquinhos","Lucas Paquetá","Philippe Coutinho","Hulk","Éder Militão","Gabriel Martinelli","Casemiro"],
        "Brasileiro aposentado": ["Pelé","Ronaldo Fenômeno","Ronaldinho Gaúcho","Romário","Kaká","Rivaldo","Zico","Sócrates","Garrincha","Roberto Carlos","Cafu","Dida","Bebeto","Adriano Imperador","Juninho Pernambucano","Marcos","Rogério Ceni","Taffarel","Denílson"],
        "Jogador sul-americano em atividade": ["Lionel Messi","Ángel Di María","Lautaro Martínez","Julián Álvarez","Enzo Fernández","Rodrigo De Paul","Paulo Dybala","Luis Suárez","Federico Valverde","Darwin Núñez","James Rodríguez","Luis Díaz","Arturo Vidal","Alexis Sánchez","Vinícius Júnior","Rodrygo","Raphinha","Richarlison","Endrick","Gabriel Jesus","Bruno Guimarães","Casemiro"],
        "Jogador sul-americano aposentado": ["Diego Maradona","Sergio Agüero","Carlos Valderrama","Paolo Guerrero","Carlos Tévez","Pelé","Ronaldo Fenômeno","Ronaldinho Gaúcho","Romário","Kaká","Rivaldo","Zico","Sócrates","Garrincha","Roberto Carlos","Cafu","Bebeto","Adriano Imperador"],
        "Jogador europeu em atividade": ["Cristiano Ronaldo","Kylian Mbappé","Antoine Griezmann","Lamine Yamal","Rodri","Harry Kane","Jude Bellingham","Bukayo Saka","Phil Foden","Manuel Neuer","Jamal Musiala","Virgil van Dijk","Erling Haaland","Robert Lewandowski","Rafael Leão","Kevin De Bruyne","Romelu Lukaku","Declan Rice","Cole Palmer","Pedri","Gavi","Luka Modrić","Bruno Fernandes","Bernardo Silva","Alexander Isak","Martin Ødegaard","Desirré Doué","Khvicha Kvaratskhelia"],
        "Jogador europeu aposentado": ["Zinedine Zidane","Thierry Henry","Karim Benzema","Xavi","Andrés Iniesta","Sergio Ramos","Iker Casillas","Carles Puyol","David Beckham","Franz Beckenbauer","Toni Kroos","Paolo Maldini","Gianluigi Buffon","Johan Cruyff","Ruud Gullit","Gareth Bale","Zlatan Ibrahimović","Eusébio","Petr Čech","Eden Hazard","Clarence Seedorf","Wayne Rooney"],
        "Time brasileiro": ["Corinthians","Palmeiras","São Paulo","Santos","Flamengo","Fluminense","Botafogo","Vasco da Gama","Grêmio","Internacional","Atlético Mineiro","Cruzeiro","Bahia","Vitória","Sport Recife","Fortaleza","Ceará","Athletico Paranaense","Coritiba","Goiás","Cuiabá","Red Bull Bragantino","América Mineiro","Chapecoense","Ponte Preta","Guarani","Portuguesa","Juventude","Avaí","Náutico","Santa Cruz","Paysandu","Remo","Atlético Goianiense","Criciúma","Mirassol","São Bernardo","Ituano","Novorizontino","Ferroviária"],
        "Time europeu": ["Real Madrid","Barcelona","Atlético de Madrid","Manchester United","Manchester City","Liverpool","Arsenal","Chelsea","Tottenham","Bayern de Munique","Borussia Dortmund","Bayer Leverkusen","RB Leipzig","Juventus","Milan","Inter de Milão","Napoli","Roma","Lazio","Paris Saint-Germain","Olympique de Marseille","Lyon","Monaco","Ajax","Benfica","Porto","Sporting","Celtic","Rangers","Galatasaray","Fenerbahçe","Real Sociedad","Olympiacos"],
        "Seleção": ["Brasil","Argentina","Uruguai","Colômbia","Chile","Paraguai","Peru","Bolívia","México","Estados Unidos","Inglaterra","França","Alemanha","Espanha","Portugal","Itália","Holanda","Bélgica","Croácia","Dinamarca","Noruega","Japão","Coreia do Sul","Austrália","Arábia Saudita","Marrocos","Egito","Costa do Marfim","África do Sul","Catar","Turquia","País de Gales"],
        "Técnico de futebol": ["Carlo Ancelotti","Pep Guardiola","José Mourinho","Jürgen Klopp","Abel Ferreira","Dorival Júnior","Tite","Felipão","Pofexô Luxemburgo","Zagallo","Fernando Diniz","Rogério Ceni","Renato Gaúcho","Jorge Jesus","Mano Menezes","Zinedine Zidane","Diego Simeone","Luis Enrique"],
        "Posição do futebol": ["Goleiro","Zagueiro","Lateral-direito","Lateral-esquerdo","Ala","Primeiro volante","Segundo volante","Meia central","Meia ofensivo","Armador","Ponta-direita","Ponta-esquerda","Centroavante","Segundo atacante","Falso nove"],
        "Campeonato brasileiro": ["Brasileirão","Copa do Brasil","Supercopa do Brasil","Libertadores","Copa Sul-Americana","Recopa Sul-Americana","Copinha","Campeonato Paulista","Campeonato Carioca","Campeonato Mineiro","Campeonato Gaúcho","Campeonato Baiano","Copa do Nordeste"],
        "Campeonato de seleções": ["Copa do Mundo","Copa América","Eurocopa","Jogos Olímpicos","Copa Africana de Nações","Liga das Nações","Copa das Confederações","Finalíssima"],
        "Campeonato europeu": ["Liga dos Campeões","Liga Europa","Conference League","Mundial de Clubes","Intercontinental","Premier League","La Liga","Serie A italiana","Bundesliga","Ligue 1","Eredivisie (Liga da Holanda)","Primeira Liga (Portugal)","Copa da Inglaterra","Copa do Rei (Espanha)"]
    },
    marvelDC: {
        "Herói da Marvel": ["Homem-Aranha","Homem de Ferro","Capitão América","Thor","Hulk","Doutor Estranho","Pantera Negra","Wolverine","Deadpool","Demolidor","Capitã Marvel","Feiticeira Escarlate","Visão","Homem-Formiga","Gavião Arqueiro","Viúva Negra","Senhor das Estrelas","Groot","Falcão","Motoqueiro Fantasma"],
        "Herói da DC": ["Batman","Superman","Mulher-Maravilha","Flash","Aquaman","Lanterna Verde","Ciborgue","Shazam","Supergirl","Robin","Asa Noturna","Batgirl","Besouro Azul","Arqueiro Verde","Caçador de Marte","Ravena","Estelar","Mutano","Canário Negro","Zatanna"],
        "Vilão da Marvel": ["Thanos","Loki","Duende Verde","Doutor Destino","Magneto","Venom","Ultron","Kang","Caveira Vermelha","Hela","Killmonger","Mysterio","Abutre","Rei do Crime","Dormammu","Apocalipse","Galactus","Duende Macabro","Dentes-de-Sabre","Mandarim"],
        "Vilão da DC": ["Coringa","Lex Luthor","Darkseid","Arlequina","Charada","Pinguim","Duas-Caras","Bane","Espantalho","Exterminador","Sinestro","Brainiac","General Zod","Mulher-Leopardo","Adão Negro","Sr. Frio","Gorila Grodd","Ares"],
        "Filme do MCU": ["Homem de Ferro","Os Vingadores","Thor: Ragnarok","Pantera Negra","Capitão América: Guerra Civil","Doutor Estranho","Guardiões da Galáxia","Homem-Aranha: Sem Volta para Casa","Vingadores: Ultimato","Vingadores: Guerra Infinita","Capitã Marvel","Homem-Formiga","Shang-Chi","Eternos","Viúva Negra","Thor: Amor e Trovão","Deadpool & Wolverine","Homem-Aranha: De Volta ao Lar","Pantera Negra: Wakanda Para Sempre","As Marvels"],
        "Equipe de heróis": ["Vingadores","X-Men","Quarteto Fantástico","Guardiões da Galáxia","Liga da Justiça","Jovens Titãs","Esquadrão Suicida","Sociedade da Justiça","Defensores","Inumanos","Aves de Rapina","Thunderbolts"],
        "Identidade secreta de herói": ["Peter Parker","Bruce Wayne","Clark Kent","Tony Stark","Matt Murdock","Barry Allen","Steve Rogers","Dick Grayson","T'Challa","Oliver Queen","Wade Wilson","Bruce Banner","Natasha Romanoff"],
        "Personagem dos X-Men": ["Wolverine","Professor Xavier","Magneto","Tempestade","Ciclope","Jean Grey","Mística","Noturno","Fera","Gambit","Vampira","Colossus"]
    }
};

// ============================================================
// CONSTANTES ONLINE
// ============================================================
const MAX_PLAYERS = 10;
const MIN_PLAYERS = 3;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;
const REVEAL_GRACE_MS = 3000; // 3s depois que todos viram, avança
const NEXT_ROUND_GRACE_MS = 3000;

// ============================================================
// ESTADO
// ============================================================
const state = {
    gameMode: null, // 'local' | 'online'

    local: {
        players: [],
        impostorCount: 1,
        impostorMode: 'blind',
        selectedThemes: new Set(),
        currentWord: null,
        infiltratedWords: [],
        impostorNames: [],
        revealIndex: 0,
        revealOrder: [],
        firstSpeaker: null,
        usedWords: new Set(),
        isTransitioning: false,
        isRolling: false
    },

    online: {
        uid: null,
        playerName: null,
        roomCode: null,
        roomRef: null,
        roomData: null,
        unsubscribeRoom: null,
        isHost: false,
        roleConfirmed: false,
        roleRevealed: false,
        myVote: null,
        voteSubmitted: false,
        confirmedContinue: false,
        revealedCardUid: null,
        writeTimerInterval: null,
        voteTimerInterval: null,
        revealGraceTimer: null,
        nextRoundGraceTimer: null,
        lastPhaseKey: null,
        lastPlayerOnTurn: null,
        lastRoomExists: null,
        pendingAction: null
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

function getMaxImpostors(playerCount) {
    if (playerCount < 3) return 0;
    if (playerCount <= 4) return 1;
    if (playerCount <= 6) return 2;
    return 4;
}

function getWordsForThemes(themeSet) {
    const result = [];
    Array.from(themeSet).forEach(cat => {
        const groups = HINT_GROUPS[cat];
        if (!groups) return;
        Object.keys(groups).forEach(hint => {
            groups[hint].forEach(word => result.push({ word, hint, cat }));
        });
    });
    return result;
}

function pickWordFrom(themeSet, usedWords) {
    const pool = getWordsForThemes(themeSet);
    const available = pool.filter(item => !usedWords.has(item.word));
    if (available.length === 0) {
        usedWords.clear();
        const item = pool[Math.floor(Math.random() * pool.length)];
        usedWords.add(item.word);
        return item;
    }
    const chosen = available[Math.floor(Math.random() * available.length)];
    usedWords.add(chosen.word);
    return chosen;
}

function pickInfiltratedWords(realWord, count) {
    const group = HINT_GROUPS[realWord.cat]?.[realWord.hint];
    if (!group || group.length < 2) {
        return Array(count).fill(realWord);
    }
    const candidates = group.filter(w => w !== realWord.word);
    const shuffled = shuffle(candidates);
    return Array.from({ length: count }, (_, i) => ({
        word: shuffled[i % shuffled.length], hint: realWord.hint, cat: realWord.cat
    }));
}

function getPlayersArray(roomData) {
    if (!roomData || !roomData.jogadores) return [];
    return Object.entries(roomData.jogadores).map(([uid, p]) => ({ uid, ...p }));
}

// ============================================================
// DOM
// ============================================================
const screens = {
    modeMenu: document.getElementById('modeMenuScreen'),
    config: document.getElementById('configScreen'),
    reveal: document.getElementById('revealScreen'),
    sort: document.getElementById('sortScreen'),
    playing: document.getElementById('playingScreen'),
    result: document.getElementById('resultScreen'),
    onlineMenu: document.getElementById('onlineMenuScreen'),
    lobby: document.getElementById('lobbyScreen'),
    onlineReveal: document.getElementById('onlineRevealScreen'),
    onlineWrite: document.getElementById('onlineWriteScreen'),
    onlineVote: document.getElementById('onlineVoteScreen'),
    onlineResult: document.getElementById('onlineResultScreen'),
    onlineGameOver: document.getElementById('onlineGameOverScreen')
};

const exitModal = document.getElementById('exitModal');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

function showScreen(key) {
    Object.keys(screens).forEach(k => {
        if (k === key) screens[k].classList.remove('hidden');
        else screens[k].classList.add('hidden');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading(text = 'Carregando...') {
    loadingText.innerText = text;
    loadingOverlay.classList.remove('hidden');
}
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});

// ============================================================
// MODAL NOME
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
// MENU DE MODOS
// ============================================================
document.getElementById('modeLocalBtn').addEventListener('click', () => {
    state.gameMode = 'local';
    renderLocalConfig();
    showScreen('config');
});

document.getElementById('modeOnlineBtn').addEventListener('click', async () => {
    state.gameMode = 'online';
    showScreen('onlineMenu');
    const ok = await ensureAuth();
    if (!ok) { showScreen('modeMenu'); }
});

// ============================================================
// MODO LOCAL
// ============================================================
const localInputs = { player: document.getElementById('playerInput') };
const localLists = { player: document.getElementById('playerList') };

function refreshLocalPlayerList() {
    localLists.player.innerHTML = '';
    state.local.players.forEach((name, i) => {
        const li = document.createElement('li');
        li.className = 'tag-item';
        li.innerHTML = `<span>${name}</span><button type="button" aria-label="Remover">&times;</button>`;
        li.querySelector('button').addEventListener('click', () => {
            state.local.players.splice(i, 1);
            refreshLocalPlayerList();
            refreshLocalImpostorLimits();
        });
        localLists.player.appendChild(li);
    });
}

function addLocalPlayer() {
    const val = localInputs.player.value.trim();
    if (!val) { localInputs.player.focus(); return; }
    if (state.local.players.includes(val)) { alert('Esse nome já foi adicionado!'); localInputs.player.focus(); return; }
    state.local.players.push(val);
    localInputs.player.value = '';
    refreshLocalPlayerList();
    refreshLocalImpostorLimits();
    localInputs.player.focus();
}

function refreshLocalImpostorLimits() {
    const maxImpostors = getMaxImpostors(state.local.players.length);
    const chips = document.querySelectorAll('#impostorCountGroup .chip-btn');
    const hint = document.getElementById('impostorLimitHint');
    chips.forEach(chip => {
        const value = parseInt(chip.dataset.value, 10);
        const available = value <= maxImpostors;
        chip.disabled = !available;
        chip.style.display = available ? '' : 'none';
        if (!available) chip.classList.remove('active');
    });
    if (state.local.impostorCount > maxImpostors) state.local.impostorCount = 1;
    chips.forEach(chip => {
        const value = parseInt(chip.dataset.value, 10);
        chip.classList.toggle('active', value === state.local.impostorCount);
    });
    if (state.local.players.length < 3) {
        hint.textContent = 'Adicione pelo menos 3 jogadores para iniciar.';
    } else {
        let msg = `Limite atual: até ${maxImpostors} impostor${maxImpostors > 1 ? 'es' : ''}.`;
        if (maxImpostors === 1) msg += ' Adicione 5+ jogadores para liberar 2.';
        else if (maxImpostors === 2) msg += ' Adicione 7+ jogadores para liberar mais.';
        hint.textContent = msg;
    }
}

function renderLocalConfig() {
    state.local.players = [];
    state.local.impostorCount = 1;
    state.local.impostorMode = 'blind';
    state.local.selectedThemes = new Set();
    state.local.usedWords = new Set();
    refreshLocalPlayerList();
    refreshLocalImpostorLimits();
    document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.value === '1');
    });
    document.querySelectorAll('.segment-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === 'blind');
    });
    document.getElementById('modeDesc').textContent = 'O impostor não recebe nenhuma informação — precisa blefar do zero.';
    document.querySelectorAll('#themeGrid .theme-toggle').forEach(b => b.classList.remove('active'));
    localInputs.player.value = '';
    if (window.lucide) lucide.createIcons();
}

document.getElementById('addPlayerBtn').addEventListener('click', addLocalPlayer);
localInputs.player.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addLocalPlayer(); }
});
document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.local.impostorCount = parseInt(btn.dataset.value, 10);
    });
});

const MODE_DESCRIPTIONS = {
    blind: 'O impostor não recebe nenhuma informação — precisa blefar do zero.',
    infiltrated: 'O impostor recebe outra palavra do mesmo tema e nem sabe que é o impostor.',
    hint: 'O impostor recebe apenas uma dica vaga sobre a palavra.'
};
document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.local.impostorMode = btn.dataset.mode;
        document.getElementById('modeDesc').textContent = MODE_DESCRIPTIONS[btn.dataset.mode] || '';
    });
});
document.querySelectorAll('#themeGrid .theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (state.local.selectedThemes.has(theme)) {
            state.local.selectedThemes.delete(theme);
            btn.classList.remove('active');
        } else {
            state.local.selectedThemes.add(theme);
            btn.classList.add('active');
        }
    });
});

document.getElementById('startGameBtn').addEventListener('click', () => {
    if (state.local.players.length < 3) { alert('Adicione pelo menos 3 jogadores!'); return; }
    if (state.local.impostorCount >= state.local.players.length) { alert('O número de impostores deve ser menor que o número de jogadores!'); return; }
    if (state.local.impostorCount > getMaxImpostors(state.local.players.length)) { alert('Número de impostores inválido.'); return; }
    if (state.local.selectedThemes.size === 0) { alert('Selecione pelo menos um tema!'); return; }
    state.local.usedWords.clear();
    state.local.revealIndex = 0;
    setupLocalRound();
});

function setupLocalRound() {
    state.local.isTransitioning = false;
    state.local.isRolling = false;
    state.local.currentWord = pickWordFrom(state.local.selectedThemes, state.local.usedWords);
    const shuffled = shuffle([...state.local.players]);
    state.local.impostorNames = shuffled.slice(0, state.local.impostorCount);
    state.local.infiltratedWords = [];
    if (state.local.impostorMode === 'infiltrated') {
        state.local.infiltratedWords = pickInfiltratedWords(state.local.currentWord, state.local.impostorCount);
    }
    state.local.revealOrder = shuffle([...state.local.players]);
    state.local.revealIndex = 0;
    state.local.firstSpeaker = null;
    renderLocalReveal();
    showScreen('reveal');
}

function renderLocalReveal() {
    const actorName = state.local.revealOrder[state.local.revealIndex];
    const isLast = state.local.revealIndex === state.local.revealOrder.length - 1;
    document.getElementById('revealActorName').innerText = actorName;
    document.getElementById('revealSub').innerText = isLast ? 'Última pessoa a ver!' : 'Passe o celular para ele(a)';
    const cardSecret = document.getElementById('cardSecret');
    cardSecret.classList.remove('flipped', 'animating');
    const secretLabel = document.getElementById('secretLabel');
    const secretContent = document.getElementById('secretContent');
    const cardBack = document.querySelector('#cardSecret .card-back');
    const nextBtn = document.getElementById('nextPlayerBtn');
    const oldHint = cardBack.querySelector('.card-back-hint');
    if (oldHint) oldHint.remove();
    cardBack.classList.remove('is-impostor');
    secretContent.classList.remove('is-impostor-text');
    const impostorIndex = state.local.impostorNames.indexOf(actorName);
    const isImpostor = impostorIndex !== -1;
    if (isImpostor) {
        if (state.local.impostorMode === 'infiltrated') {
            const fake = state.local.infiltratedWords[impostorIndex] || state.local.currentWord;
            secretLabel.innerText = 'Sua palavra';
            secretContent.innerText = fake.word;
        } else {
            cardBack.classList.add('is-impostor');
            secretContent.classList.add('is-impostor-text');
            secretLabel.innerText = 'Você é';
            secretContent.innerText = 'IMPOSTOR';
            if (state.local.impostorMode === 'hint') {
                const hintEl = document.createElement('p');
                hintEl.className = 'card-back-hint';
                hintEl.innerText = `Dica: ${state.local.currentWord.hint}`;
                cardBack.appendChild(hintEl);
            }
        }
    } else {
        secretLabel.innerText = 'Sua palavra';
        secretContent.innerText = state.local.currentWord.word;
    }
    nextBtn.classList.add('hidden');
    nextBtn.innerHTML = isLast
        ? '<i data-lucide="arrow-right"></i> Sortear quem começa'
        : '<i data-lucide="arrow-right"></i> Passar';
    if (window.lucide) lucide.createIcons();
}

const cardSecret = document.getElementById('cardSecret');
const CARD_FLIP_MS = 600;

cardSecret.addEventListener('click', () => {
    if (cardSecret.classList.contains('flipped')) return;
    cardSecret.classList.add('flipped');
    document.getElementById('nextPlayerBtn').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
});

document.getElementById('nextPlayerBtn').addEventListener('click', () => {
    if (state.local.isTransitioning) return;
    state.local.isTransitioning = true;
    document.getElementById('nextPlayerBtn').classList.add('hidden');
    cardSecret.classList.remove('flipped');
    cardSecret.classList.add('animating');
    setTimeout(() => {
        state.local.revealIndex++;
        if (state.local.revealIndex >= state.local.revealOrder.length) {
            state.local.isTransitioning = false;
            startLocalSort();
        } else {
            renderLocalReveal();
            cardSecret.classList.remove('animating');
            state.local.isTransitioning = false;
        }
    }, CARD_FLIP_MS);
});

function startLocalSort() {
    showScreen('sort');
    const sortNameEl = document.getElementById('sortName');
    const startRoundBtn = document.getElementById('startRoundBtn');
    startRoundBtn.classList.add('hidden');
    sortNameEl.classList.remove('picked');
    sortNameEl.classList.add('rolling');
    sortNameEl.innerText = '...';
    state.local.isRolling = true;
    const totalDuration = 2500;
    const startTime = Date.now();
    let lastChange = 0;
    function roll() {
        const elapsed = Date.now() - startTime;
        if (elapsed >= totalDuration) {
            const picked = state.local.players[Math.floor(Math.random() * state.local.players.length)];
            state.local.firstSpeaker = picked;
            sortNameEl.classList.remove('rolling');
            sortNameEl.classList.add('picked');
            sortNameEl.innerText = picked;
            startRoundBtn.classList.remove('hidden');
            state.local.isRolling = false;
            if (window.confetti) confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            return;
        }
        const remaining = totalDuration - elapsed;
        const interval = remaining < 500 ? 200 : (remaining < 1200 ? 130 : 80);
        if (Date.now() - lastChange >= interval) {
            const randomName = state.local.players[Math.floor(Math.random() * state.local.players.length)];
            sortNameEl.innerText = randomName;
            lastChange = Date.now();
        }
        requestAnimationFrame(roll);
    }
    roll();
}

document.getElementById('startRoundBtn').addEventListener('click', () => {
    document.getElementById('firstSpeakerName').innerText = state.local.firstSpeaker;
    showScreen('playing');
});

document.getElementById('endRoundBtn').addEventListener('click', () => {
    showScreen('result');
    renderLocalResult();
});

function renderLocalResult() {
    const impostorsCount = state.local.impostorNames.length;
    const impostorLabel = impostorsCount === 1 ? 'O impostor era' : 'Os impostores eram';
    document.getElementById('resultWord').innerText = state.local.currentWord.word;
    document.getElementById('resultImpostorLabel').innerText = impostorLabel;
    const container = document.getElementById('resultImpostors');
    container.innerHTML = '';
    state.local.impostorNames.forEach((name, i) => {
        const chip = document.createElement('span');
        chip.className = 'result-impostor-chip';
        if (state.local.impostorMode === 'infiltrated') {
            const fake = state.local.infiltratedWords[i];
            chip.innerText = fake ? `${name} (${fake.word})` : name;
        } else {
            chip.innerText = name;
        }
        container.appendChild(chip);
    });
    if (window.lucide) lucide.createIcons();
}

document.getElementById('nextRoundBtn').addEventListener('click', () => setupLocalRound());
document.getElementById('backToConfigBtn').addEventListener('click', () => {
    renderLocalConfig();
    showScreen('config');
});

// ============================================================
// MODO ONLINE — AUTH
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
        alert('Erro de autenticação. Verifique se o login anônimo está ativado no Firebase.');
        console.error(e);
        return false;
    }
}

// ============================================================
// MODO ONLINE — CRIAR/ENTRAR
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

async function doCreateRoom(name) {
    showLoading('Criando sala...');
    try {
        state.online.playerName = name.slice(0, 15);
        let code, exists = true, tries = 0;
        while (exists && tries < 10) {
            code = generateRoomCode();
            const check = await getDoc(doc(db, 'impostor_rooms', code));
            exists = check.exists();
            tries++;
        }
        if (exists) { hideLoading(); alert('Não foi possível gerar um código único.'); return; }

        const roomRef = doc(db, 'impostor_rooms', code);
        await setDoc(roomRef, {
            codigo: code,
            criadorId: state.online.uid,
            criadoEm: serverTimestamp(),
            status: 'lobby',
            config: {
                voltas: 1,
                tempo: 30,
                impostorMode: 'blind',
                temas: ['animais']
            },
            jogadores: {
                [state.online.uid]: {
                    nome: state.online.playerName,
                    pronto: false,
                    pontos: 0
                }
            },
            rodadaAtual: 0,
            jogo: null
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

async function doJoinRoom(code, name) {
    showLoading('Entrando na sala...');
    try {
        state.online.playerName = name.slice(0, 15);
        const roomRef = doc(db, 'impostor_rooms', code);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) { hideLoading(); alert('Sala não encontrada'); return; }
        const roomData = snap.data();
        if (roomData.status !== 'lobby') { hideLoading(); alert('A partida já começou'); return; }
        const players = Object.values(roomData.jogadores || {});
        if (players.length >= MAX_PLAYERS) { hideLoading(); alert('Sala cheia'); return; }
        const meuNome = state.online.playerName.toLowerCase();
        const nomeDuplicado = players.some(p => p.nome && p.nome.toLowerCase() === meuNome);
        if (nomeDuplicado) { hideLoading(); alert('Já tem alguém com esse nome'); return; }
        await updateDoc(roomRef, {
            [`jogadores.${state.online.uid}`]: {
                nome: state.online.playerName,
                pronto: false,
                pontos: 0
            }
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

// ============================================================
// MODO ONLINE — LISTENER
// ============================================================
function listenToRoom(code) {
    if (state.online.unsubscribeRoom) state.online.unsubscribeRoom();
    const roomRef = doc(db, 'impostor_rooms', code);
    state.online.roomRef = roomRef;

    state.online.unsubscribeRoom = onSnapshot(roomRef, (snap) => {
        if (state.gameMode !== 'online') return;
        if (!snap.exists()) {
            // Sala encerrada → volta ao menu
            alert('A sala foi encerrada');
            cleanupAndHome();
            return;
        }
        const prevData = state.online.roomData;
        state.online.roomData = snap.data();
        state.online.isHost = state.online.roomData.criadorId === state.online.uid;

        // Detecta se eu fui removido da sala
        if (!state.online.roomData.jogadores || !state.online.roomData.jogadores[state.online.uid]) {
            alert('Você foi removido da sala');
            cleanupAndHome();
            return;
        }

        const status = state.online.roomData.status;
        if (status === 'lobby') renderLobby();
        else if (status === 'revelacao') renderOnlineReveal();
        else if (status === 'escrita') renderOnlineWrite();
        else if (status === 'votacao') renderOnlineVote();
        else if (status === 'resultado') renderOnlineResult();
        else if (status === 'fim') renderOnlineGameOver();

        if (state.online.isHost) maybeAdvancePhase(status);
    }, (err) => {
        console.error('Listener error:', err);
    });
}

function cleanupAndHome() {
    if (state.online.unsubscribeRoom) state.online.unsubscribeRoom();
    if (state.online.writeTimerInterval) clearInterval(state.online.writeTimerInterval);
    if (state.online.voteTimerInterval) clearInterval(state.online.voteTimerInterval);
    if (state.online.revealGraceTimer) clearTimeout(state.online.revealGraceTimer);
    if (state.online.nextRoundGraceTimer) clearTimeout(state.online.nextRoundGraceTimer);
    state.online.uid = state.online.uid; // preserva auth
    state.online.playerName = null;
    state.online.roomCode = null;
    state.online.roomRef = null;
    state.online.roomData = null;
    state.online.unsubscribeRoom = null;
    state.online.isHost = false;
    state.online.roleConfirmed = false;
    state.online.roleRevealed = false;
    state.online.myVote = null;
    state.online.voteSubmitted = false;
    state.online.confirmedContinue = false;
    state.online.revealedCardUid = null;
    state.online.writeTimerInterval = null;
    state.online.voteTimerInterval = null;
    state.online.revealGraceTimer = null;
    state.online.nextRoundGraceTimer = null;
    state.online.lastPhaseKey = null;
    state.online.lastPlayerOnTurn = null;
    state.online.pendingAction = null;
    showScreen('modeMenu');
}

async function maybeAdvancePhase(status) {
    if (!state.online.isHost) return;
    const room = state.online.roomData;
    if (!room) return;

    if (status === 'revelacao') {
        // Todos viram? Espera grace de 3s e avança.
        const players = getPlayersArray(room);
        if (players.length > 0 && players.every(p => p.viuPapel)) {
            const key = `revelacao-${room.rodadaAtual}`;
            if (state.online.lastPhaseKey === key) return;
            state.online.lastPhaseKey = key;
            await new Promise(r => setTimeout(r, REVEAL_GRACE_MS));
            // Re-checa que ninguém saiu
            const fresh = await getDoc(state.online.roomRef);
            if (!fresh.exists()) return;
            const freshPlayers = getPlayersArray(fresh.data());
            if (freshPlayers.length > 0 && freshPlayers.every(p => p.viuPapel)) {
                await updateDoc(state.online.roomRef, { status: 'escrita' });
            } else {
                state.online.lastPhaseKey = null;
            }
        }
    } else if (status === 'escrita') {
        // Todos enviaram a palavra da rodada atual?
        const players = getPlayersArray(room);
        const palavras = room.jogo?.palavras || {};
        const allSent = players.every(p => {
            const pWord = palavras[p.uid];
            if (!pWord) return false;
            // Palavras é um mapa uid -> array (uma palavra por rodada)
            return Array.isArray(pWord) ? pWord.length >= room.rodadaAtual : !!pWord;
        });
        if (allSent && players.length > 0) {
            const key = `escrita-${room.rodadaAtual}`;
            if (state.online.lastPhaseKey === key) return;
            state.online.lastPhaseKey = key;
            await updateDoc(state.online.roomRef, {
                status: 'votacao',
                'jogo.votos': {},
                'jogo.votacaoInicio': Date.now()
            });
        }
    } else if (status === 'votacao') {
        const players = getPlayersArray(room);
        const votos = room.jogo?.votos || {};
        const allVoted = players.every(p => votos[p.uid] !== undefined);
        if (allVoted && players.length > 0) {
            const key = `votacao-${room.rodadaAtual}`;
            if (state.online.lastPhaseKey === key) return;
            state.online.lastPhaseKey = key;
            await resolveOnlineRound();
        }
    }
}

// ============================================================
// MODO ONLINE — LOBBY
// ============================================================
function renderLobby() {
    showScreen('lobby');
    const room = state.online.roomData;
    document.getElementById('lobbyRoomCode').innerText = state.online.roomCode;

    const hostConfig = document.getElementById('hostConfig');
    if (state.online.isHost) {
        hostConfig.classList.remove('hidden');
        document.querySelectorAll('#roundsGroup .chip-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.value,10) === room.config.voltas);
        });
        document.querySelectorAll('#timeGroup .chip-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.value,10) === room.config.tempo);
        });
        document.querySelectorAll('#hostConfig .segment-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === room.config.impostorMode);
        });
        document.querySelectorAll('#onlineThemeGrid .theme-toggle').forEach(b => {
            b.classList.toggle('active', (room.config.temas || []).includes(b.dataset.theme));
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

    const startBtn = document.getElementById('startGameOnlineBtn');
    const readyBtn = document.getElementById('readyBtn');
    const me = room.jogadores[state.online.uid];

    if (state.online.isHost) {
        startBtn.classList.remove('hidden');
        readyBtn.classList.add('hidden');
        const convidados = players.filter(p => p.uid !== state.online.uid);
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

['roundsGroup','timeGroup'].forEach(groupId => {
    document.querySelectorAll(`#${groupId} .chip-btn`).forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!state.online.isHost) return;
            const config = { ...state.online.roomData.config };
            if (groupId === 'roundsGroup') config.voltas = parseInt(btn.dataset.value, 10);
            else if (groupId === 'timeGroup') config.tempo = parseInt(btn.dataset.value, 10);
            await updateDoc(state.online.roomRef, { config });
        });
    });
});

document.querySelectorAll('#hostConfig .segment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.online.isHost) return;
        const config = { ...state.online.roomData.config, impostorMode: btn.dataset.mode };
        await updateDoc(state.online.roomRef, { config });
    });
});

document.querySelectorAll('#onlineThemeGrid .theme-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!state.online.isHost) return;
        const theme = btn.dataset.theme;
        const temas = [...(state.online.roomData.config.temas || [])];
        const idx = temas.indexOf(theme);
        if (idx >= 0) temas.splice(idx, 1);
        else temas.push(theme);
        if (temas.length === 0) { alert('Selecione pelo menos um tema!'); return; }
        await updateDoc(state.online.roomRef, { config: { ...state.online.roomData.config, temas } });
    });
});

document.getElementById('readyBtn').addEventListener('click', async () => {
    const me = state.online.roomData.jogadores[state.online.uid];
    if (!me) return;
    await updateDoc(state.online.roomRef, { [`jogadores.${state.online.uid}.pronto`]: !me.pronto });
});

document.getElementById('startGameOnlineBtn').addEventListener('click', async () => {
    if (!state.online.isHost) return;
    const players = getPlayersArray(state.online.roomData);
    if (players.length < MIN_PLAYERS) { alert(`Precisa de pelo menos ${MIN_PLAYERS} jogadores`); return; }
    showLoading('Iniciando partida...');
    try { await startOnlineRound(); } finally { hideLoading(); }
});

async function startOnlineRound() {
    if (!state.online.isHost) return;
    const room = state.online.roomData;
    const players = getPlayersArray(room);
    const config = room.config;
    const rodada = (room.rodadaAtual || 0) + 1;

    // Sorteia palavra
    const usedWords = new Set(room.jogo?.usadas || []);
    const wordObj = pickWordFrom(new Set(config.temas), usedWords);
    const impostorCount = Math.min(2, Math.max(1, Math.floor(players.length / 3)));
    const shuffled = shuffle(players.map(p => p.uid));
    const impostorIds = shuffled.slice(0, impostorCount);

    const infiltratedWords = {};
    if (config.impostorMode === 'infiltrated') {
        const picks = pickInfiltratedWords(wordObj, impostorCount);
        impostorIds.forEach((uid, i) => { infiltratedWords[uid] = picks[i]; });
    }

    // Ordem de escrita aleatória por rodada
    const ordemEscrita = shuffle(players.map(p => p.uid));

    // Estado inicial do jogo
    const palavrasIniciais = {};
    players.forEach(p => { palavrasIniciais[p.uid] = []; });

    // Atualiza jogadores com papel e palavra
    const jogadoresAtualizados = {};
    players.forEach(p => {
        const isImpostor = impostorIds.includes(p.uid);
        jogadoresAtualizados[p.uid] = {
            nome: p.nome,
            pronto: true,
            pontos: p.pontos || 0,
            papel: isImpostor ? 'impostor' : 'jogador',
            palavra: isImpostor
                ? (config.impostorMode === 'infiltrated' ? infiltratedWords[p.uid].word
                   : config.impostorMode === 'hint' ? `Dica: ${wordObj.hint}`
                   : 'IMPOSTOR')
                : wordObj.word,
            viuPapel: false,
            confirmouProximaRodada: false
        };
    });

    // Reseta estado do client
    state.online.lastPhaseKey = null;
    state.online.roleConfirmed = false;
    state.online.roleRevealed = false;
    state.online.myVote = null;
    state.online.voteSubmitted = false;
    state.online.confirmedContinue = false;
    state.online.revealedCardUid = null;
    state.online.lastPlayerOnTurn = null;

    await updateDoc(state.online.roomRef, {
        status: 'revelacao',
        rodadaAtual: rodada,
        jogadores: jogadoresAtualizados,
        jogo: {
            palavraReal: wordObj.word,
            dica: wordObj.hint,
            tema: wordObj.cat,
            impostorIds,
            impostorMode: config.impostorMode,
            infiltratedWords,
            usadas: [...usedWords],
            ordemEscrita,
            palavras: palavrasIniciais,
            votos: {},
            votacaoInicio: null,
            escritaInicio: null,
            jogadorDaVez: null,
            resultadoRodada: null
        }
    });
}

// ============================================================
// MODO ONLINE — TELA DE REVELAÇÃO
// ============================================================
function renderOnlineReveal() {
    showScreen('onlineReveal');
    const room = state.online.roomData;
    const me = room.jogadores[state.online.uid];
    if (!me) return;

    document.getElementById('onlineRevealTitle').innerText = me.nome;
    document.getElementById('onlineRevealSub').innerText = 'Toque para revelar';

    const cardSecret = document.getElementById('onlineCardSecret');
    cardSecret.classList.remove('flipped');
    const back = document.getElementById('onlineCardBack');
    back.classList.remove('is-impostor');
    const secretContent = document.getElementById('onlineSecretContent');
    secretContent.classList.remove('is-impostor-text');
    const secretLabel = document.getElementById('onlineSecretLabel');

    const oldHint = back.querySelector('.card-back-hint');
    if (oldHint) oldHint.remove();

    if (me.papel === 'impostor') {
        const mode = room.jogo?.impostorMode || 'blind';
        if (mode === 'infiltrated') {
            secretLabel.innerText = 'Sua palavra';
            secretContent.innerText = me.palavra;
        } else {
            back.classList.add('is-impostor');
            secretContent.classList.add('is-impostor-text');
            secretLabel.innerText = 'Você é';
            secretContent.innerText = 'IMPOSTOR';
            if (mode === 'hint') {
                const hintEl = document.createElement('p');
                hintEl.className = 'card-back-hint';
                hintEl.innerText = me.palavra;
                back.appendChild(hintEl);
            }
        }
    } else {
        secretLabel.innerText = 'Sua palavra';
        secretContent.innerText = me.palavra;
    }

    // Substitui card para evitar listeners duplicados
    const newCard = cardSecret.cloneNode(true);
    cardSecret.parentNode.replaceChild(newCard, cardSecret);
    newCard.addEventListener('click', () => {
        if (newCard.classList.contains('flipped')) return;
        newCard.classList.add('flipped');
        state.online.roleRevealed = true;
        document.getElementById('onlineRevealConfirmBtn').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    const confirmBtn = document.getElementById('onlineRevealConfirmBtn');
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

    if (me.viuPapel) {
        newConfirm.classList.add('hidden');
        document.getElementById('onlineWaitReveal').classList.remove('hidden');
        newCard.classList.add('flipped');
    } else {
        newConfirm.classList.toggle('hidden', !state.online.roleRevealed);
        document.getElementById('onlineWaitReveal').classList.add('hidden');
        newConfirm.addEventListener('click', async () => {
            newConfirm.classList.add('hidden');
            document.getElementById('onlineWaitReveal').classList.remove('hidden');
            await updateDoc(state.online.roomRef, { [`jogadores.${state.online.uid}.viuPapel`]: true });
        });
    }
    if (window.lucide) lucide.createIcons();
}

// ============================================================
// MODO ONLINE — TELA DE ESCRITA (por turnos, todas as rodadas)
// ============================================================
function renderOnlineWrite() {
    showScreen('onlineWrite');
    const room = state.online.roomData;
    const me = room.jogadores[state.online.uid];
    if (!me) return;
    const jogo = room.jogo || {};

    // Painéis de todas as rodadas
    renderWriteRounds(room);

    // Determina jogador da vez
    const ordem = jogo.ordemEscrita || [];
    const palavras = jogo.palavras || {};
    let jogadorDaVez = null;
    let rodadaDaVez = null;

    // Para cada rodada, verifica quem é o próximo a falar
    const totalRodadas = room.config.voltas || 1;
    const players = getPlayersArray(room);
    for (let r = 0; r < totalRodadas; r++) {
        for (const uid of ordem) {
            const words = palavras[uid] || [];
            if (!Array.isArray(words) || words.length <= r) {
                jogadorDaVez = uid;
                rodadaDaVez = r;
                break;
            }
        }
        if (jogadorDaVez) break;
    }

    // Atualiza barra flutuante
    updateWriteBar(room, me, jogadorDaVez, rodadaDaVez, players);
    if (window.lucide) lucide.createIcons();
}

function renderWriteRounds(room) {
    const jogo = room.jogo || {};
    const players = getPlayersArray(room);
    const ordem = jogo.ordemEscrita || [];
    const palavras = jogo.palavras || {};
    const totalRodadas = room.config.voltas || 1;
    const container = document.getElementById('onlineWriteRounds');
    container.innerHTML = '';

    for (let r = 0; r < totalRodadas; r++) {
        const bloco = document.createElement('div');
        bloco.className = 'write-round-block';
        bloco.innerHTML = `<h3 class="write-round-title">Rodada ${r + 1}</h3>`;
        const list = document.createElement('ol');
        list.className = 'write-round-list';

        ordem.forEach((uid, idx) => {
            const p = players.find(x => x.uid === uid);
            if (!p) return;
            const words = palavras[uid] || [];
            const word = Array.isArray(words) && words[r] ? words[r] : '';
            const li = document.createElement('li');
            li.className = 'write-round-item';
            if (word) li.classList.add('filled');
            li.innerHTML = `
                <span class="write-round-pos">${idx + 1}.</span>
                <span class="write-round-name">${p.nome}</span>
                <span class="write-round-word">${word ? escapeHtml(word) : '—'}</span>
            `;
            list.appendChild(li);
        });
        bloco.appendChild(list);
        container.appendChild(bloco);
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}

function updateWriteBar(room, me, jogadorDaVez, rodadaDaVez, players) {
    const bar = document.getElementById('onlineWriteBar');
    const info = document.getElementById('onlineWriteBarInfo');
    const inputWrap = document.getElementById('onlineWordInputWrap');
    const input = document.getElementById('onlineWordInput');
    const sendBtn = document.getElementById('onlineSendWordBtn');
    const timerEl = document.getElementById('onlineWriteTimer');
    const waitEl = document.getElementById('onlineWriteWait');

    // Todos já enviaram tudo?
    const totalRodadas = room.config.voltas || 1;
    const palavras = room.jogo?.palavras || {};
    const allDone = jogadorDaVez === null;

    if (allDone) {
        bar.classList.add('hidden');
        return;
    }

    bar.classList.remove('hidden');

    const jogador = players.find(p => p.uid === jogadorDaVez);
    const isMeuTurno = jogadorDaVez === state.online.uid;

    info.innerHTML = `<strong>Rodada ${rodadaDaVez + 1}</strong> · Vez de <strong>${jogador?.nome || '?'}</strong>`;

    if (isMeuTurno) {
        inputWrap.classList.remove('hidden');
        sendBtn.classList.remove('hidden');
        waitEl.classList.add('hidden');
        startWriteTimer(room, rodadaDaVez);

        // Ajusta placeholder
        input.placeholder = 'Sua palavra/dica...';
        // Reseta valor se trocou de rodada
        const key = `${jogadorDaVez}-${rodadaDaVez}`;
        if (state.online.lastPlayerOnTurn !== key) {
            input.value = '';
            state.online.lastPlayerOnTurn = key;
        }
    } else {
        inputWrap.classList.add('hidden');
        sendBtn.classList.add('hidden');
        waitEl.classList.remove('hidden');
        if (state.online.writeTimerInterval) {
            clearInterval(state.online.writeTimerInterval);
            state.online.writeTimerInterval = null;
        }
        timerEl.innerText = 'Aguardando...';
        timerEl.classList.remove('urgent');
    }
}

function startWriteTimer(room, rodadaDaVez) {
    if (state.online.writeTimerInterval) clearInterval(state.online.writeTimerInterval);
    const tempo = room.config.tempo || 30;
    const inicio = room.jogo?.escritaInicio || Date.now();
    const timerEl = document.getElementById('onlineWriteTimer');

    // Marca início no Firestore se ainda não marcou para essa rodada específica
    // (o host marca, mas fazemos aqui como fallback)
    if (!room.jogo?.escritaInicio) {
        updateDoc(state.online.roomRef, { 'jogo.escritaInicio': Date.now() }).catch(() => {});
    }

    const update = () => {
        const elapsed = Math.floor((Date.now() - inicio) / 1000);
        const restante = Math.max(0, tempo - elapsed);
        timerEl.innerText = `${restante}s`;
        timerEl.classList.toggle('urgent', restante <= 10);
        if (restante <= 0) {
            clearInterval(state.online.writeTimerInterval);
            state.online.writeTimerInterval = null;
            // Auto-envia vazio
            sendOnlineWord(true);
        }
    };
    update();
    state.online.writeTimerInterval = setInterval(update, 500);
}

async function sendOnlineWord(auto = false) {
    if (!state.online.roomData) return;
    const room = state.online.roomData;
    const jogo = room.jogo || {};
    const rodada = (room.rodadaAtual || 1) - 1; // índice 0-based

    const input = document.getElementById('onlineWordInput');
    const word = auto ? '...' : (input?.value.trim() || '');
    if (!word) { alert('Digite uma palavra!'); return; }

    const minhasPalavras = (jogo.palavras?.[state.online.uid] || []).slice();
    while (minhasPalavras.length < rodada) minhasPalavras.push('');
    minhasPalavras[rodada] = word;

    if (state.online.writeTimerInterval) {
        clearInterval(state.online.writeTimerInterval);
        state.online.writeTimerInterval = null;
    }
    if (input) input.value = '';

    await updateDoc(state.online.roomRef, {
        [`jogo.palavras.${state.online.uid}`]: minhasPalavras,
        'jogo.escritaInicio': Date.now()
    });
}

document.getElementById('onlineSendWordBtn').addEventListener('click', () => sendOnlineWord(false));
document.getElementById('onlineWordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendOnlineWord(false); }
});

// ============================================================
// MODO ONLINE — VOTAÇÃO
// ============================================================
function renderOnlineVote() {
    showScreen('onlineVote');
    const room = state.online.roomData;
    const me = room.jogadores[state.online.uid];
    if (!me) return;

    // Lista de palavras (rodada atual)
    const palavras = room.jogo?.palavras || {};
    const rodadaIdx = (room.rodadaAtual || 1) - 1;
    const wordList = document.getElementById('onlineWordList');
    wordList.innerHTML = '';
    const players = getPlayersArray(room);
    players.forEach(p => {
        const words = palavras[p.uid] || [];
        const word = Array.isArray(words) ? (words[rodadaIdx] || '—') : (words || '—');
        const div = document.createElement('div');
        div.className = 'word-item';
        div.innerHTML = `<span class="word-name">${p.nome}</span><span class="word-text">${escapeHtml(word)}</span>`;
        wordList.appendChild(div);
    });

    // Grid de votos
    const grid = document.getElementById('onlineVoteGrid');
    grid.innerHTML = '';
    const votos = room.jogo?.votos || {};
    const jaVotou = votos[state.online.uid] !== undefined;
    state.online.myVote = votos[state.online.uid] || null;

    players.forEach(p => {
        if (p.uid === state.online.uid) return;
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.innerText = p.nome;
        if (state.online.myVote === p.uid) btn.classList.add('selected');
        if (jaVotou) btn.disabled = true;
        btn.addEventListener('click', async () => {
            if (jaVotou) return;
            grid.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            grid.querySelectorAll('.vote-btn').forEach(b => b.disabled = true);
            document.getElementById('onlineVoteStatus').classList.remove('hidden');
            state.online.myVote = p.uid;
            await updateDoc(state.online.roomRef, { [`jogo.votos.${state.online.uid}`]: p.uid });
        });
        grid.appendChild(btn);
    });

    document.getElementById('onlineVoteStatus').classList.toggle('hidden', !jaVotou);
    startVoteTimer();
    if (window.lucide) lucide.createIcons();
}

function startVoteTimer() {
    if (state.online.voteTimerInterval) clearInterval(state.online.voteTimerInterval);
    const room = state.online.roomData;
    const tempo = room.config.tempo || 30;
    const inicio = room.jogo?.votacaoInicio || Date.now();
    const update = () => {
        const elapsed = Math.floor((Date.now() - inicio) / 1000);
        const restante = Math.max(0, tempo - elapsed);
        document.getElementById('onlineVoteTimer').innerText = `⏱️ ${restante}s`;
        if (restante <= 0) {
            clearInterval(state.online.voteTimerInterval);
            if (state.online.isHost) {
                const players = getPlayersArray(room);
                const votos = room.jogo?.votos || {};
                const votosCompletos = {};
                players.forEach(p => { votosCompletos[p.uid] = votos[p.uid] || 'skip'; });
                updateDoc(state.online.roomRef, { 'jogo.votos': votosCompletos });
            }
        }
    };
    update();
    state.online.voteTimerInterval = setInterval(update, 500);
}

// ============================================================
// MODO ONLINE — RESOLVER RODADA
// ============================================================
async function resolveOnlineRound() {
    if (!state.online.isHost) return;
    const room = state.online.roomData;
    const votos = room.jogo?.votos || {};
    const impostorIds = room.jogo?.impostorIds || [];
    const jogadores = room.jogadores || {};

    const contagem = {};
    Object.values(votos).forEach(v => {
        if (v === 'skip') return;
        contagem[v] = (contagem[v] || 0) + 1;
    });

    let maisVotado = null, max = 0, empate = false;
    Object.entries(contagem).forEach(([uid, c]) => {
        if (c > max) { max = c; maisVotado = uid; empate = false; }
        else if (c === max) empate = true;
    });
    if (empate) maisVotado = null;

    const acertou = maisVotado && impostorIds.includes(maisVotado);
    const jogadoresAtualizados = JSON.parse(JSON.stringify(jogadores));

    if (acertou) {
        Object.entries(jogadoresAtualizados).forEach(([uid, p]) => {
            if (!impostorIds.includes(uid)) p.pontos = (p.pontos || 0) + 1;
        });
    } else {
        impostorIds.forEach(uid => {
            if (jogadoresAtualizados[uid]) jogadoresAtualizados[uid].pontos = (jogadoresAtualizados[uid].pontos || 0) + 1;
        });
    }

    // Reset confirmações para próxima rodada
    Object.keys(jogadoresAtualizados).forEach(uid => {
        jogadoresAtualizados[uid].confirmouProximaRodada = false;
    });

    await updateDoc(state.online.roomRef, {
        status: 'resultado',
        jogadores: jogadoresAtualizados,
        'jogo.resultadoRodada': {
            maisVotado: maisVotado || null,
            acertou: !!acertou,
            empate
        }
    });
}

// ============================================================
// MODO ONLINE — RESULTADO
// ============================================================
function renderOnlineResult() {
    showScreen('onlineResult');
    const room = state.online.roomData;
    const jogo = room.jogo || {};
    const res = jogo.resultadoRodada || {};

    document.getElementById('onlineResultWord').innerText = jogo.palavraReal || '?';
    const impostorIds = jogo.impostorIds || [];
    const impostorLabel = impostorIds.length === 1 ? 'O impostor era' : 'Os impostores eram';
    document.getElementById('onlineResultImpostorLabel').innerText = impostorLabel;
    const impContainer = document.getElementById('onlineResultImpostors');
    impContainer.innerHTML = '';
    impostorIds.forEach(uid => {
        const p = room.jogadores[uid];
        if (!p) return;
        const chip = document.createElement('span');
        chip.className = 'result-impostor-chip';
        let label = p.nome;
        if (jogo.impostorMode === 'infiltrated' && jogo.infiltratedWords?.[uid]) {
            label += ` (${jogo.infiltratedWords[uid].word})`;
        } else if (jogo.impostorMode === 'hint' && jogo.dica) {
            label += ` (Dica: ${jogo.dica})`;
        }
        chip.innerText = label;
        impContainer.appendChild(chip);
    });

    // Voto da maioria
    const votos = jogo.votos || {};
    const contagem = {};
    Object.values(votos).forEach(v => { if (v !== 'skip') contagem[v] = (contagem[v] || 0) + 1; });
    let maisVotado = null, max = 0;
    Object.entries(contagem).forEach(([uid, c]) => { if (c > max) { max = c; maisVotado = uid; } });
    const maisVotadoNome = maisVotado && room.jogadores[maisVotado] ? room.jogadores[maisVotado].nome : 'Ninguém';

    // Texto principal
    const icon = document.getElementById('onlineResultIcon');
    const title = document.getElementById('onlineResultTitle');
    const sub = document.getElementById('onlineResultSub');

    document.getElementById('onlineResultVoteLabel').innerText = `Os jogadores escolheram ${maisVotadoNome}`;
    const impostorCheck = document.getElementById('onlineResultImpostorCheck');
    const wasImpostor = maisVotado && impostorIds.includes(maisVotado);
    impostorCheck.innerText = wasImpostor ? 'Ele era o impostor' : 'Ele não era o impostor';

    if (res.acertou) {
        icon.className = 'result-icon win';
        title.innerText = 'Vitória dos jogadores!';
        sub.innerText = 'Vocês acertaram o impostor 🎉';
        if (window.confetti) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else if (res.empate) {
        icon.className = 'result-icon';
        title.innerText = 'Empate!';
        sub.innerText = 'A votação não decidiu';
    } else {
        icon.className = 'result-icon';
        title.innerText = 'Vitória do impostor!';
        sub.innerText = 'Ele enganou a maioria 😈';
    }

    // Lista de palavras (todas as rodadas)
    const wordList = document.getElementById('onlineResultWords');
    wordList.innerHTML = '';
    const jogadores = getPlayersArray(room);
    const totalRodadas = room.config.voltas || 1;
    const palavras = jogo.palavras || {};

    for (let r = 0; r < totalRodadas; r++) {
        const bloco = document.createElement('div');
        bloco.className = 'write-round-block';
        bloco.innerHTML = `<h3 class="write-round-title">Rodada ${r + 1}</h3>`;
        const list = document.createElement('ol');
        list.className = 'write-round-list';
        (jogo.ordemEscrita || []).forEach((uid, idx) => {
            const p = jogadores.find(x => x.uid === uid);
            if (!p) return;
            const words = palavras[uid] || [];
            const word = Array.isArray(words) ? (words[r] || '') : '';
            const li = document.createElement('li');
            li.className = 'write-round-item' + (word ? ' filled' : '');
            li.innerHTML = `
                <span class="write-round-pos">${idx + 1}.</span>
                <span class="write-round-name">${p.nome}</span>
                <span class="write-round-word">${word ? escapeHtml(word) : '—'}</span>
            `;
            list.appendChild(li);
        });
        bloco.appendChild(list);
        wordList.appendChild(bloco);
    }

    // Botões de continuar
    const totalRodadasConf = room.config.voltas || 1;
    const rodadaAtual = room.rodadaAtual || 1;
    const acabou = rodadaAtual >= totalRodadasConf;

    const confirmBtn = document.getElementById('onlineResultConfirmBtn');
    const waitEl = document.getElementById('onlineWaitResult');
    const confirmCountEl = document.getElementById('onlineResultConfirmCount');

    const players = getPlayersArray(room);
    const confirmados = players.filter(p => p.confirmouProximaRodada).length;
    confirmCountEl.innerText = `${confirmados}/${players.length}`;

    if (state.online.confirmedContinue) {
        confirmBtn.classList.add('hidden');
        waitEl.classList.remove('hidden');
    } else {
        confirmBtn.classList.remove('hidden');
        waitEl.classList.add('hidden');
        confirmBtn.innerText = acabou ? 'Voltar ao menu' : 'Próxima rodada';
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', async () => {
            if (state.online.confirmedContinue) return;
            state.online.confirmedContinue = true;
            newBtn.disabled = true;
            newBtn.classList.add('hidden');
            waitEl.classList.remove('hidden');
            await updateDoc(state.online.roomRef, {
                [`jogadores.${state.online.uid}.confirmouProximaRodada`]: true
            });
        });
    }

    // Se todos confirmaram, host avança
    if (state.online.isHost) {
        maybeAdvanceFromResult(room);
    }

    if (window.lucide) lucide.createIcons();
}

async function maybeAdvanceFromResult(room) {
    const players = getPlayersArray(room);
    const confirmados = players.filter(p => p.confirmouProximaRodada).length;
    if (confirmados < players.length) return;

    const key = `result-${room.rodadaAtual}`;
    if (state.online.lastPhaseKey === key) return;
    state.online.lastPhaseKey = key;

    await new Promise(r => setTimeout(r, NEXT_ROUND_GRACE_MS));

    const fresh = await getDoc(state.online.roomRef);
    if (!fresh.exists()) return;
    const freshData = fresh.data();
    const freshPlayers = getPlayersArray(freshData);
    if (freshPlayers.filter(p => p.confirmouProximaRodada).length < freshPlayers.length) return;

    const totalRodadas = freshData.config.voltas || 1;
    const rodadaAtual = freshData.rodadaAtual || 1;

    if (rodadaAtual >= totalRodadas) {
        await updateDoc(state.online.roomRef, { status: 'fim' });
    } else {
        // Prepara próxima rodada
        const jogadoresReset = {};
        freshPlayers.forEach(p => {
            jogadoresReset[p.uid] = {
                nome: p.nome, pronto: true, pontos: p.pontos || 0,
                papel: null, palavra: null, viuPapel: false,
                confirmouProximaRodada: false
            };
        });
        state.online.lastPhaseKey = null;
        state.online.confirmedContinue = false;
        await updateDoc(state.online.roomRef, {
            status: 'revelacao',
            rodadaAtual: rodadaAtual + 1,
            jogadores: jogadoresReset,
            jogo: null
        });
        await startOnlineRound();
    }
}

// ============================================================
// MODO ONLINE — FIM DE JOGO
// ============================================================
function renderOnlineGameOver() {
    showScreen('onlineGameOver');
    const room = state.online.roomData;
    const players = getPlayersArray(room);
    players.sort((a, b) => (b.pontos || 0) - (a.pontos || 0));

    const reveal = document.getElementById('onlineFinalReveal');
    reveal.innerHTML = '';
    players.forEach((p, i) => {
        const line = document.createElement('div');
        line.className = 'result-line';
        line.innerHTML = `
            <span class="label">${i + 1}º ${p.nome}</span>
            <span class="value">${p.pontos || 0} pts</span>
        `;
        reveal.appendChild(line);
    });

    const actions = document.getElementById('onlineGameOverActions');
    const spectMsg = document.getElementById('onlineSpectatorMsg');
    if (state.online.isHost) {
        actions.classList.remove('hidden');
        spectMsg.classList.add('hidden');
    } else {
        actions.classList.add('hidden');
        spectMsg.classList.remove('hidden');
    }

    const rematch = document.getElementById('onlineRematchBtn');
    const newRematch = rematch.cloneNode(true);
    rematch.parentNode.replaceChild(newRematch, rematch);
    newRematch.addEventListener('click', async () => {
        showLoading('Preparando...');
        try {
            const jogadoresReset = {};
            players.forEach(p => {
                jogadoresReset[p.uid] = { nome: p.nome, pronto: false, pontos: 0 };
            });
            await updateDoc(state.online.roomRef, {
                status: 'lobby',
                rodadaAtual: 0,
                jogadores: jogadoresReset,
                jogo: null
            });
            state.online.lastPhaseKey = null;
        } finally { hideLoading(); }
    });

    const closeBtn = document.getElementById('onlineCloseRoomBtn');
    const newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);
    newClose.addEventListener('click', async () => {
        if (!confirm('Encerrar a sala para todos?')) return;
        showLoading('Encerrando...');
        try { await deleteDoc(state.online.roomRef); } catch (e) { console.error(e); }
        hideLoading();
        cleanupAndHome();
    });

    // Botão "Voltar ao menu" para não-host
    const backMenuBtn = document.getElementById('onlineSpectatorMenuBtn');
    if (backMenuBtn) {
        const newBtn = backMenuBtn.cloneNode(true);
        backMenuBtn.parentNode.replaceChild(newBtn, backMenuBtn);
        newBtn.addEventListener('click', () => {
            if (confirm('Sair da sala? Todos os outros voltarão ao menu.')) {
                cleanupAndHome();
            }
        });
    }

    if (window.confetti) confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    if (window.lucide) lucide.createIcons();
}

// ============================================================
// EXIT / AD
// ============================================================
document.querySelectorAll('[data-exit-btn]').forEach(btn => {
    btn.addEventListener('click', () => { exitModal.classList.remove('hidden'); });
});
document.getElementById('cancelExitBtn').addEventListener('click', () => { exitModal.classList.add('hidden'); });
document.getElementById('confirmExitBtn').addEventListener('click', () => {
    window.location.href = '../../index.html';
});

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

function openAdModal() { adOverlay.classList.add('open'); adModal.classList.add('open'); }
function closeAdModal() {
    adOverlay.classList.remove('open');
    adModal.classList.remove('open');
    adTabs.forEach(t => { const a = t.dataset.adTab === 'advertise'; t.classList.toggle('active', a); t.setAttribute('aria-selected', a ? 'true' : 'false'); });
    adPanels.forEach(p => p.classList.toggle('hidden', p.dataset.adPanel !== 'advertise'));
    adCopyBtn.textContent = 'Copiar'; adCopyBtn.classList.remove('copied'); adCopiedMsg.classList.remove('show');
    adCopyPixBtn.textContent = 'Copiar'; adCopyPixBtn.classList.remove('copied'); adCopiedPixMsg.classList.remove('show');
}
adBanners.forEach(btn => btn.addEventListener('click', openAdModal));
adModalClose.addEventListener('click', closeAdModal);
adOverlay.addEventListener('click', closeAdModal);
adTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        adTabs.forEach(t => { const a = t === tab; t.classList.toggle('active', a); t.setAttribute('aria-selected', a ? 'true' : 'false'); });
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
function flashCopied(btn, msgEl, label) {
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    msgEl.classList.add('show');
    setTimeout(() => { btn.textContent = label; btn.classList.remove('copied'); msgEl.classList.remove('show'); }, 2200);
}
adCopyBtn.addEventListener('click', async () => { if (await copyText(adEmailText.textContent.trim())) flashCopied(adCopyBtn, adCopiedMsg, 'Copiar'); });
adCopyPixBtn.addEventListener('click', async () => { if (await copyText(adPixText.textContent.trim())) flashCopied(adCopyPixBtn, adCopiedPixMsg, 'Copiar'); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { exitModal.classList.add('hidden'); nameModal.classList.add('hidden'); closeAdModal(); }
});

console.log('🎉 Impostor carregado!');