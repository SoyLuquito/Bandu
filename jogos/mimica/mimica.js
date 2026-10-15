// Bandu - Mímica (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // BANCO DE PALAVRAS
    const WORDS_DATABASE = {
        animais: [
            "Canguru", "Pinguim", "Cobra", "Tubarão", "Gorila", "Gato", "Galo", "Elefante", "Sapo", "Camaleão",
            "Girafa", "Jacaré", "Leão", "Tigre", "Urso", "Cachorro", "Coelho", "Preguiça", "Vaca", "Cavalo",
            "Ovelha", "Zebra", "Baleia", "Golfinho", "Polvo", "Caranguejo", "Águia", "Papagaio", "Pato", "Pavão",
            "Avestruz", "Morcego", "Lobo", "Raposa", "Hipopótamo", "Rinoceronte", "Tatu", "Tamanduá", "Capivara", "Esquilo",
            "Castor", "Gamba", "Hiena", "Suricato", "Llama", "Camelo", "Alce", "Panda", "Coala",
            "Flamingo", "Pelicano", "Tucano", "Pica-pau", "Coruja", "Abelha", "Formiga", "Gafanhoto", "Borboleta", "Joaninha",
            "Aranha", "Escorpião", "Centopeia", "Caracol", "Minhoca", "Água-viva", "Estrela-do-mar", "Foca", "Morsa", "Peixe-palhaço",
            "Arraia", "Lagarto", "Iguana", "Tartaruga", "Jabuti", "Piranha", "Galinha", "Porco", "Bode", "Peru",
            "Lêmure", "Chimpanzé", "Mico-leão-dourado", "Vagalume", "Ostra", "Lula", "Peixe-boi", "Orca", "Puma",
            "Onça-pintada", "Ocelote", "Gazela", "Dromedário", "Hamster"
        ],
        verbos: [
            "Tirar uma selfie", "Trocar pneu", "Escovar os dentes", "Pescar", "Tocar bateria", "Andar de skate",
            "Cozinhar", "Tricotar", "Dançar ballet", "Nadar", "Jogar boliche", "Pintar", "Tirar foto", "Varrer a casa", "Lavar louça", "Tocar violão", "Jogar videogame",
            "Dirigir", "Andar de bicicleta", "Cortar o cabelo", "Maquiar", "Regar as plantas", "Dormir",
            "Esperar", "Comer", "Tomar sorvete", "Assustar", "Rir",
            "Chorar", "Fazer flexão", "Pular corda", "Jogar basquete", "Fazer um gol", "Surfar",
            "Esquiar", "Patinar", "Escalar", "Saltar de paraquedas", "Fazer mágica",
            "Tocar piano", "Tocar flauta", "Cantar", "Sambar", "Dançar", "Lutar",
            "Ler", "Escrever", "Digitar",
            "Atender", "Procurar", "Montar barraca", "Acender fogueira", "Abraçar",
            "Soprar", "Abrir", "Comprar", "Pagar", "Empurrar",
            "Lavar", "Secar", "Barbear", "Passar roupa", "Fazer mala",
            "Provar", "Calçar", "Amarrar", "Espirrar",
            "Tossir", "Bocejar", "Sentir frio", "Sentir calor", "Abanar", "Nadar",
            "Fazer carinho", "Passear", "Tocar campainha",
            "Empinar pipa", "Jogar queimada", "Chutar"
        ],
        profissoes: [
            "Médico", "Bombeiro", "Policial", "Professor", "Astronauta", "Chef de Cozinha", "Dentista", "Veterinário",
            "Piloto", "Pintor", "Fotógrafo", "Jornalista", "Garçom", "Barbeiro", "Mecânico", "Pedreiro",
            "Eletricista", "Encanador", "Jardineiro", "Taxista", "Gari", "Cientista", "Detetive", "Juiz",
            "Advogado", "Ator", "Cantor", "Dançarino", "Mágico", "Palhaço", "Jogador de Futebol", "Atleta",
            "Arquiteto", "Engenheiro", "Carpinteiro", "Pescador", "Agricultor", "Padeiro", "Açougueiro", "Farmacêutico",
            "Enfermeiro", "Psicólogo", "Personal Trainer", "Instrutor de Yoga", "Guia Turístico", "Comissário de Bordo", "Marinheiro", "Soldado",
            "Segurança", "Porteiro", "Recepcionista", "Secretária", "Contador", "Programador", "Designer", "Youtuber",
            "Gamer", "DJ", "Costureira", "Modelo", "Esteticista", "Massagista", "Tatuador", "Arqueólogo",
            "Astrônomo", "Biólogo", "Químico", "Meteorologista", "Escultor", "Maquiador",
            "Diretor de Cinema", "Locutor", "Dublador", "Poeta", "Escritor", "Bibliotecário", "Tradutor",
            "Salva-vidas", "Adestrador", "Zelador", "Entregador", "Carteiro", "Motorista de Ônibus", "Maquinista", "Mergulhador",
            "Vendedor", "Caixa de Banco", "Corretor de Imóveis", "Empresário", "Político", "Padre"
        ],
        objetos: [
            "Celular", "Televisão", "Geladeira", "Micro-ondas", "Liquidificador", "Ventilador", "Ar-condicionado", "Computador",
            "Notebook", "Tablet", "Relógio", "Óculos", "Guarda-chuva", "Mala", "Mochila", "Cadeira",
            "Mesa", "Cama", "Travesseiro", "Espelho", "Escova de Dentes", "Pente", "Secador de Cabelo", "Sabonete",
            "Toalha", "Vassoura", "Rodo", "Balde", "Aspirador de Pó", "Ferro de Passar", "Máquina de Lavar", "Tesoura",
            "Caneta", "Lápis", "Caderno", "Livro", "Luminária", "Lanterna", "Vela", "Fósforo",
            "Chave", "Cadeado", "Carteira", "Moeda", "Garrafa", "Copo", "Prato", "Talher",
            "Panela", "Frigideira", "Abridor de Lata", "Sacola", "Caixa", "Martelo", "Chave de Fenda", "Alicate",
            "Serrote", "Trena", "Pneu", "Bicicleta", "Capacete", "Bola de Futebol", "Raquete de Tênis", "Skate",
            "Prancha de Surf", "Violão", "Guitarra", "Piano", "Tambor", "Microfone", "Fone de Ouvido", "Caixa de Som",
            "Máquina Fotográfica", "Binóculo", "Telescópio", "Batom", "Esmalte", "Perfume", "Anel", "Colar",
            "Pulseira", "Sapatos", "Tênis", "Bota", "Chinelo", "Meia", "Chapéu", "Boné",
            "Luvas", "Cachecol", "Casaco", "Guardanapo", "Bandeja", "Bule", "Xícara", "Saca-rolhas",
            "Termômetro", "Seringa", "Curativo", "Muleta", "Cadeira de Rodas", "Chocalho", "Chupeta", "Mamadeira"
        ],
        comidas: [
            "Pizza", "Hambúrguer", "Batata Frita", "Cachorro-quente", "Churrasco", "Espaguete", "Lasanha", "Sushi",
            "Temaki", "Taco", "Nachos", "Pastel", "Coxinha", "Pão de Queijo", "Empada", "Kibe",
            "Brigadeiro", "Pudim", "Sorvete", "Açaí", "Pipoca", "Bolo de Chocolate", "Torta de Limão", "Panqueca",
            "Waffle", "Croissant", "Donut", "Churros", "Ovo Frito", "Omelete", "Arroz e Feijão",
            "Feijoada", "Strogonoff", "Sopa", "Salada", "Frango Assado", "Peixe Frito", "Camarão", "Caranguejo",
            "Lagosta", "Ostra", "Maçã", "Banana", "Laranja", "Morango", "Uva", "Melancia",
            "Melão", "Abacaxi", "Manga", "Maracujá", "Limão", "Pêssego", "Coco", "Mexerica",
            "Kiwi", "Cereja", "Azeitona", "Queijo", "Requeijão", "Iogurte", "Chocolate", "Goma de Mascar",
            "Pirulito", "Bala", "Biscoito", "Torrada", "Pão", "Sanduíche", "Tapioca", "Crepe",
            "Salgadinho", "Castanha", "Amendoim", "Milho", "Pamonha", "Canjica", "Cocada", "Pé de Moleque",
            "Goiabada", "Doce de Leite", "Gelatina", "Salada de Frutas", "Suco de Laranja", "Café", "Chá", "Refrigerante",
            "Milk-shake", "Vinho", "Cerveja", "Água de Coco", "Limonada"
        ],
        filmes: [
            "Homem-Aranha", "Batman", "Superman", "Homem de Ferro", "Vingadores", "Harry Potter", "Senhor dos Anéis", "Star Wars",
            "Jurassic Park", "Titanic", "Avatar", "Matrix", "De Volta para o Futuro", "Tubarão", "O Rei Leão", "Toy Story",
            "Shrek", "Procurando Nemo", "Os Incríveis", "Frozen", "Moana", "Barbie", "O Poderoso Chefão", "Forrest Gump",
            "Gladiador", "Piratas do Caribe", "Transformers", "Velozes e Furiosos", "Missão Impossível", "Indiana Jones", "Crepúsculo", "Jogos Vorazes",
            "Stranger Things", "Round 6", "Chaves", "Game of Thrones", "Breaking Bad", "La Casa de Papel", "The Walking Dead", "Friends",
            "The Office", "Os Simpsons", "Bob Esponja", "Pokemon", "Dragon Ball Z", "Naruto", "Cavaleiros do Zodíaco", "Scooby-Doo",
            "Tom e Jerry", "Pantera Negra", "Coringa", "Esquadrão Suicida", "Thor", "Capitão América", "Doutor Estranho", "Guardiões da Galáxia",
            "Detona Ralph", "Monstros S.A.", "Carros", "Divertida Mente", "Viva - A Vida é uma Festa", "Encanto", "Kung Fu Panda", "Madagascar",
            "Meu Malvado Favorito", "Minions", "A Era do Gelo", "Aladdin", "A Bela e a Fera", "Cinderela", "A Pequena Sereia",
            "Mulan", "Pocahontas", "Hercules", "Tarzan", "Up - Altas Aventuras", "WALL-E", "Ratatouille", "Coraline", "O Estranho Mundo de Jack",
            "A Família Addams", "Ghostbusters", "Meninas Malvadas", "As Branquelas", "Se Beber, Não Case!", "O Máskara", "Debi & Lóide",
            "Todo Mundo em Pânico", "Pânico", "A Hora do Pesadelo", "Sexta-Feira 13", "O Iluminado", "It - A Coisa", "Atividade Paranormal", "Invocação do Mal"
        ]
    };

    // ÁUDIO DE ALARME
    const alarmSound = new Audio('../../sons/ringtone1.mp3');
    alarmSound.preload = 'auto';

    // ESTADO DO JOGO
    const state = {
        mode: 'individual',
        players: [],
        teamA: { name: 'Equipe Azul', players: [], score: 0 },
        teamB: { name: 'Equipe Vermelha', players: [], score: 0 },
        targetScore: 30,
        timeLimit: 45,
        selectedTheme: 'geral',
        
        usedWords: new Set(),
        currentWordChoices: [],
        selectedWord: null,
        actorIndex: { individual: 0, teamA: 0, teamB: 0 },
        currentTeamTurn: 'A',
        currentActor: null,
        
        timerId: null,
        timeLeft: 0,
        
        isTransitioning: false
    };

    // DOM
    const screens = {
        config: document.getElementById('configScreen'),
        reveal: document.getElementById('revealScreen'),
        action: document.getElementById('actionScreen'),
        guesser: document.getElementById('guesserScreen'),
        winner: document.getElementById('winnerScreen')
    };

    const inputs = {
        player: document.getElementById('playerInput'),
        teamA: document.getElementById('teamAInput'),
        teamB: document.getElementById('teamBInput')
    };

    const lists = {
        player: document.getElementById('playerList'),
        teamA: document.getElementById('teamAList'),
        teamB: document.getElementById('teamBList')
    };

    const liveScoreBtn = document.getElementById('liveScoreBtn');
    const scoreModal = document.getElementById('scoreModal');
    const transitionOverlay = document.getElementById('transitionOverlay');
    const transitionName = document.getElementById('transitionName');
    const transitionSub = document.getElementById('transitionSub');

    // NAVEGAÇÃO
    function showScreen(screenKey) {
        Object.keys(screens).forEach(key => {
            if (key === screenKey) {
                screens[key].classList.remove('hidden');
            } else {
                screens[key].classList.add('hidden');
            }
        });

        if (['reveal', 'action', 'guesser'].includes(screenKey)) {
            liveScoreBtn.classList.remove('hidden');
        } else {
            liveScoreBtn.classList.add('hidden');
        }
    }

    // ====== OVERLAY DE TRANSIÇÃO DE TURNO ======
    function showTransition(actorName, subMessage, callback) {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        transitionName.innerText = actorName;
        transitionSub.innerText = subMessage || 'Prepare-se!';
        transitionOverlay.classList.remove('hidden');
        void transitionOverlay.offsetWidth;
        transitionOverlay.classList.add('visible');

        setTimeout(() => {
            transitionOverlay.classList.remove('visible');
            setTimeout(() => {
                transitionOverlay.classList.add('hidden');
                state.isTransitioning = false;
                if (callback) callback();
            }, 350);
        }, 1500);
    }

    // ====== CÁLCULO DO PRÓXIMO ATOR (SEM AVANÇAR ÍNDICE) ======
    function peekNextActor() {
        if (state.mode === 'individual') {
            const idx = state.actorIndex.individual;
            return state.players[idx].name;
        } else {
            const isTeamA = state.currentTeamTurn === 'A';
            const currentTeam = isTeamA ? state.teamA : state.teamB;
            const idxKey = isTeamA ? 'teamA' : 'teamB';
            return currentTeam.players[state.actorIndex[idxKey]];
        }
    }

    // MODO DE JOGO
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.mode = btn.dataset.mode;
            if (state.mode === 'individual') {
                document.getElementById('individualSetup').classList.remove('hidden');
                document.getElementById('teamSetup').classList.add('hidden');
            } else {
                document.getElementById('individualSetup').classList.add('hidden');
                document.getElementById('teamSetup').classList.remove('hidden');
            }
        });
    });

    // CHIPS
    function setupChipGroup(groupId, stateKey) {
        const group = document.getElementById(groupId);
        group.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[stateKey] = parseInt(btn.dataset.value, 10);
            });
        });
    }
    setupChipGroup('scoreLimitGroup', 'targetScore');
    setupChipGroup('timeLimitGroup', 'timeLimit');

    // JOGADORES
    function addPlayerName(inputEl, targetArray, renderFn) {
        const val = inputEl.value.trim();
        if (val && !targetArray.includes(val)) {
            targetArray.push(val);
            inputEl.value = '';
            renderFn();
        }
        // Mantém o foco (e o teclado) no input após adicionar
        inputEl.focus();
    }

    function removePlayerName(index, targetArray, renderFn) {
        targetArray.splice(index, 1);
        renderFn();
    }

    function renderTags(container, array, removeCallback) {
        container.innerHTML = '';
        array.forEach((name, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `
                <span>${name}</span>
                <button type="button" aria-label="Remover">&times;</button>
            `;
            li.querySelector('button').addEventListener('click', () => removeCallback(i));
            container.appendChild(li);
        });
    }

    function refreshAllLists() {
        renderTags(lists.player, state.players, (i) => removePlayerName(i, state.players, refreshAllLists));
        renderTags(lists.teamA, state.teamA.players, (i) => removePlayerName(i, state.teamA.players, refreshAllLists));
        renderTags(lists.teamB, state.teamB.players, (i) => removePlayerName(i, state.teamB.players, refreshAllLists));
    }

    // ====== BOTÕES DE ADICIONAR (mantendo o teclado aberto no mobile) ======
    // Impede que o botão tire o foco do input ANTES do clique ser processado.
    // No mobile isso evita que o teclado feche.
    ['addPlayerBtn', 'addTeamABtn', 'addTeamBBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        // No desktop e alguns Androids
        btn.addEventListener('mousedown', (e) => e.preventDefault());

        // No iOS Safari / Chrome iOS — touchstart previne o blur
        btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

        // Como prevenimos o touchstart, disparamos o click manualmente no touchend
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.click();
        });
    });

    document.getElementById('addPlayerBtn').addEventListener('click', () => {
        addPlayerName(inputs.player, state.players, refreshAllLists);
    });

    document.getElementById('addTeamABtn').addEventListener('click', () => {
        addPlayerName(inputs.teamA, state.teamA.players, refreshAllLists);
    });

    document.getElementById('addTeamBBtn').addEventListener('click', () => {
        addPlayerName(inputs.teamB, state.teamB.players, refreshAllLists);
    });

    // ====== ENTER TAMBÉM ADICIONA (bônus) ======
    inputs.player.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlayerName(inputs.player, state.players, refreshAllLists);
        }
    });

    inputs.teamA.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlayerName(inputs.teamA, state.teamA.players, refreshAllLists);
        }
    });

    inputs.teamB.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlayerName(inputs.teamB, state.teamB.players, refreshAllLists);
        }
    });

    // EMBARALHAR EQUIPES
    document.getElementById('randomizeTeamsBtn').addEventListener('click', () => {
        const all = [...state.teamA.players, ...state.teamB.players];
        if (all.length < 2) {
            alert('Adicione pelo menos 2 jogadores para embaralhar!');
            return;
        }
        
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }

        const isOdd = all.length % 2 !== 0;
        const extraToTeamA = isOdd ? Math.random() < 0.5 : false;
        const mid = Math.floor(all.length / 2) + (extraToTeamA ? 1 : 0);
        
        state.teamA.players = all.slice(0, mid);
        state.teamB.players = all.slice(mid);

        refreshAllLists();
    });

    // INICIAR JOGO
    document.getElementById('startGameBtn').addEventListener('click', () => {
        state.selectedTheme = document.getElementById('themeSelect').value;

        if (state.mode === 'individual') {
            if (state.players.length < 2) {
                alert('Adicione pelo menos 2 jogadores!');
                return;
            }
            state.players = state.players.map(p => typeof p === 'string' ? { name: p, score: 0 } : p);
        } else {
            if (state.teamA.players.length === 0 || state.teamB.players.length === 0) {
                alert('Ambas as equipes precisam de pelo menos 1 jogador!');
                return;
            }
            state.teamA.score = 0;
            state.teamB.score = 0;
        }

        state.usedWords.clear();
        state.actorIndex = { individual: 0, teamA: 0, teamB: 0 };
        state.currentTeamTurn = 'A';

        nextTurn();
    });

    // ====== PALAVRAS ======
    function getWordPool() {
        if (state.selectedTheme === 'geral') {
            const categories = Object.keys(WORDS_DATABASE);
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            return { pool: WORDS_DATABASE[randomCat], cat: randomCat.toUpperCase() };
        }
        return { 
            pool: WORDS_DATABASE[state.selectedTheme] || [], 
            cat: state.selectedTheme.toUpperCase() 
        };
    }

    function pickSingleWord() {
        const { pool, cat } = getWordPool();
        const available = pool.filter(w => !state.usedWords.has(w));
        
        if (available.length === 0) {
            state.usedWords.clear();
            const w = pool[Math.floor(Math.random() * pool.length)];
            state.usedWords.add(w);
            return { word: w, cat };
        }

        const chosen = available[Math.floor(Math.random() * available.length)];
        state.usedWords.add(chosen);
        return { word: chosen, cat };
    }

    function pickTwoDistinctWords() {
        const first = pickSingleWord();
        let second = pickSingleWord();
        let guard = 0;
        while (second.word === first.word && guard < 20) {
            second = pickSingleWord();
            guard++;
        }
        return [first, second];
    }

    // ====== RENDERIZA TELA DE REVELAÇÃO (avança o índice) ======
    function renderRevealScreen() {
        const badgeElem = document.getElementById('roundBadge');
        const wordsBlock = document.getElementById('wordsBlock');
        const revealBtn = document.getElementById('revealWordsBtn');
        const choicesEl = document.getElementById('wordChoices');
        const startBtn = document.getElementById('startTimerBtn');

        badgeElem.classList.remove('badge-team-a', 'badge-team-b');

        if (state.mode === 'individual') {
            const actorObj = state.players[state.actorIndex.individual];
            state.currentActor = actorObj.name;
            
            badgeElem.innerText = 'Vez de...';
            document.getElementById('turnActorName').innerText = state.currentActor;
            document.getElementById('turnTeamSub').innerText = 'Passe o celular para ele(a)';

            // Avança o índice para o PRÓXIMO turno
            state.actorIndex.individual = (state.actorIndex.individual + 1) % state.players.length;
        } else {
            const isTeamA = state.currentTeamTurn === 'A';
            const currentTeam = isTeamA ? state.teamA : state.teamB;
            const idxKey = isTeamA ? 'teamA' : 'teamB';
            
            const actorName = currentTeam.players[state.actorIndex[idxKey]];
            state.currentActor = actorName;

            badgeElem.innerText = isTeamA ? 'Equipe Azul' : 'Equipe Vermelha';
            badgeElem.classList.add(isTeamA ? 'badge-team-a' : 'badge-team-b');

            document.getElementById('turnActorName').innerText = actorName;
            document.getElementById('turnTeamSub').innerText = `Mímica para ${currentTeam.name}`;

            // Avança o índice dentro da equipe e alterna a equipe
            state.actorIndex[idxKey] = (state.actorIndex[idxKey] + 1) % currentTeam.players.length;
            state.currentTeamTurn = isTeamA ? 'B' : 'A';
        }

        wordsBlock.classList.add('hidden');
        revealBtn.classList.remove('hidden');

        choicesEl.innerHTML = '';
        state.currentWordChoices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'word-choice';
            btn.dataset.index = idx;
            btn.innerHTML = `
                <span class="word-choice-category">${choice.cat}</span>
                <span class="word-choice-text">${choice.word}</span>
            `;
            btn.addEventListener('click', () => {
                choicesEl.querySelectorAll('.word-choice').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.selectedWord = choice;
                startBtn.classList.remove('hidden');
            });
            choicesEl.appendChild(btn);
        });

        startBtn.classList.add('hidden');
        state.selectedWord = null;
    }

    // ====== TURNO ======
    function nextTurn() {
        state.currentWordChoices = pickTwoDistinctWords();
        state.selectedWord = null;
        renderRevealScreen();
        showScreen('reveal');
    }

    // ====== FUNÇÃO AUXILIAR: ir para o próximo turno com transição ======
    function goToNextTurn() {
        const nextName = peekNextActor();
        showTransition(nextName, 'Prepare-se!', () => {
            nextTurn();
        });
    }

    // ====== BOTÃO REVELAR PALAVRAS ======
    document.getElementById('revealWordsBtn').addEventListener('click', () => {
        const wordsBlock = document.getElementById('wordsBlock');
        const revealBtn = document.getElementById('revealWordsBtn');
        wordsBlock.classList.remove('hidden');
        revealBtn.classList.add('hidden');
        if (window.lucide) lucide.createIcons();
    });

    // ====== PULAR VEZ ======
    document.getElementById('skipTurnBtn').addEventListener('click', () => {
        clearInterval(state.timerId);
        goToNextTurn();
    });

    // ====== CRONÔMETRO ======
    document.getElementById('startTimerBtn').addEventListener('click', () => {
        if (!state.selectedWord) return;

        showScreen('action');
        document.getElementById('actingInfo').innerHTML = `Mímica: <strong>${state.currentActor}</strong>`;
        
        document.getElementById('successBtn').classList.remove('hidden');
        document.getElementById('failBtn').classList.add('hidden');

        state.timeLeft = state.timeLimit;
        updateTimerDisplay();

        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            state.timeLeft--;
            updateTimerDisplay();

            if (state.timeLeft <= 0) {
                clearInterval(state.timerId);
                timeExpired();
            }
        }, 1000);
    });

    function updateTimerDisplay() {
        const timerEl = document.getElementById('timerDisplay');
        timerEl.innerText = state.timeLeft < 10 ? `0${state.timeLeft}` : state.timeLeft;
        if (state.timeLeft <= 10) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    }

    function playAlarmSound() {
        try {
            alarmSound.currentTime = 0;
            const playPromise = alarmSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('Não foi possível tocar o áudio de alarme:', err);
                });
            }
        } catch (e) {
            console.warn('Erro ao tocar áudio:', e);
        }
    }

    function timeExpired() {
        playAlarmSound();
        document.getElementById('failBtn').classList.remove('hidden');
    }

    document.getElementById('failBtn').addEventListener('click', () => {
        clearInterval(state.timerId);
        goToNextTurn();
    });

    document.getElementById('successBtn').addEventListener('click', () => {
        clearInterval(state.timerId);

        if (state.mode === 'team') {
            const winningTeam = state.currentTeamTurn === 'B' ? state.teamA : state.teamB;
            winningTeam.score += 3;

            if (winningTeam.score >= state.targetScore) {
                triggerVictory(winningTeam.name);
            } else {
                goToNextTurn();
            }
        } else {
            showGuesserSelection();
        }
    });

    function showGuesserSelection() {
        showScreen('guesser');
        const grid = document.getElementById('guesserList');
        grid.innerHTML = '';

        state.players.forEach(p => {
            if (p.name !== state.currentActor) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.innerText = p.name;
                btn.addEventListener('click', () => {
                    p.score += 3;
                    const actorObj = state.players.find(item => item.name === state.currentActor);
                    if (actorObj) actorObj.score += 2;

                    const winner = state.players.find(item => item.score >= state.targetScore);
                    if (winner) {
                        triggerVictory(winner.name);
                    } else {
                        goToNextTurn();
                    }
                });
                grid.appendChild(btn);
            }
        });
    }

    // ====== PLACAR AO VIVO ======
    liveScoreBtn.addEventListener('click', () => {
        const content = document.getElementById('liveScoreContent');
        content.innerHTML = '';

        const nextUpName = peekNextActor();

        if (state.mode === 'individual') {
            const sorted = [...state.players].sort((a, b) => b.score - a.score);
            sorted.forEach(p => {
                const row = document.createElement('div');
                const isNext = p.name === nextUpName;
                row.className = 'score-row' + (isNext ? ' next-up' : '');
                row.innerHTML = `
                    <span>${p.name}${isNext ? ' <span class="next-badge">▶ Próximo</span>' : ''}</span>
                    <span>${p.score} pts</span>
                `;
                content.appendChild(row);
            });
        } else {
            const nextTeamIsA = state.currentTeamTurn === 'A';
            const nextTeamName = nextTeamIsA ? state.teamA.name : state.teamB.name;

            content.innerHTML = `
                <div class="score-row score-team-a">
                    <span>${state.teamA.name}${nextTeamIsA ? ' <span class="next-badge">▶ Próximo</span>' : ''}</span>
                    <span>${state.teamA.score} pts</span>
                </div>
                <div class="score-row score-team-b">
                    <span>${state.teamB.name}${!nextTeamIsA ? ' <span class="next-badge">▶ Próximo</span>' : ''}</span>
                    <span>${state.teamB.score} pts</span>
                </div>
                <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:2px dashed rgba(0,0,0,0.1); text-align:center; font-size:0.85rem; color:var(--texto-suave); font-weight:600;">
                    ${nextTeamName} → <strong>${nextUpName}</strong>
                </div>
            `;
        }

        scoreModal.classList.remove('hidden');
    });

    document.getElementById('closeScoreModalBtn').addEventListener('click', () => {
        scoreModal.classList.add('hidden');
    });

    // ====== VITÓRIA ======
    function triggerVictory(winnerTitle) {
        showScreen('winner');
        document.getElementById('winnerName').innerText = winnerTitle;

        const board = document.getElementById('finalScoreboard');
        board.innerHTML = '';

        if (state.mode === 'individual') {
            const sorted = [...state.players].sort((a, b) => b.score - a.score);
            sorted.forEach(p => {
                const row = document.createElement('div');
                row.className = 'score-row';
                row.innerHTML = `<span>${p.name}</span><span>${p.score} pts</span>`;
                board.appendChild(row);
            });
        } else {
            board.innerHTML = `
                <div class="score-row score-team-a"><span>${state.teamA.name}</span><span>${state.teamA.score} pts</span></div>
                <div class="score-row score-team-b"><span>${state.teamB.name}</span><span>${state.teamB.score} pts</span></div>
            `;
        }

        if (window.confetti) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    }

    document.getElementById('restartGameBtn').addEventListener('click', () => showScreen('config'));
    document.getElementById('returnRallyBtn').addEventListener('click', () => window.location.href = '../../index.html');

    // ====== SAIR ======
    const exitBtn = document.getElementById('exitBtn');
    const exitModal = document.getElementById('exitModal');

    exitBtn.addEventListener('click', () => exitModal.classList.remove('hidden'));
    document.getElementById('cancelExitBtn').addEventListener('click', () => exitModal.classList.add('hidden'));
    document.getElementById('confirmExitBtn').addEventListener('click', () => {
        clearInterval(state.timerId);
        window.location.href = '../../index.html';
    });
});