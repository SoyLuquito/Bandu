// Rally - Quem é meu par? (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // BANCO DE PALAVRAS (mesmo do Impostor)
    // ============================================================
    const HINT_GROUPS = {
        animais: {
            "Animal do frio": ["Foca", "Morsa", "Urso-polar", "Pinguim", "Orca", "Leopardo-das-neves", "Rena", "Lobo-do-ártico", "Lebre-ártica", "Narval"],
            "Peludo": ["Ovelha", "Macaco", "Cavalo", "Porquinho-da-índia", "Hamster", "Morcego", "Gambá", "Canguru", "Lhama", "Doninha"],
            "Voador": ["Andorinha", "Beija-flor", "Pombo", "Gaivota", "Cegonha", "Gavião", "Mariposa", "Libélula", "Mosca", "Vespa"],
            "Marinho": ["Estrela-do-mar", "Água-viva", "Cavalo-marinho", "Tartaruga-marinha", "Lontra", "Foca", "Mexilhão", "Ouriço-do-mar", "Peixe-palhaço", "Arraia"],
            "Grande": ["Boi", "Alce", "Crocodilo", "Canguru", "Avestruz", "Leão-marinho", "Baleia-azul", "Alce", "Orangotango", "Javali"],
            "Pequeno": ["Pulga", "Cupim", "Grilo", "Besouro", "Lagartixa", "Rato", "Sapo", "Pintinho", "Pardal", "Percevejo"],
            "Rasteja": ["Lesma", "Lagarta", "Salamandra", "Cobra-cega", "Lagartixa", "Sanguessuga", "Toupeira", "Escorpião", "Lagarto", "Iguana"],
            "Selva": ["Guepardo", "Hiena", "Rinoceronte", "Zebra", "Hipopótamo", "Babuíno", "Anta", "Jaguatirica", "Arara", "Bicho-preguiça"],
            "Doméstico": ["Pato", "Peru", "Burro", "Jumento", "Pônei", "Codorna", "Ganso", "Pavão", "Peixe-dourado", "Calopsita"],
            "Pena": ["Pinguim", "Pombo", "Canário", "Peru", "Ganso", "Cisne", "Marreco", "Urubu", "Falcão", "Arara"],
            "Chifre": ["Vaca", "Cabra", "Carneiro", "Antílope", "Boi", "Veado", "Bisonte", "Íbex", "Caribu", "Cervo"]        
        },
        profissoes: {
            "Profissão": [
            "Professor", "Médico", "Enfermeiro", "Dentista", "Veterinário",
            "Policial", "Bombeiro", "Advogado", "Juiz", "Psicólogo",
            "Padeiro", "Confeiteiro", "Cozinheiro", "Garçom", "Barista",
            "Motorista", "Piloto", "Taxista", "Entregador", "Caminhoneiro",
            "Pedreiro", "Pintor", "Eletricista", "Encanador", "Marceneiro",
            "Mecânico", "Soldador", "Jardineiro", "Faxineiro", "Zelador",
            "Ator", "Cantor", "Dançarino", "Músico", "Palhaço",
            "Fotógrafo", "Jornalista", "Escritor", "Youtuber", "Influenciador",
            "Cabeleireiro", "Barbeiro", "Maquiador", "Tatuador", "Costureiro",
            "Garimpeiro", "Pescador", "Agricultor", "Carteiro", "Segurança",
            "Recepcionista", "Secretário", "Contador", "Vendedor", "Corretor",
            "Programador", "Designer", "Arquiteto", "Engenheiro", "Cientista",
            "Astronauta", "Biólogo", "Bailarino", "Mágico", "Dublador",
            "Apresentador", "Treinador", "Árbitro", "Personal trainer", "Babá",
            "Cuidador", "Bibliotecário", "Borracheiro", "Frentista", "Garagista"
            ]        
        },
        objetos: {
            "Quente": ["Fogueira", "Fogão", "Vela", "Fósforo", "Churrasqueira", "Luminária", "Chaleira", "Torradeira", "Secador de Cabelo", "Ferro de Passar", "Aquecedor", "Lareira", "Forno", "Churrasqueira Elétrica"],
            "Eletrônico": ["Celular", "Televisão", "Geladeira", "Computador", "Notebook", "Tablet", "Micro-ondas", "Liquidificador", "Ventilador", "Aspirador de Pó", "Máquina de Lavar", "Caixa de Som", "Microfone", "Fone de Ouvido"],
            "Objeto de Bolso": ["Celular", "Caneta", "Lápis", "Moeda", "Chave", "Carteira", "Batom", "Anel", "Tesoura", "Seringa", "Curativo"],
            "Limpeza": ["Vassoura", "Rodo", "Balde", "Aspirador de Pó", "Detergente", "Sabão", "Esponja", "Pano de Chão", "Luva de Borracha", "Rodo de Pia", "Escova de Limpeza", "Desinfetante"],
            "Cozinha": ["Panela", "Frigideira", "Micro-ondas", "Liquidificador", "Fogão", "Saca-rolhas", "Tábua de Corte", "Colher de Pau", "Espátula", "Ralador", "Faca", "Garfo", "Concha", "Peneira", "Batedeira", "Cafeteira", "Chaleira", "Torradeira"],
            "Elétrico": ["Geladeira", "Televisão", "Computador", "Ventilador", "Liquidificador", "Micro-ondas", "Secador de Cabelo", "Luminária", "Máquina de Lavar", "Ferro de Passar", "Aspirador de Pó"],
            "Banheiro": ["Sabonete", "Toalha", "Escova de Dentes", "Pente", "Secador de Cabelo", "Espelho", "Batom", "Shampoo", "Condicionador", "Papel Higiênico", "Desodorante", "Creme Dental", "Toalha de Rosto"],
            "Frio": ["Cachecol", "Luvas", "Casaco", "Meia", "Bota", "Chapéu", "Boné", "Gorro", "Jaqueta", "Blusa de Frio", "Cobertor", "Manta", "Aquecedor", "Lareira", "Chaleira"],
        },
        comidas: {
            "Doce": ["Brigadeiro", "Pudim", "Sorvete", "Açaí", "Bolo de Chocolate", "Torta de Limão", "Donut", "Churros", "Chocolate", "Bala", "Pirulito", "Biscoito", "Gelatina", "Goiabada", "Doce de Leite", "Cocada", "Pé de Moleque", "Milk-shake"],
            "Salgado": ["Pizza", "Hambúrguer", "Batata Frita", "Cachorro-quente", "Pastel", "Coxinha", "Pão de Queijo", "Empada", "Kibe", "Churrasco", "Frango Assado", "Peixe Frito", "Salgadinho", "Amendoim", "Castanha"],
            "Frio": ["Sorvete", "Açaí", "Salada", "Milk-shake", "Refrigerante", "Cerveja", "Vinho", "Limonada", "Água de Coco", "Iogurte"],
            "Brasil": ["Feijoada", "Brigadeiro", "Coxinha", "Pão de Queijo", "Pamonha", "Canjica", "Cocada", "Pé de Moleque", "Goiabada", "Açaí", "Tapioca", "Farofa"],
            "Fruta": ["Maçã", "Banana", "Laranja", "Morango", "Uva", "Melancia", "Melão", "Abacaxi", "Manga", "Maracujá", "Limão", "Pêssego", "Coco", "Mexerica", "Kiwi", "Cereja", "Goiaba", "Mamão"],
            "Bebida": ["Café", "Chá", "Refrigerante", "Milk-shake", "Vinho", "Cerveja", "Água de Coco", "Limonada", "Suco de Laranja"],
            "Festa": ["Brigadeiro", "Pipoca", "Bolo de Chocolate", "Coxinha", "Pastel", "Salgadinho", "Pirulito", "Bala"],
        },
        filmes: {
            "Herói": ["Homem-Aranha", "Batman", "Superman", "Homem de Ferro", "Vingadores", "Pantera Negra", "Coringa", "Thor", "Capitão América", "Doutor Estranho", "Guardiões da Galáxia", "Mulher-Maravilha", "Flash", "Aquaman", "Lanterna Verde", "Deadpool", "Wolverine", "Hulk", "Viúva Negra", "Homem-Formiga", "Cyborg", "Demolidor", "Motoqueiro Fantasma", "Surfista Prateado"],
            "Animação": ["O Rei Leão", "Toy Story", "Shrek", "Procurando Nemo", "Os Incríveis", "Frozen", "Moana", "Detona Ralph", "Monstros S.A.", "Carros", "Divertida Mente", "Encanto", "Kung Fu Panda", "Madagascar", "Meu Malvado Favorito", "A Era do Gelo", "Aladdin", "A Bela e a Fera", "Cinderela", "A Pequena Sereia", "Mulan", "Pocahontas", "Hercules", "Tarzan", "Up - Altas Aventuras", "WALL-E", "Ratatouille", "Coraline"],
            "Série": ["Stranger Things", "Round 6", "Game of Thrones", "Breaking Bad", "La Casa de Papel", "The Walking Dead", "Friends", "The Office", "Os Simpsons", "Chaves"],
            "Filme de Terror": ["Pânico", "A Hora do Pesadelo", "Sexta-Feira 13", "O Iluminado", "It - A Coisa", "Atividade Paranormal", "Invocação do Mal", "Coraline", "O Exorcista", "O Massacre da Serra Elétrica", "Annabelle", "O Chamado", "O Grito"],
            "Filme de Ficção": ["Star Wars", "Matrix", "Avatar", "Jurassic Park", "De Volta para o Futuro", "Transformers", "Interestelar", "Harry Potter", "Jogos Vorazes", "Divergente", "O Senhor dos Anéis"],
            "Filme de Comédia": ["Shrek", "As Branquelas", "Se Beber, Não Case!", "O Máskara", "Debi & Lóide", "Todo Mundo em Pânico", "Superbad", "Esqueceram de Mim"],
        },
        futebol: {
            "Jogador brasileiro": ["Pelé", "Neymar", "Ronaldo Fenômeno", "Ronaldinho Gaúcho", "Romário", "Kaká", "Rivaldo", "Zico", "Sócrates", "Garrincha", "Roberto Carlos", "Cafu", "Dida", "Bebeto", "Adriano Imperador", "Juninho Pernambucano", "Santos Marcos", "Rogério Ceni", "Taffarel", "Casemiro", "Vinícius Júnior", "Rodrygo", "Raphinha", "Richarlison", "Endrick", "Gabriel Jesus", "Bruno Guimarães", "Alisson", "Ederson", "Thiago Silva", "Marquinhos", "Lucas Paquetá", "Philippe Coutinho", "Hulk", "Denílson", "Éder Militão", "Gabriel Martinelli"],
            "Jogador sul-americano": ["Lionel Messi", "Diego Maradona", "Ángel Di María", "Lautaro Martínez", "Julián Álvarez", "Sergio Agüero", "Enzo Fernández", "Rodrigo De Paul", "Paulo Dybala", "Luis Suárez", "Edinson Cavani", "Federico Valverde", "Darwin Núñez", "James Rodríguez", "Luis Díaz", "Carlos Valderrama", "Arturo Vidal", "Paolo Guerrero", "Carlos Tévez"],
            "Jogador europeu": ["Cristiano Ronaldo", "Zinedine Zidane", "Kylian Mbappé", "Thierry Henry", "Karim Benzema", "Antoine Griezmann", "Olivier Giroud", "Xavi", "Andrés Iniesta", "Sergio Ramos", "Iker Casillas", "Carles Puyol", "Lamine Yamal", "Rodri", "David Beckham", "Harry Kane", "Jude Bellingham", "Bukayo Saka", "Phil Foden", "Franz Beckenbauer", "Toni Kroos", "Manuel Neuer", "Jamal Musiala", "Paolo Maldini", "Gianluigi Buffon", "Johan Cruyff", "Ruud Gullit", "Virgil van Dijk", "Luka Modrić", "Gareth Bale", "Zlatan Ibrahimović", "Erling Haaland", "Robert Lewandowski", "Eusébio", "Rafael Leão", "Petr Čech", "Kevin De Bruyne", "Eden Hazard", "Romelu Lukaku", "Clarence Seedorf"],
            "Time brasileiro": ["Corinthians", "Palmeiras", "São Paulo", "Santos", "Flamengo", "Fluminense", "Botafogo", "Vasco da Gama", "Grêmio", "Internacional", "Atlético Mineiro", "Cruzeiro", "Bahia", "Vitória", "Sport Recife", "Fortaleza", "Ceará", "Athletico Paranaense", "Coritiba", "Goiás", "Cuiabá", "Red Bull Bragantino", "América Mineiro", "Chapecoense", "Ponte Preta", "Guarani", "Portuguesa", "Juventude", "Avaí", "Náutico", "Santa Cruz", "Paysandu", "Remo", "Atlético Goianiense", "Criciúma", "Mirassol", "São Bernardo", "Ituano", "Novorizontino", "Ferroviária"],
            "Time europeu": ["Real Madrid", "Barcelona", "Atlético de Madrid", "Manchester United", "Manchester City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Bayern de Munique", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig", "Juventus", "Milan", "Inter de Milão", "Napoli", "Roma", "Lazio", "Paris Saint-Germain", "Olympique de Marseille", "Lyon", "Monaco", "Ajax", "Benfica", "Porto", "Sporting", "Celtic", "Rangers", "Galatasaray", "Fenerbahçe", "Real Sociedad", "Olympiacos"],
            "Seleção": ["Brasil", "Argentina", "Uruguai", "Colômbia", "Chile", "Paraguai", "Peru", "Bolívia", "México", "Estados Unidos", "Inglaterra", "França", "Alemanha", "Espanha", "Portugal", "Itália", "Holanda", "Bélgica", "Croácia", "Dinamarca", "Noruega", "Japão", "Coreia do Sul", "Austrália", "Arábia Saudita", "Marrocos", "Egito", "Costa do Marfim", "África do Sul", "Catar", "Turquia", "País de Gales"],
            "Técnico de futebol": ["Carlo Ancelotti", "Pep Guardiola", "José Mourinho", "Jürgen Klopp", "Abel Ferreira", "Dorival Júnior", "Tite", "Felipão", "Pofexô Luxemburgo", "Zagallo", "Fernando Diniz", "Rogério Ceni", "Renato Gaúcho", "Jorge Jesus", "Mano Menezes", "Zinedine Zidane", "Diego Simeone", "Luis Enrique"],
            "Posição do futebol": ["Goleiro", "Zagueiro", "Lateral-direito", "Lateral-esquerdo", "Ala", "Primeiro volante", "Segundo volante", "Meia central", "Meia ofensivo", "Armador", "Ponta-direita", "Ponta-esquerda", "Centroavante", "Segundo atacante", "Falso nove"],
            "Campeonatos e competições": ["Copa do Mundo", "Copa América", "Eurocopa", "Liga dos Campeões", "Liga Europa", "Conference League", "Libertadores", "Copa Sul-Americana", "Brasileirão", "Copa do Brasil", "Supercopa do Brasil", "Mundial de Clubes", "Intercontinental", "Recopa Sul-Americana", "Premier League", "La Liga", "Serie A italiana", "Bundesliga", "Ligue 1", "Eredivisie", "Copa da Inglaterra", "Copa do Rei", "Jogos Olímpicos", "Mundial Sub-20", "Copinha"],
        },
    };

    // ============================================================
    // ESTADO
    // ============================================================
    const state = {
        players: [],
        impostorCount: 1,
        impostorMode: 'blind',
        selectedThemes: new Set(),

        // Cada item de `pairs` é: { word, hint, players: [nome1, nome2] }
        pairs: [],
        // Mapa auxiliar: nome -> { word, hint, pairIndex }
        playerPairInfo: {},
        // Dica única da rodada (todas as duplas usam essa mesma dica)
        currentHint: '',

        impostorNames: [],
        revealIndex: 0,
        revealOrder: [],
        firstSpeaker: null,

        isRolling: false,
        isTransitioning: false
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        home: document.getElementById('homeScreen'),
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
    const comingSoonModal = document.getElementById('comingSoonModal');

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
    // UTILITÁRIOS
    // ============================================================
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function getHintGroupsForThemes() {
        const result = [];
        const cats = Array.from(state.selectedThemes);

        cats.forEach(cat => {
            const groups = HINT_GROUPS[cat];
            if (!groups) return;
            Object.keys(groups).forEach(hint => {
                const words = groups[hint].map(word => ({ word, hint }));
                result.push({ hint, words });
            });
        });

        return result;
    }

    // ============================================================
    // REGRAS DE IMPOSTORES
    // ============================================================
    function getImpostorRules(numPlayers) {
        const map = {
            5: { fixed: 1, options: [1] },
            6: { fixed: 2, options: [2] },
            7: { fixed: null, options: [1, 3] },
            8: { fixed: 2, options: [2] },
            9: { fixed: 3, options: [3] },
            10: { fixed: null, options: [2, 4] },
            11: { fixed: null, options: [3, 5] },
            12: { fixed: null, options: [2, 4] },
            13: { fixed: null, options: [3, 5] },
            14: { fixed: null, options: [2, 4] }
        };
        return map[numPlayers] || null;
    }

    function updateImpostorDisplay() {
        const group = document.getElementById('impostorCountGroup');
        const hint = document.getElementById('impostorHint');
        const total = state.players.length;
        const rules = getImpostorRules(total);

        group.innerHTML = '';

        if (!rules) {
            hint.style.display = 'block';
            hint.innerText = total < 5
                ? 'Mínimo de 5 jogadores para jogar'
                : 'Máximo de 14 jogadores';
            group.style.display = 'none';
            return;
        }

        hint.style.display = 'none';
        group.style.display = 'flex';

        if (rules.fixed !== null) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chip-btn active';
            btn.innerText = `${rules.fixed}`;
            btn.style.cursor = 'default';
            group.appendChild(btn);
            state.impostorCount = rules.fixed;
        } else {
            rules.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'chip-btn' + (idx === 0 ? ' active' : '');
                btn.dataset.value = String(opt);
                btn.innerText = `${opt}`;
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state.impostorCount = opt;
                });
                group.appendChild(btn);
            });
            state.impostorCount = rules.options[0];
        }
    }

    // ============================================================
    // MODOS
    // ============================================================
    document.getElementById('modeLocalBtn').addEventListener('click', () => {
        showScreen('config');
    });

    document.getElementById('modeOnlineBtn').addEventListener('click', () => {
        comingSoonModal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    document.getElementById('comingSoonCloseBtn').addEventListener('click', () => {
        comingSoonModal.classList.add('hidden');
    });

    // ============================================================
    // CONFIGURAÇÃO — JOGADORES
    // ============================================================
    function addPlayerName() {
        const val = inputs.player.value.trim();
        if (val && !state.players.includes(val)) {
            if (state.players.length >= 14) {
                alert('Máximo de 14 jogadores!');
                return;
            }
            state.players.push(val);
            inputs.player.value = '';
            refreshPlayerList();
            updateImpostorDisplay();
        }
        inputs.player.focus();
    }

    function removePlayer(index) {
        state.players.splice(index, 1);
        refreshPlayerList();
        updateImpostorDisplay();
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
    // CONFIGURAÇÃO — SEGMENTED e TEMAS
    // ============================================================
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.impostorMode = btn.dataset.mode;
        });
    });

    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            if (state.selectedThemes.has(theme)) {
                state.selectedThemes.delete(theme);
                btn.classList.remove('active');
            } else {
                state.selectedThemes.add(theme);
                btn.classList.add('active');
            }
        });
    });

    // ============================================================
    // INICIAR PARTIDA
    // ============================================================
    document.getElementById('startGameBtn').addEventListener('click', () => {
        if (state.players.length < 5) {
            alert('Adicione pelo menos 5 jogadores!');
            return;
        }

        if (state.players.length > 14) {
            alert('Máximo de 14 jogadores!');
            return;
        }

        const rules = getImpostorRules(state.players.length);
        if (!rules) {
            alert('Número de jogadores inválido.');
            return;
        }

        if (state.selectedThemes.size === 0) {
            alert('Selecione pelo menos um tema!');
            return;
        }

        // O total de não-impostores precisa ser par (só assim dá pra formar duplas)
        const nonImpostors = state.players.length - state.impostorCount;
        if (nonImpostors % 2 !== 0) {
            alert('Com essa quantidade de impostores, sobra um número ímpar de jogadores normais. Escolha outra opção.');
            return;
        }

        state.revealIndex = 0;

        setupNewRound();
    });

    // ============================================================
    // SETUP DE NOVA RODADA
    // ============================================================
    function setupNewRound() {
        state.isTransitioning = false;
        state.isRolling = false;

        // 1) Sorteia impostores
        const shuffledPlayers = [...state.players].sort(() => Math.random() - 0.5);
        state.impostorNames = shuffledPlayers.slice(0, state.impostorCount);

        // 2) Não-impostores (número par garantido)
        const nonImpostors = state.players.filter(p => !state.impostorNames.includes(p));
        const shuffledNon = [...nonImpostors].sort(() => Math.random() - 0.5);

        // Quantas duplas vamos formar?
        const numPairs = Math.floor(shuffledNon.length / 2);

        // 3) Sorteia UMA dica (grupo) que tenha palavras suficientes
        //    para todas as duplas. Todas as duplas usarão palavras dessa dica.
        const hintPool = getHintGroupsForThemes();
        const eligibleHints = hintPool.filter(h => h.words.length >= numPairs);

        if (eligibleHints.length === 0) {
            alert('Não há uma dica com palavras suficientes para essa quantidade de duplas. Tente outro tema ou menos jogadores.');
            return;
        }

        const chosenHint = eligibleHints[Math.floor(Math.random() * eligibleHints.length)];

        // Embaralha as palavras dessa dica e pega numPairs
        const wordsForThisRound = shuffleArray(chosenHint.words).slice(0, numPairs);

        // 4) Divide em duplas, cada dupla com UMA palavra (da mesma dica)
        state.pairs = [];
        state.playerPairInfo = {};
        for (let i = 0; i < numPairs; i++) {
            const pairPlayers = [shuffledNon[i * 2], shuffledNon[i * 2 + 1]];
            const wordObj = wordsForThisRound[i];

            state.pairs.push({
                word: wordObj.word,
                hint: wordObj.hint,
                players: pairPlayers
            });

            pairPlayers.forEach(name => {
                state.playerPairInfo[name] = {
                    word: wordObj.word,
                    hint: wordObj.hint,
                    pairIndex: i
                };
            });
        }

        // Guarda a dica da rodada para o impostor receber
        state.currentHint = chosenHint.hint;

        // 5) Ordem de revelação
        state.revealOrder = [...state.players].sort(() => Math.random() - 0.5);
        state.revealIndex = 0;
        state.firstSpeaker = null;

        renderRevealScreen();
        showScreen('reveal');
    }

    // ============================================================
    // TELA DE REVELAÇÃO
    // ============================================================
    function renderRevealScreen() {
        const actorName = state.revealOrder[state.revealIndex];
        const isLast = state.revealIndex === state.revealOrder.length - 1;

        document.getElementById('revealActorName').innerText = actorName;
        document.getElementById('revealSub').innerText = isLast
            ? 'Última pessoa a ver!'
            : 'Passe o celular para ele(a)';

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

        const isImpostor = state.impostorNames.includes(actorName);

        if (isImpostor) {
            cardBack.classList.add('is-impostor');
            secretContent.classList.add('is-impostor-text');
            secretLabel.innerText = 'Você é';
            secretContent.innerText = 'IMPOSTOR';

            if (state.impostorMode === 'hint') {
                const hintEl = document.createElement('p');
                hintEl.className = 'card-back-hint';
                hintEl.innerText = `Dica: ${state.currentHint}`;
                cardBack.appendChild(hintEl);
            }
        } else {
            const info = state.playerPairInfo[actorName];
            secretLabel.innerText = 'Sua palavra';
            secretContent.innerText = info.word;
        }

        nextBtn.classList.add('hidden');
        nextBtn.innerHTML = isLast
            ? '<i data-lucide="arrow-right"></i> Sortear quem começa'
            : '<i data-lucide="arrow-right"></i> Passar';

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // CARD
    // ============================================================
    const cardSecret = document.getElementById('cardSecret');
    const CARD_FLIP_MS = 600;

    cardSecret.addEventListener('click', () => {
        if (cardSecret.classList.contains('flipped')) return;
        cardSecret.classList.add('flipped');
        document.getElementById('nextPlayerBtn').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    // ============================================================
    // BOTÃO "PASSAR"
    // ============================================================
    document.getElementById('nextPlayerBtn').addEventListener('click', () => {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        document.getElementById('nextPlayerBtn').classList.add('hidden');
        cardSecret.classList.remove('flipped');
        cardSecret.classList.add('animating');

        setTimeout(() => {
            state.revealIndex++;

            if (state.revealIndex >= state.revealOrder.length) {
                state.isTransitioning = false;
                startSortScreen();
            } else {
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
        const reveal = document.getElementById('resultReveal');
        reveal.innerHTML = '';

        // Dica da rodada
        const hintRow = document.createElement('div');
        hintRow.className = 'result-pair-row';
        hintRow.innerHTML = `
            <span class="result-pair-badge par-a">Dica da rodada</span>
            <div class="result-pair-names">
                <strong>${state.currentHint}</strong>
            </div>
        `;
        reveal.appendChild(hintRow);

        // Cada dupla secreta
        state.pairs.forEach((pair, idx) => {
            const row = document.createElement('div');
            row.className = 'result-pair-row';
            row.innerHTML = `
                <span class="result-pair-badge par-b">Dupla ${idx + 1}</span>
                <div class="result-pair-names">
                    ${pair.players.map(n => `<strong>${n}</strong>`).join('')}
                </div>
                <div class="result-pair-word">
                    <span class="word-label">Palavra:</span>${pair.word}
                </div>
            `;
            reveal.appendChild(row);
        });

        // Impostores
        const impRow = document.createElement('div');
        impRow.className = 'result-pair-row';
        impRow.innerHTML = `
            <span class="result-pair-badge impostor">Impostor(es)</span>
            <div class="result-pair-names">
                ${state.impostorNames.map(n => `<strong>${n}</strong>`).join('')}
            </div>
        `;
        reveal.appendChild(impRow);

        document.getElementById('resultTitle').innerText = 'Resultado da rodada';
        document.getElementById('resultSub').innerText = 'Agora discutam em voz alta e descubram suas duplas!';

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

    console.log('🎉 Quem é meu par? carregado com sucesso!');
});