 // JS - Lógica da API
        async function buscarMusica() {
            const termo = document.getElementById('termoBusca').value;
            const container = document.getElementById('results');
            
            if (!termo) return alert("Digite algo para buscar!");
            
            container.innerHTML = "<p>Buscando...</p>";

            try {
                // Chamada para a iTunes Search API
                const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=song&limit=20`);

                const data = await response.json();
                
                container.innerHTML = ""; // Limpa o "Buscando..."

                if (data.results.length === 0) {
                    container.innerHTML = "<p>Nenhuma música encontrada.</p>";
                    return;
                }

                data.results.forEach(musica => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${musica.artworkUrl100.replace('100x100', '600x600')}" alt="Capa">
        <h3>${musica.trackName}</h3>
        <p>${musica.artistName}</p>
        <audio controls src="${musica.previewUrl}"></audio>
        <a href="${musica.trackViewUrl}" target="_blank" 
           style="display:block; margin-top:10px; color:#1DB954; text-decoration:none; font-size:12px;">
           Ver no Apple Music →
        </a>
    `;
    container.appendChild(card);
});

            } catch (erro) {
                console.error("Erro ao buscar:", erro);
                container.innerHTML = "<p>Ocorreu um erro na busca.</p>";
            }
        }

        // Permite buscar ao apertar "Enter"
        document.getElementById('termoBusca').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') buscarMusica();
        });
    