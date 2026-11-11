// Rally - Stop (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // ALFABETO BASE
    // ============================================================
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // ============================================================
    // ESTADO
    // ============================================================
    const state = {
        // Letras ativas (que PODEM ser sorteadas)
        // Set com as que estão ativas; ao remover, sai do Set
        activeLetters: new Set(ALPHABET),

        // Letra sorteada na rodada atual
        currentLetter: null,

        // Número da rodada (para exibir)
        roundNumber: 1,

        // Controle da animação de sorteio
        isDrawing: false,
        drawTimeoutId: null
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        home: document.getElementById('homeScreen'),
        config: document.getElementById('configScreen'),
        draw: document.getElementById('drawScreen'),
        gameOver: document.getElementById('gameOverScreen')
    };

    const lettersGrid = document.getElementById('lettersGrid');
    const activeLettersCount = document.getElementById('activeLettersCount');
    const toggleAllBtn = document.getElementById('toggleAllBtn');

    const letterDrawing = document.getElementById('letterDrawing');
    const letterDisplay = document.getElementById('letterDisplay');
    const roundBadge = document.getElementById('roundBadge');

    const drawActions = document.getElementById('drawActions');
    const stopRoundBtn = document.getElementById('stopRoundBtn');

    const comingSoonModal = document.getElementById('comingSoonModal');
    const comingSoonCloseBtn = document.getElementById('comingSoonCloseBtn');

    const exitModal = document.getElementById('exitModal');

    // ============================================================
    // NAVEGAÇÃO
    // ============================================================
    function showScreen(key) {
        Object.keys(screens).forEach(k => {
            if (k === key) screens[k].classList.remove('hidden');
            else screens[k].classList.add('hidden');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================================
    // HOME
    // ============================================================
    document.getElementById('modePaperBtn').addEventListener('click', () => {
        renderConfig();
        showScreen('config');
    });

    document.getElementById('modePhoneBtn').addEventListener('click', () => {
        comingSoonModal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    });

    if (comingSoonCloseBtn) {
        comingSoonCloseBtn.addEventListener('click', () => {
            comingSoonModal.classList.add('hidden');
        });
    }

    if (comingSoonModal) {
        comingSoonModal.addEventListener('click', (e) => {
            if (e.target === comingSoonModal) comingSoonModal.classList.add('hidden');
        });
    }

    // ============================================================
    // CONFIG — GRADE DE LETRAS
    // ============================================================
    function renderConfig() {
        lettersGrid.innerHTML = '';

        ALPHABET.forEach(letter => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'letter-tile';
            tile.dataset.letter = letter;
            tile.textContent = letter;

            // Letra está ATIVA quando está no Set
            const isActive = state.activeLetters.has(letter);
            if (!isActive) tile.classList.add('disabled');

            tile.addEventListener('click', () => {
                if (state.activeLetters.has(letter)) {
                    state.activeLetters.delete(letter);
                } else {
                    state.activeLetters.add(letter);
                }
                renderConfig();
            });

            lettersGrid.appendChild(tile);
        });

        updateConfigUI();
    }

    function updateConfigUI() {
        const count = state.activeLetters.size;
        activeLettersCount.textContent = count;

        // Botão de atalho alterna entre "Desmarcar todas" e "Marcar todas"
        if (count === 0) {
            toggleAllBtn.textContent = 'Marcar todas';
        } else if (count === ALPHABET.length) {
            toggleAllBtn.textContent = 'Desmarcar todas';
        } else {
            toggleAllBtn.textContent = 'Marcar todas';
        }

        // Desabilita o botão "Jogar" se nenhuma letra está ativa
        const startBtn = document.getElementById('startGameBtn');
        startBtn.disabled = count === 0;

        if (window.lucide) lucide.createIcons();
    }

    toggleAllBtn.addEventListener('click', () => {
        if (state.activeLetters.size === ALPHABET.length) {
            // Está tudo marcado → desmarca tudo
            state.activeLetters.clear();
        } else {
            // Qualquer outra situação → marca tudo
            state.activeLetters = new Set(ALPHABET);
        }
        renderConfig();
    });

    // ============================================================
    // INICIAR JOGO
    // ============================================================
    document.getElementById('startGameBtn').addEventListener('click', () => {
        if (state.activeLetters.size === 0) {
            alert('Ative pelo menos uma letra para jogar!');
            return;
        }
        state.roundNumber = 1;
        startDrawRound();
    });

    // ============================================================
    // SORTEIO
    // ============================================================
    function startDrawRound() {
        showScreen('draw');

        // Atualiza o badge da rodada
        roundBadge.textContent = `Rodada ${state.roundNumber}`;

        // Esconde botões de finalização e mostra o botão de STOP
        drawActions.classList.add('hidden');
        stopRoundBtn.classList.add('hidden');

        // Prepara animação
        state.isDrawing = true;
        letterDrawing.classList.remove('picked');
        letterDrawing.classList.add('rolling');
        letterDrawing.textContent = '?';

        // Se não houver letras ativas → vai para game over
        if (state.activeLetters.size === 0) {
            goToGameOver();
            return;
        }

        const activeArr = Array.from(state.activeLetters);

        // Sorteia a letra final ANTES da animação (para saber onde parar)
        const finalLetter = activeArr[Math.floor(Math.random() * activeArr.length)];

        // Animação de rolagem
        const totalDuration = 2200;
        const startTime = Date.now();
        let lastChange = 0;

        function roll() {
            if (!state.isDrawing) return;

            const elapsed = Date.now() - startTime;

            if (elapsed >= totalDuration) {
                // Terminou → mostra letra sorteada
                state.isDrawing = false;
                state.currentLetter = finalLetter;

                letterDrawing.classList.remove('rolling');
                letterDrawing.classList.add('picked');
                letterDrawing.textContent = finalLetter;

                // Mostra o botão STOP para encerrar a rodada
                stopRoundBtn.classList.remove('hidden');

                if (window.confetti) {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#FF6B8A', '#FFA94D', '#FFD43B', '#51CF66', '#4DABF7', '#B197FC']
                    });
                }
                return;
            }

            const remaining = totalDuration - elapsed;
            const interval = remaining < 500 ? 180 : (remaining < 1200 ? 110 : 70);

            if (Date.now() - lastChange >= interval) {
                const randomLetter = activeArr[Math.floor(Math.random() * activeArr.length)];
                letterDrawing.textContent = randomLetter;
                lastChange = Date.now();
            }

            requestAnimationFrame(roll);
        }

        roll();
    }

    // ============================================================
    // BOTÃO "STOP! RODADA ENCERRADA"
    // ============================================================
    stopRoundBtn.addEventListener('click', () => {
        // Esconde o botão STOP e mostra as opções de pós-rodada
        stopRoundBtn.classList.add('hidden');
        drawActions.classList.remove('hidden');

        // Atualiza o texto do botão "Remover" com a letra em questão
        const removeBtn = document.getElementById('removeLetterBtn');
        removeBtn.innerHTML = `<i data-lucide="x-circle"></i> Remover a letra "${state.currentLetter}"`;
        if (window.lucide) lucide.createIcons();
    });

    // ============================================================
    // REMOVER LETRA SORTEADA
    // ============================================================
    document.getElementById('removeLetterBtn').addEventListener('click', () => {
        if (!state.currentLetter) return;

        // Remove a letra sorteada do Set
        state.activeLetters.delete(state.currentLetter);
        state.currentLetter = null;
        state.roundNumber++;

        // Se não sobrou nenhuma letra → fim de jogo
        if (state.activeLetters.size === 0) {
            goToGameOver();
            return;
        }

        // Próximo sorteio
        startDrawRound();
    });

    // ============================================================
    // MANTER LETRA E VOLTAR AO SORTEIO
    // ============================================================
    document.getElementById('keepLetterBtn').addEventListener('click', () => {
        state.currentLetter = null;
        state.roundNumber++;
        startDrawRound();
    });

    // ============================================================
    // FIM DE JOGO
    // ============================================================
    function goToGameOver() {
        showScreen('gameOver');

        const sub = document.getElementById('resultSub');
        sub.textContent = `Vocês sortearam todas as ${ALPHABET.length} letras do jogo!`;

        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
        if (window.lucide) lucide.createIcons();
    }

    // Recomeçar com as mesmas letras ativas
    document.getElementById('restartBtn').addEventListener('click', () => {
        // Restaura todas as letras (novo jogo)
        state.activeLetters = new Set(ALPHABET);
        state.currentLetter = null;
        state.roundNumber = 1;
        renderConfig();
        showScreen('config');
    });

    // Ajustar letras (volta pra config mantendo o estado atual)
    document.getElementById('backToConfigBtn').addEventListener('click', () => {
        state.currentLetter = null;
        renderConfig();
        showScreen('config');
    });

    // ============================================================
    // SAIR — qualquer botão com data-exit-btn
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
        if (ok) flashCopied(adCopyBtn, adCopiedMsg, 'Copiar');
        else {
            adCopiedMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedMsg.classList.add('show');
        }
    });

    adCopyPixBtn.addEventListener('click', async () => {
        const pix = adPixText.textContent.trim();
        const ok = await copyText(pix);
        if (ok) flashCopied(adCopyPixBtn, adCopiedPixMsg, 'Copiar chave');
        else {
            adCopiedPixMsg.textContent = 'Não foi possível copiar. Selecione manualmente.';
            adCopiedPixMsg.classList.add('show');
        }
    });

    // ===== Fecha modais com Esc =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAdModal();
            comingSoonModal.classList.add('hidden');
            exitModal.classList.add('hidden');
        }
    });

    console.log('🎉 Stop carregado com sucesso!');
});