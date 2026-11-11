// Rally - Impostor (Party Game)

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // ============================================================
    // BANCO DE PALAVRAS AGRUPADAS POR DICAS VAGAS
    // ============================================================
    const HINT_GROUPS = {
        animais: {
            "Animal do frio": ["Foca", "Morsa", "Urso-polar", "Pinguim", "Orca", "Leopardo-das-neves", "Rena", "Lobo-do-ártico", "Lebre-ártica", "Narval"],
            "Animal peludo": ["Ovelha", "Macaco", "Cavalo", "Porquinho-da-índia", "Hamster", "Morcego", "Gambá", "Canguru", "Lhama", "Doninha"],
            "Animal voador": ["Andorinha", "Beija-flor", "Pombo", "Gaivota", "Cegonha", "Gavião", "Mariposa", "Libélula", "Mosca", "Vespa"],
            "Animal marinho": ["Estrela-do-mar", "Água-viva", "Cavalo-marinho", "Tartaruga-marinha", "Lontra", "Foca", "Mexilhão", "Ouriço-do-mar", "Peixe-palhaço", "Arraia"],
            "Animal grande": ["Boi", "Alce", "Crocodilo", "Canguru", "Avestruz", "Leão-marinho", "Baleia-azul", "Alce", "Orangotango", "Javali"],
            "Animal pequeno": ["Pulga", "Cupim", "Grilo", "Besouro", "Lagartixa", "Rato", "Sapo", "Pintinho", "Pardal", "Percevejo"],
            "Animal da selva": ["Guepardo", "Hiena", "Rinoceronte", "Zebra", "Hipopótamo", "Babuíno", "Anta", "Jaguatirica", "Arara", "Bicho-preguiça"],
            "Animal com pena": ["Pinguim", "Pombo", "Canário", "Peru", "Ganso", "Cisne", "Urubu", "Falcão", "Arara", "Avestruz", "Ema", "Pavão"],
            "Animal com chifre": ["Vaca", "Cabra", "Antílope", "Boi", "Veado", "Cervo", "Rena", "Alce", "Búfalo"],
        },
        profissoes: {
            "Profissão da saúde": [
                "Médico", "Enfermeiro", "Dentista", "Veterinário", "Psicólogo",
                "Fisioterapeuta", "Farmacêutico", "Nutricionista", "Cuidador"],
            "Profissão de risco": [
                "Bombeiro", "Policial", "Soldado", "Segurança",
                "Piloto", "Soldador", "Eletricista", "Mergulhador"],
            "Profissão da construção": [
                "Pedreiro", "Pintor", "Eletricista", "Encanador", "Marceneiro",
                "Arquiteto", "Engenheiro", "Soldador", "Mestre de obras", "Carpinteiro"],
            "Profissão da cozinha": [
                "Padeiro", "Confeiteiro", "Cozinheiro", "Garçom", "Barista",
                "Churrasqueiro", "Sushiman", "Sommelier", "Açougueiro", "Pizzaiolo"],
            "Profissão do transporte": [
                "Motorista", "Piloto", "Taxista", "Entregador", "Caminhoneiro",
                "Maquinista", "Marinheiro", "Comissário", "Motoboy"],
            "Profissão artística": [
                "Ator", "Cantor", "Dançarino", "Palhaço",
                "Mágico", "Dublador", "Fotógrafo", "Escultor"],
            "Profissão da beleza": [
                "Cabeleireiro", "Barbeiro", "Maquiador", "Tatuador", "Costureiro",
                "Manicure", "Designer de sobrancelhas", "Modelo"],
            "Profissão da tecnologia": [
                "Programador", "Técnico de informática", "Engenheiro"],
            "Profissão do esporte": [
                "Treinador", "Árbitro", "Personal trainer", "Jogador", "Nadador",
                "Atleta", "Ginasta", "Ciclista", "Instrutor"],
            "Profissão de atendimento": [
                "Vendedor", "Garçom", "Recepcionista",
                "Comissário", "Guia", "Corretor"],
            "Profissão noturna": [
                "Segurança", "Porteiro", "Vigia",
                "DJ", "Motorista", "Frentista"],
        },
        objetos: {
            "Objeto Quente": ["Fogueira", "Fogão", "Vela", "Fósforo", "Churrasqueira", "Chaleira", "Torradeira", "Secador de Cabelo", "Ferro de Passar", "Aquecedor", "Lareira", "Forno"],
            "Eletrônico": ["Celular", "Televisão", "Computador", "Notebook", "Tablet", "Caixa de Som", "Microfone", "Fone de Ouvido"],
            "Objeto de Bolso": ["Celular", "Moeda", "Chave", "Carteira", "Clipe de Papel", "Chaveiro", "Isqueiro", "Cartão de Crédito", "Fone de Ouvido", "Pen Drive"],
            "Objeto de Limpeza": ["Vassoura", "Rodo", "Balde", "Aspirador de Pó", "Detergente", "Sabão", "Esponja", "Pano de Chão", "Luva de Borracha", "Rodo de Pia", "Escova de Limpeza", "Desinfetante"],
            "Objeto de Cozinha": ["Panela", "Frigideira", "Micro-ondas", "Liquidificador", "Fogão", "Saca-rolhas", "Tábua de Corte", "Colher de Pau", "Espátula", "Ralador", "Faca", "Garfo", "Concha", "Peneira", "Batedeira", "Cafeteira", "Chaleira", "Torradeira"],
            "Eletrodoméstico": ["Geladeira", "Televisão", "Computador", "Ventilador", "Liquidificador", "Micro-ondas", "Máquina de Lavar", "Aspirador de Pó", "Fogão"],
            "Banheiro": ["Sabonete", "Toalha", "Escova de Dentes", "Pente", "Secador de Cabelo", "Espelho", "Batom", "Shampoo", "Condicionador", "Papel Higiênico", "Desodorante", "Pasta de dente", "Toalha de Rosto"],
        },
        comidas: {
            "Comida Doce": ["Brigadeiro", "Pudim", "Sorvete", "Açaí", "Bolo de Chocolate", "Torta de Limão", "Donut", "Churros", "Chocolate", "Bala", "Pirulito", "Biscoito", "Gelatina", "Goiabada", "Doce de Leite", "Cocada", "Pé de Moleque", "Milk-shake"],
            "Comida Salgada": ["Pizza", "Hambúrguer", "Batata Frita", "Cachorro-quente", "Pastel", "Coxinha", "Pão de Queijo", "Empada", "Kibe", "Churrasco", "Frango Assado", "Peixe Frito", "Salgadinho", "Amendoim", "Castanha"],
            "Comida Gelada": ["Sorvete", "Açaí", "Milk-shake", "Refrigerante", "Cerveja", "Limonada", "Iogurte"],
            "Comida Brasileira": ["Feijoada", "Brigadeiro", "Coxinha", "Pão de Queijo", "Pamonha", "Canjica", "Cocada", "Pé de Moleque", "Goiabada", "Açaí", "Tapioca", "Farofa", "Caipirinha"],
            "Fruta": ["Maçã", "Banana", "Laranja", "Morango", "Uva", "Melancia", "Melão", "Abacaxi", "Manga", "Maracujá", "Limão", "Pêssego", "Coco", "Mexerica", "Kiwi", "Cereja", "Goiaba", "Mamão"],
            "Bebida": ["Café", "Chá", "Refrigerante", "Milk-shake", "Vinho", "Cerveja", "Água de Coco", "Limonada", "Suco de Laranja"],
            "Comida de Festa": ["Brigadeiro", "Pipoca", "Bolo", "Coxinha", "Pastel", "Salgadinho", "Pirulito", "Bala"],
        },
        filmes: {
            "Super-Herói": ["Homem-Aranha", "Batman", "Superman", "Homem de Ferro", "Vingadores", "Pantera Negra", "Coringa", "Thor", "Capitão América", "Doutor Estranho", "Guardiões da Galáxia", "Mulher-Maravilha", "Flash", "Aquaman", "Lanterna Verde", "Deadpool", "Wolverine", "Hulk", "Viúva Negra", "Homem-Formiga", "Cyborg", "Demolidor", "Motoqueiro Fantasma", "Surfista Prateado"],
            "Animação": ["O Rei Leão", "Toy Story", "Shrek", "Procurando Nemo", "Os Incríveis", "Frozen", "Moana", "Detona Ralph", "Monstros S.A.", "Carros", "Divertida Mente", "Encanto", "Kung Fu Panda", "Madagascar", "Meu Malvado Favorito", "A Era do Gelo", "Aladdin", "A Bela e a Fera", "Cinderela", "A Pequena Sereia", "Mulan", "Pocahontas", "Hercules", "Tarzan", "Up - Altas Aventuras", "WALL-E", "Ratatouille", "Coraline"],
            "Série": ["Stranger Things", "Round 6", "Game of Thrones", "Breaking Bad", "La Casa de Papel", "The Walking Dead", "Friends", "The Office", "Os Simpsons", "Chaves"],
            "Filme de Terror": ["Pânico", "A Hora do Pesadelo", "Sexta-Feira 13", "O Iluminado", "It - A Coisa", "Atividade Paranormal", "Invocação do Mal", "Coraline", "O Exorcista", "O Massacre da Serra Elétrica", "Annabelle", "O Chamado", "O Grito"],
            "Filme de Ficção": ["Star Wars", "Matrix", "Avatar", "Jurassic Park", "De Volta para o Futuro", "Transformers", "Interestelar", "Harry Potter", "Jogos Vorazes", "Divergente", "O Senhor dos Anéis"],
            "Filme de Comédia": ["Shrek", "As Branquelas", "Se Beber, Não Case!", "O Máskara", "Debi & Lóide", "Todo Mundo em Pânico", "Superbad", "Esqueceram de Mim"],
        },
        futebol: {
            "Brasileiro em atividade": [
                "Neymar", "Vinícius Júnior", "Rodrygo", "Raphinha", "Richarlison",
                "Endrick", "Gabriel Jesus", "Bruno Guimarães", "Alisson", "Ederson",
                "Thiago Silva", "Marquinhos", "Lucas Paquetá", "Philippe Coutinho",
                "Hulk", "Éder Militão", "Gabriel Martinelli", "Casemiro"],
            "Brasileiro aposentado": [
                "Pelé", "Ronaldo Fenômeno", "Ronaldinho Gaúcho", "Romário", "Kaká",
                "Rivaldo", "Zico", "Sócrates", "Garrincha", "Roberto Carlos",
                "Cafu", "Dida", "Bebeto", "Adriano Imperador", "Juninho Pernambucano",
                "Marcos", "Rogério Ceni", "Taffarel", "Denílson"],
            "Jogador sul-americano em atividade": [
                "Lionel Messi", "Ángel Di María", "Lautaro Martínez", "Julián Álvarez",
                "Enzo Fernández", "Rodrigo De Paul", "Paulo Dybala", "Luis Suárez",
                "Federico Valverde", "Darwin Núñez", "James Rodríguez", "Luis Díaz",
                "Arturo Vidal", "Alexis Sánchez", "Vinícius Júnior", "Rodrygo",
                "Raphinha", "Richarlison", "Endrick", "Gabriel Jesus",
                "Bruno Guimarães", "Casemiro"],
            "Jogador sul-americano aposentado": [
                "Diego Maradona", "Sergio Agüero", "Carlos Valderrama", "Paolo Guerrero",
                "Carlos Tévez", "Pelé", "Ronaldo Fenômeno", "Ronaldinho Gaúcho",
                "Romário", "Kaká", "Rivaldo", "Zico", "Sócrates",
                "Garrincha", "Roberto Carlos", "Cafu", "Bebeto",
                "Adriano Imperador"],
            "Jogador europeu em atividade": [
                "Cristiano Ronaldo", "Kylian Mbappé", "Antoine Griezmann",
                "Lamine Yamal", "Rodri", "Harry Kane", "Jude Bellingham",
                "Bukayo Saka", "Phil Foden", "Manuel Neuer", "Jamal Musiala",
                "Virgil van Dijk", "Erling Haaland", "Robert Lewandowski",
                "Rafael Leão", "Kevin De Bruyne", "Romelu Lukaku",
                "Declan Rice", "Cole Palmer", "Pedri", "Gavi",
                "Luka Modrić", "Bruno Fernandes", "Bernardo Silva",
                "Alexander Isak", "Martin Ødegaard",
                "Desirré Doué", "Khvicha Kvaratskhelia"],
            "Jogador europeu aposentado": [
                "Zinedine Zidane", "Thierry Henry", "Karim Benzema", "Xavi",
                "Andrés Iniesta", "Sergio Ramos", "Iker Casillas", "Carles Puyol",
                "David Beckham", "Franz Beckenbauer", "Toni Kroos", "Paolo Maldini",
                "Gianluigi Buffon", "Johan Cruyff", "Ruud Gullit", "Gareth Bale",
                "Zlatan Ibrahimović", "Eusébio", "Petr Čech", "Eden Hazard",
                "Clarence Seedorf", "Wayne Rooney"],           
            "Time brasileiro": ["Corinthians", "Palmeiras", "São Paulo", "Santos", "Flamengo", "Fluminense", "Botafogo", "Vasco da Gama", "Grêmio", "Internacional", "Atlético Mineiro", "Cruzeiro", "Bahia", "Vitória", "Sport Recife", "Fortaleza", "Ceará", "Athletico Paranaense", "Coritiba", "Goiás", "Cuiabá", "Red Bull Bragantino", "América Mineiro", "Chapecoense", "Ponte Preta", "Guarani", "Portuguesa", "Juventude", "Avaí", "Náutico", "Santa Cruz", "Paysandu", "Remo", "Atlético Goianiense", "Criciúma", "Mirassol", "São Bernardo", "Ituano", "Novorizontino", "Ferroviária"],
            "Time europeu": ["Real Madrid", "Barcelona", "Atlético de Madrid", "Manchester United", "Manchester City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Bayern de Munique", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig", "Juventus", "Milan", "Inter de Milão", "Napoli", "Roma", "Lazio", "Paris Saint-Germain", "Olympique de Marseille", "Lyon", "Monaco", "Ajax", "Benfica", "Porto", "Sporting", "Celtic", "Rangers", "Galatasaray", "Fenerbahçe", "Real Sociedad", "Olympiacos"],
            "Seleção": ["Brasil", "Argentina", "Uruguai", "Colômbia", "Chile", "Paraguai", "Peru", "Bolívia", "México", "Estados Unidos", "Inglaterra", "França", "Alemanha", "Espanha", "Portugal", "Itália", "Holanda", "Bélgica", "Croácia", "Dinamarca", "Noruega", "Japão", "Coreia do Sul", "Austrália", "Arábia Saudita", "Marrocos", "Egito", "Costa do Marfim", "África do Sul", "Catar", "Turquia", "País de Gales"],
            "Técnico de futebol": ["Carlo Ancelotti", "Pep Guardiola", "José Mourinho", "Jürgen Klopp", "Abel Ferreira", "Dorival Júnior", "Tite", "Felipão", "Pofexô Luxemburgo", "Zagallo", "Fernando Diniz", "Rogério Ceni", "Renato Gaúcho", "Jorge Jesus", "Mano Menezes", "Zinedine Zidane", "Diego Simeone", "Luis Enrique"],
            "Posição do futebol": ["Goleiro", "Zagueiro", "Lateral-direito", "Lateral-esquerdo", "Ala", "Primeiro volante", "Segundo volante", "Meia central", "Meia ofensivo", "Armador", "Ponta-direita", "Ponta-esquerda", "Centroavante", "Segundo atacante", "Falso nove"],
            "Campeonato brasileiro": [
                "Brasileirão", "Copa do Brasil", "Supercopa do Brasil",
                "Libertadores", "Copa Sul-Americana", "Recopa Sul-Americana",
                "Copinha", "Campeonato Paulista", "Campeonato Carioca",
                "Campeonato Mineiro", "Campeonato Gaúcho", "Campeonato Baiano",
                "Copa do Nordeste"],
            "Campeonato de seleções": [
                "Copa do Mundo", "Copa América", "Eurocopa",
                "Jogos Olímpicos", "Copa Africana de Nações",
                "Liga das Nações", "Copa das Confederações", "Finalíssima"],
            "Campeonato europeu": [
                "Liga dos Campeões", "Liga Europa", "Conference League",
                "Mundial de Clubes", "Intercontinental",
                "Premier League", "La Liga", "Serie A italiana",
                "Bundesliga", "Ligue 1", "Eredivisie (Liga da Holanda)",
                "Primeira Liga (Portugal)",
                "Copa da Inglaterra", "Copa do Rei (Espanha)",]        
        },
        marvelDC: {
            "Herói da Marvel": [
                "Homem-Aranha", "Homem de Ferro", "Capitão América", "Thor",
                "Hulk", "Doutor Estranho", "Pantera Negra", "Wolverine",
                "Deadpool", "Demolidor", "Capitã Marvel", "Feiticeira Escarlate",
                "Visão", "Homem-Formiga", "Gavião Arqueiro", "Viúva Negra",
                "Senhor das Estrelas", "Groot", "Falcão", "Motoqueiro Fantasma"],
            "Herói da DC": [
                "Batman", "Superman", "Mulher-Maravilha", "Flash",
                "Aquaman", "Lanterna Verde", "Ciborgue", "Shazam",
                "Supergirl", "Robin", "Asa Noturna", "Batgirl",
                "Besouro Azul", "Arqueiro Verde", "Caçador de Marte",
                "Ravena", "Estelar", "Mutano", "Canário Negro", "Zatanna"],
            "Vilão da Marvel": [
                "Thanos", "Loki", "Duende Verde", "Doutor Destino",
                "Magneto", "Venom", "Ultron", "Kang",
                "Caveira Vermelha", "Hela", "Killmonger", "Mysterio",
                "Abutre", "Rei do Crime", "Dormammu", "Apocalipse",
                "Galactus", "Duende Macabro", "Dentes-de-Sabre", "Mandarim"],
            "Vilão da DC": [
                "Coringa", "Lex Luthor", "Darkseid", "Arlequina",
                "Charada", "Pinguim", "Duas-Caras", "Bane",
                "Espantalho", "Exterminador", "Sinestro", "Brainiac",
                "General Zod", "Mulher-Leopardo", "Adão Negro",
                "Sr. Frio", "Gorila Grodd", "Ares",],
            "Filme do MCU": [
                "Homem de Ferro", "Os Vingadores", "Thor: Ragnarok",
                "Pantera Negra", "Capitão América: Guerra Civil",
                "Doutor Estranho", "Guardiões da Galáxia",
                "Homem-Aranha: Sem Volta para Casa", "Vingadores: Ultimato",
                "Vingadores: Guerra Infinita", "Capitã Marvel",
                "Homem-Formiga", "Shang-Chi", "Eternos",
                "Viúva Negra", "Thor: Amor e Trovão",
                "Deadpool & Wolverine", "Homem-Aranha: De Volta ao Lar",
                "Pantera Negra: Wakanda Para Sempre", "As Marvels"],
            "Equipe de heróis": [
                "Vingadores", "X-Men", "Quarteto Fantástico",
                "Guardiões da Galáxia", "Liga da Justiça",
                "Jovens Titãs", "Esquadrão Suicida", "Sociedade da Justiça",
                "Defensores", "Inumanos",
                "Aves de Rapina", "Thunderbolts"],
            "Identidade secreta de herói": [
                "Peter Parker", "Bruce Wayne", "Clark Kent",
                "Tony Stark", "Matt Murdock",
                "Barry Allen", "Steve Rogers",
                "Dick Grayson", "T'Challa", "Oliver Queen",
                "Wade Wilson", "Bruce Banner", "Natasha Romanoff"],
            "Personagem dos X-Men": [
                "Wolverine", "Professor Xavier", "Magneto",
                "Tempestade", "Ciclope", "Jean Grey",
                "Mística", "Noturno", "Fera", "Gambit",
                "Vampira", "Colossus"]
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
    // ESTADO DO JOGO — temas começam TODOS desselecionados
    // ============================================================
    const state = {
        players: [],
        impostorCount: 1,
        impostorMode: 'blind',
        selectedThemes: new Set(),

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
    // CONFIGURAÇÃO — TEMAS (seleção múltipla)
    // ============================================================
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
        if (state.players.length < 3) {
            alert('Adicione pelo menos 3 jogadores!');
            return;
        }

        if (state.impostorCount >= state.players.length) {
            alert('O número de impostores deve ser menor que o número de jogadores!');
            return;
        }

        if (state.selectedThemes.size === 0) {
            alert('Selecione pelo menos um tema!');
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
        const cats = Array.from(state.selectedThemes);

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

        // Reseta abas para "Anuncie"
        adTabs.forEach(t => {
            const active = t.dataset.adTab === 'advertise';
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        adPanels.forEach(p => {
            p.classList.toggle('hidden', p.dataset.adPanel !== 'advertise');
        });

        // Reseta estados de cópia
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

    console.log('🎉 Impostor carregado com sucesso!');
});