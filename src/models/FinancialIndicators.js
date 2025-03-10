// Set fisso di indicatori finanziari
const indicators = {
    margineStruttura: {
      name: "Margine di struttura",
      category: "struttura",
      unit: "EUR",
      description: "Differenza tra capitale proprio e attivo immobilizzato",
      benchmark: { healthy: "> 0" }
    },
    margineTesoreria: {
      name: "Margine di tesoreria",
      category: "liquidità",
      unit: "EUR",
      description: "Differenza tra liquidità immediate e differite e passività correnti",
      benchmark: { healthy: "> 0" }
    },
    capitaleCircolanteNetto: {
      name: "Capitale circolante netto",
      category: "liquidità", 
      unit: "EUR",
      description: "Differenza tra attività correnti e passività correnti",
      benchmark: { healthy: "> 0" }
    },
    capitaleCircolanteNettoOperativo: {
      name: "Capitale circolante netto operativo",
      category: "operatività",
      unit: "EUR",
      description: "Capitale circolante al netto delle componenti finanziarie",
      benchmark: { healthy: "Positivo e controllato" }
    },
    indiceCapitalizzazione: {
      name: "Indice di capitalizzazione",
      category: "struttura",
      unit: "%",
      description: "Rapporto tra capitale proprio e totale fonti",
      benchmark: { healthy: "> 30%" }
    },
    patrimonioNettoTangCap: {
      name: "Patrimonio netto tang./ capitale investito",
      category: "struttura",
      unit: "%",
      description: "Rapporto tra patrimonio netto tangibile e capitale investito",
      benchmark: { healthy: "> 25%" }
    },
    coperturaImmobilizzazioni: {
      name: "Copertura immobilizzazioni",
      category: "struttura",
      unit: "%", 
      description: "Rapporto tra capitale permanente e immobilizzazioni",
      benchmark: { healthy: "> 100%" }
    },
    autocoperturaImmobilizzazioni: {
      name: "Autocopertura immobilizzazioni",
      category: "struttura",
      unit: "%",
      description: "Rapporto tra capitale proprio e immobilizzazioni",
      benchmark: { healthy: "> 70%" }
    },
    liquiditaCorrente: {
      name: "Liquidità corrente",
      category: "liquidità",
      unit: "%",
      description: "Rapporto tra attività correnti e passività correnti",
      benchmark: { healthy: "> 150%" }
    },
    liquiditaSecca: {
      name: "Liquidità secca",
      category: "liquidità",
      unit: "%",
      description: "Rapporto tra liquidità immediate e differite e passività correnti",
      benchmark: { healthy: "> 100%" }
    },
    indiceAutofinanziamento: {
      name: "Indice di autofinanziamento",
      category: "liquidità",
      unit: "%",
      description: "Capacità di generare liquidità dalla gestione",
      benchmark: { healthy: "> 5%" }
    },
    ebitda: {
      name: "EBITDA",
      category: "redditività",
      unit: "EUR",
      description: "Margine operativo lordo",
      benchmark: { healthy: "Positivo e in crescita" }
    },
    redditCapitaleInvestito: {
      name: "Redditività capitale investito",
      category: "redditività",
      unit: "%",
      description: "ROI - Return on Investment",
      benchmark: { healthy: "> 10%" }
    },
    redditCapitaleProprio: {
      name: "Redditività capitale proprio",
      category: "redditività",
      unit: "%",
      description: "ROE - Return on Equity",
      benchmark: { healthy: "> 8%" }
    },
    posizioneFinanziariaNetta: {
      name: "Posizione finanziaria netta",
      category: "indebitamento",
      unit: "EUR",
      description: "Differenza tra debiti finanziari e attività finanziarie",
      benchmark: { healthy: "Più bassa possibile" }
    },
    leverage: {
      name: "Leverage",
      category: "indebitamento",
      unit: "%",
      description: "Rapporto tra capitale investito e capitale proprio",
      benchmark: { healthy: "< 3" }
    },
    debitiTotaliEbitda: {
      name: "Debiti totali/EBITDA",
      category: "indebitamento",
      unit: "%",
      description: "Rapporto tra debito totale e margine operativo lordo",
      benchmark: { healthy: "< 4" }
    },
    oneriFinanziariRol: {
      name: "Oneri finanziari/Reddito operativo lordo",
      category: "indebitamento",
      unit: "%",
      description: "Incidenza degli oneri finanziari sul reddito operativo",
      benchmark: { healthy: "< 10%" }
    },
    pfnPn: {
      name: "PFN / PN",
      category: "indebitamento",
      unit: "%",
      description: "Rapporto tra posizione finanziaria netta e patrimonio netto",
      benchmark: { healthy: "< 1" }
    },
    emScore: {
      name: "EM SCORE",
      category: "rischio",
      unit: "",
      description: "Indice di Altman per la previsione del rischio di insolvenza",
      benchmark: { healthy: "> 3", warning: "1.8-3", critical: "< 1.8" }
    }
  };
  
  module.exports = indicators;