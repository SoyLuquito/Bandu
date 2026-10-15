// Rally - Lobby de Party Games
// Versão 1.3

document.addEventListener('DOMContentLoaded', () => {
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

    // ===== Banco de dados dos jogos (info que só aparece no modal) =====
    const GAMES_INFO = {
        'corescomdicas.html': {
            title: 'Cores com Dicas',
            emoji: '🎨',
            bg: 'linear-gradient(135deg, #FF8FA3 0%, #FFC078 100%)',
            players: '1 à 10 jogadores',
            device: 'Tela compartilhada ou Cada um no seu',
            description: 'Dê dicas com palavras para que os outros jogadores acertem a cor correta no tabuleiro. Quanto mais próximo, mais pontos!'
        },
        'imposto.html': {
            title: 'Impostor',
            emoji: '🕵️',
            bg: 'linear-gradient(135deg, #7BE495 0%, #6EC6FF 100%)',
            players: '4 à 10 jogadores',
            device: 'Tela compartilhada',
            description: 'Todos recebem a mesma palavra, exceto o impostor. Descubra quem é o impostor antes que ele te engane!'
        },
        '/jogos/mimica/mimica.html': {
            title: 'Mímica',
            emoji: '🤸',
            bg: 'linear-gradient(135deg, #FFE066 0%, #FF9A8B 100%)',
            players: '4+ jogadores',
            device: 'Tela compartilhada',
            description: 'Faça mímica para que sua equipe adivinhe a palavra ou frase. Sem falar, sem sons, só gestos!'
        },
        'eununca.html': {
            title: 'Eu Nunca',
            emoji: '🙊',
            bg: 'linear-gradient(135deg, #C77DFF 0%, #FF7EB9 100%)',
            players: '3+ jogadores',
            device: 'Tela compartilhada',
            description: 'O jogo clássico de revelações! Diga algo que nunca fez e descubra quem já fez. Prepare-se para rir!'
        },
        'espiao.html': {
            title: 'Espião',
            emoji: '🔍',
            bg: 'linear-gradient(135deg, #4DD0C8 0%, #7B9EFF 100%)',
            players: '4+ jogadores',
            device: 'Cada um no seu',
            description: 'Dê pistas para sua equipe encontrar as palavras secretas no tabuleiro, mas cuidado para não ajudar o time adversário!'
        },
        'cidadedorme.html': {
            title: 'Cidade Dorme',
            emoji: '🌙',
            bg: 'linear-gradient(135deg, #6A8EEA 0%, #4DD0C8 100%)',
            players: '6+ jogadores',
            device: 'Tela compartilhada ou Cada um no seu',
            description: 'A cidade dorme, mas o assassino está acordado! Descubra quem está matando os cidadãos antes que seja tarde.'
        },
        'sintonia.html': {
            title: 'Sintonia',
            emoji: '📊',
            bg: 'linear-gradient(135deg, #FFB067 0%, #A8E063 100%)',
            players: '2+ jogadores',
            device: 'Tela compartilhada ou Cada um no seu',
            description: 'Dê uma dica para que sua equipe posicione o ponteiro no espectro entre dois opostos. Comunicação é tudo!'
        }
    };

    // ===== Estado dos filtros =====
    const filters = {
        players: 'any',
        device: 'any'
    };

    // ===== Animação de ondinha do logo =====
    function triggerWave() {
        logo.classList.add('waving');
        setTimeout(() => {
            logo.classList.remove('waving');
        }, 1800);
    }

    setTimeout(() => {
        triggerWave();
        setInterval(triggerWave, 8000);
    }, 3000);

    // ===== Modal =====
    function openModal(card) {
        const gameUrl = card.dataset.game;
        const info = GAMES_INFO[gameUrl];

        if (!info) return;

        // Monta o HTML do modal
        modalContent.innerHTML = `
            <div class="card-image" style="background: ${info.bg};">
                <span class="card-emoji">${info.emoji}</span>
            </div>
            <h2 class="card-title">${info.title}</h2>
            <div class="modal-details">
                <div class="detail-item">
                    <span class="detail-icon">👥</span>
                    <span>${info.players}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📱</span>
                    <span>${info.device}</span>
                </div>
                <p class="card-description">${info.description}</p>
                <button class="play-button" id="modalPlayButton">Jogar</button>
            </div>
        `;

        // Botão de jogar dentro do modal
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

    // ===== Clique nos cards =====
    cards.forEach(card => {
        card.addEventListener('click', () => {
            openModal(card);
        });
    });

    // Fecha o modal
    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
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

    // ===== Aplicar filtros e busca =====
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

    console.log('🎉 Rally carregado com sucesso!');
});