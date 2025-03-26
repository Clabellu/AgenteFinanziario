// src/renderer/js/main.js
document.addEventListener('DOMContentLoaded', () => {
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

    // Immediatamente nascondi l'overlay di caricamento all'inizio
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        console.log('Loading nascosto all\'avvio');
    } else {
        console.error('Elemento loading-overlay non trovato!');
    }

    // Elementi form
    const indicatorsForm = document.getElementById('indicators-form');
    const loadSampleBtn = document.getElementById('load-sample-btn');
    
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

    console.log('Elementi DOM trovati:', {
        loadingOverlay,
        progressSteps,
        tabPanes,
        indicatorsForm,
        loadSampleBtn,
        generateOptimizationsBtn,
        validateOptimizationsBtn
    });

    // Funzioni di utilità
    function showLoading(message = 'Elaborazione in corso...') {
        if (!loadingOverlay || !loadingMessage) {
            console.error('Elementi loading non trovati');
            return;
        }
        loadingMessage.textContent = message;
        loadingOverlay.classList.remove('hidden');
        console.log('Loading mostrato:', message);
    }

    function hideLoading() {
        if (!loadingOverlay) {
            console.error('Elemento loading-overlay non trovato');
            return;
        }
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
                        ${scenarios.comparison || 'Analisi comparativa in corso...'}
                    </div>
                </div>
                
                <div class="row">
                    <!-- Scenario Pessimistico -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">Scenario Pessimistico</div>
                            <div class="card-body">
                                <p><strong>Descrizione:</strong> ${scenarios.pessimistic.description}</p>
                                <h5>Indicatori Chiave:</h5>
                                <ul>
                                    ${Object.entries(scenarios.pessimistic.keyMetrics || {}).map(([key, value]) => 
                                      `<li>${key}: ${value}</li>`).join('')}
                                </ul>
                                ${scenarios.pessimistic.analysis && scenarios.pessimistic.analysis.impact ? `
                                <h5>Impatto:</h5>
                                <div class="scenario-impact">${scenarios.pessimistic.analysis.impact.substring(0, 150)}...</div>
                                ` : ''}
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
                                      `<li>${typeof opt === 'object' ? (opt.title || JSON.stringify(opt)) : opt}</li>`).join('')}
                                </ul>
                                ${scenarios.realistic.analysis && scenarios.realistic.analysis.impact ? `
                                <h5>Impatto:</h5>
                                <div class="scenario-impact">${scenarios.realistic.analysis.impact.substring(0, 150)}...</div>
                                ` : ''}
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
                                      `<li>${typeof opt === 'object' ? (opt.title || JSON.stringify(opt)) : opt}</li>`).join('')}
                                </ul>
                                ${scenarios.optimistic.analysis && scenarios.optimistic.analysis.impact ? `
                                <h5>Impatto:</h5>
                                <div class="scenario-impact">${scenarios.optimistic.analysis.impact.substring(0, 150)}...</div>
                                ` : ''}
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
    
    // Form submission
    if (indicatorsForm) {
        indicatorsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form sottomesso');
            console.log('Verifica elementi DOM');
            console.log('analysisContent:', document.getElementById('analysis-content') ? 'OK' : 'MANCANTE');
            console.log('analysis-tab:', document.getElementById('analysis-tab') ? 'OK' : 'MANCANTE');

            
            // Raccogli i dati del form
            const formData = new FormData(indicatorsForm);
            const indicators = {};
            
            for (const [key, value] of formData.entries()) {
                if (value.trim() !== '') {
                    indicators[key] = parseFloat(value);
                }
            }
            
            console.log('Indicatori raccolti:', Object.keys(indicators).length);
            
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
    
                console.log('Chiamata API analyze-financial-health con Timeout');
                
                // Crea entrambe le promise
                const analysisPromise = window.superAgenteAPI.analyzeFinancialHealth(indicators);
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout: analisi troppo lunga')), 60000);
                });
                
                // Usa Promise.race per il timeout
                const result = await Promise.race([analysisPromise, timeoutPromise]);
                console.log('Risposta ricevuta dal server:', Object.keys(result));
                
                // Salva l'ID sessione
                currentSessionId = result.sessionId;
                console.log('ID sessione salvato:', currentSessionId);
                
                // Verifica la presenza dell'analisi
                if (!result.analysis) {
                    console.warn('Oggetto analysis non presente nella risposta');
                    throw new Error('Risposta senza analisi');
                }
                
                if (!result.analysis.analysis) {
                    console.warn('Campo analysis.analysis non presente nella risposta');
                    // Salva comunque i dati parziali
                    result.analysis.analysis = "Analisi non disponibile o incompleta. Puoi proseguire comunque.";
                }
                
                console.log('Visualizzazione analisi nel DOM, lunghezza:', result.analysis.analysis.length);
                
                // Sanitizza la risposta prima di inserirla
                const sanitizedAnalysis = result.analysis.analysis
                    .replace(/[^\x20-\x7E\xA0-\xFF\s]/g, '')  // Rimuovi caratteri non standard
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');  // Rimuovi script
                
                // Mostra i risultati
                if (analysisContent) {
                    analysisContent.innerHTML = `<div class="analysis-result">${sanitizedAnalysis}</div>`;
                    console.log('Analisi inserita nel DOM');
                } else {
                    console.error('Elemento analysisContent non trovato');
                }
            
                // Abilita il tab di analisi
                enableTab('analysis');
                
                // Passa al tab di analisi
                switchTab('analysis');
                console.log('Tab attivo dopo switch:', document.querySelector('.tab-pane.active')?.id);
            } catch (error) {
                console.error('Errore durante l\'analisi:', error);
    
                // Mostra un'analisi predefinita in caso di errore
                if (analysisContent) {
                    analysisContent.innerHTML = `
                    <div class="analysis-result">
                        <h3>Analisi Finanziaria</h3>
                        <p>Si è verificato un problema nella generazione dell'analisi dettagliata</p>
    
                        <h4>Indicatori principali ricevuti:</h4>
                        <ul>
                        ${Object.entries(indicators).slice(0, 5).map(([key, value]) => 
                            `<li><strong>${key}</strong>: ${value}</li>`).join('')}
                        <li>... e altri ${Object.keys(indicators).length - 5} indicatori</li>
                        </ul>
    
                        <p>Puoi procedere comunque alla fase successiva per la generazione delle ottimizzazioni</p>
                    </div>
                    `;
                    console.log('Visualizzata analisi predefinita per errore');
                }
    
                // Crea un ID sessione anche in caso di errore per permettere di proseguire
                if (!currentSessionId) {
                    currentSessionId = `session_backup_${Date.now()}`;
                    console.log('Creato ID sessione di backup:', currentSessionId);
                }
    
                // Passa comunque al tab successivo
                enableTab('analysis');
                switchTab('analysis');
    
                // Mostra un messaggio all'utente 
                alert(`Si è verificato un problema durante l'analisi: ${error.message}\nPuoi comunque procedere alla fase successiva`);
            } finally {
                // Nascondi il loading
                hideLoading();
                console.log('Loading nascosto');
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
                console.error('Sessione non valida, ID:',  currentSessionId);
                alert('Sessione non valida. Ripeti l\'analisi.');
                return;
            }
            
            showLoading('Generazione ottimizzazioni in corso...');
            
            try {
                console.log('Chiamata API identifyOptimizations con sessionId:', currentSessionId);
                const result = await window.superAgenteAPI.identifyOptimizations(currentSessionId);
                console.log('Risultato ottimizzazioni:', result);
                
                renderOptimizations(result.optimizations);
                
                // Abilita il tab di ottimizzazioni
                enableTab('optimizations');
                
                // Passa al tab di ottimizzazioni
                switchTab('optimizations');
            } catch (error) {
                console.error('Errore nella generazione delle ottimizzazioni:', error);
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
            console.log('Pulsante Valida e Genera Scenari cliccato');
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
                console.log('Chiamata API updateSelectedOptimizations con sessionId:', currentSessionId);
                console.log('Ottimizzazioni selezionate:', selectedIds);
                
                // Aggiorna le selezioni
                await window.superAgenteAPI.updateSelectedOptimizations(currentSessionId, selectedIds);
                
                // Valida le selezioni
                console.log('Chiamata API validateSelections');
                const validation = await window.superAgenteAPI.validateSelections(currentSessionId);
                validationResult = validation.validationResult;
                console.log('Risultato validazione:', validationResult);
                
                // Genera scenari
                console.log('Chiamata API generateScenarios');
                const scenarios = await window.superAgenteAPI.generateScenarios(currentSessionId);
                console.log('Struttura scenarios completa', JSON.stringify(scenarios, null,2));
                console.log('Scenari generati:', scenarios);
                
                renderScenarios(scenarios);
                
                // Abilita il tab di scenari
                enableTab('scenarios');
                
                // Passa al tab di scenari
                switchTab('scenarios');
                console.log('Tab attivo', document.querySelector('.tab-pane.active').id)
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
            console.log('Pulsante Genera Report cliccato');
            if (!currentSessionId) {
                alert('Sessione non valida. Ripeti l\'analisi.');
                return;
            }
            
            showLoading('Generazione report in corso...');
            
            try {
                console.log('Chiamata API generateReport');
                const result = await window.superAgenteAPI.generateReport(currentSessionId);
                console.log('Report generato:', result);
                
                renderReport(result.report);
                
                // Abilita il tab di report
                enableTab('report');
                
                // Passa al tab di report
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
            console.log('Pulsante Esporta Report cliccato');
            if (!reportData) {
                alert('Nessun report da esportare. Genera prima il report.');
                return;
            }
            
            showLoading('Esportazione report in corso...');
            
            try {
                console.log('Chiamata API saveDocumentAs');
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