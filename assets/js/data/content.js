/**
 * Static content for elements that only exist in a hover/open state, so they
 * are not part of the saved page markup. Replaces the data the Framer page
 * bundle used to supply at runtime.
 */
(function () {
  'use strict';
  const FourK = (window.FourK = window.FourK || {});

  FourK.content = {
    // Keyed by the name shown on each team card.
    team: {
      'Jon Medlock': {
        role: 'Director',
        bio: "Jon founded 4K Projects in 2016 after spending nearly a decade at one of London's leading workplace design firms. During his time there, he was regularly responsible for outsourcing CGIs and experienced firsthand the challenges that come with the process. This experience shaped his understanding of what designers need from their visualization partners.",
      },
      'Anna Kawalec': {
        role: 'Associate Director',
        bio: 'Anna joined 4K Projects in 2017, having previously worked alongside Jon for many years in workplace design. As our longest-serving project manager, she brings extensive industry knowledge and understands the nuances of commercial projects inside out. Her deep experience in workplace design makes her an invaluable bridge between creative vision and practical delivery',
      },
      'Georgia Grigoriadi': {
        role: 'Studio Manager',
        bio: 'Georgia joined 4K Projects after working extensively with workplace design clients, giving her deep insight into the industry from both sides. She now oversees day-to-day operations, ensuring projects run smoothly and resources are allocated effectively. Her industry experience and problem-solving skills make her instrumental in delivering consistent results across all our projects.',
      },
      'Giulia Zanotti': {
        role: 'Project Manager',
        bio: 'Giulia worked alongside Jon and Anna at a leading workplace design firm before joining the 4K Projects team. With several years of experience managing projects here, she brings both exceptional design skills and deep industry knowledge. Her background as a designer herself makes her perfectly positioned to understand and deliver on complex workplace requirements.',
      },
      'Paola Maria Baliki': {
        role: 'Project Manager',
        bio: 'Paola joined 4K Projects in 2023, bringing strong interior design credentials and solid workplace knowledge to the team. Her design background proves invaluable in understanding client intentions and ensuring projects run smoothly from a creative perspective. Having delivered numerous projects since joining, her design expertise helps bridge the gap between client vision and final delivery.',
      },
      'Namik Pirkic': {
        role: 'Art Director',
        bio: 'Namik has been with 4K Projects almost since day one, bringing extensive experience as a former art director at a leading European 3D visualization company. As our art director and senior 3D artist, he ensures consistency across all projects, maintaining quality standards regardless of which artists are assigned to different aspects of larger commissions.',
      },
    },

    // In page order; matched to the accordion rows by question text.
    faq: [
      {
        question: 'Do you offer other types of CGIs like residential?',
        answer: "Absolutely. We specialise in workplace CGIs simply as they're generally considered the toughest to produce due to quality demands vs incredibly tight deadlines. Our 3D team love working on all types of CGIs and we've delivered hundreds of non-workplace projects over the years, including residential developments, student resi, hospitality, airports, apartment complexes, public spaces and more.",
      },
      {
        question: 'Why should we hire you when our usual guy can create similar result at half the cost?',
        answer: 'It’s true, you’ll be able to find a comparable final image for a good deal less than we’re offering, but we believe that great quality should be taken for granted when outsourcing for CGIs; it’s the process that matters just as much.  Backlogs of work, strict caps on revisions, availability for revisions if the project comes back, what happens when they stop replying - and this is all assuming you’ve actually worked with the artist before and know they can handle tight deadlines without jeopardising image quality and won’t waste your time by making you repeat yourself or hand-hold as they try to decipher what you really mean by “please match the RCP to the M&E drawings for the exposed services adjacent to the bulkhead perimeter".',
      },
      {
        question: 'What do you charge?',
        answer: 'Our workplace pricing starts at £400 for our smallest image size, up to £690 for our largest. Visit our visualisation page for further info on our transparent fixed priced brackets.',
      },
      {
        question: 'How many changes can I make?',
        answer: 'Most studios cap you at one or two rounds. We build in a 20% buffer for design changes - extra time set aside purely for revisions and adjustments, so you can refine your ideas at your own pace without the pressure of capturing everything in a fixed amount of draft rounds.',
      },
      {
        question: 'What’s your availability like?',
        answer: "Thanks to our team of 20+ artists we're able to start all projects within 24 hours, sometimes even the same day. We know how frustrating it is when your usual 3D partners have a backlog - from day one we’ve made it a priority to guarantee availability, meaning whenever you have a project that needs visualising you can rely on us to deliver.",
      },
      {
        question: 'I have an urgent request, when can I get a quote by?',
        answer: "We're almost always able to provide a quote the same day, the following morning latest. We appreciate that turnarounds are tight and the quicker we can share a quote the quicker you can make a decision and the quicker we can get started, leaving us more time to get your images looking phenomenal. Our fixed-price system helps to keep the process quick and transparent, meaning even before we send our quote you'll have an idea of roughly what it might be.",
      },
    ],

    // Stats card counter target ("22+ ARTISTS").
    artists: 22,
  };
})();
