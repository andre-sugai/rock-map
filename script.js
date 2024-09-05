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
async function searchBand() {
  const bandNameInput = document.getElementById('bandName');
  const bandName = bandNameInput.value.trim();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpa os resultados anteriores

  if (bandName === '') {
    resultsDiv.innerHTML = '<p>Por favor, insira o nome de uma banda.</p>';
    return;
  }

  // Limpa o campo de busca
  bandNameInput.value = '';

  const musicBrainzUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(bandName)}&fmt=json`;

  try {
    const response = await fetch(musicBrainzUrl);
    const data = await response.json();
    const artist = data.artists[0]; // Pegando apenas o primeiro resultado

    if (artist) {
      const country = formatCountry(artist.country);
      resultsDiv.innerHTML = '<h2>Informações encontradas:</h2>';

      const bandDiv = document.createElement('div');
      bandDiv.classList.add('band-info');

      // Chamada para a API do Discogs
      const discogsUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(artist.name)}&type=artist&token=IWKHJBLNOoQRqpFuSWcZFYfxCCDdDeNIMiktspOZ`;

      try {
        console.log('Buscando informações no Discogs...');
        const discogsResponse = await fetch(discogsUrl);
        const discogsData = await discogsResponse.json();
        let profile = 'Perfil não disponível';
        let urls = [];

        if (discogsData.results && discogsData.results.length > 0) {
          const artistId = discogsData.results[0].id;
          console.log(`ID do artista no Discogs: ${artistId}`);
          const artistResponse = await fetch(`https://api.discogs.com/artists/${artistId}`);
          const artistData = await artistResponse.json();
          profile = artistData.profile || 'Perfil não disponível';
          urls = artistData.urls || [];
          console.log('Perfil original:', profile);
          console.log('URLs de contato:', urls);

          // Substituir códigos de artista por nomes
          console.log('Substituindo códigos de artista...');
          profile = await replaceArtistCodes(profile);
          console.log('Perfil após substituição de códigos de artista:', profile);

          // Substituir códigos de álbum por nomes
          console.log('Substituindo códigos de álbum...');
          profile = await replaceAlbumCodes(profile);
          console.log('Perfil após substituição de códigos de álbum:', profile);
        }

        // Remove os colchetes e [a=, mantém o conteúdo dentro (incluindo "Artista" de [a=Artista]), exceto URLs
        profile = profile.replace(/\[a=|\[url=.*?\].*?\[\/url\]|\[|\]/g, '').trim();
        console.log('Perfil após remoção de colchetes:', profile);

        // Converter entidades HTML para seus caracteres correspondentes
        profile = decodeHTMLEntities(profile);

        console.log('Traduzindo perfil...');
        const translatedProfile = await translateText(profile);
        console.log('Perfil traduzido:', translatedProfile);

        // Formatar as URLs de contato
        const formattedUrls = urls.map(url => `<a href="${url}" target="_blank">${url}</a>`).join('<br>');

        const bandDetails = `
          <strong>Nome:</strong> ${artist.name} <br>
          <strong>País de Origem:</strong> ${country || 'N/A'} <br>
          <strong>Data de Início:</strong> ${formatDate(artist['life-span'].begin)} <br>
          <strong>Data de Fim:</strong> ${formatDate(artist['life-span'].end)} <br>
          <strong>Perfil:</strong>&nbsp;${formatProfile(translatedProfile)} <br>
          <strong>URLs de Contato:</strong><br>${formattedUrls || 'Nenhuma URL disponível'} <br>
          <strong>Tags:</strong> ${artist.tags ? artist.tags.map((tag) => tag.name).join(', ') : 'Nenhuma'}
        `;

        bandDiv.innerHTML = bandDetails;
        resultsDiv.appendChild(bandDiv);
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Erro ao buscar ou traduzir o perfil:', error);
        const bandDetails = `
          <strong>Nome:</strong> ${artist.name} <br>
          <strong>País de Origem:</strong> ${country || 'N/A'} <br>
          <strong>Data de Início:</strong> ${formatDate(artist['life-span'].begin)} <br>
          <strong>Data de Fim:</strong> ${formatDate(artist['life-span'].end)} <br>
          <strong>Perfil:</strong> Não foi possível obter ou traduzir o perfil <br>
          <strong>Tags:</strong> ${artist.tags ? artist.tags.map((tag) => tag.name).join(', ') : 'Nenhuma'}
        `;
        bandDiv.innerHTML = bandDetails;
        resultsDiv.appendChild(bandDiv);
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      resultsDiv.innerHTML = '<p>Nenhuma banda encontrada com esse nome.</p>';
    }
  } catch (error) {
    resultsDiv.innerHTML = '<p>Ocorreu um erro ao buscar as informações da banda.</p>';
    console.error('Erro:', error);
  }
}

