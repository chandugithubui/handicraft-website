export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author?: string;
  publishedDate: string;
  heroImage: string;
  content: {
    type: 'paragraph' | 'heading' | 'image';
    text?: string;
    src?: string;
    alt?: string;
    level?: number;
  }[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'pattachitra-ancient-art-odisha',
    title: 'Pattachitra: The Living Canvas of Odisha',
    excerpt:
      'Discover the intricate world of Pattachitra, an ancient painting tradition where mythology meets meticulous craftsmanship on cloth and palm leaves.',
    category: 'Craft Guides',
    publishedDate: '2026-09-15',
    heroImage: '/images/pattachitra1.jpg',
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'Pattachitra, derived from the Sanskrit words "patta" (cloth) and "chitra" (picture), represents one of India\'s oldest and most revered painting traditions. Originating in the temple town of Puri, Odisha, this art form has flourished for over a thousand years, telling stories of gods, legends, and daily life through vivid colors and intricate linework.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Traditional Technique',
      },
      {
        type: 'paragraph',
        text: 'Creating a Pattachitra painting is a labor-intensive process that begins long before the first brushstroke. Artisans prepare the canvas by coating cloth with a mixture of chalk and tamarind seed gum, creating a smooth, absorbent surface. Natural pigments derived from minerals, plants, and stones provide the characteristic earthy tones and brilliant colors.',
      },
      {
        type: 'paragraph',
        text: 'The entire process is done by hand, from grinding stones for pigments to fashioning brushes from animal hair. This dedication to traditional methods ensures each piece carries the authentic spirit of centuries-old techniques.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Iconic Motifs and Themes',
      },
      {
        type: 'paragraph',
        text: 'Pattachitra paintings typically depict stories from Hindu epics like the Ramayana and Mahabharata, as well as tales of Lord Jagannath, the presiding deity of Puri. The distinctive style features bold outlines, rich colors, and decorative borders adorned with floral and geometric patterns.',
      },
      {
        type: 'paragraph',
        text: 'Every element in a Pattachitra painting carries symbolic meaning. The facial features follow strict iconographic rules, and the absence of perspective creates a timeless, spiritual quality. Birds, animals, and mythological creatures populate the compositions, each rendered with careful attention to traditional proportions.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Preserving a Heritage',
      },
      {
        type: 'paragraph',
        text: 'Today, Pattachitra artists face the challenge of sustaining their craft in a modern world. While tourism has brought renewed interest, the painstaking nature of the work and the time required to master the technique mean fewer young people are entering the tradition.',
      },
      {
        type: 'paragraph',
        text: 'When you purchase a Pattachitra painting, you\'re not just acquiring art—you\'re supporting families who have dedicated generations to preserving this cultural treasure. Each piece represents weeks or months of meticulous work and carries forward a visual language that has survived centuries.',
      },
      {
        type: 'paragraph',
        text: 'Whether displayed as wall art or treasured as a collector\'s piece, Pattachitra brings the richness of Indian mythology and the skill of master craftspeople into your home.',
      },
    ],
  },
  {
    slug: 'palm-leaf-engraving-art',
    title: 'Palm Leaf Engraving: Writing on Nature\'s Parchment',
    excerpt:
      'Explore the delicate art of palm leaf engraving, where ancient scripts and intricate designs are etched onto dried palm leaves to create timeless manuscripts and decorative pieces.',
    category: 'Craft Guides',
    publishedDate: '2026-08-22',
    heroImage: '/images/palm-leaf-design.png',
    content: [
      {
        type: 'paragraph',
        text: 'Long before paper became commonplace, palm leaves served as the primary writing surface across South and Southeast Asia. In India, particularly in Odisha, palm leaf manuscripts preserved religious texts, medicinal knowledge, and artistic traditions for centuries. Today, this ancient technique continues as both a functional craft and a decorative art form.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Craft Process',
      },
      {
        type: 'paragraph',
        text: 'Palm leaf engraving begins with selecting mature leaves from the Talipot or Palmyra palm. The leaves are boiled, dried, and smoothed to create a durable surface. Artists then use a sharp metal stylus to etch designs into the leaf, following patterns that may be centuries old or entirely contemporary.',
      },
      {
        type: 'paragraph',
        text: 'After engraving, artisans rub a mixture of charcoal or turmeric powder into the incisions, making the designs visible and permanent. The leaves are then treated with oil to prevent insect damage and increase longevity. When properly preserved, palm leaf art can last for generations.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Common Themes and Uses',
      },
      {
        type: 'paragraph',
        text: 'Traditional palm leaf manuscripts often feature religious verses, mythological scenes, or botanical illustrations. Modern artisans have expanded the repertoire to include contemporary designs suitable for home décor, greeting cards, and bookmarks.',
      },
      {
        type: 'paragraph',
        text: 'The natural golden-brown color of treated palm leaves provides a warm, organic aesthetic that complements both traditional and modern interiors. Framed palm leaf art makes for unique wall hangings that tell a story of sustainable craftsmanship.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'An Eco-Friendly Art Form',
      },
      {
        type: 'paragraph',
        text: 'In an age of environmental awareness, palm leaf art stands out for its sustainability. The leaves are a natural byproduct of palm trees, requiring no special cultivation. The entire process uses minimal resources and produces no harmful waste.',
      },
      {
        type: 'paragraph',
        text: 'By choosing palm leaf crafts, you support artisans who work with nature rather than against it, creating beautiful objects that carry both cultural significance and environmental responsibility.',
      },
    ],
  },
  {
    slug: 'handloom-textiles-indian-tradition',
    title: 'The Rhythm of the Loom: India\'s Handloom Heritage',
    excerpt:
      'Delve into the world of Indian handloom textiles, where every thread tells a story of regional identity, ancestral knowledge, and the patient skill of weavers who transform fiber into fabric.',
    category: 'Craft Guides',
    publishedDate: '2026-10-01',
    heroImage: '/images/blacksaree.jpeg',
    content: [
      {
        type: 'paragraph',
        text: 'The rhythmic clack of a handloom has been the soundtrack of Indian villages for millennia. From the silk weaving centers of Varanasi to the cotton traditions of rural Bengal, handloom textiles represent one of India\'s most significant craft sectors, employing millions and producing fabrics renowned worldwide for their quality and beauty.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'More Than Just Fabric',
      },
      {
        type: 'paragraph',
        text: 'Handloom weaving is not simply a method of making cloth—it\'s a cultural practice that varies dramatically from region to region. Each weaving cluster has developed its own techniques, patterns, and color palettes, often passed down through families for generations.',
      },
      {
        type: 'paragraph',
        text: 'A Banarasi silk sari might take weeks to weave, with its intricate brocade work requiring exceptional skill and concentration. A Khadi cotton fabric reflects Gandhi\'s vision of self-reliance and sustainable living. Each textile carries the imprint of its maker and the traditions of its place of origin.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Weaver\'s Skill',
      },
      {
        type: 'paragraph',
        text: 'Operating a handloom demands physical coordination, spatial reasoning, and artistic judgment. Weavers must calculate thread counts, maintain consistent tension, and execute complex patterns from memory or simple guides. The process is meditative yet demanding, requiring hours of focused attention.',
      },
      {
        type: 'paragraph',
        text: 'Unlike mechanized production, handloom weaving allows for spontaneous adjustments and variations. Slight irregularities in handwoven fabric are not flaws but signatures of human craft, proof that a real person sat at the loom and guided each thread into place.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Sustainable Fashion Choice',
      },
      {
        type: 'paragraph',
        text: 'Handloom textiles offer an alternative to fast fashion. They require no electricity, produce minimal waste, and often use natural fibers and dyes. The durability of handwoven fabric means garments and home textiles can last for years, even decades, with proper care.',
      },
      {
        type: 'paragraph',
        text: 'When you purchase handloom products, you directly support artisan families and help sustain traditional knowledge systems. You\'re choosing quality over quantity and investing in pieces with genuine character and story.',
      },
    ],
  },
  {
    slug: 'pottery-traditions-india',
    title: 'From Clay to Creation: India\'s Pottery Traditions',
    excerpt:
      'Journey through India\'s diverse pottery traditions, from utilitarian earthenware to decorative ceramics, and learn how potters transform humble clay into functional art.',
    category: 'Artisan Stories',
    publishedDate: '2026-07-10',
    heroImage: '/images/claypot.jpg',
    content: [
      {
        type: 'paragraph',
        text: 'Pottery is among humanity\'s oldest crafts, and in India, the potter\'s wheel has been spinning for over 5,000 years. Archaeological sites across the subcontinent reveal sophisticated ceramic traditions dating back to the Indus Valley Civilization. Today, potters continue to practice their craft, balancing ancient techniques with contemporary needs.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Regional Pottery Styles',
      },
      {
        type: 'paragraph',
        text: 'India\'s pottery traditions vary widely by region. In Rajasthan, the blue pottery of Jaipur features distinctive Persian-influenced designs glazed in vibrant blues and greens. Tamil Nadu\'s Thanjavur pottery creates figures of deities and decorative items using a technique called "thanjavur bommai."',
      },
      {
        type: 'paragraph',
        text: 'Terracotta, or unglazed earthenware, remains the most common form across India. From simple cooking pots to elaborate temple decorations, terracotta items serve both practical and ceremonial purposes. The porous nature of unglazed pottery makes it ideal for water storage, naturally cooling the contents through evaporation.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Potter\'s Process',
      },
      {
        type: 'paragraph',
        text: 'Traditional pottery begins with sourcing and preparing clay, often from local deposits. Potters knead the clay to remove air bubbles and achieve the right consistency. The vessel is then shaped on a wheel or by hand, allowed to dry to a leather-hard state, and finally fired in a kiln.',
      },
      {
        type: 'paragraph',
        text: 'Each stage requires judgment and experience. The clay must have the right moisture content, the wheel speed must match the form being made, and the firing temperature must be carefully controlled. A lifetime of practice develops the intuitive knowledge needed to produce consistent, quality work.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Pottery in Modern Homes',
      },
      {
        type: 'paragraph',
        text: 'Handmade pottery brings warmth and authenticity to contemporary interiors. Whether used as planters, serving dishes, or purely decorative pieces, ceramic items add texture and natural tones that complement various design styles.',
      },
      {
        type: 'paragraph',
        text: 'Choosing handcrafted pottery supports artisan communities and connects your home to India\'s deep craft heritage. Each piece carries the marks of its making—slight variations that prove it was shaped by human hands, not machines.',
      },
    ],
  },
  {
    slug: 'caring-for-handmade-home-decor',
    title: 'Caring for Your Handmade Treasures: A Practical Guide',
    excerpt:
      'Learn how to properly care for handmade home décor items to ensure they remain beautiful and functional for years to come. Practical tips for wood, textiles, ceramics, and more.',
    category: 'Home Décor',
    publishedDate: '2026-09-28',
    heroImage: '/images/handcraftedwoodenBowl3.webp',
    content: [
      {
        type: 'paragraph',
        text: 'Handmade items deserve thoughtful care. Unlike mass-produced goods designed for quick replacement, handcrafted pieces are meant to last, gaining character and patina over time. With proper maintenance, your handmade décor can become heirloom pieces that serve your family for generations.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Caring for Wooden Items',
      },
      {
        type: 'paragraph',
        text: 'Wooden handicrafts, from carved figurines to serving bowls, benefit from occasional oiling. Food-safe mineral oil or coconut oil helps prevent drying and cracking. Apply a thin coat, let it absorb for several hours, then buff with a soft cloth.',
      },
      {
        type: 'paragraph',
        text: 'Keep wooden items away from direct heat sources and avoid soaking them in water. For cleaning, use a damp cloth rather than submerging the piece. If your wooden item develops small cracks over time, this is natural and doesn\'t compromise its function—it\'s simply the wood adjusting to your home\'s humidity.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Textile Care',
      },
      {
        type: 'paragraph',
        text: 'Handwoven textiles and embroidered pieces need gentle handling. Hand washing in cool water with mild soap is safest for most handmade fabrics. Avoid wringing or twisting; instead, press water out gently and dry flat or hang to avoid stretching.',
      },
      {
        type: 'paragraph',
        text: 'Natural dyes may fade slightly with repeated washing, which is normal and often adds to the textile\'s charm. To minimize fading, wash items inside-out and avoid prolonged sun exposure. Store textiles in cool, dry places, preferably wrapped in cotton cloth rather than plastic.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Pottery and Ceramics',
      },
      {
        type: 'paragraph',
        text: 'Unglazed terracotta pottery should be seasoned before first use by soaking it in water for several hours. This prevents excessive absorption when you use the vessel for food or liquids. Clean terracotta with warm water and a soft brush; avoid harsh detergents that can be absorbed by the porous clay.',
      },
      {
        type: 'paragraph',
        text: 'Glazed ceramics are more durable but should still be handled with care. While many pieces are dishwasher-safe, hand washing extends their life and prevents chips. If a ceramic item develops small cracks (crazing) in the glaze, this is cosmetic and doesn\'t affect function.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Painted and Decorated Items',
      },
      {
        type: 'paragraph',
        text: 'Pattachitra paintings, miniature art, and other painted items should be kept away from direct sunlight, which can fade pigments over time. Dust frames gently with a soft, dry cloth. If the painting is on cloth or paper, maintain moderate humidity levels to prevent brittleness.',
      },
      {
        type: 'paragraph',
        text: 'Palm leaf engravings benefit from occasional light application of coconut oil to prevent drying. Use a cotton swab to apply oil sparingly to the leaf surface, avoiding the engraved areas.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'General Principles',
      },
      {
        type: 'paragraph',
        text: 'The key to caring for handmade items is respect for their materials and construction. Avoid extreme temperatures, harsh chemicals, and rough handling. Regular, gentle maintenance prevents major problems. When in doubt, err on the side of caution—most handmade items prefer gentle treatment over aggressive cleaning.',
      },
      {
        type: 'paragraph',
        text: 'Remember that signs of age and use are not defects. The patina that develops on brass, the softening of cotton, the deepening color of wood—these changes tell the story of an object that is loved and lived with. Your handmade items are meant to be used and enjoyed, not kept pristine in storage.',
      },
    ],
  },
];

export const categories = [
  'All',
  'Craft Guides',
  'Artisan Stories',
  'Home Décor',
  'Culture',
];
