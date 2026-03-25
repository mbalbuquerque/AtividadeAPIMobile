// 1. Registo do Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker: Ativo"));
}

// 2. Função de Busca (API iTunes)
async function buscarMusica() {
    const termo = document.getElementById('termoBusca').value;
    const container = document.getElementById('results');
    
    if (!termo) return alert("Digite o nome de um artista ou música!");

    container.innerHTML = "<div class='loader'><h2>A procurar melodias...</h2></div>";

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=song&limit=20`);
        const data = await response.json();
        
        container.innerHTML = ""; // Limpa a busca
        
        if (data.results.length === 0) {
            container.innerHTML = "<h2>Nenhuma música encontrada.</h2>";
            return;
        }

        renderizarCards(data.results, "Resultados da Busca");
    } catch (erro) {
        container.innerHTML = "<h2>Erro ao ligar ao servidor.</h2>";
    }
}

// 3. Renderização de Cards de Música
function renderizarCards(lista, titulo) {
    const container = document.getElementById('results');
    const favsAtuais = JSON.parse(localStorage.getItem('meusFavs')) || [];
    
    const sectionTitle = document.createElement('h2');
    sectionTitle.innerText = titulo;
    container.appendChild(sectionTitle);

    const grid = document.createElement('div');
    grid.className = 'music-grid';

    lista.forEach(musica => {
        const ehFav = favsAtuais.some(m => m.trackId === musica.trackId);
        const card = document.createElement('div');
        card.className = 'music-card';
        
        // Proteção para caracteres especiais no JSON
        const musicaData = JSON.stringify(musica).replace(/'/g, "&apos;");

        card.innerHTML = `
            <button class="fav-btn ${ehFav ? 'active' : ''}" onclick='alternarFavorito(${musicaData}, this)'>
                ${ehFav ? '❤️' : '♡'}
            </button>
            <img src="${musica.artworkUrl100.replace('100x100', '600x600')}" loading="lazy">
            <div class="info">
                <h3>${musica.trackName}</h3>
                <p>${musica.artistName}</p>
            </div>
            <audio controls src="${musica.previewUrl}" onplay="registrarPlay('${musica.trackName}')"></audio>
        `;
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

// 4. Lógica de Favoritos
function alternarFavorito(musica, btn) {
    let favs = JSON.parse(localStorage.getItem('meusFavs')) || [];
    const index = favs.findIndex(m => m.trackId === musica.trackId);

    if (index > -1) {
        favs.splice(index, 1);
        btn.innerText = "♡";
        btn.classList.remove('active');
    } else {
        favs.push(musica);
        btn.innerText = "❤️";
        btn.classList.add('active');
    }
    localStorage.setItem('meusFavs', JSON.stringify(favs));
}

// 5. Lógica de Mais Ouvidas
function registrarPlay(nome) {
    let plays = JSON.parse(localStorage.getItem('maisOuvidas')) || {};
    plays[nome] = (plays[nome] || 0) + 1;
    localStorage.setItem('maisOuvidas', JSON.stringify(plays));
}

// 6. HOME MODERNA (Central de Descoberta)
function irParaHome() {
    const container = document.getElementById('results');
    document.getElementById('termoBusca').value = "";

    container.innerHTML = `
        <div class="home-wrapper">
            <h2 class="welcome-text">Olá! O que vamos ouvir hoje?</h2>
            
            <div class="home-grid">
                <div class="home-card fav-section" onclick="mostrarFavoritos()">
                    <span class="icon">❤️</span>
                    <div class="card-text">
                        <span class="title">Favoritos</span>
                        <span class="desc">As tuas músicas salvas</span>
                    </div>
                </div>
                
                <div class="home-card trend-section" onclick="mostrarMaisOuvidas()">
                    <span class="icon">🔥</span>
                    <div class="card-text">
                        <span class="title">Mais Ouvidas</span>
                        <span class="desc">O teu top pessoal</span>
                    </div>
                </div>

                <div class="home-card search-focus" onclick="focarBusca()">
                    <span class="icon">🔍</span>
                    <div class="card-text">
                        <span class="title">Explorar</span>
                        <span class="desc">Descobrir novos sons</span>
                    </div>
                </div>
            </div>

            <button onclick="limparDados()" class="btn-clean">🗑️ Limpar tudo</button>
        </div>
    `;
}

// 7. Funções de Navegação
function mostrarFavoritos() {
    const favs = JSON.parse(localStorage.getItem('meusFavs')) || [];
    const container = document.getElementById('results');
    container.innerHTML = "";
    favs.length ? renderizarCards(favs, "Teus Favoritos") : container.innerHTML = "<h2>Ainda não tens favoritos ❤️</h2><button onclick='irParaHome()'>Voltar</button>";
}

function mostrarMaisOuvidas() {
    const plays = JSON.parse(localStorage.getItem('maisOuvidas')) || {};
    const ordenadas = Object.entries(plays).sort((a,b) => b[1] - a[1]).slice(0,5);
    const container = document.getElementById('results');
    container.innerHTML = "<h2>O Teu Top 5</h2>";
    
    if (ordenadas.length === 0) {
        container.innerHTML += "<p>Ouve algumas músicas primeiro!</p>";
        return;
    }

    ordenadas.forEach(([nome, qtd]) => {
        container.innerHTML += `<div class="card-mini"><strong>${nome}</strong> <span>${qtd} plays</span></div>`;
    });
}

function focarBusca() {
    document.getElementById('termoBusca').focus();
}

function limparDados() {
    if(confirm("Desejas apagar todos os teus dados locais?")) {
        localStorage.clear();
        irParaHome();
    }
}

// Tecla Enter para busca
document.getElementById('termoBusca').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarMusica();
});

// Inicialização
irParaHome();
