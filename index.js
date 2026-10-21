// Rally - Lobby de Party Games
// Versão 2.6

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os ícones do Lucide (com proteção contra falha do CDN)
    try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn('[Rally] Lucide não carregou:', e);
    }

    // ============================================================
    // ★ VERSÃO DO SITE — atualize esta string a cada deploy ★
    // (Não é possível ler o nome do deploy automaticamente na Vercel;
    //  atualize manualmente aqui a cada nova versão publicada.)
    // ============================================================
    const SITE_VERSION = 'v0.2.6.6';

    // ============================================================
    // ★ DEVLOG — últimas atualizações (mais recente no topo) ★
    // Mostra apenas as 5 primeiras entradas.
    // ============================================================
    const DEVLOG = [
        {
            version: 'v0.2.6.6',
            date: '21/10/2026',
            items: [
                'Adicionado o Devlog acessível pelo botão no rodapé.',
                'Versão do site agora aparece no rodapé.',
                'Filtro de jogadores virou slider de 1 a 10.'
            ]
        },
        {
            version: 'v0.2.6.5.1',
            date: '20/10/2026',
            items: [
                'Adicionado o jogo "Acerte o Tempo".',
                'Tela de "Em breve" ao clicar em "Cores com Dicas".'
            ]
        }
    ];

    // ============================================================
    // Aplica a versão no rodapé
    // ============================================================
    const footerVersionEl = document.getElementById('footerVersion');
    if (footerVersionEl) {
        footerVersionEl.textContent = SITE_VERSION;
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

    // Elementos do Devlog
    const devlogModal = document.getElementById('devlogModal');
    const devlogList = document.getElementById('devlogList');
    const openDevlogBtn = document.getElementById('openDevlogBtn');
    const devlogCloseBtn = document.getElementById('devlogCloseBtn');
    const devlogCloseBtnBottom = document.getElementById('devlogCloseBtnBottom');

    // Elementos do slider de jogadores
    const playersSlider = document.getElementById('playersSlider');
    const playersTicks = document.getElementById('playersTicks');
    const playersLabel = document.getElementById('playersLabel');

    // ============================================================
    // Slider de jogadores — gera as marcações 1..10
    // ============================================================
    if (playersTicks) {
        playersTicks.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            span.dataset.value = String(i);
            playersTicks.appendChild(span);
        }
    }

    function updatePlayersSliderUI(value) {
        // Pinta a parte preenchida da barra proporcionalmente
        const min = parseInt(playersSlider.min, 10);
        const max = parseInt(playersSlider.max, 10);
        const percent = ((value - min) / (max - min)) * 100;
        playersSlider.style.backgroundSize = `${percent}% 100%`;

        // Atualiza o texto
        if (value <= 1) {
            playersLabel.textContent = 'Qualquer quantidade';
        } else {
            playersLabel.textContent = `${value}+ jogadores`;
        }

        // Marca os ticks ativos (≤ valor escolhido)
        if (playersTicks) {
            playersTicks.querySelectorAll('span').forEach(span => {
                const v = parseInt(span.dataset.value, 10);
                span.classList.toggle('active', v <= value);
            });
        }
    }

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
    const HUE_ANCHORS = [
        { h: 24,  s: 90, l: 72 },
        { h: 350, s: 88, l: 70 },
        { h: 330, s: 85, l: 70 },
        { h: 290, s: 78, l: 72 },
        { h: 260, s: 82, l: 74 },
        { h: 220, s: 85, l: 74 },
        { h: 190, s: 78, l: 70 },
        { h: 150, s: 65, l: 68 },
        { h: 95,  s: 70, l: 70 },
        { h: 55,  s: 92, l: 72 },
        { h: 38,  s: 92, l: 72 },
        { h: 18,  s: 90, l: 72 },
        { h: 5,   s: 88, l: 72 },
        { h: 348, s: 88, l: 72 },
        { h: 340, s: 86, l: 70 },
        { h: 335, s: 84, l: 72 }
    ];

    const CARD_GRADIENTS = HUE_ANCHORS.map((c, i) => {
        const next = HUE_ANCHORS[(i + 1) % HUE_ANCHORS.length];
        const c1 = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
        const c2 = `hsl(${next.h}, ${next.s}%, ${Math.max(next.l - 8, 40)}%)`;
        return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
    });

    cards.forEach((card, i) => {
        const bg = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
        card.dataset.bg = bg;
        const img = card.querySelector('.card-image');
        if (img) img.style.background = bg;
    });

    // ===== Banco de dados dos jogos =====
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
        players: 1,     // 1 = "qualquer quantidade"
        device: 'any'
    };

    // Inicializa o slider
    if (playersSlider) {
        updatePlayersSliderUI(parseInt(playersSlider.value, 10));

        playersSlider.addEventListener('input', () => {
            const v = parseInt(playersSlider.value, 10);
            updatePlayersSliderUI(v);
            filters.players = v;
            applyFilters();
        });
    }

    // ===== Animação de ondinha do logo =====
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
        const gameUrl = card.dataset.game || '';

        if (gameUrl.includes('corescomdicas')) {
            if (comingSoonModal) {
                comingSoonModal.classList.remove('hidden');
            }
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                try { lucide.createIcons(); } catch (e) {}
            }
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

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try { lucide.createIcons(); } catch (e) {}
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
    if (comingSoonCloseBtn) {
        comingSoonCloseBtn.addEventListener('click', () => {
            comingSoonModal.classList.add('hidden');
        });
    }

    if (comingSoonModal) {
        comingSoonModal.addEventListener('click', (e) => {
            if (e.target === comingSoonModal) {
                comingSoonModal.classList.add('hidden');
            }
        });
    }

    // ===== Devlog =====
    function renderDevlog() {
        if (!devlogList) return;

        devlogList.innerHTML = '';
        const latest = DEVLOG.slice(0, 5);

        latest.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'devlog-entry';

            const itemsHtml = entry.items
                .map(text => `<li>${text}</li>`)
                .join('');

            item.innerHTML = `
                <div class="devlog-entry-header">
                    <span class="devlog-entry-version">${entry.version}</span>
                    <span class="devlog-entry-date">${entry.date}</span>
                </div>
                <ul class="devlog-entry-items">${itemsHtml}</ul>
            `;

            devlogList.appendChild(item);
        });
    }

    function openDevlog() {
        renderDevlog();
        if (devlogModal) {
            devlogModal.classList.remove('hidden');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                try { lucide.createIcons(); } catch (e) {}
            }
        }
    }

    function closeDevlog() {
        if (devlogModal) devlogModal.classList.add('hidden');
    }

    if (openDevlogBtn) openDevlogBtn.addEventListener('click', openDevlog);
    if (devlogCloseBtn) devlogCloseBtn.addEventListener('click', closeDevlog);
    if (devlogCloseBtnBottom) devlogCloseBtnBottom.addEventListener('click', closeDevlog);

    if (devlogModal) {
        devlogModal.addEventListener('click', (e) => {
            if (e.target === devlogModal) closeDevlog();
        });
    }

    // ===== Painel de filtros =====
    filterButton.addEventListener('click', () => {
        filterPanel.classList.toggle('open');
        filterButton.classList.toggle('active');
    });

    // Chips (agora só o de dispositivos)
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
            if (filters.players > 1) {
                matchesPlayers = playersMin <= filters.players;
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

    // ===== Fecha modais com Esc =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeAdModal();
            closeDevlog();
            if (comingSoonModal) {
                comingSoonModal.classList.add('hidden');
            }
        }
    });

    console.log(`🎉 Rally carregado com sucesso! Versão: ${SITE_VERSION}`);
});