// letter.js — responsive auto-paginate + typewriter per-page + setQR()
document.addEventListener('DOMContentLoaded', () => {
  const envelope = document.getElementById('envelope');
  const paper = document.getElementById('paper');
  const pagesEl = document.getElementById('pages');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const controlsRow = document.getElementById('controls-row');
  const qrInpage = document.getElementById('qr-inpage');
  const qrImg = document.getElementById('qrcode');

  let pages = [];
  let currentIndex = 0;
  let typingCancel = false;

  // Message text (signature appended on last page)
  const fullMessage = `Hi Shamira Bianca, my pretty girl

You are probably wondering what this is for. Secret muna, you will find out later. I just wanted to leave you a message first.

I am really grateful that I met you. It was unexpected, like out of all the people in the world, I got to know you. I never imagined we would become this close. At first, I was really shy. Every time you invited me to play, I felt like I had to perform in front of a crowd because of how nervous I was. Hindi ko rin ma explain kung bakit. But you kept inviting me and that made me feel seen.

Then we started talking every day. It became constant and we had so many topics. That is rare for me because I am usually awkward with conversations. I overthink a lot and I get insecure. Pero with you, it felt different. You made it easy. You made me feel safe. You made me feel like I can be myself without being judged.

When you confessed, I have to be honest, I got scared. Even before we got close, I already felt like I was becoming avoidant. I am not usually like that, but the truth is, I have always been afraid of getting too close to someone because I have been hurt before. So when I started feeling something for you, my mind immediately tried to protect me by pulling away.

But even though I felt that way, I still chose to be honest. I still chose to tell you how I felt. Because even if my fears were loud, my feelings for you were louder. I wanted you to know the truth and I wanted to give us a chance, because you deserve that.
And the more we talked, the more I realized that my fears were not real with you. Instead of feeling trapped, I felt safe. Instead of wanting to run away, I wanted to stay.

I also did not expect to become vulnerable so quickly. Yun talaga yung pinaka iniiwasan ko. I do not like showing the side of me that is weak, messy and scared kasi once I open that part, it becomes real. But with you, it felt different. Hindi ako natakot mag open up. Hindi ako natakot maging honest about my feelings. Instead of pulling away, I wanted to come closer.

I love hearing you yap. Even when you are just talking about random things or ranting about your day, I never get tired of listening. Because every time you talk, I feel like I am getting to know you more and I love that.

Every day, I want to know you more. All of you. I love hearing you talk about your dreams, your rants, your random thoughts, even on days when you are not in the mood. Even when you are a bit moody, I still love you. I love my mataray baby. Mahal kita hindi lang sa good days mo but also in the days you do not feel okay. Because on those days, I see the real you, yung hindi kailangan mag pretend.

I may not always find the perfect words to explain everything I feel, but one thing I am sure of is this. I love you. And I will keep loving you, not just today, not just this month, but every single day moving forward. I do not know what the future holds, but one thing is certain. I will always choose you.

I know things are not perfect and we don’t know what the future holds. But I want to be with you while we figure it out. I want to grow with you, not because we have to, but because we want to.

PS: Alam mo, ang dami ko pang gustong sabihin sa’yo pero sabihin ko na lang yung iba next time. Please play tayo later kasi may something ako for you. I really hope you will like it.`;

  const paragraphs = fullMessage.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  // hidden measurer for pagination
  function createMeasurer() {
    const measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.left = '-9999px';
    measurer.style.top = '-9999px';
    const pageW = getComputedStyle(document.documentElement).getPropertyValue('--page-width') || '460px';
    measurer.style.width = pageW.trim();
    measurer.style.fontFamily = getComputedStyle(document.body).fontFamily || 'serif';
    measurer.style.fontSize = '15px';
    measurer.style.lineHeight = '1.6';
    measurer.style.whiteSpace = 'pre-wrap';
    measurer.style.padding = '0';
    measurer.style.boxSizing = 'border-box';
    document.body.appendChild(measurer);
    return measurer;
  }

  function paginateParagraphs(paragraphs, maxHeight) {
    const measurer = createMeasurer();
    const pageTexts = [];
    let currentText = '';

    for (let p of paragraphs) {
      measurer.innerText = currentText ? (currentText + '\n\n' + p) : p;
      if (measurer.scrollHeight <= maxHeight) {
        currentText = currentText ? (currentText + '\n\n' + p) : p;
        continue;
      }

      if (!currentText) {
        let remaining = p;
        while (remaining.length > 0) {
          let low = 0, high = remaining.length;
          let fitLen = 0;
          while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            measurer.innerText = remaining.slice(0, mid);
            if (measurer.scrollHeight <= maxHeight) { fitLen = mid; low = mid + 1; }
            else { high = mid - 1; }
          }
          if (fitLen === 0) fitLen = Math.max(1, Math.floor(remaining.length / 4));
          pageTexts.push(remaining.slice(0, fitLen));
          remaining = remaining.slice(fitLen).trim();
        }
        currentText = '';
      } else {
        pageTexts.push(currentText);
        currentText = '';
        measurer.innerText = p;
        if (measurer.scrollHeight <= maxHeight) currentText = p;
        else {
          let remaining = p;
          while (remaining.length > 0) {
            let low = 0, high = remaining.length;
            let fitLen = 0;
            while (low <= high) {
              let mid = Math.floor((low + high) / 2);
              measurer.innerText = remaining.slice(0, mid);
              if (measurer.scrollHeight <= maxHeight) { fitLen = mid; low = mid + 1; }
              else { high = mid - 1; }
            }
            if (fitLen === 0) fitLen = Math.max(1, Math.floor(remaining.length / 4));
            pageTexts.push(remaining.slice(0, fitLen));
            remaining = remaining.slice(fitLen).trim();
          }
          currentText = '';
        }
      }
    }

    if (currentText) pageTexts.push(currentText);
    measurer.remove();
    return pageTexts;
  }

  function buildPagesDOM(pagesArr) {
    pagesEl.innerHTML = '';
    pagesArr.forEach((text, idx) => {
      const panel = document.createElement('div');
      panel.className = 'page-panel' + (idx === 0 ? ' active' : ' hidden');
      panel.dataset.index = idx;

      const column = document.createElement('div');
      column.className = 'notebook-column';

      if (idx === 0) {
        const s = document.createElement('div');
        s.className = 'salutation';
        s.textContent = 'Dear Biaboo,';
        column.appendChild(s);
      }

      const tp = document.createElement('div');
      tp.className = 'typed-paragraphs';
      tp.id = `typed-${idx}`;
      column.appendChild(tp);

      panel.appendChild(column);
      pagesEl.appendChild(panel);
    });
  }

  async function typePage(idx) {
    typingCancel = true;
    await sleep(20);
    typingCancel = false;
    const tp = document.getElementById(`typed-${idx}`);
    if (!tp) return;
    tp.innerHTML = '';

    const text = pages[idx] || '';
    const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const speed = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--type-speed')) || 22;

    for (let p of paras) {
      if (typingCancel) return;
      const pEl = document.createElement('p');
      tp.appendChild(pEl);
      for (let i = 0; i < p.length; i++) {
        if (typingCancel) return;
        const ch = p[i];
        if (ch === '\n') pEl.innerHTML += '<br>';
        else {
          const escaped = (ch === '<') ? '&lt;' : (ch === '&' ? '&amp;' : ch);
          pEl.innerHTML += escaped;
        }
        tp.scrollTop = tp.scrollHeight;
        await sleep(speed + Math.random() * 18);
      }
      const caret = document.createElement('span'); caret.className = 'caret';
      pEl.appendChild(caret);
      await sleep(380);
      if (pEl.contains(caret)) pEl.removeChild(caret);
      await sleep(120);
    }

    if (idx === pages.length - 1) {
      let sig = document.getElementById('signature-inline');
      if (!sig) {
        sig = document.createElement('div');
        sig.id = 'signature-inline';
        sig.className = 'signature';
        sig.textContent = '— yours truly,\ndutch mill';
        const panel = pagesEl.querySelector(`.page-panel[data-index="${idx}"]`);
        if (panel) panel.querySelector('.notebook-column').appendChild(sig);
      }
      sig.style.opacity = '1';
    }
  }

  function showPage(idx) {
    const panels = pagesEl.querySelectorAll('.page-panel');
    panels.forEach(p => { p.classList.add('hidden'); p.classList.remove('active'); });
    const target = pagesEl.querySelector(`.page-panel[data-index="${idx}"]`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
    currentIndex = idx;
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === pages.length - 1);
    typePage(currentIndex);

    // show QR only on last page and only if qrcode src exists
    if (currentIndex === pages.length - 1 && qrImg && qrImg.src && qrImg.src.trim() !== '') {
      qrInpage.style.display = 'flex';
      qrInpage.setAttribute('aria-hidden', 'false');
    } else {
      qrInpage.style.display = 'none';
      qrInpage.setAttribute('aria-hidden', 'true');
    }
  }

  function initPaginationAndBuild() {
    const maxHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--typed-max-height')) || 420;
    pages = paginateParagraphs(paragraphs, maxHeight);
    buildPagesDOM(pages);
  }

  function openEnvelope() {
    envelope.classList.add('open');
    setTimeout(() => { envelope.style.display = 'none'; }, 360);
    paper.classList.add('visible');
    paper.setAttribute('aria-hidden', 'false');
    controlsRow.setAttribute('aria-hidden', 'false');
    if (!pages.length) initPaginationAndBuild();
    if (window._lastQR && qrImg) { qrImg.src = window._lastQR; }
    setTimeout(() => showPage(0), 360);
  }

  function closeEnvelope() {
    envelope.style.display = '';
    envelope.classList.remove('open');
    paper.classList.remove('visible');
    paper.setAttribute('aria-hidden', 'true');
    controlsRow.setAttribute('aria-hidden', 'true');
    typingCancel = true;
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } });

  prevBtn.addEventListener('click', () => { if (currentIndex > 0) showPage(currentIndex - 1); });
  nextBtn.addEventListener('click', () => { if (currentIndex < pages.length - 1) showPage(currentIndex + 1); });

  // runtime QR setter
  window.setQR = function(src) {
    window._lastQR = src;
    if (qrImg) { qrImg.src = src; }
  };

  pagesEl.addEventListener('dblclick', (e) => {
    const panel = e.target.closest('.page-panel');
    if (!panel) return;
    const idx = parseInt(panel.dataset.index, 10);
    if (!isNaN(idx)) showPage(idx);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!paper.classList.contains('visible')) return;
      const prevPage = currentIndex;
      typingCancel = true;
      initPaginationAndBuild();
      const newIndex = Math.min(prevPage, pages.length - 1);
      showPage(newIndex);
      if (window._lastQR && qrImg) qrImg.src = window._lastQR;
    }, 220);
  });

  window._ll = { paginateParagraphs, setQR: window.setQR };
});