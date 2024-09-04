// Função para buscar bandas por país e gênero musical
function searchBands() {
  const country = document.getElementById('country').value;
  const genre = document.querySelector('input[name="genre"]:checked').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpa os resultados anteriores

  if (country === '') {
    resultsDiv.innerHTML = '<p>Por favor, selecione um país.</p>';
    return;
  }

  const url = `https://musicbrainz.org/ws/2/artist/?query=country:${country} AND tag:${genre}&fmt=json`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const artists = data.artists;
      if (artists.length > 0) {
        resultsDiv.innerHTML = '<h2>Bandas encontradas:</h2>';
        artists.forEach((artist) => {
          const bandDiv = document.createElement('div');
          bandDiv.classList.add('band-info');
          bandDiv.innerHTML = `<strong>${artist.name}</strong>`;
          resultsDiv.appendChild(bandDiv);
        });
      } else {
        resultsDiv.innerHTML = `<p>Nenhuma banda de ${genre} encontrada para o país selecionado.</p>`;
      }
      // Rolar para a seção de resultados
      resultsDiv.scrollIntoView({ behavior: 'smooth' });
    })
    .catch((error) => {
      resultsDiv.innerHTML = '<p>Ocorreu um erro ao buscar as bandas.</p>';
      console.error('Erro:', error);
    });
}

// Função para buscar informações detalhadas sobre uma banda pelo nome
function searchBand() {
  const bandName = document.getElementById('bandName').value.trim();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpa os resultados anteriores

  if (bandName === '') {
    resultsDiv.innerHTML = '<p>Por favor, insira o nome de uma banda.</p>';
    return;
  }

  const musicBrainzUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(bandName)}&fmt=json`;

  fetch(musicBrainzUrl)
    .then((response) => response.json())
    .then((data) => {
      const artist = data.artists[0]; // Pegando apenas o primeiro resultado
      if (artist) {
        const country = formatCountry(artist.country);
        resultsDiv.innerHTML = '<h2>Informações encontradas:</h2>';

        const bandDiv = document.createElement('div');
        bandDiv.classList.add('band-info');

        // Chamada para a API do Discogs
        const discogsUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(artist.name)}&type=artist&token=IWKHJBLNOoQRqpFuSWcZFYfxCCDdDeNIMiktspOZ`;

        fetch(discogsUrl)
          .then((response) => response.json())
          .then((discogsData) => {
            let profile = 'Perfil não disponível';
            if (discogsData.results && discogsData.results.length > 0) {
              const artistId = discogsData.results[0].id;
              return fetch(`https://api.discogs.com/artists/${artistId}`);
            }
            return Promise.reject('Artista não encontrado no Discogs');
          })
          .then((response) => response.json())
          .then((artistData) => {
            profile = artistData.profile || 'Perfil não disponível';
          })
          .catch((error) => {
            console.error('Erro ao buscar perfil no Discogs:', error);
          })
          .finally(() => {
            const bandDetails = `
              <strong>Nome:</strong> ${artist.name} <br>
              <strong>País de Origem:</strong> ${country || 'N/A'} <br>
              <strong>Data de Início:</strong> ${formatDate(artist['life-span'].begin)} <br>
              <strong>Data de Fim:</strong> ${formatDate(artist['life-span'].end)} <br>
              <strong>Perfil:</strong> ${profile} <br>
              <strong>Tags:</strong> ${artist.tags ? artist.tags.map((tag) => tag.name).join(', ') : 'Nenhuma'}
            `;

            bandDiv.innerHTML = bandDetails;
            resultsDiv.appendChild(bandDiv);
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
          });
      } else {
        resultsDiv.innerHTML = '<p>Nenhuma banda encontrada com esse nome.</p>';
      }
    })
    .catch((error) => {
      resultsDiv.innerHTML = '<p>Ocorreu um erro ao buscar as informações da banda.</p>';
      console.error('Erro:', error);
    });
}

// Função para formatar a data no formato brasileiro (dia/mês/ano)
function formatDate(dateString) {
  if (!dateString) return 'N/A'; // Se a data for indefinida
  const [year, month, day] = dateString.split('-');
  return `${day ? day.padStart(2, '0') : '??'}/${month ? month.padStart(2, '0') : '??'}/${year}`;
}

// Função para formatar o país com nomes em português
function formatCountry(countryCode) {
  const countryNames = {
    BR: 'Brasil',
    US: 'Estados Unidos',
    GB: 'Inglaterra',
    // Adicione os outros países aqui
  };
  return countryNames[countryCode] || countryCode;
}

// Mostrar ou esconder o botão "Voltar ao Topo" com base na rolagem
window.onscroll = function () {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backToTopBtn.style.display = 'flex';
  } else {
    backToTopBtn.style.display = 'none';
  }
};

// Função para rolar suavemente até o topo
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
