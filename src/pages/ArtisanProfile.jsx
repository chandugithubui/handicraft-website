import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiAward, FiHeart, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './ArtisanProfile.css';

const artisans = [
  {
    id: 1,
    name: 'Rakesh Prusty',
    slug: 'rakesh-prusty',
    craft: 'Pattachitra Painting',
    location: 'Chandanpur, Puri, Odisha',
    years: 25,
    story: 'Rakesh learned the ancient art of Pattachitra from his father, who learned it from his father. For 25 years, he has been keeping this 200-year-old tradition alive, creating intricate mythological paintings on cloth and palm leaves. His work has been featured in national exhibitions and he has trained over 50 apprentices in this delicate art form.',
    image: '/images/rakesh.jpeg',
    specialty: 'Lord Jagannath Paintings',
    craftProcess: [
      {
        step: 1,
        title: 'Preparing the Canvas',
        description: 'The cloth is treated with a mixture of chalk and gum to create a smooth, durable surface for painting.',
        image: '/images/rakesh.jpeg'
      },
      {
        step: 2,
        title: 'Sketching the Design',
        description: 'The outline of the deity or scene is drawn using charcoal, following traditional Pattachitra patterns.',
        image: '/images/rakesh.jpeg'
      },
      {
        step: 3,
        title: 'Applying Natural Colors',
        description: 'Natural pigments made from stones, minerals, and plants are applied using fine brushes made of squirrel hair.',
        image: '/images/rakesh.jpeg'
      },
      {
        step: 4,
        title: 'Final Finishing',
        description: 'The painting is polished and framed, ready to be displayed as a masterpiece of traditional art.',
        image: '/images/rakesh.jpeg'
      }
    ],
    gallery: [
      {
        id: 'rakesh-1',
        image: '/images/pattachitra1.jpg.jpg',
        name: 'Lord Jagannath Pattachitra',
        description: 'Traditional Pattachitra painting depicting Lord Jagannath with intricate details and natural colors.',
        price: 4500,
        priceDisplay: '₹4,500',
        craftingTime: '7-10 days',
        materials: 'Natural colors on cloth'
      },
      {
        id: 'rakesh-2',
        image: '/images/jagannathpainting.jpg',
        name: 'Jagannath Temple Scene',
        description: 'Beautiful portrayal of the Jagannath temple with devotees and traditional motifs.',
        price: 3800,
        priceDisplay: '₹3,800',
        craftingTime: '5-7 days',
        materials: 'Natural colors on palm leaf'
      },
      {
        id: 'rakesh-3',
        image: '/images/kurmaavatar.jpg',
        name: 'Kurma Avatar Painting',
        description: 'Mythological painting showing Lord Vishnu in his Kurma avatar form.',
        price: 5200,
        priceDisplay: '₹5,200',
        craftingTime: '10-12 days',
        materials: 'Natural colors on cloth'
      }
    ]
  },
  {
    id: 2,
    name: 'Jagannath Das',
    slug: 'jagannath-das',
    craft: 'Palm Leaf Engraving',
    location: 'Raghurajpur, Odisha',
    years: 26,
    story: 'Jagannath is a master of palm leaf engraving, a delicate art form that requires immense patience and precision. Her work tells stories from Indian epics through intricate cut-work on dried palm leaves. She has received multiple state awards for her contributions to preserving this traditional craft and has been teaching for over 15 years.',
    image: '/images/jaga.jpeg',
    specialty: 'Epic Narratives',
    craftProcess: [
      {
        step: 1,
        title: 'Selecting Palm Leaves',
        description: 'Fresh palm leaves are carefully selected, dried, and treated to become flexible for engraving.',
        image: '/images/jaga.jpeg'
      },
      {
        step: 2,
        title: 'Design Transfer',
        description: 'The design is traced onto the leaf using a stylus, creating the foundation for intricate engraving.',
        image: '/images/jaga.jpeg'
      },
      {
        step: 3,
        title: 'Precision Engraving',
        description: 'Using traditional tools, the artisan carefully cuts and engraves the patterns with meticulous precision.',
        image: '/images/jaga.jpeg'
      },
      {
        step: 4,
        title: 'Final Assembly',
        description: 'Multiple engraved strips are assembled together to create the complete artwork.',
        image: '/images/jaga.jpeg'
      }
    ],
    gallery: [
      {
        id: 'jaga-1',
        image: '/images/woodentray.jpg',
        name: 'Palm Leaf Tray',
        description: 'Intricately engraved palm leaf tray with traditional patterns and motifs.',
        price: 1800,
        priceDisplay: '₹1,800',
        craftingTime: '3-5 days',
        materials: 'Dried palm leaf'
      },
      {
        id: 'jaga-2',
        image: '/images/tilledpattachitra.webp',
        name: 'Tiled Pattachitra Panel',
        description: 'Beautiful tiled Pattachitra panel with geometric patterns and floral designs.',
        price: 2500,
        priceDisplay: '₹2,500',
        craftingTime: '5-7 days',
        materials: 'Natural colors on palm leaf'
      },
      {
        id: 'jaga-3',
        image: '/images/teapot.webp',
        name: 'Palm Leaf Teapot Design',
        description: 'Artistic engraving depicting traditional teapot with decorative elements.',
        price: 1200,
        priceDisplay: '₹1,200',
        craftingTime: '2-3 days',
        materials: 'Dried palm leaf'
      }
    ]
  },
  {
    id: 3,
    name: 'Chandan Sahoo',
    slug: 'chandan-sahoo',
    craft: 'Wood Carving',
    location: 'Raghurajpur, Puri, Odisha',
    years: 26,
    story: 'Chandan comes from a family of wood carvers who have been crafting beautiful wooden artifacts for generations. His work ranges from decorative bowls to intricate furniture pieces. He specializes in traditional Saharanpur wood carving techniques and has supplied his work to luxury hotels and private collectors across India.',
    image: '/images/chandan.jpeg',
    specialty: 'Decorative Artifacts',
    craftProcess: [
      {
        step: 1,
        title: 'Wood Selection',
        description: 'High-quality wood like Sheesham or Teak is selected based on the intended use and design requirements.',
        image: '/images/chandan.jpeg'
      },
      {
        step: 2,
        title: 'Rough Shaping',
        description: 'The wood is cut to approximate size using traditional tools, preparing it for detailed carving.',
        image: '/images/chandan.jpeg'
      },
      {
        step: 3,
        title: 'Intricate Carving',
        description: 'Using chisels and gouges, the artisan creates detailed patterns, motifs, and designs by hand.',
        image: '/images/chandan.jpeg'
      },
      {
        step: 4,
        title: 'Sanding & Finishing',
        description: 'The carved piece is sanded smooth and finished with natural oils or polish to enhance the wood beauty.',
        image: '/images/chandan.jpeg'
      }
    ],
    gallery: [
      {
        id: 'chandan-1',
        image: '/images/decorativeplate.webp',
        name: 'Decorative Wooden Plate',
        description: 'Hand-carved decorative plate with intricate floral patterns and traditional designs.',
        price: 2200,
        priceDisplay: '₹2,200',
        craftingTime: '4-6 days',
        materials: 'Sheesham wood'
      },
      {
        id: 'chandan-2',
        image: '/images/handmadevase.webp',
        name: 'Handcrafted Wooden Vase',
        description: 'Elegant wooden vase with carved motifs and smooth finish, perfect for home decor.',
        price: 3500,
        priceDisplay: '₹3,500',
        craftingTime: '6-8 days',
        materials: 'Teak wood'
      },
      {
        id: 'chandan-3',
        image: '/images/metallamp.jpg',
        name: 'Metal Lamp Stand',
        description: 'Traditional metal lamp stand with wooden base and intricate metalwork.',
        price: 1800,
        priceDisplay: '₹1,800',
        craftingTime: '3-4 days',
        materials: 'Brass and wood'
      }
    ]
  }
];

