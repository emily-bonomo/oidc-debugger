document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('oidcForm');
    const preview = document.getElementById('authUrlPreview');
    const link = document.getElementById('authLink');
  
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
  