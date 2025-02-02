document.addEventListener('DOMContentLoaded', function() {
    // Get the Base64 encoded reason from the URL
    let urlParams = new URLSearchParams(window.location.search);
    let encodedReason = urlParams.get('reason');
    
    if (encodedReason) {
        // Decode the Base64 encoded reason
        let decodedReason = atob(encodedReason);
        
        // Display the decoded reason in the "reason-text" element
        let reasonTextElement = document.getElementById("reason-text");
        if (reasonTextElement) {
            reasonTextElement.textContent = `${decodedReason}`;
        } else {
            console.error('Element with id "reason-text" not found.');
        }
    } else {
        console.log('No reason provided in the URL.');
    }
});
