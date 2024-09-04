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

  const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(bandName)}&fmt=json`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const artist = data.artists[0]; // Pegando apenas o primeiro resultado
      if (artist) {
        const country = formatCountry(artist.country);
        resultsDiv.innerHTML = '<h2>Informações encontradas:</h2>';

        const bandDiv = document.createElement('div');
        bandDiv.classList.add('band-info');

        const bandDetails = `
          <strong>Nome:</strong> ${artist.name} <br>
          <strong>País de Origem:</strong> ${country || 'N/A'} <br>
          <strong>Data de Início:</strong> ${formatDate(artist['life-span'].begin)} <br>
          <strong>Data de Fim:</strong> ${formatDate(artist['life-span'].end)} <br>
          <strong>Tags:</strong> ${artist.tags ? artist.tags.map((tag) => tag.name).join(', ') : 'Nenhuma'}
        `;

        bandDiv.innerHTML = bandDetails;
        resultsDiv.appendChild(bandDiv);
      } else {
        resultsDiv.innerHTML = '<p>Nenhuma banda encontrada com esse nome.</p>';
      }
      // Rolar para a seção de resultados
      resultsDiv.scrollIntoView({ behavior: 'smooth' });
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
      GB: 'Reino Unido',
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
