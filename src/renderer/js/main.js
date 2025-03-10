// Versione semplificata di src/renderer/js/main.js
console.log('Script renderer inizializzato');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM caricato completamente');
    
    // Nascondi esplicitamente il loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('d-none');
        console.log('Loading overlay nascosto');
    } else {
        console.error('Elemento loading-overlay non trovato');
    }
    
    // Stampa tutti gli elementi per debug
    console.log('Elementi form:', document.getElementById('indicators-form'));
    console.log('Elementi tab:', document.querySelectorAll('.tab-pane'));
    
    // Imposta semplici event listener sul form
    const form = document.getElementById('indicators-form');
    if (form) {
        console.log('Form trovato, aggiungo event listener');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Form sottomesso - funzionalità in costruzione');
        });
    } else {
        console.error('Form non trovato!');
    }
    
    // Carica dati esempio
    const loadSampleBtn = document.getElementById('load-sample-btn');
    if (loadSampleBtn) {
        console.log('Pulsante esempio trovato, aggiungo event listener');
        loadSampleBtn.addEventListener('click', () => {
            alert('Caricamento dati esempio - funzionalità in costruzione');
        });
    } else {
        console.error('Pulsante esempio non trovato!');
    }
});