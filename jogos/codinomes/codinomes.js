// Rally - Codinomes (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

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
        "Xilofone","Zíper","Zona","Zoológico",
    ];

    // ============================================================
    // ESTADO
    // ============================================================
    const state = {
        teamA: { players: [], decoder: null, agentIndex: 0, score: 0 },
        teamB: { players: [], decoder: null, agentIndex: 0, score: 0 },

        board: [],
        currentTeam: 'A',       // 'A' ou 'B'
        phase: 'clue',          // 'clue' | 'guess' | 'revealing' | 'over'

        currentClue: null,
        remainingGuesses: 0,
        justRevealedIndex: -1,  // índice da carta recém-revelada (para animar só ela)

        winner: null
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        home: document.getElementById('homeScreen'),
        config: document.getElementById('configScreen'),
        rolePick: document.getElementById('rolePickScreen'),
        handoffAgent: document.getElementById('handoffAgentScreen'),
        agentBoard: document.getElementById('agentBoardScreen'),
        handoffDecoder: document.getElementById('handoffDecoderScreen'),
        decoderBoard: document.getElementById('decoderBoardScreen'),
        gameOver: document.getElementById('gameOverScreen')
    };

    const inputs = {
        teamA: document.getElementById('teamAInput'),
        teamB: document.getElementById('teamBInput')
    };

    const lists = {
        teamA: document.getElementById('teamAList'),
        teamB: document.getElementById('teamBList')
    };

    const exitModal = document.getElementById('exitModal');
    const comingSoonModal = document.getElementById('comingSoonModal');
    const scoreModal = document.getElementById('scoreModal');

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
    // MENU
    // ============================================================
    document.getElementById('modeLocalBtn').addEventListener('click', () => {
        showScreen('config');
        renderConfig();
    });

    document.getElementById('modeOnlineBtn').addEventListener('click', () => {
        comingSoonModal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    document.getElementById('comingSoonCloseBtn').addEventListener('click', () => {
        comingSoonModal.classList.add('hidden');
    });

    // ============================================================
    // CONFIGURAÇÃO DE EQUIPES
    // ============================================================
    function renderConfig() {
        lists.teamA.innerHTML = '';
        state.teamA.players.forEach((name, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `<span>${name}</span><button type="button">&times;</button>`;
            li.querySelector('button').addEventListener('click', () => {
                state.teamA.players.splice(i, 1);
                renderConfig();
            });
            lists.teamA.appendChild(li);
        });

        lists.teamB.innerHTML = '';
        state.teamB.players.forEach((name, i) => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.innerHTML = `<span>${name}</span><button type="button">&times;</button>`;
            li.querySelector('button').addEventListener('click', () => {
                state.teamB.players.splice(i, 1);
                renderConfig();
            });
            lists.teamB.appendChild(li);
        });

        const totalA = state.teamA.players.length;
        const totalB = state.teamB.players.length;

        const hint = document.getElementById('teamsHint');
        if (totalA < 2 || totalB < 2) {
            hint.innerText = `Cada equipe precisa de pelo menos 2 jogadores. Azul: ${totalA}, Vermelha: ${totalB}.`;
        } else {
            hint.innerText = `Pronto! ${totalA} na azul e ${totalB} na vermelha.`;
        }

        const startBtn = document.getElementById('startGameBtn');
        startBtn.disabled = !(totalA >= 2 && totalB >= 2);

        if (window.lucide) lucide.createIcons();
    }

    function addPlayerToTeam(teamKey, inputEl) {
        const val = inputEl.value.trim();
        if (!val) return;
        const team = state[teamKey];
        if (team.players.includes(val)) {
            alert('Já tem alguém com esse nome nessa equipe.');
            return;
        }
        team.players.push(val);
        inputEl.value = '';
        renderConfig();
        inputEl.focus();
    }

    ['addTeamABtn', 'addTeamBBtn'].forEach(id => {
        const btn = document.getElementById(id);
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.click();
        });
    });

    document.getElementById('addTeamABtn').addEventListener('click', () => {
        addPlayerToTeam('teamA', inputs.teamA);
    });
    document.getElementById('addTeamBBtn').addEventListener('click', () => {
        addPlayerToTeam('teamB', inputs.teamB);
    });

    inputs.teamA.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addTeamABtn').click(); }
    });
    inputs.teamB.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addTeamBBtn').click(); }
    });

    document.getElementById('randomizeTeamsBtn').addEventListener('click', () => {
        const all = [...state.teamA.players, ...state.teamB.players];
        if (all.length < 4) {
            alert('Adicione pelo menos 4 jogadores para embaralhar!');
            return;
        }
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        const mid = Math.floor(all.length / 2);
        state.teamA.players = all.slice(0, mid);
        state.teamB.players = all.slice(mid);
        renderConfig();
    });

    document.getElementById('startGameBtn').addEventListener('click', () => {
        if (state.teamA.players.length < 2 || state.teamB.players.length < 2) {
            alert('Cada equipe precisa de pelo menos 2 jogadores.');
            return;
        }
        state.teamA.decoder = null;
        state.teamB.decoder = null;
        renderRolePick();
        showScreen('rolePick');
    });

    // ============================================================
    // ESCOLHA DO DECODIFICADOR
    // ============================================================
    function renderRolePick() {
        const listA = document.getElementById('rolePickA');
        const listB = document.getElementById('rolePickB');
        listA.innerHTML = '';
        listB.innerHTML = '';

        state.teamA.players.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'role-pick-btn' + (state.teamA.decoder === name ? ' selected' : '');
            btn.innerText = name;
            btn.addEventListener('click', () => {
                state.teamA.decoder = name;
                renderRolePick();
            });
            listA.appendChild(btn);
        });

        state.teamB.players.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'role-pick-btn' + (state.teamB.decoder === name ? ' selected' : '');
            btn.innerText = name;
            btn.addEventListener('click', () => {
                state.teamB.decoder = name;
                renderRolePick();
            });
            listB.appendChild(btn);
        });

        const confirmBtn = document.getElementById('confirmRolesBtn');
        confirmBtn.disabled = !(state.teamA.decoder && state.teamB.decoder);

        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('confirmRolesBtn').addEventListener('click', () => {
        if (!state.teamA.decoder || !state.teamB.decoder) return;

        state.teamA.agentIndex = state.teamA.players.findIndex(n => n !== state.teamA.decoder);
        if (state.teamA.agentIndex < 0) state.teamA.agentIndex = 0;
        state.teamB.agentIndex = state.teamB.players.findIndex(n => n !== state.teamB.decoder);
        if (state.teamB.agentIndex < 0) state.teamB.agentIndex = 0;

        state.currentTeam = Math.random() < 0.5 ? 'A' : 'B';
        state.phase = 'clue';
        state.currentClue = null;
        state.remainingGuesses = 0;
        state.justRevealedIndex = -1;
        state.winner = null;

        buildBoard();
        goToHandoffAgent();
    });

    // ============================================================
    // TABULEIRO — CONSTRUÇÃO
    // ============================================================
    function buildBoard() {
        const shuffled = [...WORDS_POOL].sort(() => Math.random() - 0.5);
        const unique = [];
        const seen = new Set();
        for (const w of shuffled) {
            if (!seen.has(w)) {
                seen.add(w);
                unique.push(w);
            }
            if (unique.length === 25) break;
        }

        const colors = [];
        for (let i = 0; i < 9; i++) colors.push('azul');
        for (let i = 0; i < 9; i++) colors.push('vermelho');
        for (let i = 0; i < 6; i++) colors.push('branco');
        colors.push('preto');
        const shuffledColors = colors.sort(() => Math.random() - 0.5);

        state.board = unique.map((word, i) => ({
            word,
            color: shuffledColors[i],
            revealed: false
        }));

        state.teamA.score = 0;
        state.teamB.score = 0;
        state.justRevealedIndex = -1;
    }

    // ============================================================
    // AGENTE / DECODIFICADOR DA VEZ
    // ============================================================
    function getCurrentAgent() {
        const team = state.currentTeam === 'A' ? state.teamA : state.teamB;
        return team.players[team.agentIndex % team.players.length];
    }

    function getCurrentDecoder() {
        const team = state.currentTeam === 'A' ? state.teamA : state.teamB;
        return team.decoder;
    }

    // ============================================================
    // HANDOFF — IR PARA O AGENTE
    // ============================================================
    function goToHandoffAgent() {
        const teamIsA = state.currentTeam === 'A';
        const teamName = teamIsA ? 'Equipe Azul' : 'Equipe Vermelha';
        const agent = getCurrentAgent();

        const badge = document.getElementById('handoffAgentTeam');
        badge.className = 'handoff-badge ' + (teamIsA ? 'team-a' : 'team-b');
        badge.innerText = teamName;

        document.getElementById('handoffAgentSub').innerText = 'Para o agente da equipe';
        document.getElementById('handoffAgentName').innerText = agent;

        state.phase = 'clue';
        showScreen('handoffAgent');
        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('confirmAgentBtn').addEventListener('click', () => {
        renderAgentBoard();
        showScreen('agentBoard');
    });

    // ============================================================
    // TABULEIRO — MODO AGENTE (vê as cores)
    // ============================================================
    function renderAgentBoard() {
        const teamIsA = state.currentTeam === 'A';
        const teamName = teamIsA ? 'Equipe Azul' : 'Equipe Vermelha';
        const agent = getCurrentAgent();

        const turnBar = document.getElementById('agentTurnBar');
        turnBar.className = 'turn-bar ' + (teamIsA ? 'team-a' : 'team-b');
        document.getElementById('agentTeamLabel').innerText = teamName;
        document.getElementById('agentRoleLabel').innerText = `Agente: ${agent}`;
        document.getElementById('agentInstruction').innerText =
            `Este é o tabuleiro com as cores. Escolha uma dica e um número.`;

        const grid = document.getElementById('agentBoardGrid');
        grid.innerHTML = '';
        state.board.forEach((card, index) => {
            const div = document.createElement('div');
            div.className = 'board-card color-' + card.color;
            if (card.revealed) {
                div.classList.add('revealed', card.color);
                if (index === state.justRevealedIndex) {
                    div.classList.add('just-revealed');
                }
            }
            div.innerText = card.word;
            grid.appendChild(div);
        });

        document.getElementById('agentScoreA').innerText = `${state.teamA.score}/9`;
        document.getElementById('agentScoreB').innerText = `${state.teamB.score}/9`;

        document.getElementById('clueWordInput').value = '';
        document.getElementById('clueNumberInput').value = '1';

        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('giveClueBtn').addEventListener('click', () => {
        if (state.phase !== 'clue') return;

        const wordInput = document.getElementById('clueWordInput');
        const numberInput = document.getElementById('clueNumberInput');

        const clueWord = wordInput.value.trim();
        const clueNum = parseInt(numberInput.value, 10);

        if (!clueWord) { alert('Digite uma dica.'); return; }
        if (!clueNum || clueNum < 1 || clueNum > 9) {
            alert('Escolha um número entre 1 e 9.');
            return;
        }

        state.currentClue = { word: clueWord, number: clueNum };
        state.phase = 'guess';

        goToHandoffDecoder();
    });

    // ============================================================
    // HANDOFF — IR PARA O DECODIFICADOR
    // ============================================================
    function goToHandoffDecoder() {
        const teamIsA = state.currentTeam === 'A';
        const teamName = teamIsA ? 'Equipe Azul' : 'Equipe Vermelha';
        const decoder = getCurrentDecoder();

        const badge = document.getElementById('handoffDecoderTeam');
        badge.className = 'handoff-badge ' + (teamIsA ? 'team-a' : 'team-b');
        badge.innerText = teamName;

        document.getElementById('handoffDecoderSub').innerText = 'Para o decodificador da equipe';
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

    // ============================================================
    // TABULEIRO — MODO DECODIFICADOR (sem cores, clicável)
    // ============================================================
    function renderDecoderBoard() {
        const teamIsA = state.currentTeam === 'A';
        const teamName = teamIsA ? 'Equipe Azul' : 'Equipe Vermelha';
        const decoder = getCurrentDecoder();

        const turnBar = document.getElementById('decoderTurnBar');
        turnBar.className = 'turn-bar ' + (teamIsA ? 'team-a' : 'team-b');
        document.getElementById('decoderTeamLabel').innerText = teamName;
        document.getElementById('decoderRoleLabel').innerText = `Decodificador: ${decoder}`;

        document.getElementById('clueText').innerText = state.currentClue.word;
        document.getElementById('clueNumber').innerText = state.currentClue.number;

        if (state.phase === 'revealing') {
            document.getElementById('decoderInstruction').innerText =
                'A carta foi revelada! Veja a cor…';
        } else if (state.phase === 'guess') {
            document.getElementById('decoderInstruction').innerText =
                'Clique nas cartas que você acha que combinam com a dica. Se acertar a sua cor, continua jogando!';
        } else {
            document.getElementById('decoderInstruction').innerText =
                'Clique nas cartas que você acha que combinam com a dica.';
        }

        const grid = document.getElementById('decoderBoardGrid');
        grid.innerHTML = '';
        grid.classList.add('decoder-board');

        state.board.forEach((card, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';

            if (card.revealed) {
                // Carta já revelada (de turnos anteriores ou agora)
                let classes = 'board-card revealed ' + card.color;
                // Só a carta recém-virada ganha a animação
                if (index === state.justRevealedIndex) {
                    classes += ' just-revealed';
                }
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

        document.getElementById('decoderScoreA').innerText = `${state.teamA.score}/9`;
        document.getElementById('decoderScoreB').innerText = `${state.teamB.score}/9`;

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // CLIQUE DO DECODIFICADOR
    // ============================================================
    function handleGuess(index) {
        if (state.phase !== 'guess') return;
        const card = state.board[index];
        if (!card || card.revealed) return;

        // Bloqueia cliques adicionais enquanto a animação roda
        state.phase = 'revealing';

        card.revealed = true;
        // Marca SÓ esta carta para animar
        state.justRevealedIndex = index;

        const teamIsA = state.currentTeam === 'A';

        // Atualiza placar
        if (card.color === 'azul') state.teamA.score++;
        if (card.color === 'vermelho') state.teamB.score++;

        // Re-renderiza imediatamente para a animação de flip acontecer
        renderDecoderBoard();

        // Preto → fim de jogo imediato (mas com 1.8s para ver a carta)
        if (card.color === 'preto') {
            state.winner = teamIsA ? 'B' : 'A';
            setTimeout(() => {
                state.phase = 'over';
                state.justRevealedIndex = -1;
                renderGameOver();
            }, 1800);
            return;
        }

        // Vitórias por revelar todas
        if (state.teamA.score >= 9) {
            state.winner = 'A';
            setTimeout(() => {
                state.phase = 'over';
                state.justRevealedIndex = -1;
                renderGameOver();
            }, 1800);
            return;
        }
        if (state.teamB.score >= 9) {
            state.winner = 'B';
            setTimeout(() => {
                state.phase = 'over';
                state.justRevealedIndex = -1;
                renderGameOver();
            }, 1800);
            return;
        }

        // Regra: se virou a própria cor, continua jogando
        const ownColor = teamIsA ? 'azul' : 'vermelho';

        if (card.color === ownColor) {
            // Continua jogando — libera cliques de novo após animação
            setTimeout(() => {
                if (state.phase === 'revealing') {
                    state.phase = 'guess';
                    state.justRevealedIndex = -1; // já animou, pode limpar
                    renderDecoderBoard();
                }
            }, 700);
        } else {
            // Acertou branco ou cor adversária → passa a vez
            setTimeout(() => {
                if (state.phase === 'revealing') {
                    state.justRevealedIndex = -1;
                    endTurn();
                }
            }, 1500);
        }
    }

    // Passar a vez manualmente
    document.getElementById('passTurnBtn').addEventListener('click', () => {
        if (state.phase !== 'guess') return;
        endTurn();
    });

    function endTurn() {
        // Troca a equipe
        state.currentTeam = state.currentTeam === 'A' ? 'B' : 'A';

        // Avança o agente da nova equipe
        const team = state.currentTeam === 'A' ? state.teamA : state.teamB;
        team.agentIndex = (team.agentIndex + 1) % team.players.length;

        state.currentClue = null;
        state.remainingGuesses = 0;
        state.phase = 'clue';
        state.justRevealedIndex = -1;

        goToHandoffAgent();
    }

    // ============================================================
    // FIM DE JOGO
    // ============================================================
    function renderGameOver() {
        showScreen('gameOver');

        const title = document.getElementById('resultTitle');
        const sub = document.getElementById('resultSub');
        const icon = document.getElementById('resultIcon');

        if (state.winner === 'A') {
            title.innerText = 'Equipe Azul venceu!';
            sub.innerText = 'Revelaram todas as cartas azuis ou encontraram a preta do outro time.';
            icon.className = 'result-icon azul';
        } else {
            title.innerText = 'Equipe Vermelha venceu!';
            sub.innerText = 'Revelaram todas as cartas vermelhas ou encontraram a preta do outro time.';
            icon.className = 'result-icon vermelho';
        }

        if (window.confetti) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('rematchBtn').addEventListener('click', () => {
        state.currentTeam = Math.random() < 0.5 ? 'A' : 'B';
        state.phase = 'clue';
        state.currentClue = null;
        state.remainingGuesses = 0;
        state.justRevealedIndex = -1;
        state.winner = null;
        state.teamA.score = 0;
        state.teamB.score = 0;
        buildBoard();
        goToHandoffAgent();
    });

    document.getElementById('backToConfigBtn').addEventListener('click', () => {
        renderConfig();
        showScreen('config');
    });

    // ============================================================
    // PLACAR AO VIVO
    // ============================================================
    function openLiveScore() {
        const content = document.getElementById('liveScoreContent');
        content.innerHTML = `
            <div class="live-score-row team-a"><span>Equipe Azul</span><span>${state.teamA.score}/9</span></div>
            <div class="live-score-row team-b"><span>Equipe Vermelha</span><span>${state.teamB.score}/9</span></div>
            <div class="live-score-row" style="color:var(--texto-suave);font-size:0.8rem;margin-top:0.5rem">
                <span>Vez de</span><span>${state.currentTeam === 'A' ? 'Azul' : 'Vermelha'}</span>
            </div>
        `;
        scoreModal.classList.remove('hidden');
    }

    document.getElementById('liveScoreBtn').addEventListener('click', openLiveScore);
    document.getElementById('liveScoreBtnDecoder').addEventListener('click', openLiveScore);

    document.getElementById('closeScoreModalBtn').addEventListener('click', () => {
        scoreModal.classList.add('hidden');
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

    console.log('🎉 Codinomes carregado com sucesso!');
});