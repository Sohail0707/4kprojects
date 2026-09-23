/**
 * Static content for elements that only exist in a hover/open state, so they
 * are not part of the saved page markup. Replaces the data the Framer page
 * bundle used to supply at runtime.
 *
 * Names, roles and questions match the markup in about-us.html. The long-form
 * `bio` and `answer` copy is left empty on purpose: fill it in with the text
 * you have the rights to use (see README → "Content").
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  FourK.content = {
    // Keyed by the name shown on each team card.
    team: {
      'Jon Medlock': { role: 'Director', bio: '' },
      'Anna Kawalec': { role: 'Associate Director', bio: '' },
      'Georgia Grigoriadi': { role: 'Studio Manager', bio: '' },
      'Giulia Zanotti': { role: 'Project Manager', bio: '' },
      'Paola Maria Baliki': { role: 'Project Manager', bio: '' },
      'Namik Pirkic': { role: 'Art Director', bio: '' },
    },

    // In page order; matched to the accordion rows by question text.
    faq: [
      { question: 'Do you offer other types of CGIs like residential?', answer: '' },
      { question: 'Why should we hire you when our usual guy can create similar result at half the cost?', answer: '' },
      { question: 'What do you charge?', answer: '' },
      { question: 'How many changes can I make?', answer: '' },
      { question: 'What’s your availability like?', answer: '' },
      { question: 'I have an urgent request, when can I get a quote by?', answer: '' },
    ],

    // Stats card counter target ("22+ ARTISTS").
    artists: 22,
  };
})();
