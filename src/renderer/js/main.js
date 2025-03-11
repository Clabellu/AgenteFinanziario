// Variabili principali
let currentSessionId = null;
let currentOptimizations = [];
let validationResult = null;
let scenariosData = null;
let reportData = null;

// Elementi DOM principali
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');
const progressSteps = document.querySelectorAll('.progress-steps li');
const tabPanes = document.querySelectorAll('.tab-pane');

// Elementi form
const indicatorsForm = document.getElementById('indicators-form');
const loadSampleBtn = document.getElementById('load-sample-btn');
const analyzeBtn = document.getElementById('analyze-btn');

// Analisi
const analysisContent = document.getElementById('analysis-content');
const backToIndicatorsBtn = document.getElementById('back-to-indicators-btn');
const generateOptimizationsBtn = document.getElementById('generate-optimizations-btn');

// Ottimizzazioni
const optimizationsContent = document.getElementById('optimizations-content');
const backToAnalysisBtn = document.getElementById('back-to-analysis-btn');
const validateOptimizationsBtn = document.getElementById('validate-optimizations-btn');
const optimizationTemplate = document.getElementById('optimization-template');

// Scenari
const scenariosContent = document.getElementById('scenarios-content');
const backToOptimizationsBtn = document.getElementById('back-to-optimizations-btn');
const generateReportBtn = document.getElementById('generate-report-btn');

// Report
const reportContent = document.getElementById('report-content');
const backToScenariosBtn = document.getElementById('back-to-scenarios-btn');
const exportReportBtn = document.getElementById('export-report-btn');

// Funzioni di utilità
function showLoading(message = 'Elaborazione in corso...') {
    loadingMessage.textContent = message;
    loadingOverlay.classList.remove('hidden');
    console.log('Loading mostrato:', message);
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    console.log('Loading nascosto');
}

