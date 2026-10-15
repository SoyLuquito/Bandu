// Bandu - Impostor (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // BANCO DE PALAVRAS AGRUPADAS POR DICAS VAGAS
    // ============================================================
    const HINT_GROUPS = {
        animais: {
            "Gelo": ["Pinguim", "Foca", "Morsa", "Urso-polar", "Orca"],
            "Peludo": ["Cachorro", "Gato", "Leão", "Tigre", "Urso", "Lobo", "Raposa", "Coelho", "Esquilo", "Panda", "Coala"],
            "Voador": ["Águia", "Papagaio", "Coruja", "Morcego", "Tucano", "Flamingo", "Borboleta", "Abelha", "Pavão", "Pelicano"],
            "Marinho": ["Tubarão", "Golfinho", "Baleia", "Polvo", "Caranguejo", "Piranha", "Lula", "Foca", "Orca", "Peixe-boi"],
            "Grande": ["Elefante", "Girafa", "Hipopótamo", "Rinoceronte", "Baleia", "Urso", "Gorila", "Capivara", "Búfalo", "Camelo"],
            "Pequeno": ["Formiga", "Abelha", "Joaninha", "Vagalume", "Caracol", "Minhoca", "Hamster", "Esquilo", "Borboleta", "Centopeia"],
            "Rasteja": ["Cobra", "Lagarto", "Iguana", "Jacaré", "Tartaruga", "Jabuti", "Caracol", "Minhoca", "Camaleão"],
            "Selva": ["Leão", "Tigre", "Gorila", "Macaco", "Preguiça", "Onça-pintada", "Jacaré", "Capivara", "Tamanduá", "Tatu"],
            "Doméstico": ["Cachorro", "Gato", "Coelho", "Hamster", "Porquinho-da-índia", "Galinha", "Vaca", "Cavalo", "Ovelha", "Porco"],
            "Pena": ["Galinha", "Galo", "Pato", "Pavão", "Avestruz", "Flamingo", "Pelicano", "Tucano", "Pica-pau", "Coruja"],
            "Chifre": ["Rinoceronte", "Bode", "Búfalo", "Alce", "Camelo", "Gnu", "Gazela", "Impala"],
        },
        profissoes: {
            "Profissão": ["Médico", "Enfermeiro", "Dentista", "Psicólogo", "Farmacêutico", "Veterinário", "Massagista"],
            "Profissão": ["Chef de Cozinha", "Padeiro", "Açougueiro", "Garçom", "Barbeiro"],
            "Profissão": ["Policial", "Bombeiro", "Médico", "Enfermeiro", "Soldado", "Segurança", "Carteiro", "Comissário de Bordo"],
            "Profissão": ["Pedreiro", "Jardineiro", "Agricultor", "Pescador", "Gari", "Salva-vidas", "Carteiro", "Motorista de Ônibus"],
            "Profissão": ["Advogado", "Contador", "Programador", "Designer", "Secretária", "Recepcionista", "Empresário", "Corretor de Imóveis"],
            "Profissão": ["Mecânico", "Pedreiro", "Eletricista", "Encanador", "Carpinteiro", "Tatuador", "Escultor"],
            "Profissão": ["Ator", "Cantor", "Dançarino", "Mágico", "Palhaço", "Escultor", "Pintor", "Fotógrafo", "Maquiador", "Tatuador"],
            "Profissão": ["Professor", "Personal Trainer", "Instrutor de Yoga", "Adestrador", "Guia Turístico"],
            "Profissão": ["Ator", "Cantor", "Jornalista", "Youtuber", "Apresentador", "Dublador"],
            "Profissão": ["Contador", "Caixa de Banco", "Empresário", "Corretor de Imóveis", "Vendedor"],
            "Profissão": ["Pescador", "Marinheiro", "Mergulhador", "Salva-vidas", "Comissário de Bordo"],
            "Profissão": ["Veterinário", "Adestrador", "Pescador", "Agricultor", "Zelador"],
        },
        objetos: {
            "Quente": ["Fogueira", "Fogão", "Vela", "Fósforo", "Churrasqueira", "Lanterna", "Luminária"],
            "Eletrônico": ["Celular", "Televisão", "Geladeira", "Computador", "Notebook", "Tablet", "Micro-ondas", "Liquidificador", "Ventilador", "Aspirador de Pó", "Máquina de Lavar", "Caixa de Som", "Microfone", "Fone de Ouvido"],
            "Bolso": ["Celular", "Caneta", "Lápis", "Moeda", "Chave", "Carteira", "Batom", "Anel", "Tesoura", "Seringa", "Termômetro", "Curativo"],
            "Metal": ["Chave", "Tesoura", "Martelo", "Chave de Fenda", "Alicate", "Serrote", "Trena", "Panela", "Frigideira", "Saca-rolhas"],
            "Madeira": ["Cadeira", "Mesa", "Lápis", "Caderno", "Violão", "Guitarra", "Cama", "Tambor"],
            "Limpeza": ["Vassoura", "Rodo", "Balde", "Aspirador de Pó", "Sabonete", "Toalha", "Máquina de Lavar"],
            "Cozinha": ["Panela", "Frigideira", "Micro-ondas", "Liquidificador", "Fogão", "Saca-rolhas"],
            "Elétrico": ["Geladeira", "Televisão", "Computador", "Ventilador", "Liquidificador", "Micro-ondas", "Secador de Cabelo", "Luminária", "Máquina de Lavar", "Ferro de Passar", "Aspirador de Pó"],
            "Banheiro": ["Sabonete", "Toalha", "Escova de Dentes", "Pente", "Secador de Cabelo", "Espelho", "Batom", "Perfume"],
            "Trabalho": ["Computador", "Caneta", "Caderno", "Martelo", "Chave de Fenda", "Trena", "Microfone", "Máquina Fotográfica"],
            "Esporte": ["Bicicleta", "Bola de Futebol", "Raquete de Tênis", "Skate", "Capacete", "Prancha de Surf"],
            "Frio": ["Cachecol", "Luvas", "Casaco", "Meia", "Bota", "Chapéu", "Boné"],
            "Barulho": ["Tambor", "Guitarra", "Violão", "Caixa de Som", "Microfone", "Despertador", "Chocalho"],
        },
        comidas: {
            "Doce": ["Brigadeiro", "Pudim", "Sorvete", "Açaí", "Bolo de Chocolate", "Torta de Limão", "Donut", "Churros", "Chocolate", "Bala", "Pirulito", "Biscoito", "Gelatina", "Goiabada", "Doce de Leite", "Cocada", "Pé de Moleque", "Milk-shake"],
            "Salgado": ["Pizza", "Hambúrguer", "Batata Frita", "Cachorro-quente", "Pastel", "Coxinha", "Pão de Queijo", "Empada", "Kibe", "Churrasco", "Frango Assado", "Peixe Frito", "Salgadinho", "Amendoim", "Castanha"],
            "Quente": ["Sopa", "Café", "Chá", "Feijoada", "Strogonoff", "Frango Assado", "Lasanha", "Pizza", "Pão", "Milho", "Pamonha", "Canjica"],
            "Frio": ["Sorvete", "Açaí", "Salada", "Milk-shake", "Refrigerante", "Cerveja", "Vinho", "Limonada", "Água de Coco", "Iogurte"],
            "Mar": ["Sushi", "Camarão", "Lagosta", "Ostra", "Peixe Frito", "Caranguejo", "Temaki"],
            "Brasil": ["Feijoada", "Brigadeiro", "Coxinha", "Pão de Queijo", "Pamonha", "Canjica", "Cocada", "Pé de Moleque", "Goiabada", "Açaí", "Tapioca", "Farofa"],
            "Itália": ["Pizza", "Espaguete", "Lasanha", "Risoto", "Panqueca", "Tiramissu"],
            "Fruta": ["Maçã", "Banana", "Laranja", "Morango", "Uva", "Melancia", "Melão", "Abacaxi", "Manga", "Maracujá", "Limão", "Pêssego", "Coco", "Mexerica", "Kiwi", "Cereja", "Goiaba", "Mamão"],
            "Bebida": ["Café", "Chá", "Refrigerante", "Milk-shake", "Vinho", "Cerveja", "Água de Coco", "Limonada", "Suco de Laranja"],
            "Festa": ["Brigadeiro", "Pipoca", "Bolo de Chocolate", "Coxinha", "Pastel", "Salgadinho", "Pirulito", "Bala"],
        },
        filmes: {
            "Herói": ["Homem-Aranha", "Batman", "Superman", "Homem de Ferro", "Vingadores", "Pantera Negra", "Coringa", "Thor", "Capitão América", "Doutor Estranho", "Guardiões da Galáxia"],
            "Animação": ["O Rei Leão", "Toy Story", "Shrek", "Procurando Nemo", "Os Incríveis", "Frozen", "Moana", "Detona Ralph", "Monstros S.A.", "Carros", "Divertida Mente", "Encanto", "Kung Fu Panda", "Madagascar", "Meu Malvado Favorito", "A Era do Gelo", "Aladdin", "A Bela e a Fera", "Cinderela", "A Pequena Sereia", "Mulan", "Pocahontas", "Hercules", "Tarzan", "Up - Altas Aventuras", "WALL-E", "Ratatouille", "Coraline"],
            "Série": ["Stranger Things", "Round 6", "Game of Thrones", "Breaking Bad", "La Casa de Papel", "The Walking Dead", "Friends", "The Office", "Os Simpsons", "Chaves"],
            "Filme de Terror": ["Pânico", "A Hora do Pesadelo", "Sexta-Feira 13", "O Iluminado", "It - A Coisa", "Atividade Paranormal", "Invocação do Mal", "Coraline", "A Família Addams"],
            "Filme de Ficção": ["Star Wars", "Matrix", "Avatar", "Jurassic Park", "De Volta para o Futuro", "Transformers", "Stranger Things", "WALL-E", "Guardiões da Galáxia"],
            "Filme de Comédia": ["Shrek", "As Branquelas", "Se Beber, Não Case!", "O Máskara", "Debi & Lóide", "Todo Mundo em Pânico", "The Office", "Friends", "Os Simpsons", "Chaves"],
            "Filme Infantil": ["Harry Potter", "Toy Story", "Frozen", "Moana", "Encanto", "Detona Ralph", "Coraline", "Stranger Things", "Up - Altas Aventuras"],
            "Filme antigo": ["O Poderoso Chefão", "Titanic", "Star Wars", "Matrix", "De Volta para o Futuro", "Tubarão", "O Rei Leão", "Chaves", "A Família Addams", "Ghostbusters", "O Iluminado"],
        },
        geral: {
            "Esporte": ["Boliche", "Basquete", "Futebol", "Surfar", "Esquiar", "Patinar", "Queimada", "Vôlei", "Natação", "Atletismo", "Olimpiadas", "Copa do mundo"],
        },
    };

    // Mapa reverso: palavra -> { cat, hint }
    const WORDS_INDEX = {};
    Object.keys(HINT_GROUPS).forEach(cat => {
        const groups = HINT_GROUPS[cat];
        Object.keys(groups).forEach(hint => {
            groups[hint].forEach(word => {
                if (!WORDS_INDEX[word]) {
                    WORDS_INDEX[word] = { cat, hint, word };
                }
            });
        });
    });

    // ============================================================
    // ESTADO DO JOGO
    // ============================================================
    const state = {
        players: [],
        impostorCount: 1,
        impostorMode: 'blind',
        selectedTheme: 'geral',

        currentWord: null,
        impostorNames: [],
        revealIndex: 0,
        revealOrder: [],
        firstSpeaker: null,
        usedWords: new Set(),

        isRolling: false,
        isTransitioning: false
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        config: document.getElementById('configScreen'),
        reveal: document.getElementById('revealScreen'),
        sort: document.getElementById('sortScreen'),
        playing: document.getElementById('playingScreen'),
        result: document.getElementById('resultScreen')
    };

    const inputs = {
        player: document.getElementById('playerInput')
    };

    const lists = {
        player: document.getElementById('playerList')
    };

    const exitModal = document.getElementById('exitModal');

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
    // CONFIGURAÇÃO — JOGADORES
    // ============================================================
    function addPlayerName() {
        const val = inputs.player.value.trim();
        if (val && !state.players.includes(val)) {
            state.players.push(val);
            inputs.player.value = '';
            refreshPlayerList();
        }
        inputs.player.focus();
    }

    function removePlayer(index) {
        state.players.splice(index, 1);
        refreshPlayerList();
    }

    function refreshPlayerList() {
        lists.player.innerHTML = '';
        state.players.forEach((name, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `
                <span>${name}</span>
                <button type="button" aria-label="Remover">&times;</button>
            `;
            li.querySelector('button').addEventListener('click', () => removePlayer(i));
            lists.player.appendChild(li);
        });
    }

    const addPlayerBtn = document.getElementById('addPlayerBtn');
    addPlayerBtn.addEventListener('mousedown', (e) => e.preventDefault());
    addPlayerBtn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    addPlayerBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        addPlayerBtn.click();
    });
    addPlayerBtn.addEventListener('click', addPlayerName);

    inputs.player.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPlayerName();
        }
    });

    // ============================================================
    // CONFIGURAÇÃO — CHIPS E SEGMENTED
    // ============================================================
    document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#impostorCountGroup .chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.impostorCount = parseInt(btn.dataset.value, 10);
        });
    });

    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.impostorMode = btn.dataset.mode;
        });
    });

    // ============================================================
    // INICIAR PARTIDA
    // ============================================================
    document.getElementById('startGameBtn').addEventListener('click', () => {
        state.selectedTheme = document.getElementById('themeSelect').value;

        if (state.players.length < 3) {
            alert('Adicione pelo menos 3 jogadores!');
            return;
        }

        if (state.impostorCount >= state.players.length) {
            alert('O número de impostores deve ser menor que o número de jogadores!');
            return;
        }

        state.usedWords.clear();
        state.revealIndex = 0;

        setupNewRound();
    });

    // ============================================================
    // SORTEIO DE PALAVRA + DICA
    // ============================================================
    function getWordsForTheme() {
        const result = [];
        const cats = state.selectedTheme === 'geral'
            ? Object.keys(HINT_GROUPS)
            : [state.selectedTheme];

        cats.forEach(cat => {
            const groups = HINT_GROUPS[cat];
            if (!groups) return;
            Object.keys(groups).forEach(hint => {
                groups[hint].forEach(word => {
                    result.push({ word, hint, cat });
                });
            });
        });

        return result;
    }

    function pickWord() {
        const pool = getWordsForTheme();
        const available = pool.filter(item => !state.usedWords.has(item.word));

        if (available.length === 0) {
            state.usedWords.clear();
            const item = pool[Math.floor(Math.random() * pool.length)];
            state.usedWords.add(item.word);
            return item;
        }

        const chosen = available[Math.floor(Math.random() * available.length)];
        state.usedWords.add(chosen.word);
        return chosen;
    }

    // ============================================================
    // SETUP DE NOVA RODADA
    // ============================================================
    function setupNewRound() {
        // Reset de flags de transição (evita travamento ao iniciar nova rodada)
        state.isTransitioning = false;
        state.isRolling = false;

        state.currentWord = pickWord();

        const shuffled = [...state.players].sort(() => Math.random() - 0.5);
        state.impostorNames = shuffled.slice(0, state.impostorCount);

        state.revealOrder = [...state.players].sort(() => Math.random() - 0.5);
        state.revealIndex = 0;
        state.firstSpeaker = null;

        renderRevealScreen();
        showScreen('reveal');
    }

    // ============================================================
    // TELA DE REVELAÇÃO — preenche o conteúdo do card
    // ============================================================
    function renderRevealScreen() {
        const actorName = state.revealOrder[state.revealIndex];
        const isLast = state.revealIndex === state.revealOrder.length - 1;

        document.getElementById('revealActorName').innerText = actorName;
        document.getElementById('revealSub').innerText = isLast
            ? 'Última pessoa a ver!'
            : 'Passe o celular para ele(a)';

        // Garante que o card esteja SEMPRE de frente ao renderizar
        const cardSecret = document.getElementById('cardSecret');
        cardSecret.classList.remove('flipped', 'animating');

        const secretLabel = document.getElementById('secretLabel');
        const secretContent = document.getElementById('secretContent');
        const cardBack = document.querySelector('#cardSecret .card-back');
        const nextBtn = document.getElementById('nextPlayerBtn');

        // Remove dica antiga se houver
        const oldHint = cardBack.querySelector('.card-back-hint');
        if (oldHint) oldHint.remove();

        cardBack.classList.remove('is-impostor');
        secretContent.classList.remove('is-impostor-text');

        const isImpostor = state.impostorNames.includes(actorName);

        if (isImpostor) {
            cardBack.classList.add('is-impostor');
            secretContent.classList.add('is-impostor-text');
            secretLabel.innerText = 'Você é';
            secretContent.innerText = 'IMPOSTOR';

            if (state.impostorMode === 'hint') {
                const hintEl = document.createElement('p');
                hintEl.className = 'card-back-hint';
                hintEl.innerText = `Dica: ${state.currentWord.hint}`;
                cardBack.appendChild(hintEl);
            }
        } else {
            secretLabel.innerText = 'Sua palavra';
            secretContent.innerText = state.currentWord.word;
        }

        nextBtn.classList.add('hidden');
        nextBtn.innerHTML = isLast
            ? '<i data-lucide="arrow-right"></i> Sortear quem começa'
            : '<i data-lucide="arrow-right"></i> Passar';

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // CARD — clique para revelar
    // ============================================================
    const cardSecret = document.getElementById('cardSecret');
    const CARD_FLIP_MS = 600; // duração da animação (bate com o CSS)

    cardSecret.addEventListener('click', () => {
        if (cardSecret.classList.contains('flipped')) return;

        cardSecret.classList.add('flipped');
        document.getElementById('nextPlayerBtn').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    // ============================================================
    // BOTÃO "PASSAR" — reseta o card ANTES de trocar de jogador
    // ============================================================
    document.getElementById('nextPlayerBtn').addEventListener('click', () => {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        // 1) Esconde o botão imediatamente (evita duplo clique)
        document.getElementById('nextPlayerBtn').classList.add('hidden');

        // 2) Desvira o card — a animação roda para voltar à frente neutra
        cardSecret.classList.remove('flipped');

        // 3) Bloqueia cliques durante a animação
        cardSecret.classList.add('animating');

        // 4) Espera a animação de virar de volta terminar ANTES de
        //    atualizar o conteúdo e o nome do próximo jogador.
        setTimeout(() => {
            state.revealIndex++;

            if (state.revealIndex >= state.revealOrder.length) {
                state.isTransitioning = false;
                startSortScreen();
            } else {
                // Agora sim, atualiza conteúdo e nome — card já está de frente
                renderRevealScreen();
                cardSecret.classList.remove('animating');
                state.isTransitioning = false;
            }
        }, CARD_FLIP_MS);
    });

    // ============================================================
    // SORTEIO DE QUEM COMEÇA
    // ============================================================
    function startSortScreen() {
        showScreen('sort');

        const sortNameEl = document.getElementById('sortName');
        const startRoundBtn = document.getElementById('startRoundBtn');

        startRoundBtn.classList.add('hidden');
        sortNameEl.classList.remove('picked');
        sortNameEl.classList.add('rolling');
        sortNameEl.innerText = '...';

        state.isRolling = true;

        const totalDuration = 2500;
        const startTime = Date.now();
        let lastChange = 0;

        function roll() {
            const elapsed = Date.now() - startTime;

            if (elapsed >= totalDuration) {
                const picked = state.players[Math.floor(Math.random() * state.players.length)];
                state.firstSpeaker = picked;

                sortNameEl.classList.remove('rolling');
                sortNameEl.classList.add('picked');
                sortNameEl.innerText = picked;

                startRoundBtn.classList.remove('hidden');
                state.isRolling = false;

                if (window.confetti) {
                    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                }
                return;
            }

            const remaining = totalDuration - elapsed;
            const interval = remaining < 500 ? 200 : (remaining < 1200 ? 130 : 80);

            if (Date.now() - lastChange >= interval) {
                const randomName = state.players[Math.floor(Math.random() * state.players.length)];
                sortNameEl.innerText = randomName;
                lastChange = Date.now();
            }

            requestAnimationFrame(roll);
        }

        roll();
    }

    // ============================================================
    // RODADA EM ANDAMENTO
    // ============================================================
    document.getElementById('startRoundBtn').addEventListener('click', () => {
        document.getElementById('firstSpeakerName').innerText = state.firstSpeaker;
        showScreen('playing');
    });

    // ============================================================
    // RESULTADO
    // ============================================================
    document.getElementById('endRoundBtn').addEventListener('click', () => {
        showScreen('result');
        renderResultScreen();
    });

    function renderResultScreen() {
        const impostorsCount = state.impostorNames.length;
        const impostorLabel = impostorsCount === 1 ? 'O impostor era' : 'Os impostores eram';

        document.getElementById('resultWord').innerText = state.currentWord.word;
        document.getElementById('resultImpostorLabel').innerText = impostorLabel;

        const impostorsContainer = document.getElementById('resultImpostors');
        impostorsContainer.innerHTML = '';
        state.impostorNames.forEach(name => {
            const chip = document.createElement('span');
            chip.className = 'result-impostor-chip';
            chip.innerText = name;
            impostorsContainer.appendChild(chip);
        });

        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
        setupNewRound();
    });

    document.getElementById('backToConfigBtn').addEventListener('click', () => {
        showScreen('config');
    });

    // ============================================================
    // SAIR
    // ============================================================
    document.getElementById('exitBtn').addEventListener('click', () => {
        exitModal.classList.remove('hidden');
    });

    document.getElementById('cancelExitBtn').addEventListener('click', () => {
        exitModal.classList.add('hidden');
    });

    document.getElementById('confirmExitBtn').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    console.log('🎉 Impostor carregado com sucesso!');
});