const ArtisanProfile = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const artisan = artisans.find(a => a.slug === slug);

  const handleAddToCart = (product) => {
    const productForCart = {
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: 10 // Default stock for artisan products
    };
    addToCart(productForCart);
  };

  const handleViewDetails = (product) => {
    // Navigate to products page with the product details
    // For now, we'll navigate to the products page filtered by craft
    window.location.href = `/products?craft=${encodeURIComponent(artisan.craft)}`;
  };

  if (!artisan) {
    return (
      <div className="artisan-profile-page">
        <div className="container">
          <div className="artisan-not-found">
            <h2>Artisan Not Found</h2>
            <Link to="/" className="btn btn-primary">
              <FiArrowLeft className="btn-icon" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-profile-page">
      {/* Hero Section */}
      <div className="artisan-hero">
        <div className="container">
          <Link to="/" className="back-link">
            <FiArrowLeft className="back-icon" />
            Back to Home
          </Link>
          <div className="artisan-hero-content">
            <div className="artisan-hero-image">
              <img src={artisan.image} alt={artisan.name} />
            </div>
            <div className="artisan-hero-info">
              <span className="craft-badge-hero">{artisan.craft}</span>
              <h1 className="artisan-name-hero">{artisan.name}</h1>
              <div className="artisan-location-hero">
                <FiMapPin className="location-icon" />
                <span>{artisan.location}</span>
              </div>
              <div className="artisan-stats-hero">
                <div className="stat-item">
                  <FiAward className="stat-icon" />
                  <span>{artisan.years} Years Experience</span>
                </div>
                <div className="stat-item">
                  <FiHeart className="stat-icon" />
                  <span>{artisan.specialty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Story Section */}
        <div className="artisan-story-section">
          <div className="section-header">
            <h2 className="section-title">Their Story</h2>
          </div>
          <p className="artisan-story-full">{artisan.story}</p>
        </div>

        {/* Craft Process Section */}
        <div className="craft-process-section">
          <div className="section-header">
            <h2 className="section-title">How They Create</h2>
            <p className="section-subtitle">
              Discover the traditional process behind {artisan.name}'s {artisan.craft}
            </p>
          </div>
          <div className="craft-process-timeline">
            {artisan.craftProcess.map((process, index) => (
              <div key={index} className="process-step">
                <div className="step-number">
                  <span>{process.step}</span>
                </div>
                <div className="step-content">
                  <div className="step-image">
                    <img src={process.image} alt={process.title} />
                  </div>
                  <h3 className="step-title">{process.title}</h3>
                  <p className="step-description">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="artisan-gallery-section">
          <div className="section-header">
            <h2 className="section-title">Work Gallery</h2>
          </div>
          <div className="gallery-grid">
            {artisan.gallery.map((item, index) => (
              <div key={index} className="gallery-product-card">
                <div className="gallery-product-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="gallery-product-info">
                  <h3 className="gallery-product-name">{item.name}</h3>
                  <p className="gallery-product-description">{item.description}</p>
                  <div className="gallery-product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Price:</span>
                      <span className="meta-value">{item.priceDisplay}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Time:</span>
                      <span className="meta-value">{item.craftingTime}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Materials:</span>
                      <span className="meta-value">{item.materials}</span>
                    </div>
                  </div>
                  <div className="gallery-product-actions">
                    <button 
                      className="btn btn-primary btn-sm add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="btn btn-outline btn-sm view-details-btn"
                      onClick={() => handleViewDetails(item)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="artisan-products-section">
          <div className="section-header">
            <h2 className="section-title">Shop Their Work</h2>
            <p className="section-subtitle">
              Discover beautiful handcrafted products by {artisan.name}
            </p>
          </div>
          <Link to={`/products?craft=${encodeURIComponent(artisan.craft)}`} className="btn btn-primary btn-lg cta-btn">
            <FiShoppingBag className="btn-icon" />
            Browse {artisan.craft} Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
