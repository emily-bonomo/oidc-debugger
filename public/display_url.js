function generateRandomString(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function sha256(base64String) {
  const encoder = new TextEncoder();
  const data = encoder.encode(base64String);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode.apply(null, hashArray))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('oidcForm');
  const preview = document.getElementById('authUrlPreview');
  const link = document.getElementById('authLink');

  const usePkceCheckbox = document.getElementById('usePkce');
  const pkceSection = document.getElementById('pkceSection');
  const codeVerifierInput = form.querySelector('input[name="code_verifier"]');
  const codeChallengeInput = form.querySelector('input[name="code_challenge"]');
  const tokenEndpointRow = document.getElementById('tokenEndpointRow');
  const codeVerifierRow = document.getElementById('codeVerifierRow');
  const codeChallengeRow = document.getElementById('codeChallengeRow');

  // Auto-generate state and nonce
  form.querySelector('input[name="state"]').value = generateRandomString(16);
  form.querySelector('input[name="nonce"]').value = generateRandomString(16);

  async function updatePKCE() {
    const codeChecked = form.querySelector('input[name="response_type"][value="code"]').checked;
    pkceSection.style.display = codeChecked ? 'block' : 'none';

    if (codeChecked && usePkceCheckbox.checked) {
      tokenEndpointRow.style.display = 'block';
      codeVerifierRow.style.display = 'block';
      codeChallengeRow.style.display = 'block';

      const codeVerifier = generateRandomString(64);
      const codeChallenge = await sha256(codeVerifier);

      codeVerifierInput.value = codeVerifier;
      codeChallengeInput.value = codeChallenge;
    } else {
      tokenEndpointRow.style.display = 'none';
      codeVerifierRow.style.display = 'none';
      codeChallengeRow.style.display = 'none';
      codeVerifierInput.value = '';
      codeChallengeInput.value = '';
    }
  }

  async function updatePreview() {
    await updatePKCE();

    const data = new FormData(form);
    const endpoint = data.get('authorization_endpoint');
    if (!endpoint) {
      preview.value = '';
      link.href = '#';
      link.style.display = 'none';
      return;
    }

    const params = new URLSearchParams();

    // Handle multiple response types
    const responseTypes = Array.from(form.querySelectorAll('input[name="response_type"]:checked'))
                               .map(input => input.value);
    if (responseTypes.length > 0) {
      params.append('response_type', responseTypes.join(' '));
    }

    // Append standard fields
    ['client_id', 'redirect_uri', 'scope', 'state', 'nonce', 'audience'].forEach(field => {
      const value = data.get(field);
      if (value) params.append(field, value);
    });

    // Append PKCE if used
    if (usePkceCheckbox.checked) {
      const codeChallenge = data.get('code_challenge');
      if (codeChallenge) {
        params.append('code_challenge', codeChallenge);
        params.append('code_challenge_method', 'S256');
      }
    }

    const url = `${endpoint}?${params.toString()}`;
    const [baseUrl, queryString] = url.split('?');
    const queryLines = queryString
      .split('&')
      .map((param, index) => index === 0
        ? `  ${decodeURIComponent(param)}`
        : `  &${decodeURIComponent(param)}`
      )
      .join('\n');

    preview.value = `${baseUrl}?\n${queryLines}`;

    link.href = url;
    link.style.display = 'inline-block';
  }

  // Event Listeners
  form.addEventListener('input', updatePreview);
  usePkceCheckbox.addEventListener('change', updatePreview);
  updatePreview(); // initial run
});