function switchTab(tabName) {
    console.log('Cambio tab a:', tabName);
    
    // Aggiorna progress steps
    progressSteps.forEach(step => {
        step.classList.remove('active');
        if (step.dataset.tab === tabName) {
            step.classList.add('active');
        }
    });
    
    // Aggiorna tab panes
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabName}-tab`) {
            pane.classList.add('active');
        }
    });
}

function enableTab(tabName) {
    // Trova l'indice del tab
    const tabIndex = Array.from(progressSteps).findIndex(step => step.dataset.tab === tabName);
    
    // Abilita il tab e segna i tab precedenti come completati
    progressSteps.forEach((step, index) => {
        if (index <= tabIndex) {
            step.classList.remove('disabled');
        }
    });
    
    console.log(`Tab ${tabName} abilitato`);
}

// Funzioni di gestione contenuti
function renderOptimizations(optimizations) {
    optimizationsContent.innerHTML = '';
    
    if (!optimizations || optimizations.length === 0) {
        optimizationsContent.innerHTML = '<p>Nessuna ottimizzazione disponibile.</p>';
        return;
    }
    
    // Salva le ottimizzazioni
    currentOptimizations = optimizations;
    
    // Crea una card per ogni ottimizzazione
    optimizations.forEach((opt, index) => {
        const template = optimizationTemplate.content.cloneNode(true);
        
        // Selettori
        const card = template.querySelector('.optimization-card');
        const title = template.querySelector('.optimization-title');
        const description = template.querySelector('.optimization-description');
        const checkbox = template.querySelector('.optimization-checkbox');
        const impact = template.querySelector('.optimization-impact');
        const difficulty = template.querySelector('.optimization-difficulty');
        const timeframe = template.querySelector('.optimization-timeframe');
        const category = template.querySelector('.optimization-category');
        
        // Popola la card
        card.id = `opt-${opt.id}`;
        title.textContent = opt.title;
        description.textContent = opt.description;
        checkbox.id = `checkbox-${opt.id}`;
        checkbox.dataset.optId = opt.id;
        
        // Styling per impact
        impact.textContent = `Impatto: ${opt.impact}`;
        impact.classList.add(opt.impact === 'Alto' ? 'badge-success' : 
                            opt.impact === 'Medio' ? 'badge-primary' : 'badge-secondary');
        
        // Styling per difficulty
        difficulty.textContent = `Difficoltà: ${opt.difficulty}`;
        difficulty.classList.add(opt.difficulty === 'Bassa' ? 'badge-success' : 
                                opt.difficulty === 'Media' ? 'badge-warning' : 'badge-danger');
        
        // Styling per timeframe
        timeframe.textContent = `Tempo: ${opt.timeframe}`;
        timeframe.classList.add(opt.timeframe === 'Breve' ? 'badge-success' : 
                               opt.timeframe === 'Medio' ? 'badge-primary' : 'badge-secondary');
        
        // Categoria
        category.textContent = `Categoria: ${opt.category}`;
        
        // Aggiungi la card
        optimizationsContent.appendChild(template);
    });
}

function renderScenarios(scenarios) {
    scenariosContent.innerHTML = '';
    
    if (!scenarios) {
        scenariosContent.innerHTML = '<p>Nessuno scenario disponibile.</p>';
        return;
    }
    
    // Salva gli scenari
    scenariosData = scenarios;
    
    // Crea il contenuto HTML
    let html = `
        <div class="scenarios-container">
            <h3>Risultati della Simulazione</h3>
            <div class="card mb-4">
                <div class="card-header">Confronto tra Scenari</div>
                <div class="card-body">
                    ${scenarios.comparison || 'Nessun confronto disponibile.'}
                </div>
            </div>
            
            <div class="row">
                <!-- Scenario Base -->
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">Scenario Base</div>
                        <div class="card-body">
                            <p><strong>Descrizione:</strong> ${scenarios.base.description}</p>
                            <h5>Indicatori Chiave:</h5>
                            <ul>
                                ${Object.entries(scenarios.base.keyMetrics || {}).map(([key, value]) => 
                                  `<li>${key}: ${value}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Scenario Realistico -->
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white">Scenario Realistico</div>
                        <div class="card-body">
                            <p><strong>Descrizione:</strong> ${scenarios.realistic.description}</p>
                            <h5>Indicatori Chiave:</h5>
                            <ul>
                                ${Object.entries(scenarios.realistic.keyMetrics || {}).map(([key, value]) => 
                                  `<li>${key}: ${value}</li>`).join('')}
                            </ul>
                            <h5>Ottimizzazioni:</h5>
                            <ul>
                                ${(scenarios.realistic.optimizations || []).map(opt => 
                                  `<li>${opt}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Scenario Ottimistico -->
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-success text-white">Scenario Ottimistico</div>
                        <div class="card-body">
                            <p><strong>Descrizione:</strong> ${scenarios.optimistic.description}</p>
                            <h5>Indicatori Chiave:</h5>
                            <ul>
                                ${Object.entries(scenarios.optimistic.keyMetrics || {}).map(([key, value]) => 
                                  `<li>${key}: ${value}</li>`).join('')}
                            </ul>
                            <h5>Ottimizzazioni:</h5>
                            <ul>
                                ${(scenarios.optimistic.optimizations || []).map(opt => 
                                  `<li>${opt}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    scenariosContent.innerHTML = html;
}

function renderReport(report) {
    reportContent.innerHTML = '';
    
    if (!report) {
        reportContent.innerHTML = '<p>Nessun report disponibile.</p>';
        return;
    }
    
    // Salva il report
    reportData = report;
    
    // Crea il contenuto HTML
    let html = `
        <div class="report-container">
            <h3>${report.title}</h3>
            <p>Data: ${report.date}</p>
            
            <div class="card mb-4">
                <div class="card-header">Executive Summary</div>
                <div class="card-body">
                    ${report.sections.executive}
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">Analisi Finanziaria</div>
                <div class="card-body">
                    <h5>Panoramica</h5>
                    <div>${report.sections.financial.overview}</div>
                    
                    <h5>Punti di Forza</h5>
                    <div>${report.sections.financial.strengths}</div>
                    
                    <h5>Criticità</h5>
                    <div>${report.sections.financial.weaknesses}</div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">Raccomandazioni</div>
                <div class="card-body">
                    ${report.sections.recommendations}
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">Piano di Implementazione</div>
                <div class="card-body">
                    ${report.sections.implementation}
                </div>
            </div>
        </div>
    `;
    
    reportContent.innerHTML = html;
}

// EVENT HANDLERS
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente caricato');
    
    // Nascondi il loading overlay all'avvio
    hideLoading();
    
    // Form submission
    if (indicatorsForm) {
        indicatorsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form sottomesso');
            
            // Raccogli i dati del form
            const formData = new FormData(indicatorsForm);
            const indicators = {};
            
            for (const [key, value] of formData.entries()) {
                if (value.trim() !== '') {
                    indicators[key] = parseFloat(value);
                }
            }
            
            console.log('Indicatori raccolti:', indicators);
            
            // Verifica i dati minimi
            if (Object.keys(indicators).length < 2) {
                alert('Inserisci almeno due indicatori per avviare l\'analisi.');
                return;
            }
            
            // Mostra il loading
            showLoading('Analisi finanziaria in corso...');
            
            try {
                // Verifica disponibilità API
                if (!window.superAgenteAPI) {
                    throw new Error('API SuperAgente non disponibile');
                }
                
                // Chiama l'API per l'analisi
                console.log('Chiamata API analyze-financial-health');
                const result = await window.superAgenteAPI.analyzeFinancialHealth(indicators);
                console.log('Risultato analisi:', result);
                
                // Salva l'ID sessione
                currentSessionId = result.sessionId;
                
                // Mostra i risultati
                if (analysisContent) {
                    analysisContent.innerHTML = `<div class="analysis-result">${result.analysis.analysis}</div>`;
                }
                
                // Abilita il tab di analisi
                enableTab('analysis');
                
                // Passa al tab di analisi
                switchTab('analysis');
            } catch (error) {
                console.error('Errore durante l\'analisi:', error);
                alert(`Errore durante l'analisi: ${error.message}`);
            } finally {
                // Nascondi il loading
                hideLoading();
            }
        });
    }
    
    // Caricamento dati di esempio
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', () => {
            console.log('Caricamento dati esempio');
            
            // Dati di esempio
            const sampleData = {
                margineStruttura: 86033,
                margineTesoreria: 86033,
                capitaleCircolanteNetto: 86033,
                capitaleCircolanteNettoOperativo: 80881,
                indiceCapitalizzazione: 62.84,
                patrimonioNettoTangCap: 50.03,
                coperturaImmobilizzazioni: 1.83,
                autocoperturaImmobilizzazioni: 1.83,
                liquiditaCorrente: 1.77,
                liquiditaSecca: 1.77,
                indiceAutofinanziamento: 7.54,
                ebitda: 61435,
                redditCapitaleInvestito: 20.18,
                redditCapitaleProprio: 20.25,
                posizioneFinanziariaNetta: 80881,
                leverage: 1.59,
                debitiTotaliEbitda: 1.67,
                oneriFinanziariRol: 0.46,
                pfnPn: 0,
                emScore: 12.09
            };
            
            // Compila tutti i campi presenti nel form
            Object.entries(sampleData).forEach(([key, value]) => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) input.value = value;
            });
            
            alert('Dati di esempio caricati');
        });
    }
    
    // Torna agli indicatori
    if (backToIndicatorsBtn) {
        backToIndicatorsBtn.addEventListener('click', () => {
            switchTab('indicators');
        });
    }
    
    // Genera ottimizzazioni
