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
    body: `We exist to give voice to the bold. Limited drops, sustainable mindset, and designs that
           make you feel seen. No fluff. No overproduction. Just streetwear with bite.`,
  },
  {
    id: 'process',
    title: 'The Process',
    body: `Every item is curated in small batches. We collaborate with artists, source quality materials,
           and apply attention to detail that you can see and feel. From concept to drop, it's crafted
           to last and designed to stand out.`,
  },
  {
    id: 'community',
    title: 'Community & Culture',
    body: `This isn’t just a brand—it’s a movement. Fans, collaborators, and outsiders alike help shape
           what Claw & Decay becomes. Your feedback, your style, your voice are all part of the story.`,
  },
];

function useRevealOnScroll(ref, options = {}) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
}

function OurStoryPage() {
  const containerRef = useRef(null);
  useRevealOnScroll(containerRef);

  return (
    <div className="app-main-content" ref={containerRef}>
      <Helmet>
        <title>Our Story — Claw & Decay</title>
        <meta
          name="description"
          content="Discover the origin, mission, and culture behind Claw & Decay. Streetwear crafted in small batches for bold statements."
        />
      </Helmet>

      <h2>Our Story</h2>

      {sections.map((sec) => (
        <section key={sec.id} className="our-story-section" id={sec.id}>
          <h3>{sec.title}</h3>
          <p>{sec.body}</p>
        </section>
      ))}

      <div className="timeline">
        <h3>Milestones</h3>
        <ul>
          <li>
            <strong>2024:</strong> Concept born from frustration with overpriced band tees and a passion
            for supporting local artists.
          </li>
          <li>
            <strong>2024:</strong> Collaboration with local artists & expansion of community.
          </li>
          <li>
            <strong>2025:</strong> Refining sustainable production and evolving the drop experience.
          </li>
        </ul>
      </div>

      <div className="callout-newsletter">
        <h3>Stay in the Loop 🤘</h3>
        <p>
          Join the Claw & Decay mailing list for early access, behind-the-scenes, and exclusive
          releases.
        </p>
        <button onClick={() => window.location.assign('/?newsletter=true')} className="subscribe-btn">
          Join the List
        </button>
      </div>
    </div>
  );
}

export default OurStoryPage;
