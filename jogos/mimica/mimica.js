// Rally - Mímica (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // BANCO DE PALAVRAS EXTENSO (100+ POR CATEGORIA)
    const WORDS_DATABASE = {
        animais: [
            "Canguru", "Pinguim", "Cobra", "Tubarão", "Gorila", "Gato", "Galo", "Elefante", "Sapo", "Camaleão",
            "Girafa", "Jacaré", "Leão", "Tigre", "Urso", "Cachorro", "Coelho", "Preguiça", "Vaca", "Cavalo",
            "Ovelha", "Zebra", "Baleia", "Golfinho", "Polvo", "Caranguejo", "Águia", "Papagaio", "Pato", "Pavão",
            "Avestruz", "Morcego", "Lobo", "Raposa", "Hipopótamo", "Rinoceronte", "Tatu", "Tamanduá", "Capivara", "Esquilo",
            "Castor", "Gamba", "Hiena", "Suricato", "Llama", "Camelo", "Búfalo", "Alce", "Panda", "Coala",
            "Flamingo", "Pelicano", "Tucano", "Pica-pau", "Coruja", "Abelha", "Formiga", "Garfanho", "Borboleta", "Joaninha",
            "Aranha", "Escorpião", "Centopeia", "Caracol", "Minhoca", "Água-viva", "Estrela-do-mar", "Foca", "Morsa", "Peixe-palhaço",
            "Arraia", "Lagarto", "Iguana", "Tartaruga", "Jabuti", "Piranha", "Galinha", "Porco", "Bode", "Peru",
            "Lêmure", "Chimpanzé", "Mico-leão-dourado", "Bicho-da-seda", "Vagalume", "Ostras", "Lula", "Peixe-boi", "Orca", "Puma",
            "Jaguaretê", "Ocelote", "Gazela", "Impala", "Gnu", "Dromedário", "Bisão", "Hamster", "Porquinho-da-índia", "Furão"
        ],
        verbos: [
            "Tirar uma selfie", "Trocar pneu furado", "Escovar os dentes", "Pescar um peixe", "Tocar bateria", "Andar de skate",
            "Cozinhar panquecas", "Fazer tricô", "Dançar ballet", "Nadar no mar", "Jogar boliche", "Pintar uma parede",
            "Correr da chuva", "Tirar foto", "Varrer a casa", "Lavar louça", "Tocando violão", "Jogar videogame",
            "Dirigir um carro", "Andar de bicicleta", "Cortar o cabelo", "Fazer maquiagem", "Regar as plantas", "Dormir roncando",
            "Acordar atrasado", "Esperar o ônibus", "Comer espaguete", "Tomar sorvete", "Assustar alguém", "Rir até chorar",
            "Chorar assistindo filme", "Fazer flexão", "Pular corda", "Jogar basquete", "Fazer um gol", "Surfar uma onda",
            "Esquiar na neve", "Patinar no gelo", "Andar de patins", "Escalar montanha", "Saltar de paraquedas", "Fazer mágica",
            "Tocar piano", "Tocar flauta", "Cantar no chuveiro", "Dançar samba", "Dançar hip hop", "Lutar boxe",
            "Fazer karatê", "Brincar de ioiô", "Montar quebra-cabeça", "Ler livro", "Escrever carta", "Digitar rápido",
            "Atender telefone", "Procurar chave perdida", "Montar barraca", "Acender fogueira", "Abraçar amigo", "Dar aperto de mão",
            "Soprar vela", "Abrir presente", "Fazer compras", "Pagar conta", "Empurrar carro", "Tirar mofo",
            "Lavar o carro", "Secar o cabelo", "Barbear a barba", "Passar roupa", "Fazer mala", "Apertar cinto",
            "Provar roupa", "Calçar sapato", "Amarrar cadarço", "Procurar sinal de celular", "Tirar cisco do olho", "Espirrar",
            "Tossir", "Bocejar", "Ficar com frio", "Sentir muito calor", "Abanar-se", "Nadar de costas",
            "Fazer carinho no gato", "Passear com cachorro", "Dar banho no pet", "Caçar mosca", "Armar ratos", "Tocar campainha",
            "Empinar pipa", "Brincar de bambolê", "Jogar peão", "Jogar queimada", "Chutar bola", "Cuidar de bebê"
        ],
        profissoes: [
            "Médico", "Bombeiro", "Policial", "Professor", "Astronauta", "Chef de Cozinha", "Dentista", "Veterinário",
            "Piloto de Avião", "Pintor", "Fotógrafo", "Jornalista", "Garçom", "Barbeiro", "Mecânico", "Pedreiro",
            "Eletricista", "Encanador", "Jardineiro", "Motorista de Táxi", "Gari", "Cientista", "Detetive", "Juiz",
            "Advogado", "Ator", "Cantor", "Dançarino", "Mágico", "Palhaço", "Jogador de Futebol", "Atleta",
            "Arquiteto", "Engenheiro", "Carpinteiro", "Pescador", "Agricultor", "Padeiro", "Açougueiro", "Farmacêutico",
            "Enfermeiro", "Psicólogo", "Personal Trainer", "Instrutor de Yoga", "Guia Turístico", "Comissário de Bordo", "Marinheiro", "Soldado",
            "Segurança", "Porteiro", "Recepcionista", "Secretária", "Contador", "Programador", "Designer", "Youtuber",
            "Gamer Profissional", "DJ", "Costureira", "Modelo", "Esteticista", "Massagista", "Tatuador", "Arqueólogo",
            "Astrônomo", "Biólogo", "Químico", "Geólogo", "Meteorologista", "Escultor", "Ilustrador", "Maquiador",
            "Cinegrafista", "Diretor de Cinema", "Locutor de Rádio", "Dublador", "Poeta", "Escritor", "Bibliotecário", "Tradutor",
            "Salva-vidas", "Treinador de Cães", "Zelador", "Entregador", "Carteiro", "Motorista de Ônibus", "Maquinista", "Mergulhador",
            "Sismólogo", "Taxista", "Vendedor", "Caixa de Banco", "Corretor de Imóveis", "Empresário", "Político", "Padre"
        ],
        objetos: [
            "Celular", "Televisão", "Geladeira", "Micro-ondas", "Liquidificador", "Ventilador", "Ar-condicionado", "Computador",
            "Notebook", "Tablet", "Relógio", "Óculos", "Guarda-chuva", "Mala de Viagem", "Mochila", "Cadeira",
            "Mesa", "Cama", "Travesseiro", "Espelho", "Escova de Dentes", "Pente", "Secador de Cabelo", "Sabonete",
            "Toalha", "Vassoura", "Rodo", "Balde", "Aspirador de Pó", "Ferro de Passar", "Máquina de Lavar", "Tesoura",
            "Caneta", "Lápis", "Caderno", "Livro", "Luminária", "Lanterna", "Vela", "Fósforo",
            "Chave", "Cadeado", "Carteira", "Moeda", "Garrafa de Água", "Copo", "Prato", "Talher",
            "Panela", "Frigideira", "Abridor de Lata", "Sacola", "Caixa de Papelão", "Martelo", "Chave de Fenda", "Alicate",
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
            "Waffle", "Croissant", "Donut", "Churros", "Pipoca Doce", "Ovo Frito", "Omelete", "Arroz e Feijão",
            "Feijoada", "Strogonoff", "Sopa Quente", "Salada", "Frango Assado", "Peixe Frito", "Camarão", "Caranguejo",
            "Lagosta", "Ostra", "Maçã", "Banana", "Laranja", "Morango", "Uva", "Melancia",
            "Melão", "Abacaxi", "Manga", "Maracujá", "Limão", "Pêssego", "Açai na Tigela", "Coco Verde",
            "Mexerica", "Kiwi", "Cereja", "Azeitona", "Queijo", "Requeijão", "Iogurte", "Chocolate",
            "Goma de Mascar", "Pirulito", "Bala", "Pipoca de Cinema", "Pretzel", "Biscoito", "Torrada", "Pão Francês",
            "Sanduíche", "Tapioca", "Crepe", "Salgadinho", "Castanha de Caju", "Amendoim", "Milho Cozido", "Pamonha",
            "Canjica", "Cocada", "Pé de Moleque", "Goiabada", "Doce de Leite", "Gelatina", "Salada de Frutas", "Suco de Laranja",
            "Café", "Chá Quente", "Refrigerante", "Milk-shake", "Vinho", "Cerveja", "Água de Coco", "Limonada"
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
            "Meu Malvado Favorito", "Minions", "Ice Age (A Era do Gelo)", "Shrek 2", "Aladdin", "A Bela e a Fera", "Cinderela", "A Pequena Sereia",
            "Mulan", "Pocahontas", "Hercules", "Tarzan", "Up - Altas Aventuras", "WALL-E", "Ratatouille", "Coraline", "O Estranho Mundo de Jack",
            "A Família Addams", "Ghostbusters", "Meninas Malvadas", "As Branquelas", "Se Beber, Não Case!", "O Máskara", "Debi & Lóide", "Um Maluco no Pedaço",
            "Todo Mundo em Pânico", "Pânico", "A Hora do Pesadelo", "Sexta-Feira 13", "O Iluminado", "It - A Coisa", "Atividade Paranormal", "Invocação do Mal"
        ]
    };

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
        currentWord: null,
        actorIndex: { individual: 0, teamA: 0, teamB: 0 },
        currentTeamTurn: 'A',
        currentActor: null,
        
        timerId: null,
        timeLeft: 0
    };

    // ELEMENTOS DOM
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

    // NAVEGAÇÃO DE TELAS
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

    // SELEÇÃO DE MODO DE JOGO
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

    // SELEÇÃO DE METAS/TEMPO
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

    // GERENCIAMENTO DE JOGADORES
    function addPlayerName(inputEl, targetArray, renderFn) {
        const val = inputEl.value.trim();
        if (val && !targetArray.includes(val)) {
            targetArray.push(val);
            inputEl.value = '';
            renderFn();
        }
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

    document.getElementById('addPlayerBtn').addEventListener('click', () => {
        addPlayerName(inputs.player, state.players, () => renderTags(lists.player, state.players, (i) => removePlayerName(i, state.players, () => renderTags(lists.player, state.players, null))));
    });

    document.getElementById('addTeamABtn').addEventListener('click', () => {
        addPlayerName(inputs.teamA, state.teamA.players, () => renderTags(lists.teamA, state.teamA.players, (i) => removePlayerName(i, state.teamA.players, () => renderTags(lists.teamA, state.teamA.players, null))));
    });

    document.getElementById('addTeamBBtn').addEventListener('click', () => {
        addPlayerName(inputs.teamB, state.teamB.players, () => renderTags(lists.teamB, state.teamB.players, (i) => removePlayerName(i, state.teamB.players, () => renderTags(lists.teamB, state.teamB.players, null))));
    });

    // EMBARALHAR EQUIPES
    document.getElementById('randomizeTeamsBtn').addEventListener('click', () => {
        const all = [...state.teamA.players, ...state.teamB.players];
        if (all.length < 2) return;
        
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }

        const isOdd = all.length % 2 !== 0;
        const extraToTeamA = isOdd ? Math.random() < 0.5 : false;
        const mid = Math.floor(all.length / 2) + (extraToTeamA ? 1 : 0);
        
        state.teamA.players = all.slice(0, mid);
        state.teamB.players = all.slice(mid);

        renderTags(lists.teamA, state.teamA.players, (i) => removePlayerName(i, state.teamA.players, () => renderTags(lists.teamA, state.teamA.players, null)));
        renderTags(lists.teamB, state.teamB.players, (i) => removePlayerName(i, state.teamB.players, () => renderTags(lists.teamB, state.teamB.players, null)));
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

    // PALAVRAS E ROTATIVIDADE
    function getNextWord() {
        let pool = [];
        let categoryName = "Geral";

        if (state.selectedTheme === 'geral') {
            const categories = Object.keys(WORDS_DATABASE);
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            pool = WORDS_DATABASE[randomCat];
            categoryName = randomCat.toUpperCase();
        } else {
            pool = WORDS_DATABASE[state.selectedTheme] || [];
            categoryName = state.selectedTheme.toUpperCase();
        }

        const available = pool.filter(word => !state.usedWords.has(word));
        
        if (available.length === 0) {
            state.usedWords.clear();
            return { word: pool[Math.floor(Math.random() * pool.length)], cat: categoryName };
        }

        const chosenWord = available[Math.floor(Math.random() * available.length)];
        state.usedWords.add(chosenWord);
        return { word: chosenWord, cat: categoryName };
    }

    function nextTurn() {
        state.currentWord = getNextWord();

        const badgeElem = document.getElementById('roundBadge');
        const cardFrontElem = document.getElementById('cardFrontElem');

        // Limpa classes anteriores de cor
        badgeElem.classList.remove('badge-team-a', 'badge-team-b');
        cardFrontElem.classList.remove('bg-team-a', 'bg-team-b');

        if (state.mode === 'individual') {
            const actorObj = state.players[state.actorIndex.individual];
            state.currentActor = actorObj.name;
            
            badgeElem.innerText = 'Vez de...';
            document.getElementById('turnActorName').innerText = state.currentActor;
            document.getElementById('turnTeamSub').innerText = 'Passe o celular para ele(a)';

            state.actorIndex.individual = (state.actorIndex.individual + 1) % state.players.length;
        } else {
            const isTeamA = state.currentTeamTurn === 'A';
            const currentTeam = isTeamA ? state.teamA : state.teamB;
            const idxKey = isTeamA ? 'teamA' : 'teamB';
            
            const actorName = currentTeam.players[state.actorIndex[idxKey]];
            state.currentActor = actorName;

            badgeElem.innerText = isTeamA ? 'Equipe Azul' : 'Equipe Vermelha';
            badgeElem.classList.add(isTeamA ? 'badge-team-a' : 'badge-team-b');
            cardFrontElem.classList.add(isTeamA ? 'bg-team-a' : 'bg-team-b');

            document.getElementById('turnActorName').innerText = actorName;
            document.getElementById('turnTeamSub').innerText = `Mímica para ${currentTeam.name}`;

            state.actorIndex[idxKey] = (state.actorIndex[idxKey] + 1) % currentTeam.players.length;
            state.currentTeamTurn = isTeamA ? 'B' : 'A';
        }

        document.getElementById('wordCategory').innerText = state.currentWord.cat;
        document.getElementById('secretWord').innerText = state.currentWord.word;

        const cardSecret = document.getElementById('cardSecret');
        cardSecret.classList.remove('flipped');
        document.getElementById('startTimerBtn').classList.add('hidden');

        showScreen('reveal');
    }

    const cardSecret = document.getElementById('cardSecret');
    cardSecret.addEventListener('click', () => {
        cardSecret.classList.toggle('flipped');
        if (cardSecret.classList.contains('flipped')) {
            document.getElementById('startTimerBtn').classList.remove('hidden');
        }
    });

    // CRONÔMETRO
    document.getElementById('startTimerBtn').addEventListener('click', () => {
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
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            for (let i = 0; i < 5; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(600, now + i);
                gain.gain.setValueAtTime(0.15, now + i);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i);
                osc.stop(now + i + 0.6);
            }
        } catch (e) {}
    }

    function timeExpired() {
        playAlarmSound();
        document.getElementById('failBtn').classList.remove('hidden');
    }

    document.getElementById('failBtn').addEventListener('click', () => {
        clearInterval(state.timerId);
        nextTurn();
    });

    document.getElementById('successBtn').addEventListener('click', () => {
        clearInterval(state.timerId);

        if (state.mode === 'team') {
            const winningTeam = state.currentTeamTurn === 'B' ? state.teamA : state.teamB;
            winningTeam.score += 3;

            if (winningTeam.score >= state.targetScore) {
                triggerVictory(winningTeam.name);
            } else {
                nextTurn();
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
                        nextTurn();
                    }
                });
                grid.appendChild(btn);
            }
        });
    }

    // MODAL DE PLACAR COM CORES NAS EQUIPES
    liveScoreBtn.addEventListener('click', () => {
        const content = document.getElementById('liveScoreContent');
        content.innerHTML = '';

        if (state.mode === 'individual') {
            const sorted = [...state.players].sort((a, b) => b.score - a.score);
            sorted.forEach(p => {
                const row = document.createElement('div');
                row.className = 'score-row';
                row.innerHTML = `<span>${p.name}</span><span>${p.score} pts</span>`;
                content.appendChild(row);
            });
        } else {
            content.innerHTML = `
                <div class="score-row score-team-a"><span>${state.teamA.name}</span><span>${state.teamA.score} pts</span></div>
                <div class="score-row score-team-b"><span>${state.teamB.name}</span><span>${state.teamB.score} pts</span></div>
            `;
        }

        scoreModal.classList.remove('hidden');
    });

    document.getElementById('closeScoreModalBtn').addEventListener('click', () => {
        scoreModal.classList.add('hidden');
    });

    // VITÓRIA
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

    // MODAL DE SAIR
    const exitBtn = document.getElementById('exitBtn');
    const exitModal = document.getElementById('exitModal');

    exitBtn.addEventListener('click', () => exitModal.classList.remove('hidden'));
    document.getElementById('cancelExitBtn').addEventListener('click', () => exitModal.classList.add('hidden'));
    document.getElementById('confirmExitBtn').addEventListener('click', () => {
        clearInterval(state.timerId);
        window.location.href = '../../index.html';
    });
});