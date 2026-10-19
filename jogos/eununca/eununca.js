// Rally - Eu Nunca (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // BARALHOS
    // ============================================================
    const DECKS = {
        livre: {
            name: 'Baralho Livre',
            questions: [
                "fingi que estava entendendo alguma coisa",
                "acenei para alguém que não estava acenando para mim",
                "mandei mensagem para a pessoa errada",
                "ri em um momento completamente inadequado",
                "tropecei andando em um lugar plano",
                "fingi estar ocupado para não conversar com alguém",
                "esqueci o nome de alguém logo depois de conhecê-lo",
                "procurei meu celular enquanto estava com ele na mão",
                "entrei em um cômodo e esqueci o que ia fazer",
                "falei sozinho achando que ninguém estava ouvindo",
                "ensaiei uma conversa antes de ela acontecer",
                "inventei uma desculpa para cancelar um compromisso",
                "fiquei acordado até muito mais tarde do que deveria",
                "dormi durante um filme",
                "assisti a uma série inteira em poucos dias",
                "fingi ter visto um filme que nunca assisti",
                "pesquisei meu próprio nome na internet",
                "reli uma mensagem várias vezes antes de enviar",
                "apaguei uma mensagem porque me arrependi de mandar",
                "fiquei esperando alguém sair para poder usar um banheiro",
                "paguei um mico na frente de uma pessoa que queria impressionar",
                "caí em público e fingi que nada aconteceu",
                "ri tanto que comecei a chorar",
                "tentei segurar uma risada e acabei rindo mais ainda",
                "contei uma piada e ninguém riu",
                "falei mal de alguém e descobri que a pessoa estava perto",
                "respondi 'você também' quando não fazia sentido",
                "dei tchau e continuei andando na mesma direção da pessoa",
                "mandei um áudio e me arrependi de ouvir minha própria voz",
                "tirei uma foto de alguém sem a pessoa perceber",
                "tentei parecer legal e passei vergonha",
                "inventei uma história para parecer mais interessante",
                "ri de uma piada sem entender",
                "chamei alguém pelo nome errado",
                "fingi estar falando ao telefone para evitar alguém",
                "fiquei preso em uma conversa sem saber como sair",
                "fiz uma pergunta cuja resposta já tinha sido explicada",
                "derrubei comida ou bebida em mim mesmo em público",
                "cantei uma música com a letra completamente errada",
                "fui pego fazendo algo que achava que ninguém tinha visto",
                "tive uma primeira impressão completamente errada de alguém",
                "fiquei com ciúmes de uma amizade",
                "guardei um segredo de um amigo por muito tempo",
                "contei um segredo que prometi guardar",
                "inventei um apelido para alguém do grupo",
                "tive uma discussão por causa de um jogo",
                "fiquei irritado porque alguém demorou para responder",
                "silenciei um grupo de mensagens",
                "saí de um grupo e me arrependi depois",
                "reli conversas antigas com meus amigos",
                "fiz uma surpresa para alguém",
                "esqueci o aniversário de uma pessoa importante",
                "senti saudade de alguém e não falei nada",
                "fiquei de mal com alguém por um motivo bobo",
                "fingi concordar com um amigo para evitar uma discussão",
                "fiquei sabendo de uma fofoca antes de todo mundo",
                "espalhei uma fofoca sem querer",
                "julguei alguém antes de conhecer sua história",
                "tive uma amizade que acabou sem explicação",
                "voltei a conversar com alguém depois de anos sem contato",
                "colei em uma prova",
                "estudei só na noite anterior a uma prova",
                "entreguei um trabalho no último minuto",
                "fingi estar prestando atenção em uma aula",
                "dormi durante uma aula ou reunião",
                "inventei uma desculpa para não fazer uma tarefa",
                "esqueci um prazo importante",
                "deixei uma mensagem de trabalho sem resposta de propósito",
                "fingi estar com problemas na internet para sair de uma reunião",
                "pesquisei como fazer algo que todo mundo parecia saber",
                "tive medo de perguntar alguma coisa por vergonha",
                "tive uma paixão por alguém da escola ou do trabalho",
                "cheguei atrasado e tentei entrar sem ser percebido",
                "fiz uma tarefa de qualquer jeito só para terminar logo",
                "culpei outra pessoa por um erro meu",
                "comi escondido para não ter que dividir",
                "comi algo que caiu no chão",
                "experimentei uma comida só para não parecer fresco",
                "comprei algo por impulso e me arrependi",
                "gastei dinheiro com algo completamente desnecessário",
                "fiquei perdido mesmo usando um mapa",
                "perdi um ônibus, trem ou voo",
                "viajei sem planejar quase nada",
                "entrei no lugar errado por engano",
                "fiz algo só porque meus amigos estavam fazendo",
                "aceitei um desafio e me arrependi imediatamente",
                "menti sobre ter gostado de um presente",
                "tive uma superstição estranha",
                "chorei assistindo a um filme ou desenho",
                "tive medo de algo que sabia ser inofensivo",
                "falei com um animal como se ele pudesse responder",
                "criei um cenário inteiro na minha cabeça antes de dormir",
                "fiquei horas rolando as redes sociais sem perceber o tempo passar",
                "pesquisei sintomas na internet e fiquei preocupado",
                "tentei aprender uma habilidade e desisti rapidamente",
                "tive uma fase de gostar muito de algo e depois perder completamente o interesse",
                "fingi saber dançar",
                "inventei uma coreografia quando estava sozinho",
                "fiz algo espontâneo que virou uma ótima história",
                "vivi uma situação que parece mentira quando conto para alguém"
            ]
        },
        adulto: {
            name: 'Baralho +18',
            questions: [
                "fiz sexo a três",
                "fiz sexo com mais de uma pessoa na mesma noite",
                "fiz sexo com alguém que conheci no mesmo dia",
                "fiz sexo casual sem intenção de reencontrar a pessoa",
                "transei com alguém cujo sobrenome eu não sabia",
                "fiz sexo em um primeiro encontro",
                "fiz sexo em um carro",
                "fiz sexo em uma piscina",
                "fiz sexo na praia",
                "fiz sexo em um banheiro público",
                "fiz sexo em um lugar onde corria o risco de ser descoberto",
                "fui interrompido durante o sexo",
                "tive uma relação sexual que durou a noite inteira",
                "transei mais de uma vez no mesmo dia",
                "fiz sexo com alguém muito mais velho do que eu",
                "fiz sexo com alguém que tinha acabado de conhecer pela internet",
                "tive uma experiência sexual da qual me arrependi",
                "tive uma experiência sexual completamente inesperada",
                "fiz sexo com alguém por quem não sentia atração romântica",
                "tive uma relação sexual em um lugar inusitado",
                "me masturbei em um local público",
                "me masturbei no trabalho ou na escola",
                "me masturbei em um banheiro fora de casa",
                "fingi um orgasmo",
                "tive dificuldade para chegar ao orgasmo durante o sexo",
                "tive um orgasmo em uma situação inesperada",
                "me masturbei pensando em alguém que conheço pessoalmente",
                "me masturbei pensando em alguém comprometido",
                "me masturbei usando um brinquedo sexual",
                "comprei um brinquedo sexual",
                "escondi um brinquedo sexual de alguém",
                "fui interrompido enquanto me masturbava",
                "tive medo de ser flagrado me masturbando",
                "usei conteúdo adulto para me masturbar",
                "me masturbei mais de uma vez no mesmo dia",
                "tive uma fantasia sexual que me surpreendeu",
                "tive vergonha de contar a alguém do que gosto na cama",
                "tive um orgasmo durante uma situação em que não esperava",
                "fingi estar gostando de algo durante o sexo",
                "conversei abertamente com alguém sobre minhas preferências sexuais",
                "traí um namorado ou uma namorada",
                "beijei outra pessoa enquanto estava em um relacionamento",
                "tive uma relação sexual com alguém que não era meu parceiro",
                "fiquei com alguém sabendo que a pessoa era comprometida",
                "fui a outra pessoa em um relacionamento",
                "escondi uma ficada do meu parceiro",
                "apaguei mensagens para esconder algo de um parceiro",
                "mantive contato com um ex escondido do meu parceiro",
                "traí emocionalmente alguém com quem namorava",
                "fiquei com alguém para me vingar de um parceiro",
                "traí e consegui esconder isso",
                "descobri uma traição e continuei no relacionamento",
                "perdoei uma traição",
                "fui descoberto fazendo algo que meu parceiro considerava traição",
                "tive vontade de trair alguém com quem estava namorando",
                "fiquei com duas pessoas que se conheciam sem que elas soubessem",
                "fiquei com o ex de um amigo ou de uma amiga",
                "me envolvi com alguém sabendo que isso causaria uma briga no grupo",
                "escondi de um parceiro quantas pessoas já tinha beijado",
                "voltei a ficar com alguém com quem tinha jurado nunca mais ficar",
                "fiquei com a irmã ou o irmão de um amigo",
                "fiquei com o melhor amigo ou a melhor amiga de um ex",
                "fiquei com duas pessoas da mesma família",
                "fiquei com duas pessoas do mesmo grupo de amigos",
                "senti atração pelo parceiro de um amigo",
                "beijei alguém que meu amigo também queria beijar",
                "fiquei com alguém e escondi isso dos meus amigos",
                "fiquei com um amigo e depois fingi que nada aconteceu",
                "tive uma amizade colorida",
                "transei com alguém que considerava apenas um amigo",
                "fiquei com alguém durante uma festa organizada por um amigo",
                "fiquei com alguém para provocar ciúmes em outra pessoa",
                "me envolvi com alguém que meu grupo de amigos detestava",
                "fiquei com alguém e descobri depois que um amigo já tinha ficado com a pessoa",
                "tive uma tensão sexual com alguém do meu grupo de amigos",
                "tive um fetiche que tive vergonha de admitir",
                "realizei uma fantasia sexual incomum",
                "conversei com um parceiro sobre experimentar algo diferente na cama",
                "usei algemas ou acessórios durante o sexo",
                "experimentei vendas nos olhos durante o sexo",
                "experimentei jogos de dominação e submissão consensuais",
                "tive curiosidade de experimentar BDSM",
                "usei fantasias ou roupas especiais durante o sexo",
                "fiz uma sessão de fotos sensual",
                "enviei uma foto íntima",
                "recebi uma foto íntima sem ter pedido",
                "gravei um vídeo íntimo consensualmente",
                "tive uma fantasia com alguém que não era meu parceiro",
                "experimentei um brinquedo sexual acompanhado",
                "tive curiosidade de fazer sexo em um ambiente diferente do habitual",
                "coloquei um piercing em uma região íntima",
                "fiz uma tatuagem com significado sexual ou romântico",
                "fiquei completamente nu diante de alguém pela primeira vez em uma situação inesperada",
                "fiquei nu em um lugar onde poderia ser visto por outras pessoas",
                "tomei banho acompanhado de alguém com quem tinha interesse sexual",
                "fui a uma praia de nudismo",
                "fui flagrado trocando de roupa",
                "fui visto por acidente em um momento íntimo",
                "tirei a roupa por causa de um desafio",
                "fiz striptease para alguém",
                "usei um aplicativo de relacionamento apenas para conseguir sexo",
                "marquei um encontro com a intenção explícita de transar",
                "enviei uma mensagem sexual para a pessoa errada",
                "mandei uma mensagem picante para alguém enquanto outra pessoa estava ao meu lado",
                "tive uma conversa sexual com alguém que nunca encontrei pessoalmente",
                "mantive uma conversa sexual com alguém comprometido",
                "fui reconhecido por alguém em um aplicativo de relacionamento",
                "usei um perfil falso para flertar",
                "assisti a conteúdo adulto junto de outra pessoa",
                "tive curiosidade de aparecer em conteúdo adulto",
                "paguei por conteúdo adulto",
                "encontrei alguém conhecido em um site ou aplicativo de conteúdo adulto",
                "tive uma conversa picante durante uma chamada de vídeo",
                "recebi uma mensagem sexual de alguém inesperado",
                "flertei com alguém apenas por mensagens, sem intenção de encontrar a pessoa",
                "fui embora de um encontro depois de perceber que não queria nada com a pessoa",
                "inventei uma desculpa para ir embora depois de ficar com alguém",
                "me arrependi de ter transado com alguém logo depois",
                "fiquei com alguém apenas por carência",
                "voltei para casa com alguém que tinha acabado de conhecer",
                "dormi com alguém e me arrependi de ter passado a noite lá",
                "tive uma experiência sexual tão ruim que virou história para contar",
                "menti sobre ter gostado de uma experiência sexual",
                "menti sobre meu número de parceiros sexuais",
                "exagerei uma história sexual para impressionar meus amigos",
                "contei detalhes íntimos de uma relação para outra pessoa sem autorização",
                "tive uma experiência sexual com alguém por quem não sentia nenhuma atração",
                "fiquei com alguém apenas para esquecer outra pessoa",
                "me envolvi com alguém e descobri depois uma informação importante que a pessoa havia escondido",
                "tive uma experiência sexual que ninguém do meu grupo de amigos imagina",
                "tive vontade de ficar com alguém que está nesta roda",
                "imaginei como seria transar com alguém que está nesta roda",
                "fiquei com alguém presente nesta roda",
                "escondi de alguém aqui uma atração que sentia por essa pessoa",
                "tive uma fantasia envolvendo alguém que conheço pessoalmente",
                "fiquei com alguém e depois descobri que outra pessoa do grupo também queria",
                "fiquei com alguém e escondi isso por medo da reação dos meus amigos",
                "tive uma relação secreta",
                "me envolvi com alguém que deveria ter evitado",
                "tive uma experiência íntima que mudaria a forma como meus amigos me enxergam",
                "fiquei com alguém e depois me arrependi de ter contado para meus amigos",
                "tive atração por alguém que considero uma péssima escolha para mim",
                "tive uma experiência íntima que mantive em segredo por anos",
                "me envolvi com alguém que era proibido pelas circunstâncias",
                "escondi uma informação importante sobre minha vida sexual de alguém com quem estava me relacionando",
                "tive uma experiência sexual que começou de forma completamente inesperada",
                "fui surpreendido por uma proposta sexual",
                "recusei uma proposta sexual e depois fiquei curioso sobre como teria sido",
                "aceitei experimentar algo novo e descobri que gostava",
                "descobri uma preferência sexual que não sabia que tinha",
                "tive uma conversa íntima que mudou meu relacionamento com alguém",
                "me envolvi com alguém e percebi que a química era muito diferente do que imaginava",
                "tive uma experiência sexual que parecia inacreditável quando contei depois",
                "escondi uma aventura de praticamente todo mundo que conheço",
                "tive uma situação íntima interrompida por uma ligação ou mensagem",
                "tive que improvisar uma desculpa depois de ser pego em uma situação comprometedora",
                "me envolvi com alguém e precisei fingir que não conhecia a pessoa em público",
                "tive uma experiência íntima em uma viagem",
                "tive uma aventura que começou como uma brincadeira e ficou séria",
                "vivi uma história sexual que só contaria depois de algumas bebidas"
            ]
        }
    };

    // ============================================================
    // ESTADO DO JOGO
    // ============================================================
    const state = {
        currentDeckKey: null,
        remainingQuestions: [],
        currentQuestion: null,
        isTransitioning: false
    };

    // ============================================================
    // DOM
    // ============================================================
    const screens = {
        menu: document.getElementById('menuScreen'),
        game: document.getElementById('gameScreen')
    };

    const questionCard = document.getElementById('questionCard');
    const questionText = document.getElementById('questionText');
    const deckBadge = document.getElementById('deckBadge');
    const counterText = document.getElementById('counterText');
    const nextBtn = document.getElementById('nextQuestionBtn');

    const ageModal = document.getElementById('ageModal');
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
    // EMBARALHAR (Fisher-Yates)
    // ============================================================
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ============================================================
    // INICIAR BARALHO
    // ============================================================
    function startDeck(deckKey) {
        state.currentDeckKey = deckKey;
        state.remainingQuestions = shuffle(DECKS[deckKey].questions);
        state.currentQuestion = null;
        state.isTransitioning = false;

        deckBadge.innerText = DECKS[deckKey].name;
        if (deckKey === 'adulto') {
            deckBadge.classList.add('adulto');
            questionCard.classList.add('adulto');
        } else {
            deckBadge.classList.remove('adulto');
            questionCard.classList.remove('adulto');
        }

        showScreen('game');
        nextQuestion(true);
    }

    // ============================================================
    // ATUALIZAR CONTADOR
    // ============================================================
    function updateCounter() {
        const total = DECKS[state.currentDeckKey].questions.length;
        const answered = total - state.remainingQuestions.length;
        counterText.innerText = `${Math.min(answered, total)} / ${total}`;
    }

    // ============================================================
    // MOSTRAR PRÓXIMA PERGUNTA
    // ============================================================
    function nextQuestion(skipAnimation) {
        if (state.remainingQuestions.length === 0) {
            state.remainingQuestions = shuffle(DECKS[state.currentDeckKey].questions);
        }

        state.currentQuestion = state.remainingQuestions.shift();

        questionText.innerText = `Eu nunca ${state.currentQuestion}.`;

        questionCard.classList.remove('card-exit');
        if (!skipAnimation) {
            questionCard.style.animation = 'none';
            void questionCard.offsetWidth;
            questionCard.style.animation = '';
        }

        updateCounter();
    }

    // ============================================================
    // BOTÃO PRÓXIMA
    // ============================================================
    nextBtn.addEventListener('click', () => {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        questionCard.classList.add('card-exit');

        setTimeout(() => {
            nextQuestion(false);
            state.isTransitioning = false;
        }, 250);
    });

    // ============================================================
    // SELEÇÃO DE BARALHO
    // ============================================================
    document.getElementById('deckLivreBtn').addEventListener('click', () => {
        startDeck('livre');
    });

    document.getElementById('deckAdultoBtn').addEventListener('click', () => {
        ageModal.classList.remove('hidden');
    });

    document.getElementById('cancelAgeBtn').addEventListener('click', () => {
        ageModal.classList.add('hidden');
    });

    document.getElementById('confirmAgeBtn').addEventListener('click', () => {
        ageModal.classList.add('hidden');
        startDeck('adulto');
    });

    // ============================================================
    // TROCAR BARALHO
    // ============================================================
    document.getElementById('changeDeckBtn').addEventListener('click', () => {
        state.isTransitioning = false;
        showScreen('menu');
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

    // Fechar modais clicando fora
    ageModal.addEventListener('click', (e) => {
        if (e.target === ageModal) ageModal.classList.add('hidden');
    });

    exitModal.addEventListener('click', (e) => {
        if (e.target === exitModal) exitModal.classList.add('hidden');
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

    // Anúncio
    const adEmailText = document.getElementById('adEmailText');
    const adCopyBtn = document.getElementById('adCopyBtn');
    const adCopiedMsg = document.getElementById('adCopiedMsg');

    // Apoio
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

    console.log('🎉 Eu Nunca carregado com sucesso!');
});