async function sendData(endpoint, data) {
    try {
        const response = await fetch(`/api/harvest/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success && result.redirect) {
            window.location.href = result.redirect;
        }
    } catch (error) {
        console.error('Error sending data:', error);
    }
}
