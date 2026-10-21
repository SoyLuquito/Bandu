// Rally - Lobby de Party Games
// Versão 2.3

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    const cards = document.querySelectorAll('.game-card');
    const logo = document.getElementById('logo');
    const searchInput = document.getElementById('searchInput');
    const filterButton = document.getElementById('filterButton');
    const filterPanel = document.getElementById('filterPanel');
    const overlay = document.getElementById('cardOverlay');
    const modal = document.getElementById('cardModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const noResults = document.getElementById('noResults');

    // Elementos do modal "Em breve"
    const comingSoonModal = document.getElementById('comingSoonModal');
    const comingSoonCloseBtn = document.getElementById('comingSoonCloseBtn');

    // Elementos do modal "Apoie ou anuncie aqui"
    const adBanners = document.querySelectorAll('[data-ad-banner]');
    const adOverlay = document.getElementById('adOverlay');
    const adModal = document.getElementById('adModal');
    const adModalClose = document.getElementById('adModalClose');

    const adTabs = document.querySelectorAll('.ad-tab');
    const adPanels = document.querySelectorAll('.ad-tab-panel');

    // Anúncio
    const adEmailText = document.getElementById('adEmailText');
    const adCopyBtn = document.getElementById('adCopyBtn');
    const adCopiedMsg = document.getElementById('adCopiedMsg');

    // Apoio
    const adPixText = document.getElementById('adPixText');
    const adCopyPixBtn = document.getElementById('adCopyPixBtn');
    const adCopiedPixMsg = document.getElementById('adCopiedPixMsg');

    // ===== Gradientes contínuos: roda cromática de 16 cores =====
    // Cada card "avança" um passo na paleta, sem repetir e sem voltar.
    // Ordem: laranja → vermelho → rosa → roxo → azul → ciano → verde → amarelo → volta suave.
    // 16 tons únicos antes de repetir — e o 16º emenda perfeitamente no 1º,
    // criando a sensação de continuidade mesmo em ciclos longos.

    // Cores-âncora em HSL (matiz, saturação, luminosidade) — distribuição harmônica
    // pela roda cromática. Interpolamos matiz e mantemos sat/lum para coesão visual.
    const HUE_ANCHORS = [
        { h: 24,  s: 90, l: 72 }, // 0: laranja quente (início)
        { h: 350, s: 88, l: 70 }, // 1: vermelho-rosa
        { h: 330, s: 85, l: 70 }, // 2: rosa
        { h: 290, s: 78, l: 72 }, // 3: roxo-rosa
        { h: 260, s: 82, l: 74 }, // 4: roxo
        { h: 220, s: 85, l: 74 }, // 5: azul
        { h: 190, s: 78, l: 70 }, // 6: ciano
        { h: 150, s: 65, l: 68 }, // 7: verde
        { h: 95,  s: 70, l: 70 }, // 8: verde-amarelo
        { h: 55,  s: 92, l: 72 }, // 9: amarelo
        { h: 38,  s: 92, l: 72 }, // 10: amarelo-laranja
        { h: 18,  s: 90, l: 72 }, // 11: laranja
        { h: 5,   s: 88, l: 72 }, // 12: laranja-vermelho
        { h: 348, s: 88, l: 72 }, // 13: vermelho
        { h: 340, s: 86, l: 70 }, // 14: vermelho-rosa
        { h: 335, s: 84, l: 72 }  // 15: rosa (fecha suavemente no início)
    ];

    // Gera 16 gradientes diagonais únicos a partir das âncoras.
    // Cada card usa um par (cor i, cor i+1 ligeiramente mais escura) → sensação de "avanço".
    const CARD_GRADIENTS = HUE_ANCHORS.map((c, i) => {
        const next = HUE_ANCHORS[(i + 1) % HUE_ANCHORS.length];
        const c1 = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
        const c2 = `hsl(${next.h}, ${next.s}%, ${Math.max(next.l - 8, 40)}%)`;
        return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
    });

    // Aplica gradiente por índice (ciclando suavemente)
    cards.forEach((card, i) => {
        const bg = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
        card.dataset.bg = bg;
        const img = card.querySelector('.card-image');
        if (img) img.style.background = bg;
    });

    // ===== Banco de dados dos jogos (info que só aparece no modal) =====
    const GAMES_INFO = {
        '/jogos/acerteotempo/acerteotempo.html': {
            title: 'Acerte o Tempo',
            icon: 'timer',
            bg: 'linear-gradient(135deg, #FFC078 0%, #FF8FA3 100%)',
            players: '1+ jogadores',
            device: '1 dispositivo',
            description: 'Um tempo entre 0 e 12 segundos é sorteado secretamente. Aperte o botão para iniciar e tente parar no momento certo, confiando apenas na sua intuição!'
        },
        '/jogos/corescomdicas/corescomdicas.html': {
            title: 'Cores com Dicas',
            icon: 'palette',
            bg: 'linear-gradient(135deg, #FF8FA3 0%, #FFC078 100%)',
            players: '1 à 10 jogadores',
            device: '1 dispositivo ou Cada um no seu',
            description: 'Dê dicas com palavras para que os outros jogadores acertem a cor correta no tabuleiro. Quanto mais próximo, mais pontos!'
        },
        '/jogos/impostor/impostor.html': {
            title: 'Impostor',
            icon: 'user-x',
            bg: 'linear-gradient(135deg, #7BE495 0%, #6EC6FF 100%)',
            players: '4 à 10 jogadores',
            device: '1 dispositivo',
            description: 'Todos recebem a mesma palavra, exceto o impostor. Descubra quem é o impostor antes que ele te engane!'
        },
        '/jogos/mimica/mimica.html': {
            title: 'Mímica',
            icon: 'sparkles',
            bg: 'linear-gradient(135deg, #FFE066 0%, #FF9A8B 100%)',
            players: '4+ jogadores',
            device: '1 dispositivo',
            description: 'Faça mímica para que sua equipe adivinhe a palavra ou frase. Sem falar, sem sons, só gestos!'
        },
        '/jogos/eununca/eununca.html': {
            title: 'Eu Nunca',
            icon: 'message-circle',
            bg: 'linear-gradient(135deg, #C77DFF 0%, #FF7EB9 100%)',
            players: '3+ jogadores',
            device: '1 dispositivo',
            description: 'O jogo clássico de revelações! Diga algo que nunca fez e descubra quem já fez. Prepare-se para rir!'
        },
        '/jogos/codinomes/codinomes.html': {
            title: 'Codinomes',
            icon: 'search',
            bg: 'linear-gradient(135deg, #4DD0C8 0%, #7B9EFF 100%)',
            players: '4+ jogadores',
            device: 'Cada um no seu',
            description: 'Dê pistas para sua equipe encontrar as palavras secretas no tabuleiro, mas cuidado para não ajudar o time adversário!'
        },
        '/jogos/cidadedorme/cidadedorme.html': {
            title: 'Cidade Dorme',
            icon: 'moon',
            bg: 'linear-gradient(135deg, #6A8EEA 0%, #4DD0C8 100%)',
            players: '6+ jogadores',
            device: '1 dispositivo ou Cada um no seu',
            description: 'A cidade dorme, mas o assassino está acordado! Descubra quem está matando os cidadãos antes que seja tarde.'
        },
        '/jogos/sintonia/sintonia.html': {
            title: 'Sintonia',
            icon: 'activity',
            bg: 'linear-gradient(135deg, #FFB067 0%, #A8E063 100%)',
            players: '2+ jogadores',
            device: '1 dispositivo ou Cada um no seu',
            description: 'Dê uma dica para que sua equipe posicione o ponteiro no espectro entre dois opostos. Comunicação é tudo!'
        },
        '/jogos/meupar/meupar.html': {
            title: 'Quem é meu par?',
            icon: 'users',
            bg: 'linear-gradient(135deg, #B197FC 0%, #FF9A8B 100%)',
            players: '5+ jogadores',
            device: '1 dispositivo',
            description: 'Cada jogador recebe uma palavra secreta, compartilhada com sua dupla. O impostor não sabe a palavra e precisa blefar! Dê dicas, descubra sua dupla e desmascare o impostor. Cuidado: pode haver mais de um!'
        }
    };

    // ===== Estado dos filtros =====
    const filters = {
        players: 'any',
        device: 'any'
    };

    // ===== Animação de ondinha do logo + letras levitáveis =====
    const logoLetters = logo.querySelectorAll('[data-letter]');

    logoLetters.forEach(letter => {
        letter.addEventListener('click', (e) => {
            e.stopPropagation();
            letter.classList.toggle('lifted');
        });
    });

    function triggerWave() {
        logoLetters.forEach(letter => letter.classList.remove('lifted'));

        logo.classList.add('waving');
        setTimeout(() => {
            logo.classList.remove('waving');
        }, 1800);
    }

    setTimeout(() => {
        triggerWave();
        setInterval(triggerWave, 8000);
    }, 3000);

    // ===== Modal de jogo =====
    function openModal(card) {
        const gameUrl = card.dataset.game;

        // Cores com Dicas está "Em breve" — mostra modal especial
        if (gameUrl === 'corescomdicas.html') {
            comingSoonModal.style.display = 'flex';
            if (window.lucide) lucide.createIcons();
            return;
        }

        const info = GAMES_INFO[gameUrl];

        if (!info) return;

        const bg = card.dataset.bg || info.bg;

        modalContent.innerHTML = `
            <div class="card-image" style="background: ${bg};">
                <i data-lucide="${info.icon}" class="card-icon"></i>
            </div>
            <h2 class="card-title">${info.title}</h2>
            <div class="modal-details">
                <div class="detail-item">
                    <i data-lucide="users" class="detail-icon"></i>
                    <span>${info.players}</span>
                </div>
                <div class="detail-item">
                    <i data-lucide="smartphone" class="detail-icon"></i>
                    <span>${info.device}</span>
                </div>
                <p class="card-description">${info.description}</p>
                <button class="play-button" id="modalPlayButton">Jogar</button>
            </div>
        `;

        if (window.lucide) {
            lucide.createIcons();
        }

        document.getElementById('modalPlayButton').addEventListener('click', () => {
            window.location.href = gameUrl;
        });

        overlay.classList.add('open');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('open');
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            openModal(card);
        });
    });

    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // ===== Fecha o modal "Em breve" =====
    comingSoonCloseBtn.addEventListener('click', () => {
        comingSoonModal.style.display = 'none';
    });

    comingSoonModal.addEventListener('click', (e) => {
        if (e.target === comingSoonModal) {
            comingSoonModal.style.display = 'none';
        }
    });

    // ===== Painel de filtros =====
    filterButton.addEventListener('click', () => {
        filterPanel.classList.toggle('open');
        filterButton.classList.toggle('active');
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const group = chip.closest('.filter-options');
            const filterType = group.dataset.filter;

            group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            filters[filterType] = chip.dataset.value;
            applyFilters();
        });
    });

    // ===== Busca =====
    searchInput.addEventListener('input', applyFilters);

    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.dataset.title || '';
            const playersMin = parseInt(card.dataset.playersMin || '0', 10);
            const devices = (card.dataset.device || '').split(' ');

            const matchesSearch = searchTerm === '' || title.includes(searchTerm);

            let matchesPlayers = true;
            if (filters.players !== 'any') {
                const minRequired = parseInt(filters.players, 10);
                matchesPlayers = playersMin <= minRequired;
            }

            let matchesDevice = true;
            if (filters.device !== 'any') {
                matchesDevice = devices.includes(filters.device);
            }

            if (matchesSearch && matchesPlayers && matchesDevice) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // ===== Modal "Apoie ou anuncie aqui" =====
    function openAdModal() {
        adOverlay.classList.add('open');
        adModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeAdModal() {
        adOverlay.classList.remove('open');
        adModal.classList.remove('open');
        document.body.style.overflow = '';

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

    // Troca de abas
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

    // Função utilitária de cópia com fallback
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

    // Copiar e-mail de contato (aba Anuncie)
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

    // Copiar chave Pix (aba Apoie)
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

    // ===== Fecha modais com Esc =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeAdModal();
            comingSoonModal.style.display = 'none';
        }
    });

    console.log('🎉 Rally carregado com sucesso!');
});