// Função para substituir códigos de artista por nomes
async function replaceArtistCodes(text) {
  const regex = /a\d+/g;
  const codes = text.match(regex) || [];
  console.log('Códigos de artista encontrados:', codes);
  
  for (const code of codes) {
    try {
      console.log(`Buscando informações para o código ${code}...`);
      const response = await fetch(`https://api.discogs.com/artists/${code.substring(1)}`, {
        headers: {
          'User-Agent': 'YourAppName/1.0',
          'Authorization': 'Discogs token=IWKHJBLNOoQRqpFuSWcZFYfxCCDdDeNIMiktspOZ'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.name) {
        console.log(`Nome do artista para o código ${code}: ${data.name}`);
        text = text.replace(new RegExp(code, 'g'), data.name);
      } else {
        console.log(`Nenhum nome encontrado para o código ${code}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar informações para o código ${code}:`, error);
    }
  }
  
  return text;
}

// Função para substituir códigos de álbum por nomes
async function replaceAlbumCodes(text) {
  const regex = /m=(\d+)/g;
  const codes = text.match(regex) || [];
  console.log('Códigos de álbum encontrados:', codes);
  
  for (const code of codes) {
    try {
      const albumId = code.split('=')[1];
      console.log(`Buscando informações para o álbum ${albumId}...`);
      const response = await fetch(`https://api.discogs.com/masters/${albumId}`, {
        headers: {
          'User-Agent': 'YourAppName/1.0',
          'Authorization': 'Discogs token=SEU_TOKEN_AQUI'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.title) {
        console.log(`Nome do álbum para o código ${code}: ${data.title}`);
        text = text.replace(new RegExp(code, 'g'), data.title);
      } else {
        console.log(`Nenhum nome encontrado para o código ${code}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar informações para o código ${code}:`, error);
    }
  }
  
  return text;
}

// Função para traduzir o texto usando MyMemory API
async function translateText(text) {
  const apiKey = 'guitarfreaks@gmail.com'; // Use seu e-mail como chave de API
  const encodedText = encodeURIComponent(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|pt-BR&de=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else {
      throw new Error('Falha na tradução');
    }
  } catch (error) {
    console.error('Erro na tradução:', error);
    return text; // Retorna o texto original se houver erro na tradução
  }
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
    AD: 'Andorra',
    AE: 'Emirados Árabes Unidos',
    AF: 'Afeganistão',
    AG: 'Antígua e Barbuda',
    AI: 'Anguilla',
    AL: 'Albânia',
    AM: 'Armênia',
    AO: 'Angola',
    AQ: 'Antártida',
    AR: 'Argentina',
    AS: 'Samoa Americana',
    AT: 'Áustria',
    AU: 'Austrália',
    AW: 'Aruba',
    AX: 'Ilhas Åland',
    AZ: 'Azerbaijão',
    BA: 'Bósnia e Herzegovina',
    BB: 'Barbados',
    BD: 'Bangladesh',
    BE: 'Bélgica',
    BF: 'Burkina Faso',
    BG: 'Bulgária',
    BH: 'Bahrein',
    BI: 'Burundi',
    BJ: 'Benin',
    BL: 'São Bartolomeu',
    BM: 'Bermudas',
    BN: 'Brunei',
    BO: 'Bolívia',
    BQ: 'Caribe Neerlandês',
    BR: 'Brasil',
    BS: 'Bahamas',
    BT: 'Butão',
    BV: 'Ilha Bouvet',
    BW: 'Botsuana',
    BY: 'Bielorrússia',
    BZ: 'Belize',
    CA: 'Canadá',
    CC: 'Ilhas Cocos (Keeling)',
    CD: 'República Democrática do Congo',
    CF: 'República Centro-Africana',
    CG: 'Congo',
    CH: 'Suíça',
    CI: 'Costa do Marfim',
    CK: 'Ilhas Cook',
    CL: 'Chile',
    CM: 'Camarões',
    CN: 'China',
    CO: 'Colômbia',
    CR: 'Costa Rica',
    CU: 'Cuba',
    CV: 'Cabo Verde',
    CW: 'Curaçao',
    CX: 'Ilha Christmas',
    CY: 'Chipre',
    CZ: 'República Tcheca',
    DE: 'Alemanha',
    DJ: 'Djibuti',
    DK: 'Dinamarca',
    DM: 'Dominica',
    DO: 'República Dominicana',
    DZ: 'Argélia',
    EC: 'Equador',
    EE: 'Estônia',
    EG: 'Egito',
    EH: 'Saara Ocidental',
    ER: 'Eritreia',
    ES: 'Espanha',
    ET: 'Etiópia',
    FI: 'Finlândia',
    FJ: 'Fiji',
    FK: 'Ilhas Malvinas',
    FM: 'Micronésia',
    FO: 'Ilhas Faroe',
    FR: 'França',
    GA: 'Gabão',
    GB: 'Inglaterra',
    GD: 'Granada',
    GE: 'Geórgia',
    GF: 'Guiana Francesa',
    GG: 'Guernsey',
    GH: 'Gana',
    GI: 'Gibraltar',
    GL: 'Groenlândia',
    GM: 'Gâmbia',
    GN: 'Guiné',
    GP: 'Guadalupe',
    GQ: 'Guiné Equatorial',
    GR: 'Grécia',
    GS: 'Geórgia do Sul e Ilhas Sandwich do Sul',
    GT: 'Guatemala',
    GU: 'Guam',
    GW: 'Guiné-Bissau',
    GY: 'Guiana',
    HK: 'Hong Kong',
    HM: 'Ilhas Heard e McDonald',
    HN: 'Honduras',
    HR: 'Croácia',
    HT: 'Haiti',
    HU: 'Hungria',
    ID: 'Indonésia',
    IE: 'Irlanda',
    IL: 'Israel',
    IM: 'Ilha de Man',
    IN: 'Índia',
    IO: 'Território Britânico do Oceano Índico',
    IQ: 'Iraque',
    IR: 'Irã',
    IS: 'Islândia',
    IT: 'Itália',
    JE: 'Jersey',
    JM: 'Jamaica',
    JO: 'Jordânia',
    JP: 'Japão',
    KE: 'Quênia',
    KG: 'Quirguistão',
    KH: 'Camboja',
    KI: 'Quiribati',
    KM: 'Comores',
    KN: 'São Cristóvão e Nevis',
    KP: 'Coreia do Norte',
    KR: 'Coreia do Sul',
    KW: 'Kuwait',
    KY: 'Ilhas Cayman',
    KZ: 'Cazaquistão',
    LA: 'Laos',
    LB: 'Líbano',
    LC: 'Santa Lúcia',
    LI: 'Liechtenstein',
    LK: 'Sri Lanka',
    LR: 'Libéria',
    LS: 'Lesoto',
    LT: 'Lituânia',
    LU: 'Luxemburgo',
    LV: 'Letônia',
    LY: 'Líbia',
    MA: 'Marrocos',
    MC: 'Mônaco',
    MD: 'Moldávia',
    ME: 'Montenegro',
    MF: 'São Martinho',
    MG: 'Madagáscar',
    MH: 'Ilhas Marshall',
    MK: 'Macedônia do Norte',
    ML: 'Mali',
    MM: 'Mianmar',
    MN: 'Mongólia',
    MO: 'Macau',
    MP: 'Ilhas Marianas do Norte',
    MQ: 'Martinica',
    MR: 'Mauritânia',
    MS: 'Montserrat',
    MT: 'Malta',
    MU: 'Maurícia',
    MV: 'Maldivas',
    MW: 'Malawi',
    MX: 'México',
    MY: 'Malásia',
    MZ: 'Moçambique',
    NA: 'Namíbia',
    NC: 'Nova Caledônia',
    NE: 'Níger',
    NF: 'Ilha Norfolk',
    NG: 'Nigéria',
    NI: 'Nicarágua',
    NL: 'Países Baixos',
    NO: 'Noruega',
    NP: 'Nepal',
    NR: 'Nauru',
    NU: 'Niue',
    NZ: 'Nova Zelândia',
    OM: 'Omã',
    PA: 'Panamá',
    PE: 'Peru',
    PF: 'Polinésia Francesa',
    PG: 'Papua-Nova Guiné',
    PH: 'Filipinas',
    PK: 'Paquistão',
    PL: 'Polônia',
    PM: 'São Pedro e Miquelão',
    PN: 'Ilhas Pitcairn',
    PR: 'Porto Rico',
    PS: 'Palestina',
    PT: 'Portugal',
    PW: 'Palau',
    PY: 'Paraguai',
    QA: 'Catar',
    RE: 'Reunião',
    RO: 'Romênia',
    RS: 'Sérvia',
    RU: 'Rússia',
    RW: 'Ruanda',
    SA: 'Arábia Saudita',
    SB: 'Ilhas Salomão',
    SC: 'Seicheles',
    SD: 'Sudão',
    SE: 'Suécia',
    SG: 'Singapura',
    SH: 'Santa Helena, Ascensão e Tristão da Cunha',
    SI: 'Eslovênia',
    SJ: 'Svalbard e Jan Mayen',
    SK: 'Eslováquia',
    SL: 'Serra Leoa',
    SM: 'San Marino',
    SN: 'Senegal',
    SO: 'Somália',
    SR: 'Suriname',
    SS: 'Sudão do Sul',
    ST: 'São Tomé e Príncipe',
    SV: 'El Salvador',
    SX: 'Sint Maarten',
    SY: 'Síria',
    SZ: 'Eswatini',
    TC: 'Ilhas Turks e Caicos',
    TD: 'Chade',
    TF: 'Territórios Franceses do Sul',
    TG: 'Togo',
    TH: 'Tailândia',
    TJ: 'Tadjiquistão',
    TK: 'Tokelau',
    TL: 'Timor-Leste',
    TM: 'Turcomenistão',
    TN: 'Tunísia',
    TO: 'Tonga',
    TR: 'Turquia',
    TT: 'Trinidad e Tobago',
    TV: 'Tuvalu',
    TW: 'Taiwan',
    TZ: 'Tanzânia',
    UA: 'Ucrânia',
    UG: 'Uganda',
    UM: 'Ilhas Menores Distantes dos EUA',
    US: 'Estados Unidos',
    UY: 'Uruguai',
    UZ: 'Uzbequistão',
    VA: 'Vaticano',
    VC: 'São Vicente e Granadinas',
    VE: 'Venezuela',
    VG: 'Ilhas Virgens Britânicas',
    VI: 'Ilhas Virgens dos EUA',
    VN: 'Vietnã',
    VU: 'Vanuatu',
    WF: 'Wallis e Futuna',
    WS: 'Samoa',
    YE: 'Iêmen',
    YT: 'Mayotte',
    ZA: 'África do Sul',
    ZM: 'Zâmbia',
    ZW: 'Zimbábue'
  };
  
  let countryName = countryNames[countryCode] || countryCode;
  
  // Substituir "Reino Unido" por "Inglaterra"
  if (countryName === 'Reino Unido') {
    countryName = 'Inglaterra';
  }
  
  return countryName;
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

// Função para decodificar entidades HTML
function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

// Função para formatar o perfil, preservando quebras de linha e adicionando estilos
function formatProfile(profile) {
  // Substitui quebras de linha por <br> para preservar a formatação
  const formattedProfile = profile.replace(/\n/g, '<br>');
  
  // Envolve o perfil formatado em uma span com estilos
  return `<span style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">${formattedProfile}</span>`;
}

// Função para tornar o accordion funcional
document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            
            // Fechar outros itens do accordion
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });
        });
    });
});
