import { showDownloadNotification } from '/js/module/helper/toastify.js';
import { clearPreview, nextStep } from '/js/pages/redmensioning/redmensioning.js';

const form = document.getElementById('multiStepForm');
const downloadButton = document.getElementById('downloadButton');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    resetProgress();
    submitForm();
});

function resetProgress() {
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

function submitForm() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload');
    xhr.responseType = 'blob';

    xhr.upload.addEventListener('progress', updateProgress);
    xhr.onload = () => handleResponse(xhr);
    xhr.onerror = () => showDownloadNotification('Erro ao enviar a solicitação', 'error');

    const formData = new FormData(form);
    xhr.send(formData);
}

function updateProgress(event) {
    if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressBar.style.width = `${percentComplete}%`;
        progressText.textContent = `${Math.round(percentComplete)}%`;
    }
}

function handleResponse(xhr) {
    if (xhr.status >= 200 && xhr.status < 300) {
        handleZipDownload(xhr.response);
    } else {
        handleError(xhr.response);
    }
}

function handleZipDownload(response) {
    const blob = new Blob([response], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const formData = new FormData(form);

    downloadButton.href = url;
    downloadButton.download = (formData.get('title') || 'download') + '.zip';
    downloadButton.classList.remove('hidden');

    nextStep(5);
    clearPreview();
    showDownloadNotification('Imagens processadas com sucesso!', 'success');
}

function handleError(response) {
    // Try reading the response as JSON to get the error message
    response.text().then(text => {
        try {
            const errorMessage = JSON.parse(text).message || 'Erro ao processar a solicitação';
            showDownloadNotification(`Erro: ${errorMessage}`, 'error');
        } catch (e) {
            showDownloadNotification('Erro inesperado na resposta do servidor', 'error');
        }
    });
}

function resetForm() {
    form.reset();

    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.add('hidden'));
    document.getElementById('step-1').classList.remove('hidden');

    const previewContainer = document.getElementById('preview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }

    // Clear progress bar style
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

export { resetForm };
