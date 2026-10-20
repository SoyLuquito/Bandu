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
        "Faca","Fada","Fantasma","Faca","Fênix","Ferro","Festa","Fita","Flor","Fogo",
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
        "Vermelho","Vidro","Vinho","Violino","Vulcão","Zebra","Zumbi"
    ];

    // ============================================================
    // ESTADO
    // ============================================================
    const state = {
        teamA: { players: [], decoder: null, agentIndex: 0, score: 0 },
        teamB: { players: [], decoder: null, agentIndex: 0, score: 0 },

        // Tabuleiro
        board: [], // [{ word, color, revealed }]
        currentTeam: 'A', // 'A' ou 'B'
        phase: 'clue', // 'clue' | 'guess' | 'over'

        currentClue: null, // { word, number }
        remainingGuesses: 0,

        winner: null, // 'A' | 'B'

        isTransitioning: false
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        home: document.getElementById('homeScreen'),
        config: document.getElementById('configScreen'),
        rolePick: document.getElementById('rolePickScreen'),
        board: document.getElementById('boardScreen'),
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
        // Equipe A
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

        // Equipe B
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
        const total = totalA + totalB;

        const hint = document.getElementById('teamsHint');
        if (totalA < 2 || totalB < 2) {
            hint.innerText = `Cada equipe precisa de pelo menos 2 jogadores. Azul: ${totalA}, Vermelha: ${totalB}.`;
        } else if (total < 4) {
            hint.innerText = 'Adicione pelo menos 4 jogadores no total.';
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

    // Evita perder o foco do input no mobile (mesmo padrão dos outros jogos)
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

    // Embaralhar equipes (junta todos e divide aleatoriamente)
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

    // Iniciar → escolher decodificadores
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

        // Inicializa estado dos agentes
        state.teamA.agentIndex = state.teamA.players.findIndex(n => n !== state.teamA.decoder);
        if (state.teamA.agentIndex < 0) state.teamA.agentIndex = 0;
        state.teamB.agentIndex = state.teamB.players.findIndex(n => n !== state.teamB.decoder);
        if (state.teamB.agentIndex < 0) state.teamB.agentIndex = 0;

        // Sorteia quem começa
        state.currentTeam = Math.random() < 0.5 ? 'A' : 'B';
        state.phase = 'clue';
        state.currentClue = null;
        state.remainingGuesses = 0;
        state.winner = null;
        state.isTransitioning = false;

        buildBoard();
        renderBoard();
        showScreen('board');
    });

    // ============================================================
    // TABULEIRO
    // ============================================================
    function buildBoard() {
        // Embaralha o pool e pega 25 palavras únicas
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

        // Define as cores: 9 azuis, 9 vermelhas, 6 brancas, 1 preta
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
    }

    function renderBoard() {
        const grid = document.getElementById('boardGrid');
        grid.innerHTML = '';

        state.board.forEach((card, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-card';
            btn.innerText = card.word;

            if (card.revealed) {
                btn.classList.add('revealed', card.color);
                btn.disabled = true;
            } else {
                // Só habilita clique se for a vez do decodificador
                if (state.phase === 'guess' && isDecoderTurn()) {
                    btn.addEventListener('click', () => handleGuess(index));
                } else {
                    btn.disabled = true;
                }
            }

            grid.appendChild(btn);
        });

        // Atualiza placar
        document.getElementById('scoreA').innerText = `${state.teamA.score}/9`;
        document.getElementById('scoreB').innerText = `${state.teamB.score}/9`;

        updateTurnUI();
    }

    function updateTurnUI() {
        const turnBar = document.getElementById('turnBar');
        const teamLabel = document.getElementById('turnTeamLabel');
        const roleLabel = document.getElementById('turnRoleLabel');
        const instruction = document.getElementById('boardInstruction');
        const clueDisplay = document.getElementById('clueDisplay');
        const clueText = document.getElementById('clueText');
        const clueNumber = document.getElementById('clueNumber');
        const agentArea = document.getElementById('agentArea');
        const decoderArea = document.getElementById('decoderArea');

        const teamIsA = state.currentTeam === 'A';
        const team = teamIsA ? state.teamA : state.teamB;
        const teamName = teamIsA ? 'Equipe Azul' : 'Equipe Vermelha';

        turnBar.className = 'turn-bar ' + (teamIsA ? 'team-a' : 'team-b');
        teamLabel.innerText = teamName;

        if (state.phase === 'over') {
            roleLabel.innerText = 'Fim de jogo';
            instruction.innerText = 'A partida terminou.';
            agentArea.classList.add('hidden');
            decoderArea.classList.add('hidden');
            clueDisplay.classList.add('hidden');
            return;
        }

        const agentName = team.players[team.agentIndex % team.players.length];

        if (state.phase === 'clue') {
            roleLabel.innerText = `Agente: ${agentName}`;
            instruction.innerText = `Passe o celular para ${agentName}. Escolha uma dica e um número.`;
            agentArea.classList.remove('hidden');
            decoderArea.classList.add('hidden');
            clueDisplay.classList.add('hidden');
            document.getElementById('clueWordInput').value = '';
            document.getElementById('clueNumberInput').value = '1';
        } else if (state.phase === 'guess') {
            roleLabel.innerText = `Decodificador: ${team.decoder}`;
            instruction.innerText = `Passe o celular para ${team.decoder}. Clique nas cartas certas!`;
            agentArea.classList.add('hidden');
            decoderArea.classList.remove('hidden');
            clueDisplay.classList.remove('hidden');
            clueText.innerText = state.currentClue.word;
            clueNumber.innerText = state.currentClue.number;
        }
    }

    function isDecoderTurn() {
        // No modo 1 dispositivo, sempre é a vez do decodificador local quando estamos em 'guess'
        return state.phase === 'guess';
    }

    // ============================================================
    // AÇÃO DO AGENTE — DAR DICA
    // ============================================================
    document.getElementById('giveClueBtn').addEventListener('click', () => {
        if (state.phase !== 'clue') return;

        const wordInput = document.getElementById('clueWordInput');
        const numberInput = document.getElementById('clueNumberInput');

        const clueWord = wordInput.value.trim();
        const clueNum = parseInt(numberInput.value, 10);

        if (!clueWord) {
            alert('Digite uma dica.');
            return;
        }

        if (!clueNum || clueNum < 1 || clueNum > 9) {
            alert('Escolha um número entre 1 e 9.');
            return;
        }

        state.currentClue = { word: clueWord, number: clueNum };
        state.remainingGuesses = clueNum + 1; // regra clássica: número + 1 tentativas
        state.phase = 'guess';

        renderBoard();
    });

    // ============================================================
    // AÇÃO DO DECODIFICADOR — CLICAR NAS CARTAS
    // ============================================================
    function handleGuess(index) {
        if (state.phase !== 'guess') return;
        const card = state.board[index];
        if (!card || card.revealed) return;

        const teamIsA = state.currentTeam === 'A';
        card.revealed = true;

        // Atualiza placar
        if (card.color === 'azul') state.teamA.score++;
        if (card.color === 'vermelho') state.teamB.score++;

        // Verificações de fim de jogo
        if (card.color === 'preto') {
            state.winner = teamIsA ? 'B' : 'A';
            state.phase = 'over';
            renderBoard();
            renderGameOver();
            return;
        }

        // Venceu por revelar todas
        if (state.teamA.score >= 9) {
            state.winner = 'A';
            state.phase = 'over';
            renderBoard();
            renderGameOver();
            return;
        }
        if (state.teamB.score >= 9) {
            state.winner = 'B';
            state.phase = 'over';
            renderBoard();
            renderGameOver();
            return;
        }

        // Regras de turno
        // Se virou uma carta da própria equipe, continua jogando
        // Se virou uma carta da equipe oponente ou branca, passa a vez
        const ownColor = teamIsA ? 'azul' : 'vermelho';

        if (card.color === ownColor) {
            state.remainingGuesses--;
            if (state.remainingGuesses <= 0) {
                endTurn();
            } else {
                renderBoard();
            }
        } else {
            // Carta neutra ou da equipe adversária → passa a vez
            endTurn();
        }
    }

    function endTurn() {
        // Passa a vez para a outra equipe e avança o agente
        if (state.currentTeam === 'A') {
            state.currentTeam = 'B';
        } else {
            state.currentTeam = 'A';
        }

        const team = state.currentTeam === 'A' ? state.teamA : state.teamB;
        team.agentIndex = (team.agentIndex + 1) % team.players.length;

        state.currentClue = null;
        state.remainingGuesses = 0;
        state.phase = 'clue';

        renderBoard();
    }

    // Passar a vez manualmente
    document.getElementById('passTurnBtn').addEventListener('click', () => {
        if (state.phase !== 'guess') return;
        endTurn();
    });

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
        // Reinicia mantendo equipes e decodificadores
        state.currentTeam = Math.random() < 0.5 ? 'A' : 'B';
        state.phase = 'clue';
        state.currentClue = null;
        state.remainingGuesses = 0;
        state.winner = null;
        state.teamA.score = 0;
        state.teamB.score = 0;
        buildBoard();
        renderBoard();
        showScreen('board');
    });

    document.getElementById('backToConfigBtn').addEventListener('click', () => {
        renderConfig();
        showScreen('config');
    });

    // ============================================================
    // PLACAR AO VIVO
    // ============================================================
    document.getElementById('liveScoreBtn').addEventListener('click', () => {
        const content = document.getElementById('liveScoreContent');
        content.innerHTML = `
            <div class="live-score-row team-a"><span>Equipe Azul</span><span>${state.teamA.score}/9</span></div>
            <div class="live-score-row team-b"><span>Equipe Vermelha</span><span>${state.teamB.score}/9</span></div>
            <div class="live-score-row" style="color:var(--texto-suave);font-size:0.8rem;margin-top:0.5rem">
                <span>Vez de</span><span>${state.currentTeam === 'A' ? 'Azul' : 'Vermelha'}</span>
            </div>
        `;
        scoreModal.classList.remove('hidden');
    });

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