if (generateOptimizationsBtn) {
    generateOptimizationsBtn.addEventListener('click', async () => {
        console.log('Pulsante Genera Ottimizzazioni cliccato');
        if (!currentSessionId) {
            console.log('Nessun sessionId trovato!', currentSessionId);
            alert('Sessione non valida. Ripeti l\'analisi.');
            return;
        }
        
        showLoading('Generazione ottimizzazioni in corso...');
        
        try {
            console.log('Tentativo di chiamare identifyOptimizations con sessionId:', currentSessionId);
            const result = await window.superAgenteAPI.identifyOptimizations(currentSessionId);
            console.log('Risultato ottimizzazioni:', result);
            
            renderOptimizations(result.optimizations);
            
            enableTab('optimizations');
            switchTab('optimizations');
        } catch (error) {
            console.error('Errore dettagliato:', error);
            alert(`Errore: ${error.message}`);
        } finally {
            hideLoading();
        }
    });
}
    
    // Torna all'analisi
    if (backToAnalysisBtn) {
        backToAnalysisBtn.addEventListener('click', () => {
            switchTab('analysis');
        });
    }
    
    // Valida ottimizzazioni e genera scenari
    if (validateOptimizationsBtn) {
        validateOptimizationsBtn.addEventListener('click', async () => {
            if (!currentSessionId || !currentOptimizations || currentOptimizations.length === 0) {
                alert('Dati insufficienti. Ripeti la procedura.');
                return;
            }
            
            // Raccogli le ottimizzazioni selezionate
            const checkboxes = document.querySelectorAll('.optimization-checkbox:checked');
            const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.optId);
            
            if (selectedIds.length === 0) {
                alert('Seleziona almeno un\'ottimizzazione.');
                return;
            }
            
            showLoading('Validazione e generazione scenari in corso...');
            
            try {
                // Aggiorna le selezioni
                await window.superAgenteAPI.updateSelectedOptimizations(currentSessionId, selectedIds);
                
                // Valida le selezioni
                const validation = await window.superAgenteAPI.validateSelections(currentSessionId);
                validationResult = validation.validationResult;
                
                // Genera scenari
                const scenarios = await window.superAgenteAPI.generateScenarios(currentSessionId);
                console.log('Scenari generati:', scenarios);
                
                renderScenarios(scenarios.scenarios);
                
                enableTab('scenarios');
                switchTab('scenarios');
            } catch (error) {
                console.error('Errore nella generazione degli scenari:', error);
                alert(`Errore: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }
    
    // Torna alle ottimizzazioni
    if (backToOptimizationsBtn) {
        backToOptimizationsBtn.addEventListener('click', () => {
            switchTab('optimizations');
        });
    }
    
    // Genera report
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async () => {
            if (!currentSessionId) {
                alert('Sessione non valida. Ripeti l\'analisi.');
                return;
            }
            
            showLoading('Generazione report in corso...');
            
            try {
                const result = await window.superAgenteAPI.generateReport(currentSessionId);
                console.log('Report generato:', result);
                
                renderReport(result.report);
                
                enableTab('report');
                switchTab('report');
            } catch (error) {
                console.error('Errore nella generazione del report:', error);
                alert(`Errore: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }
    
    // Torna agli scenari
    if (backToScenariosBtn) {
        backToScenariosBtn.addEventListener('click', () => {
            switchTab('scenarios');
        });
    }
    
    // Esporta report
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', async () => {
            if (!reportData) {
                alert('Nessun report da esportare. Genera prima il report.');
                return;
            }
            
            showLoading('Esportazione report in corso...');
            
            try {
                // Per ora facciamo un semplice export del testo
                const result = await window.superAgenteAPI.saveDocumentAs(
                    reportData.fullText, 
                    'SuperAgente_Report.txt'
                );
                
                if (result.success) {
                    alert(`Report esportato con successo in ${result.filePath}`);
                } else {
                    alert('Esportazione annullata.');
                }
            } catch (error) {
                console.error('Errore nell\'esportazione del report:', error);
                alert(`Errore: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }
});