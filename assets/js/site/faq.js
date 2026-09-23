/**
 * FAQ accordion ("Accordion / Row" component). Each row toggles on its own:
 * open adds the answer, turns the chevron down and springs the row height;
 * close removes the answer and springs the height back.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const SPRING = { type: 'spring', stiffness: 400, damping: 40, mass: 1 };
  const VARIANT = {
    closed: { cls: 'framer-v-izz0jp', name: 'Closed', chevron: '9 18 15 12 9 6' },
    open: { cls: 'framer-v-tcfu90', name: 'Open', chevron: '6 9 12 15 18 9' },
  };

  function answerBlock(text) {
    const block = document.createElement('div');
    block.className = 'framer-1cwrg4a';
    block.setAttribute('data-framer-name', 'Answer');
    block.innerHTML =
      '<div class="framer-5m6voo" data-framer-component-type="RichTextContainer">' +
      '<p class="framer-text framer-styles-preset-mqfsko" data-styles-preset="Gjim6gwBQ"></p></div>';
    const rich = block.firstChild;
    rich.style.setProperty('--extracted-r6o4lv', 'rgb(0, 0, 0)');
    rich.style.setProperty('--framer-link-text-color', 'rgb(0, 153, 255)');
    rich.style.setProperty('--framer-link-text-decoration', 'underline');
    const p = rich.firstChild;
    p.style.setProperty('--framer-text-color', 'var(--extracted-r6o4lv, rgb(0, 0, 0))');
    p.textContent = text;
    return block;
  }

  function setup(row, answers) {
    const { animate } = FourK.motion;
    const question = row.querySelector('.framer-t7mw70');
    const polyline = row.querySelector('.framer-11nh6fm-container polyline');
    const text = question?.textContent.trim();
    const answer = answers.find(a => a.question === text)?.answer ?? '';
    let open = false;
    let block = null;
    let resize = null;

    const apply = variant => {
      row.classList.remove(VARIANT.closed.cls, VARIANT.open.cls);
      row.classList.add(variant.cls);
      row.setAttribute('data-framer-name', variant.name);
      polyline?.setAttribute('points', variant.chevron);
    };

    question?.addEventListener('click', () => {
      const from = row.offsetHeight;
      open = !open;
      apply(open ? VARIANT.open : VARIANT.closed);
      if (open) {
        block = answerBlock(answer);
        question.after(block);
        animate(block, { opacity: 1 }, SPRING, { opacity: 0 });
        animate(block.firstChild, { opacity: 1 }, SPRING, { opacity: 0.6 });
      } else {
        block?.remove();
        block = null;
      }
      // Layout animation: spring the row between its old and new height.
      resize?.stop();
      row.style.height = '';
      const to = row.offsetHeight;
      const current = (resize = animate(row, { height: `${to}px` }, SPRING, { height: `${from}px` }));
      current.finished.then(() => {
        if (resize === current) row.style.height = '';
      });
    });
  }

  function init() {
    const answers = FourK.content?.faq ?? [];
    document.querySelectorAll('.framer-q8bsO').forEach(row => setup(row, answers));
  }

  FourK.faq = { init };
})();
