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