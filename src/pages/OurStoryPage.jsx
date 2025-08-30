// src/pages/OurStoryPage.jsx
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

const sections = [
  {
    id: 'origin',
    title: 'How It Started',
    body: `In 2024, after getting sick of paying $30-$40 for band T-shirts with crappy quality — but
           still loving to support the bands — I decided to create Claw & Decay. I wanted some cool,
           brutal designs printed on great quality shirts that wouldn’t break the bank. I also wanted to
           work with local artists, make my own art, and put that on clothing.`,
  },
  {
    id: 'mission',
    title: 'Our Mission',
    body: `We exist to give voice to the bold. Our designs are not for everyone and that is fine! This is for the people who are into the alternative culture. Growing up in the metal scene I know what its like
    to be cast out, have your music called just noise, satanic etc. This brand is for us the misfits the outcasts the bold!`,
  },
  {
    id: 'process',
    title: 'The Process',
    body: `Every item is made by the brand except for some of the art which I work with freelance artists and local creators to design. As of right now I am only one person so it takes some time to get new products
    out. Rest assured I spend probably too much time on all the products before publishing them.`,
  },
  {
    id: 'community',
    title: 'Community & Culture',
    body: `This isn’t just a brand—it’s a movement. Fans, collaborators, and outsiders alike help shape
           what Claw & Decay becomes. Your feedback, your style, your voice are all part of the story. If you have any merch, design, or ideas, I would love to hear from you. You can contact us on the Contact Page.`,
  },
];

// Hook to reveal multiple elements on scroll
function useRevealOnScrollMultiple(refs, options = {}) {
  useEffect(() => {
    const observers = [];
    refs.forEach(ref => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, ...options }
      );
      observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach(observer => observer.disconnect());
  }, [refs, options]);
}

function OurStoryPage() {
  const sectionRefs = sections.map(() => useRef(null));
  const timelineRef = useRef(null);
  const newsletterRef = useRef(null);

  useRevealOnScrollMultiple([...sectionRefs, timelineRef, newsletterRef]);

  return (
    <div className="glow-card">
      <div className="our-story-glow">
        <Helmet>
          <title>Our Story — Claw & Decay</title>
          <meta
            name="description"
            content="Discover the origin, mission, and culture behind Claw & Decay. Streetwear crafted in small batches for bold statements."
          />
        </Helmet>

        <h2 className="our-story-clean-wrapper">Our Story</h2>

        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className="our-story-section"
            id={sec.id}
            ref={sectionRefs[i]}
          >
            <h3>{sec.title}</h3>
            <p>{sec.body}</p>
          </section>
        ))}

        <div className="timeline" ref={timelineRef}>
          <h3>Milestones</h3>
          <ul>
            <li>
              <strong>2024:</strong> Concept born from frustration with overpriced band tees and a passion
              for supporting local artists.
            </li>
            <li>
              <strong>2025:</strong> Collaboration with local artists & creating the merch!
            </li>
            <li>
              <strong>2025:</strong> Deployed Website and here we are!
            </li>
          </ul>
        </div>

        {/* <div className="callout-newsletter" ref={newsletterRef}>
          <h3>Stay in the Loop 🤘</h3>
          <p>
            Join the Claw & Decay mailing list for early access, behind-the-scenes, and exclusive
            releases.
          </p>
          <button
            onClick={() => window.location.assign('/?newsletter=true')}
            className="subscribe-btn shiny-text-shadow"
          >
            Join the List
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default OurStoryPage;
