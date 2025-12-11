let turnstileToken = null;
window.onTurnstile = (token) => { turnstileToken = token; };

// Theme toggle functionality
const themeManager = (() => {
  const html = document.documentElement;
  const themeBtns = document.querySelectorAll('.theme-btn');
  
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function applyTheme(theme) {
    if (theme === 'system') {
      html.setAttribute('data-theme', getSystemTheme());
    } else {
      html.setAttribute('data-theme', theme);
    }
  }
  
  function setActiveButton(theme) {
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }
  
  function init() {
    // Load saved preference or default to system
    const saved = localStorage.getItem('theme') || 'system';
    applyTheme(saved);
    setActiveButton(saved);
    
    // Listen for clicks on theme buttons
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        setActiveButton(theme);
      });
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const saved = localStorage.getItem('theme') || 'system';
      if (saved === 'system') {
        applyTheme('system');
      }
    });
  }
  
  return { init };
})();

themeManager.init();

const el = {
  note: document.getElementById('note'),
  save: document.getElementById('save'),
  summarize: document.getElementById('summarize'),
  bullets: document.getElementById('bullets'),
  translate: document.getElementById('translate'),
  rewrite: document.getElementById('rewrite'),
  style: document.getElementById('style'),
  styleSelect: document.getElementById('styleSelect'),
  output: document.getElementById('output'),
  toHtml: document.getElementById('toHtml'),
  copyHtml: document.getElementById('copyHtml'),
  previewHtml: document.getElementById('previewHtml'),
  previewSection: document.getElementById('previewSection'),
  htmlPreview: document.getElementById('htmlPreview'),
  htmlCode: document.getElementById('htmlCode'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),
  wordCount: document.getElementById('wordCount'),
  charCount: document.getElementById('charCount')
};

// Word count functionality
function updateWordCount() {
  const text = el.note.value;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  el.wordCount.textContent = wordCount.toLocaleString();
  el.charCount.textContent = charCount.toLocaleString();
}

// Update on input
el.note.addEventListener('input', updateWordCount);
// Initialize on load
updateWordCount();

// Loading state management
const loading = {
  show(message = 'Processing...', button = null) {
    el.loadingText.textContent = message;
    el.loadingOverlay.classList.add('active');
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }
    // Disable all action buttons
    [el.save, el.summarize, el.bullets, el.translate, el.rewrite, el.style, el.toHtml].forEach(btn => {
      if (btn) btn.disabled = true;
    });
  },
  hide(button = null) {
    el.loadingOverlay.classList.remove('active');
    if (button) {
      button.classList.remove('loading');
    }
    // Re-enable all action buttons
    [el.save, el.summarize, el.bullets, el.translate, el.rewrite, el.style, el.toHtml].forEach(btn => {
      if (btn) btn.disabled = false;
    });
  }
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
  loading.show('Saving note...', el.save);
  try {
    const { key } = await callApi('save', { content: el.note.value });
    el.output.textContent = `Saved note key: ${key}`;
    sessionStorage.setItem('noteKey', key);
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.save);
  }
});

el.summarize.addEventListener('click', async () => {
  loading.show('Summarizing with AI...', el.summarize);
  try {
    const { result } = await callApi('summarize', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.summarize);
  }
});

el.bullets.addEventListener('click', async () => {
  loading.show('Creating bullet points...', el.bullets);
  try {
    const { result } = await callApi('bullets', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.bullets);
  }
});

el.translate.addEventListener('click', async () => {
  loading.show('Translating to Spanish...', el.translate);
  try {
    const { result } = await callApi('translate', { content: el.note.value, target: 'es' });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.translate);
  }
});

el.rewrite.addEventListener('click', async () => {
  loading.show('Rewriting for clarity...', el.rewrite);
  try {
    const { result } = await callApi('rewrite', { content: el.note.value });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.rewrite);
  }
});

el.style.addEventListener('click', async () => {
  const styleName = el.styleSelect.value;
  loading.show(`Applying ${styleName} style...`, el.style);
  try {
    const { result } = await callApi('style', { content: el.note.value, style: styleName });
    el.output.textContent = result;
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.style);
  }
});

// Store last generated HTML
let lastHtmlResult = '';

el.toHtml.addEventListener('click', async () => {
  const content = el.output.textContent;
  if (!content || content.startsWith('Error:') || content.startsWith('Saved note') || content.startsWith('Loaded last') || content.startsWith('✅') || content.startsWith('📋')) {
    el.output.textContent = 'Error: No AI output to convert. Generate some content first!';
    return;
  }
  loading.show('Converting to HTML...', el.toHtml);
  try {
    const { result } = await callApi('format', { content, title: 'AI Generated Content' });
    lastHtmlResult = result;
    el.output.textContent = '✅ HTML generated! Click "Preview" to see it or "Copy HTML" to copy the code.';
    el.htmlCode.value = result;
    el.previewSection.classList.remove('hidden');
  } catch (e) {
    el.output.textContent = `Error: ${e.message}`;
  } finally {
    loading.hide(el.toHtml);
  }
});

el.copyHtml.addEventListener('click', async () => {
  if (!lastHtmlResult) {
    el.output.textContent = 'Error: No HTML to copy. Click "Convert to HTML" first!';
    return;
  }
  try {
    await navigator.clipboard.writeText(lastHtmlResult);
    el.output.textContent = '📋 HTML copied to clipboard!';
  } catch (e) {
    el.output.textContent = `Error copying: ${e.message}`;
  }
});

el.previewHtml.addEventListener('click', () => {
  if (!lastHtmlResult) {
    el.output.textContent = 'Error: No HTML to preview. Click "Convert to HTML" first!';
    return;
  }
  el.htmlPreview.innerHTML = lastHtmlResult;
  el.previewSection.classList.remove('hidden');
  el.previewSection.scrollIntoView({ behavior: 'smooth' });
});

// Load last note for this session on page load
(async () => {
  try {
    const { content } = await callApi('load', {});
    if (content) {
      el.note.value = content;
      el.output.textContent = 'Loaded last note for this session.';
      updateWordCount();
    }
  } catch (_) {
    // ignore if none
  }
})();
