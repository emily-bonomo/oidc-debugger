function generateRandomString(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('oidcForm');
    const preview = document.getElementById('authUrlPreview');
    const link = document.getElementById('authLink');

    // 🔐 Auto-generate state and nonce on load
    form.querySelector('input[name="state"]').value = generateRandomString(12);
    form.querySelector('input[name="nonce"]').value = generateRandomString(12);
  
    function updatePreview() {
      const data = new FormData(form);
      const endpoint = data.get('authorization_endpoint');
      if (!endpoint) {
        preview.value = '';
        link.href = '#';
        link.style.display = 'none';
        return;
      }
  
      const params = new URLSearchParams();
  
      // Collect all checked response_type values
      const responseTypes = Array.from(form.querySelectorAll('input[name="response_type"]:checked'))
                                 .map(input => input.value);
      if (responseTypes.length > 0) {
        params.append('response_type', responseTypes.join(' '));
      }
  
      ['client_id', 'redirect_uri', 'scope', 'state', 'nonce', 'audience'].forEach(field => {
        const value = data.get(field);
        if (value) params.append(field, value);
      });
  
      const url = `${endpoint}?${params.toString()}`;
      preview.value = url;
      link.href = url;
      link.style.display = 'inline-block';
    }
  
    form.addEventListener('input', updatePreview);
    updatePreview(); // Initial update on page load
  });
  