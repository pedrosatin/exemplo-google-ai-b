import { CityTransitData, LineAlert } from '../types';

export const CITIES_DATA: CityTransitData[] = [
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    country: 'Brasil',
    center: [-23.5505, -46.6333],
    zoom: 13,
    currency: 'BRL',
    currencySymbol: 'R$',
    baseFareSingle: 5.00,
    baseFareIntegrated: 8.20,
    cardName: 'Bilhete Único',
    stations: [
      // Linha 1 - Azul
      { id: 'sp-tucuruvi', name: 'Tucuruvi', lat: -23.4795, lng: -46.6033, lines: ['sp-l1'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-santana', name: 'Santana', lat: -23.5028, lng: -46.6247, lines: ['sp-l1'], isAccessible: true, hasElevator: true },
      { id: 'sp-tiete', name: 'Portuguesa-Tietê (Rodoviária)', lat: -23.5163, lng: -46.6253, lines: ['sp-l1', 'sp-bus-expresso'], isAccessible: true, hasElevator: true },
      { id: 'sp-luz', name: 'Luz', lat: -23.5365, lng: -46.6341, lines: ['sp-l1', 'sp-l4', 'sp-l7', 'sp-l11'], isAccessible: true, hasElevator: true },
      { id: 'sp-sao-bento', name: 'São Bento', lat: -23.5446, lng: -46.6343, lines: ['sp-l1'], isAccessible: true, hasElevator: true },
      { id: 'sp-se', name: 'Sé (Catedral)', lat: -23.5501, lng: -46.6339, lines: ['sp-l1', 'sp-l3'], isAccessible: true, hasElevator: true },
      { id: 'sp-liberdade', name: 'Japão-Liberdade', lat: -23.5552, lng: -46.6358, lines: ['sp-l1'], isAccessible: true, hasElevator: true },
      { id: 'sp-paraiso', name: 'Paraíso', lat: -23.5772, lng: -46.6409, lines: ['sp-l1', 'sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-ana-rosa', name: 'Ana Rosa', lat: -23.5816, lng: -46.6384, lines: ['sp-l1', 'sp-l2'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-santa-cruz', name: 'Santa Cruz', lat: -23.5989, lng: -46.6366, lines: ['sp-l1', 'sp-l5'], isAccessible: true, hasElevator: true },
      { id: 'sp-jabaquara', name: 'Jabaquara (Terminal/EMTU)', lat: -23.6465, lng: -46.6415, lines: ['sp-l1', 'sp-bus-abd'], isAccessible: true, hasElevator: true, hasBicycleParking: true },

      // Linha 2 - Verde
      { id: 'sp-vila-madalena', name: 'Vila Madalena', lat: -23.5463, lng: -46.6909, lines: ['sp-l2'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-sumare', name: 'Sumaré', lat: -23.5513, lng: -46.6784, lines: ['sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-clinicas', name: 'Clínicas (HCFMUSP)', lat: -23.5544, lng: -46.6713, lines: ['sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-consolacao', name: 'Consolação (Av. Paulista)', lat: -23.5579, lng: -46.6603, lines: ['sp-l2', 'sp-l4'], isAccessible: true, hasElevator: true },
      { id: 'sp-trianon-masp', name: 'Trianon-MASP', lat: -23.5638, lng: -46.6547, lines: ['sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-brigadeiro', name: 'Brigadeiro', lat: -23.5694, lng: -46.6478, lines: ['sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-chacara-klabin', name: 'Chácara Klabin', lat: -23.5925, lng: -46.6294, lines: ['sp-l2', 'sp-l5'], isAccessible: true, hasElevator: true },
      { id: 'sp-vila-prudente', name: 'Vila Prudente', lat: -23.5852, lng: -46.5828, lines: ['sp-l2', 'sp-l15', 'sp-bus-expresso'], isAccessible: true, hasElevator: true, hasBicycleParking: true },

      // Linha 3 - Vermelha
      { id: 'sp-barra-funda', name: 'Palmeiras-Barra Funda', lat: -23.5255, lng: -46.6669, lines: ['sp-l3', 'sp-l7', 'sp-l8'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-santa-cecilia', name: 'Santa Cecília', lat: -23.5393, lng: -46.6496, lines: ['sp-l3'], isAccessible: true, hasElevator: true },
      { id: 'sp-republica', name: 'República (Teatro Municipal)', lat: -23.5441, lng: -46.6429, lines: ['sp-l3', 'sp-l4'], isAccessible: true, hasElevator: true },
      { id: 'sp-bras', name: 'Brás', lat: -23.5434, lng: -46.6167, lines: ['sp-l3', 'sp-l7', 'sp-l10', 'sp-l11', 'sp-l12'], isAccessible: true, hasElevator: true },
      { id: 'sp-tatuape', name: 'Tatuapé (Shopping)', lat: -23.5404, lng: -46.5768, lines: ['sp-l3', 'sp-l11', 'sp-l12'], isAccessible: true, hasElevator: true },
      { id: 'sp-itaquera', name: 'Corinthians-Itaquera', lat: -23.5424, lng: -46.4711, lines: ['sp-l3', 'sp-l11'], isAccessible: true, hasElevator: true, hasBicycleParking: true },

      // Linha 4 - Amarela
      { id: 'sp-paulista', name: 'Paulista', lat: -23.5552, lng: -46.6622, lines: ['sp-l4', 'sp-l2'], isAccessible: true, hasElevator: true },
      { id: 'sp-oscar-freire', name: 'Oscar Freire (Jardins)', lat: -23.5598, lng: -46.6718, lines: ['sp-l4'], isAccessible: true, hasElevator: true },
      { id: 'sp-fradique-coutinho', name: 'Fradique Coutinho', lat: -23.5662, lng: -46.6841, lines: ['sp-l4'], isAccessible: true, hasElevator: true },
      { id: 'sp-faria-lima', name: 'Faria Lima (Centro Financeiro)', lat: -23.5678, lng: -46.6939, lines: ['sp-l4'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-pinheiros', name: 'Pinheiros', lat: -23.5664, lng: -46.7027, lines: ['sp-l4', 'sp-l9'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-butanta', name: 'Butantã (USP)', lat: -23.5718, lng: -46.7082, lines: ['sp-l4'], isAccessible: true, hasElevator: true, hasBicycleParking: true },
      { id: 'sp-morumbi-l4', name: 'São Paulo-Morumbi (Estádio)', lat: -23.5866, lng: -46.7237, lines: ['sp-l4'], isAccessible: true, hasElevator: true },
      { id: 'sp-vila-sonia', name: 'Vila Sônia', lat: -23.5952, lng: -46.7369, lines: ['sp-l4'], isAccessible: true, hasElevator: true, hasBicycleParking: true },

      // Linha 9 - Esmeralda (Trem Metropolitano)
      { id: 'sp-cidade-universitaria', name: 'Cidade Universitária', lat: -23.5542, lng: -46.7077, lines: ['sp-l9'], isAccessible: true, hasElevator: true },
      { id: 'sp-hebraica-reboucas', name: 'Hebraica-Rebouças (Shopping Eldorado)', lat: -23.5755, lng: -46.6989, lines: ['sp-l9'], isAccessible: true, hasElevator: true },
      { id: 'sp-vila-olimpia', name: 'Vila Olímpia', lat: -23.5932, lng: -46.6931, lines: ['sp-l9'], isAccessible: true, hasElevator: true },
      { id: 'sp-berrini', name: 'Berrini (Brooklin Novo)', lat: -23.6063, lng: -46.6967, lines: ['sp-l9'], isAccessible: true, hasElevator: true },
      { id: 'sp-morumbi-l9', name: 'Morumbi (Chucri Zaidan)', lat: -23.6212, lng: -46.7021, lines: ['sp-l9'], isAccessible: true, hasElevator: true },
      { id: 'sp-santo-amaro', name: 'Santo Amaro', lat: -23.6558, lng: -46.7214, lines: ['sp-l9', 'sp-l5'], isAccessible: true, hasElevator: true },

      // Linha 5 - Lilás
      { id: 'sp-moema', name: 'Moema (Parque Ibirapuera)', lat: -23.6033, lng: -46.6621, lines: ['sp-l5'], isAccessible: true, hasElevator: true },
      { id: 'sp-aacd-servidor', name: 'AACD-Servidor', lat: -23.5977, lng: -46.6521, lines: ['sp-l5'], isAccessible: true, hasElevator: true },
      { id: 'sp-hospital-sao-paulo', name: 'Hospital São Paulo', lat: -23.5982, lng: -46.6445, lines: ['sp-l5'], isAccessible: true, hasElevator: true },

      // Linha de Ônibus Corredor Rebouças / Paulista Expresso
      { id: 'sp-bus-paulista-reboucas', name: 'Parada Rebouças/Paulista (Corredor BRT)', lat: -23.5568, lng: -46.6612, lines: ['sp-bus-reboucas', 'sp-bus-expresso'], isAccessible: true, hasElevator: false },
      { id: 'sp-bus-faria-lima', name: 'Parada Faria Lima / Rebouças', lat: -23.5682, lng: -46.6925, lines: ['sp-bus-reboucas'], isAccessible: true, hasElevator: false },
      { id: 'sp-bus-masp', name: 'Parada Trianon MASP (Av. Paulista)', lat: -23.5615, lng: -46.6560, lines: ['sp-bus-expresso'], isAccessible: true, hasElevator: false },
      { id: 'sp-bus-ibirapuera', name: 'Parada Portão 3 - Parque Ibirapuera', lat: -23.5874, lng: -46.6576, lines: ['sp-bus-expresso'], isAccessible: true, hasElevator: false },
    ],
    lines: [
      {
        id: 'sp-l1',
        name: 'Linha 1 - Azul',
        shortName: 'L1 Azul',
        mode: 'subway',
        color: '#0055a5',
        textColor: '#ffffff',
        operator: 'Metrô de São Paulo',
        frequencyPeakMin: 2,
        frequencyOffPeakMin: 4,
        status: 'normal',
        statusDetails: 'Circulação regular em todas as estações.',
        fare: 5.00,
        stations: ['sp-tucuruvi', 'sp-santana', 'sp-tiete', 'sp-luz', 'sp-sao-bento', 'sp-se', 'sp-liberdade', 'sp-paraiso', 'sp-ana-rosa', 'sp-santa-cruz', 'sp-jabaquara']
      },
      {
        id: 'sp-l2',
        name: 'Linha 2 - Verde',
        shortName: 'L2 Verde',
        mode: 'subway',
        color: '#00805c',
        textColor: '#ffffff',
        operator: 'Metrô de São Paulo',
        frequencyPeakMin: 2.5,
        frequencyOffPeakMin: 4.5,
        status: 'normal',
        statusDetails: 'Operação dentro do horário programado.',
        fare: 5.00,
        stations: ['sp-vila-madalena', 'sp-sumare', 'sp-clinicas', 'sp-consolacao', 'sp-trianon-masp', 'sp-brigadeiro', 'sp-paraiso', 'sp-ana-rosa', 'sp-chacara-klabin', 'sp-vila-prudente']
      },
      {
        id: 'sp-l3',
        name: 'Linha 3 - Vermelha',
        shortName: 'L3 Vermelha',
        mode: 'subway',
        color: '#ee3124',
        textColor: '#ffffff',
        operator: 'Metrô de São Paulo',
        frequencyPeakMin: 1.8,
        frequencyOffPeakMin: 3.5,
        status: 'normal',
        statusDetails: 'Intervalo médio de 110 segundos no horário de pico.',
        fare: 5.00,
        stations: ['sp-barra-funda', 'sp-santa-cecilia', 'sp-republica', 'sp-se', 'sp-bras', 'sp-tatuape', 'sp-itaquera']
      },
      {
        id: 'sp-l4',
        name: 'Linha 4 - Amarela',
        shortName: 'L4 Amarela',
        mode: 'subway',
        color: '#ffd100',
        textColor: '#000000',
        operator: 'ViaQuatro (Concessionária)',
        frequencyPeakMin: 2,
        frequencyOffPeakMin: 3.5,
        status: 'normal',
        statusDetails: 'Trens automatizados (GoA4) operando com velocidade e frequência ideais.',
        fare: 5.00,
        stations: ['sp-luz', 'sp-republica', 'sp-paulista', 'sp-oscar-freire', 'sp-fradique-coutinho', 'sp-faria-lima', 'sp-pinheiros', 'sp-butanta', 'sp-morumbi-l4', 'sp-vila-sonia']
      },
      {
        id: 'sp-l5',
        name: 'Linha 5 - Lilás',
        shortName: 'L5 Lilás',
        mode: 'subway',
        color: '#9b388b',
        textColor: '#ffffff',
        operator: 'ViaMobilidade',
        frequencyPeakMin: 3,
        frequencyOffPeakMin: 5,
        status: 'normal',
        statusDetails: 'Operando normalmente com integração livre nas estações Chácara Klabin e Santa Cruz.',
        fare: 5.00,
        stations: ['sp-chacara-klabin', 'sp-santa-cruz', 'sp-hospital-sao-paulo', 'sp-aacd-servidor', 'sp-moema', 'sp-santo-amaro']
      },
      {
        id: 'sp-l9',
        name: 'Linha 9 - Esmeralda',
        shortName: 'L9 Esmeralda',
        mode: 'train',
        color: '#00a88f',
        textColor: '#ffffff',
        operator: 'ViaMobilidade Linhas 8 e 9',
        frequencyPeakMin: 4,
        frequencyOffPeakMin: 7,
        status: 'reduced_speed',
        statusDetails: 'Intervalo ligeiramente maior no trecho Morumbi devido a ajustes de sinalização.',
        fare: 5.00,
        stations: ['sp-cidade-universitaria', 'sp-pinheiros', 'sp-hebraica-reboucas', 'sp-vila-olimpia', 'sp-berrini', 'sp-morumbi-l9', 'sp-santo-amaro']
      },
      {
        id: 'sp-bus-reboucas',
        name: 'Corredor Rebouças - Ônibus Expresso',
        shortName: 'Ônibus Rebouças',
        mode: 'brt',
        color: '#ea580c',
        textColor: '#ffffff',
        operator: 'SPTrans Corredores',
        frequencyPeakMin: 3,
        frequencyOffPeakMin: 6,
        status: 'normal',
        statusDetails: 'Faixas exclusivas operando com fluidez normal.',
        fare: 4.40,
        stations: ['sp-bus-paulista-reboucas', 'sp-fradique-coutinho', 'sp-bus-faria-lima', 'sp-pinheiros', 'sp-butanta']
      },
      {
        id: 'sp-bus-expresso',
        name: 'Expresso Ibirapuera / Paulista / Tietê',
        shortName: 'Ônibus Expresso',
        mode: 'bus',
        color: '#0284c7',
        textColor: '#ffffff',
        operator: 'SPTrans',
        frequencyPeakMin: 5,
        frequencyOffPeakMin: 8,
        status: 'normal',
        statusDetails: 'Linha direta com ar-condicionado e Wi-Fi.',
        fare: 4.40,
        stations: ['sp-tiete', 'sp-luz', 'sp-republica', 'sp-bus-masp', 'sp-bus-ibirapuera', 'sp-moema']
      }
    ],
    popularPlaces: [
      { id: 'masp', name: 'MASP - Museu de Arte de SP', description: 'Av. Paulista, 1578', lat: -23.5615, lng: -46.6560, nearestStation: 'sp-trianon-masp', category: 'culture' },
      { id: 'parque-ibirapuera', name: 'Parque Ibirapuera (Portão Principal)', description: 'Av. Pedro Álvares Cabral', lat: -23.5874, lng: -46.6576, nearestStation: 'sp-bus-ibirapuera', category: 'park' },
      { id: 'av-faria-lima', name: 'Av. Brigadeiro Faria Lima (Largo da Batata)', description: 'Pólo corporativo e financeiro', lat: -23.5678, lng: -46.6939, nearestStation: 'sp-faria-lima', category: 'business' },
      { id: 'usp-butanta', name: 'Universidade de São Paulo (USP - Portão 1)', description: 'Butantã, Zona Oeste', lat: -23.5570, lng: -46.7120, nearestStation: 'sp-butanta', category: 'university' },
      { id: 'catedral-se', name: 'Catedral da Sé / Marco Zero', description: 'Praça da Sé, Centro Histórico', lat: -23.5501, lng: -46.6339, nearestStation: 'sp-se', category: 'landmark' },
      { id: 'rodoviaria-tiete', name: 'Terminal Rodoviário Tietê', description: 'Maior terminal rodoviário da América Latina', lat: -23.5163, lng: -46.6253, nearestStation: 'sp-tiete', category: 'transport' },
      { id: 'shopping-eldorado', name: 'Shopping Eldorado / Rebouças', description: 'Av. Rebouças, 3970', lat: -23.5755, lng: -46.6989, nearestStation: 'sp-hebraica-reboucas', category: 'landmark' },
      { id: 'vila-madalena-art', name: 'Beco do Batman (Vila Madalena)', description: 'Rua Gonçalo Afonso - Grafites e vida noturna', lat: -23.5567, lng: -46.6865, nearestStation: 'sp-vila-madalena', category: 'culture' },
    ]
  },
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brasil',
    center: [-22.9068, -43.1729],
    zoom: 13,
    currency: 'BRL',
    currencySymbol: 'R$',
    baseFareSingle: 7.50,
    baseFareIntegrated: 9.30,
    cardName: 'Riocard Mais',
    stations: [
      { id: 'rj-jardim-oceanico', name: 'Jardim Oceânico (Barra da Tijuca)', lat: -23.0076, lng: -43.3086, lines: ['rj-l4', 'rj-brt'], isAccessible: true, hasElevator: true },
      { id: 'rj-sao-conrado', name: 'São Conrado', lat: -22.9926, lng: -43.2541, lines: ['rj-l4'], isAccessible: true, hasElevator: true },
      { id: 'rj-leblon', name: 'Antero de Quental (Leblon)', lat: -22.9845, lng: -43.2241, lines: ['rj-l4'], isAccessible: true, hasElevator: true },
      { id: 'rj-ipanema', name: 'Nossa Senhora da Paz (Ipanema)', lat: -22.9839, lng: -43.2057, lines: ['rj-l4'], isAccessible: true, hasElevator: true },
      { id: 'rj-general-osorio', name: 'General Osório (Ipanema/Copacabana)', lat: -22.9843, lng: -43.1972, lines: ['rj-l1', 'rj-l4'], isAccessible: true, hasElevator: true },
      { id: 'rj-siqueira-campos', name: 'Siqueira Campos (Copacabana)', lat: -22.9678, lng: -43.1868, lines: ['rj-l1'], isAccessible: true, hasElevator: true },
      { id: 'rj-botafogo', name: 'Botafogo (Praia e Enseada)', lat: -22.9511, lng: -43.1842, lines: ['rj-l1', 'rj-l2'], isAccessible: true, hasElevator: true },
      { id: 'rj-flamengo', name: 'Flamengo (Aterro)', lat: -22.9377, lng: -43.1788, lines: ['rj-l1', 'rj-l2'], isAccessible: true, hasElevator: true },
      { id: 'rj-cinelandia', name: 'Cinelândia (Teatro Municipal/VLT)', lat: -22.9113, lng: -43.1755, lines: ['rj-l1', 'rj-l2', 'rj-vlt-1'], isAccessible: true, hasElevator: true },
      { id: 'rj-carioca', name: 'Carioca (Centro)', lat: -22.9069, lng: -43.1781, lines: ['rj-l1', 'rj-l2', 'rj-vlt-1'], isAccessible: true, hasElevator: true },
      { id: 'rj-central', name: 'Central do Brasil', lat: -22.9042, lng: -43.1917, lines: ['rj-l1', 'rj-l2', 'rj-vlt-1'], isAccessible: true, hasElevator: true },
      { id: 'rj-praca-xv', name: 'Praça XV (Estação das Barcas Niterói)', lat: -22.9031, lng: -43.1722, lines: ['rj-vlt-1', 'rj-barcas'], isAccessible: true, hasElevator: true },
      { id: 'rj-maracana', name: 'Maracanã (Estádio)', lat: -22.9122, lng: -43.2323, lines: ['rj-l2'], isAccessible: true, hasElevator: true },
    ],
    lines: [
      {
        id: 'rj-l1',
        name: 'Metrô Linha 1 - Laranja',
        shortName: 'L1 Laranja',
        mode: 'subway',
        color: '#f97316',
        textColor: '#ffffff',
        operator: 'MetrôRio',
        frequencyPeakMin: 3,
        frequencyOffPeakMin: 5,
        status: 'normal',
        fare: 7.50,
        stations: ['rj-general-osorio', 'rj-siqueira-campos', 'rj-botafogo', 'rj-flamengo', 'rj-cinelandia', 'rj-carioca', 'rj-central']
      },
      {
        id: 'rj-l4',
        name: 'Metrô Linha 4 - Amarela',
        shortName: 'L4 Barra/Zona Sul',
        mode: 'subway',
        color: '#eab308',
        textColor: '#000000',
        operator: 'MetrôRio',
        frequencyPeakMin: 4,
        frequencyOffPeakMin: 6,
        status: 'normal',
        fare: 7.50,
        stations: ['rj-jardim-oceanico', 'rj-sao-conrado', 'rj-leblon', 'rj-ipanema', 'rj-general-osorio']
      },
      {
        id: 'rj-vlt-1',
        name: 'VLT Carioca Linha 1',
        shortName: 'VLT Santos Dumont',
        mode: 'tram',
        color: '#06b6d4',
        textColor: '#ffffff',
        operator: 'VLT Carioca',
        frequencyPeakMin: 5,
        frequencyOffPeakMin: 8,
        status: 'normal',
        fare: 4.30,
        stations: ['rj-praca-xv', 'rj-carioca', 'rj-cinelandia', 'rj-central']
      }
    ],
    popularPlaces: [
      { id: 'copacabana', name: 'Praia de Copacabana (Posto 4)', description: 'Av. Atlântica', lat: -22.9678, lng: -43.1868, nearestStation: 'rj-siqueira-campos', category: 'landmark' },
      { id: 'estadio-maracana', name: 'Estádio do Maracanã', description: 'Av. Pres. Castelo Branco', lat: -22.9122, lng: -43.2323, nearestStation: 'rj-maracana', category: 'landmark' },
      { id: 'pao-de-acucar', name: 'Pão de Açúcar / Urca', description: 'Praia Vermelha', lat: -22.9554, lng: -43.1678, nearestStation: 'rj-botafogo', category: 'landmark' },
    ]
  },
  {
    id: 'curitiba',
    name: 'Curitiba',
    country: 'Brasil',
    center: [-25.4284, -49.2733],
    zoom: 13,
    currency: 'BRL',
    currencySymbol: 'R$',
    baseFareSingle: 6.00,
    baseFareIntegrated: 6.00,
    cardName: 'Cartão URBS',
    stations: [
      { id: 'cwb-rua-xv', name: 'Estação Tubo Praça Osório / Rua XV', lat: -25.4332, lng: -49.2764, lines: ['cwb-expresso-eixo', 'cwb-interbairros'], isAccessible: true, hasElevator: false },
      { id: 'cwb-santa-candida', name: 'Terminal Santa Cândida', lat: -25.3852, lng: -49.2312, lines: ['cwb-expresso-eixo'], isAccessible: true, hasElevator: false },
      { id: 'cwb-capao-raso', name: 'Terminal Capão Raso', lat: -25.4984, lng: -49.2942, lines: ['cwb-expresso-eixo'], isAccessible: true, hasElevator: false },
      { id: 'cwb-botanico', name: 'Tubo Jardim Botânico', lat: -25.4428, lng: -49.2396, lines: ['cwb-interbairros'], isAccessible: true, hasElevator: false },
      { id: 'cwb-centro-civico', name: 'Tubo Centro Cívico / Museu Oscar Niemeyer', lat: -25.4124, lng: -49.2678, lines: ['cwb-interbairros', 'cwb-expresso-eixo'], isAccessible: true, hasElevator: false }
    ],
    lines: [
      {
        id: 'cwb-expresso-eixo',
        name: 'BRT Expresso Norte-Sul (Biarticulado Vermelho)',
        shortName: 'Expresso Santa Cândida/Capão Raso',
        mode: 'brt',
        color: '#dc2626',
        textColor: '#ffffff',
        operator: 'URBS Curitiba',
        frequencyPeakMin: 3,
        frequencyOffPeakMin: 6,
        status: 'normal',
        fare: 6.00,
        stations: ['cwb-santa-candida', 'cwb-centro-civico', 'cwb-rua-xv', 'cwb-capao-raso']
      },
      {
        id: 'cwb-interbairros',
        name: 'Linha Direta Ligeirinho (Tubo Prata)',
        shortName: 'Ligeirinho Inter 2',
        mode: 'bus',
        color: '#64748b',
        textColor: '#ffffff',
        operator: 'URBS Curitiba',
        frequencyPeakMin: 4,
        frequencyOffPeakMin: 7,
        status: 'normal',
        fare: 6.00,
        stations: ['cwb-centro-civico', 'cwb-rua-xv', 'cwb-botanico']
      }
    ],
    popularPlaces: [
      { id: 'cwb-jardim-botanico', name: 'Jardim Botânico de Curitiba', description: 'Estufa icônica e jardins franceses', lat: -25.4428, lng: -49.2396, nearestStation: 'cwb-botanico', category: 'park' },
      { id: 'cwb-mon', name: 'Museu Oscar Niemeyer (Museu do Olho)', description: 'Centro Cívico', lat: -25.4104, lng: -49.2670, nearestStation: 'cwb-centro-civico', category: 'culture' }
    ]
  },
  {
    id: 'lisboa',
    name: 'Lisboa',
    country: 'Portugal',
    center: [38.7223, -9.1393],
    zoom: 13,
    currency: 'EUR',
    currencySymbol: '€',
    baseFareSingle: 1.80,
    baseFareIntegrated: 1.80,
    cardName: 'Navegante / Viva Viagem',
    stations: [
      { id: 'lis-baixa-chiado', name: 'Baixa-Chiado', lat: 38.7106, lng: -9.1398, lines: ['lis-azul', 'lis-verde'], isAccessible: true, hasElevator: true },
      { id: 'lis-marques-pombal', name: 'Marquês de Pombal', lat: 38.7252, lng: -9.1501, lines: ['lis-azul', 'lis-amarela'], isAccessible: true, hasElevator: true },
      { id: 'lis-rossio', name: 'Rossio', lat: 38.7138, lng: -9.1394, lines: ['lis-verde'], isAccessible: true, hasElevator: true },
      { id: 'lis-cais-sodre', name: 'Cais do Sodré (Comboio Cascais / Barco)', lat: 38.7061, lng: -9.1447, lines: ['lis-verde', 'lis-electrico'], isAccessible: true, hasElevator: true },
      { id: 'lis-oriente', name: 'Gare do Oriente (Parque das Nações)', lat: 38.7679, lng: -9.0994, lines: ['lis-vermelha'], isAccessible: true, hasElevator: true },
      { id: 'lis-aeroporto', name: 'Aeroporto Humberto Delgado', lat: 38.7687, lng: -9.1287, lines: ['lis-vermelha'], isAccessible: true, hasElevator: true },
      { id: 'lis-belem', name: 'Belém (Torre / Mosteiro Jerónimos)', lat: 38.6978, lng: -9.2062, lines: ['lis-electrico'], isAccessible: true, hasElevator: true }
    ],
    lines: [
      {
        id: 'lis-azul',
        name: 'Linha Azul (Gaivota)',
        shortName: 'Linha Azul',
        mode: 'subway',
        color: '#0284c7',
        textColor: '#ffffff',
        operator: 'Metropolitano de Lisboa',
        frequencyPeakMin: 4,
        frequencyOffPeakMin: 6,
        status: 'normal',
        fare: 1.80,
        stations: ['lis-baixa-chiado', 'lis-marques-pombal']
      },
      {
        id: 'lis-verde',
        name: 'Linha Verde (Caravela)',
        shortName: 'Linha Verde',
        mode: 'subway',
        color: '#16a34a',
        textColor: '#ffffff',
        operator: 'Metropolitano de Lisboa',
        frequencyPeakMin: 3.5,
        frequencyOffPeakMin: 5.5,
        status: 'normal',
        fare: 1.80,
        stations: ['lis-cais-sodre', 'lis-baixa-chiado', 'lis-rossio']
      },
      {
        id: 'lis-vermelha',
        name: 'Linha Vermelha (Oriente)',
        shortName: 'Linha Vermelha',
        mode: 'subway',
        color: '#e11d48',
        textColor: '#ffffff',
        operator: 'Metropolitano de Lisboa',
        frequencyPeakMin: 4,
        frequencyOffPeakMin: 7,
        status: 'normal',
        fare: 1.80,
        stations: ['lis-oriente', 'lis-aeroporto']
      },
      {
        id: 'lis-electrico',
        name: 'Elétrico 15E (Cais do Sodré - Belém)',
        shortName: 'Elétrico 15E',
        mode: 'tram',
        color: '#eab308',
        textColor: '#000000',
        operator: 'Carris',
        frequencyPeakMin: 8,
        frequencyOffPeakMin: 12,
        status: 'normal',
        fare: 3.00,
        stations: ['lis-cais-sodre', 'lis-belem']
      }
    ],
    popularPlaces: [
      { id: 'lis-torre-belem', name: 'Torre de Belém', description: 'Monumento histórico à beira do Tejo', lat: 38.6916, lng: -9.2160, nearestStation: 'lis-belem', category: 'landmark' },
      { id: 'lis-praca-comercio', name: 'Praça do Comércio / Terreiro do Paço', description: 'Centro histórico ribeirinho', lat: 38.7077, lng: -9.1365, nearestStation: 'lis-baixa-chiado', category: 'landmark' }
    ]
  }
];

export const SYSTEM_ALERTS: LineAlert[] = [
  {
    id: 'alert-1',
    lineId: 'sp-l9',
    lineName: 'Linha 9 - Esmeralda (SP)',
    lineColor: '#00a88f',
    severity: 'warning',
    title: 'Operação com velocidade reduzida',
    description: 'Intervalos entre trens com acréscimo de 2 minutos entre estações Morumbi e Santo Amaro para manutenção programada de via.',
    updatedAt: 'Há 12 minutos'
  },
  {
    id: 'alert-2',
    lineId: 'sp-l3',
    lineName: 'Linha 3 - Vermelha (SP)',
    lineColor: '#ee3124',
    severity: 'info',
    title: 'Horário de Pico: Alta demanda',
    description: 'Trens operando na capacidade máxima com intervalos reduzidos a 105 segundos. Estratégia de embarque escalonado na Estação Sé.',
    updatedAt: 'Há 5 minutos'
  },
  {
    id: 'alert-3',
    lineId: 'rj-vlt-1',
    lineName: 'VLT Carioca L1 (RJ)',
    lineColor: '#06b6d4',
    severity: 'info',
    title: 'Operação Totalmente Normal',
    description: 'Frequência de 6 minutos em todo o trajeto Santos Dumont - Rodoviária.',
    updatedAt: 'Há 25 minutos'
  }
];
