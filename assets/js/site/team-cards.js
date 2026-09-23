/**
 * Team card hover ("Team Card 2" component). On hover the portrait fades out,
 * a tinted panel fades in and the person's bio springs in on top of it.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  const FADE = { duration: 0.4, ease: [0.5, 0, 0.88, 0.77] };
  const TEXT_IN = { type: 'spring', bounce: 0.2, delay: 0.3, duration: 0.4 };
  const TEXT_COLOR = 'var(--token-a765b7b0-7d53-46be-8993-a5af0de400ee, rgb(0, 0, 0))';

  // Markup of the hover-only description block, as the component renders it.
  function descriptionBlock(bio) {
    const block = document.createElement('div');
    block.className = 'framer-ukhjqd';
    block.innerHTML =
      '<div class="framer-1rlbi0p" data-framer-name="Description">' +
      '<div class="framer-1ekfv2i" data-framer-component-type="RichTextContainer">' +
      '<p class="framer-text"></p></div></div>';
    const rich = block.querySelector('.framer-1ekfv2i');
    rich.style.setProperty('--extracted-r6o4lv', TEXT_COLOR);
    rich.style.setProperty('--framer-link-text-color', 'rgb(0, 153, 255)');
    rich.style.setProperty('--framer-link-text-decoration', 'underline');
    const p = block.querySelector('p');
    p.style.setProperty('--font-selector', 'R0Y7RE0gU2Fucy1yZWd1bGFy');
    p.style.setProperty('--framer-font-family', '"DM Sans", "DM Sans Placeholder", sans-serif');
    p.style.setProperty('--framer-font-size', '18px');
    p.style.setProperty('--framer-text-color', `var(--extracted-r6o4lv, ${TEXT_COLOR})`);
    p.textContent = bio;
    return block;
  }

  function setup(card) {
    const { animate } = FourK.motion;
    const border = card.querySelector('.framer-irlnun');
    const image = card.querySelector('.framer-m3hsx1');
    const panel = card.querySelector('.framer-wlv943');
    const name = card.querySelector('.framer-1oua9pd h5')?.textContent.trim();
    const bio = FourK.content?.team?.[name]?.bio ?? '';
    const baseName = card.getAttribute('data-framer-name');
    let block = null;

    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || block) return;
      card.classList.add('hover');
      card.removeAttribute('data-framer-name');
      block = descriptionBlock(bio);
      border.after(block);
      const rich = block.querySelector('.framer-1ekfv2i');
      animate(rich, { opacity: 1 }, TEXT_IN, { opacity: 0.001 });
      animate(image, { opacity: 0 }, FADE);
      animate(panel, { opacity: 1 }, FADE);
    });

    card.addEventListener('pointerleave', () => {
      if (!block) return;
      block.remove();
      block = null;
      card.classList.remove('hover');
      if (baseName) card.setAttribute('data-framer-name', baseName);
      animate(image, { opacity: 1 }, FADE);
      animate(panel, { opacity: 0 }, FADE);
    });
  }

  function init() {
    document.querySelectorAll('a.framer-NuN3E').forEach(setup);
  }

  FourK.teamCards = { init };
})();
