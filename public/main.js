let turnstileToken = null;
window.onTurnstile = (token) => { turnstileToken = token; };

const el = {
  note: document.getElementById('note'),
  save: document.getElementById('save'),
  summarize: document.getElementById('summarize'),
  bullets: document.getElementById('bullets'),
  translate: document.getElementById('translate'),
  rewrite: document.getElementById('rewrite'),
  output: document.getElementById('output')
};

// Create or reuse a sessionId for anonymous tracking
const sessionId = (() => {
  let id = sessionStorage.getItem('sessionId');
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('sessionId', id); }
  return id;
})();

async function callApi(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, turnstileToken, sessionId })
  });
  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
  } else {
    const text = await res.text();
    // Attempt to parse if it looks like JSON, otherwise return text as error
    try { data = JSON.parse(text); }
    catch (_) { throw new Error(text || 'Non-JSON response'); }
  }
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

el.save.addEventListener('click', async () => {
  try {
    const { key } = await callApi('save', { content: el.note.value });
    el.output.textContent = `Saved note key: ${key}`;
    sessionStorage.setItem('noteKey', key);
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  }
});

el.summarize.addEventListener('click', async () => {
  try {
    const { result } = await callApi('summarize', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  }
});

el.bullets.addEventListener('click', async () => {
  try {
    const { result } = await callApi('bullets', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  }
});

el.translate.addEventListener('click', async () => {
  try {
    const { result } = await callApi('translate', { content: el.note.value, target: 'es' });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  }
});

el.rewrite.addEventListener('click', async () => {
  try {
    const { result } = await callApi('rewrite', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  }
});

// Load last note for this session on page load
(async () => {
  try {
    const { content } = await callApi('load', {});
    if (content) {
      el.note.value = content;
      el.output.textContent = 'Loaded last note for this session.';
    }
  } catch (_) {
    // ignore if none
  }
})();
