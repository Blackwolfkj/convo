document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const studentInput = document.getElementById('student-id');
    const loader = document.getElementById('loader');
    const errorBox = document.getElementById('error-box');
    const errorMsg = document.getElementById('error-msg');
    const resultCard = document.getElementById('result-card');
    
    // Result elements
    const studentName = document.getElementById('student-name');
    const studentNumber = document.getElementById('student-number');
    const studentExams = document.getElementById('student-exams');
    const btnPreview = document.getElementById('btn-preview');
    const btnDownload = document.getElementById('btn-download');
    
    // Preview elements
    const previewSection = document.getElementById('preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');
    const btnClosePreview = document.getElementById('btn-close-preview');

    let currentStudentId = null;

    // Intercepter la soumission du formulaire
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentId = studentInput.value.trim();
        if (!studentId) return;

        // Réinitialiser l'affichage
        hideElement(errorBox);
        hideElement(resultCard);
        hideElement(previewSection);
        showElement(loader);
        
        pdfViewer.src = ''; // Vider le visualiseur PDF

        try {
            const response = await fetch(`/api/student/${studentId}`);
            const data = await response.json();

            if (response.ok && data.success) {
                currentStudentId = studentId;
                
                // Formater le nom et prénom (ex: EL GHANDALI Meriem)
                const fullName = `${data.nom.toUpperCase()} ${capitalizeFirstLetter(data.prenom.toLowerCase())}`;
                
                // Mettre à jour l'interface
                studentName.textContent = fullName;
                studentNumber.textContent = data.student_id;
                studentExams.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Convocation (${data.pages_count} page${data.pages_count > 1 ? 's' : ''})`;
                
                // Configurer les actions
                btnDownload.href = `/api/download/${studentId}`;
                
                hideElement(loader);
                showElement(resultCard);
            } else {
                showError(data.error || "Une erreur est survenue lors de la recherche.");
            }
        } catch (err) {
            console.error(err);
            showError("Impossible de contacter le serveur. Veuillez vérifier votre connexion.");
        }
    });

    // Événement pour l'aperçu en ligne
    btnPreview.addEventListener('click', () => {
        if (!currentStudentId) return;
        
        // Charger le PDF dans l'iframe
        pdfViewer.src = `/api/download/${currentStudentId}`;
        
        showElement(previewSection);
        
        // Défilement fluide vers la section d'aperçu
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });

    // Événement pour fermer l'aperçu
    btnClosePreview.addEventListener('click', () => {
        hideElement(previewSection);
        pdfViewer.src = ''; // Arrêter le chargement du PDF
    });

    // Fonctions utilitaires
    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }

    function showError(message) {
        hideElement(loader);
        errorMsg.textContent = message;
        showElement(errorBox);
    }

    function capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, l => l.toUpperCase());
    }
});
