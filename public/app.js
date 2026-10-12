
async function checkApiConnection() {
    const statusElement = document.getElementById('api-status');

    try {
        const response = await fetch('/api/health');

        if (!response.ok) {
            throw new Error('The server returned an error.');
        }

        const data = await response.json();

        statusElement.textContent = `Backend status: ${data.status} - ${data.message}`;
    } catch (error) {
        statusElement.textContent = 'Could not connect to the backend.';
        console.error('API connection error:', error);
    }
}

checkApiConnection();