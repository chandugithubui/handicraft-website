import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiGlobe, FiHeart, FiPackage, FiShield, FiUsers } from 'react-icons/fi';
import './About.css';

const values = [
  { title: 'Integrity', description: 'Clear product information and thoughtful, respectful relationships with shoppers and makers.', Icon: FiHeart },
  { title: 'Craftsmanship', description: 'Celebrating the care, patience and distinctive techniques behind handmade work.', Icon: FiAward },
  { title: 'Community', description: 'Creating space for artisans, their stories and the people who appreciate their work.', Icon: FiUsers },
  { title: 'Responsibility', description: 'Encouraging mindful choices and appreciation for pieces made to be treasured.', Icon: FiGlobe },
];

const journey = [
  { year: '2024', label: 'THE IDEA', title: 'A passion for handmade art', description: 'The idea behind Handicraft Hub took shape: bring Indian craft traditions and modern online shopping closer together.' },
  { year: '2025', label: 'BUILDING THE PLATFORM', title: 'Designing the experience', description: 'Work on the storefront, craft collections and the tools needed to discover products and their stories.' },
  { year: '2026', label: 'OUR NEXT CHAPTER', title: 'Growing the collection', description: 'Continuing to refine the shopping experience and create a more useful space for handmade creations.' },
];

const promises = [
  { title: 'Explore craft collections', description: 'Browse Pattachitra, palm-leaf art, textiles, decor and more.', Icon: FiPackage },
  { title: 'Discover the story', description: 'Learn about the styles and traditions that inspire each collection.', Icon: FiHeart },
  { title: 'Shop with clarity', description: 'Find useful product details before deciding what belongs in your home.', Icon: FiShield },
];

export default function About() {
  return (
    <main className="about-page">
      
<section className="about-hero">
  <div className="about-hero-decoration about-hero-decoration-one" />
  <div className="about-hero-decoration about-hero-decoration-two" />

  <div className="about-hero-inner">
    <div className="about-hero-content">
      <span className="about-eyebrow">
        ✦ HANDICRAFT HUB · OUR STORY
      </span>

      <h1>
        Handmade with heritage.
        <em> Shared with heart.</em>
      </h1>

      <p>
        Celebrating the artistry, traditions and people
        behind India's handmade treasures. Every craft
        carries a story worth sharing.
      </p>

      <div className="about-hero-actions">
        <Link
          to="/category/all"
          className="about-button about-button-dark"
        >
          Explore Our Crafts <FiArrowRight />
        </Link>

        <span className="about-hero-note">
          Rooted in tradition. Made with care.
        </span>
      </div>
    </div>
  </div>
</section>


      <div className="about-container">
        <section className="about-mission about-block" aria-labelledby="mission-heading">
          <div className="about-mission-copy">
            <span className="about-eyebrow">WHY WE EXIST</span>
            <h2 id="mission-heading">Crafts with a story.<br /><em>People with a passion.</em></h2>
            <p>At Handicraft Hub, we believe a handmade piece is more than an object. It reflects skill, imagination and the cultural traditions passed between generations.</p>
            <p>Our mission is to make these crafts easier to discover, while putting the creativity and care of Indian artisans at the center of the experience.</p>
            <div className="about-mission-note"><FiHeart aria-hidden="true" /><span>Celebrating the hands and heritage behind every craft.</span></div>
          </div>
          <div className="about-mission-media">
            <img src="/images/pattachitra1.jpg" alt="Traditional Odisha Pattachitra painting" loading="lazy" />
            <div className="about-photo-caption">ART · CULTURE · CRAFTSMANSHIP</div>
          </div>
        </section>

        <section className="about-values about-block" aria-labelledby="values-heading">
          <div className="about-heading"><span className="about-eyebrow">WHAT GUIDES US</span><h2 id="values-heading">Our Core Values</h2><p>Simple principles that shape the Handicraft Hub experience.</p></div>
          <div className="about-values-grid">{values.map(({ title, description, Icon }) => <article className="about-value-card" key={title}><div className="about-value-icon"><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="about-journey about-block" aria-labelledby="journey-heading">
          <div className="about-heading"><span className="about-eyebrow">HOW IT BEGAN</span><h2 id="journey-heading">From an Idea to a Community</h2><p>The story of building a place for India's handmade heritage.</p></div>
          <div className="about-timeline">{journey.map(item => <article className="about-timeline-item" key={item.year}><span className="about-timeline-year">{item.year}</span><div className="about-timeline-content"><span className="about-timeline-label">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
          <p className="about-disclosure">This timeline describes the Handicraft Hub portfolio project's development story; adjust the dates and milestones to match your records.</p>
        </section>

        <section className="about-experience about-block" aria-labelledby="experience-heading">
          <div className="about-heading"><span className="about-eyebrow">WHAT YOU'LL FIND HERE</span><h2 id="experience-heading">A More Meaningful Way to Shop</h2><p>Made for people who value craft, culture and individuality.</p></div>
          <div className="about-experience-grid">{promises.map(({ title, description, Icon }, index) => <article className="about-experience-card" key={title}><span className="about-experience-number">0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="about-impact about-block" aria-labelledby="impact-heading">
          <div><span className="about-eyebrow">OUR VISION</span><h2 id="impact-heading">Small details.<br />Lasting impressions.</h2></div>
          <p>Our goal is to help more people appreciate Indian handicrafts and the creative communities behind them. As the platform grows, we'll share verified milestones and genuine customer stories here.</p>
        </section>

        <section className="about-cta about-block" aria-labelledby="about-cta-heading"><span className="about-eyebrow">DISCOVER THE CRAFT</span><h2 id="about-cta-heading">Bring a Story Home</h2><p>Explore pieces inspired by tradition, crafted with care and made to be cherished.</p><Link to="/products" className="about-button about-button-light">Explore Our Collection <FiArrowRight /></Link></section>
      </div>
    </main>
  );
}
