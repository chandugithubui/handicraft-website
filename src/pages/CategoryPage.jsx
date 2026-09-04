import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiAward, FiUsers, FiPackage } from 'react-icons/fi';
import './CategoryPage.css';

// Category data with detailed information
const categoryData = {
  'all': {
    id: 'all',
    name: 'All Categories',
    label: 'Explore All Crafts',
    image: '/images/pattachitra1.jpg.jpg',
    heroImage: '/images/homepagedesign.png',
    description: 'Discover the rich heritage of Indian handicrafts. From traditional paintings to intricate wood carvings, explore our complete collection of artisan-crafted treasures.',
    origin: 'Across India',
    history: 'Indian handicrafts represent thousands of years of cultural heritage, passed down through generations of skilled artisans. Each craft tells a unique story of tradition, artistry, and regional identity.',
    techniques: 'Various traditional techniques across different regions',
    materials: 'Diverse - wood, cloth, metal, clay, natural fibers',
    regions: 'All across India',
    culturalSignificance: 'Represents the diverse cultural heritage of India',
    artisanCount: 1200,
    productCount: 3720,
    artisans: [
      { id: 1, name: 'Rakesh Prusty', slug: 'rakesh-prusty', image: '/images/rakesh.jpeg', specialty: 'Lord Jagannath Paintings', years: 25 },
      { id: 2, name: 'Puspalata Jena', slug: 'puspalata-jena', image: '/images/puspalata.jpeg', specialty: 'Epic Narratives', years: 24 },
      { id: 3, name: 'Chandan Sahoo', slug: 'chandan-sahoo', image: '/images/chandan.jpeg', specialty: 'Decorative Artifacts', years: 26 }
    ],
    localProducts: [
      { _id: 'all-1', name: 'Lord Jagannath Pattachitra', description: 'Traditional Pattachitra painting depicting Lord Jagannath', price: 4500, image: '/images/pattachitra1.jpg.jpg' },
      { _id: 'all-2', name: 'Palm Leaf Tray', description: 'Intricately engraved palm leaf tray', price: 1800, image: '/images/woodentray.jpg' },
      { _id: 'all-3', name: 'Decorative Wooden Plate', description: 'Hand-carved decorative plate with floral patterns', price: 2200, image: '/images/decorativeplate.webp' },
      { _id: 'all-4', name: 'Jagannath Temple Scene', description: 'Beautiful portrayal of Jagannath temple', price: 3800, image: '/images/jagannathpainting.jpg' },
      { _id: 'all-5', name: 'Tiled Pattachitra Panel', description: 'Beautiful tiled Pattachitra panel', price: 2500, image: '/images/tilledpattachitra.webp' },
      { _id: 'all-6', name: 'Handcrafted Wooden Vase', description: 'Elegant wooden vase with carved motifs', price: 3500, image: '/images/handmadevase.webp' },
      { _id: 'all-7', name: 'Kurma Avatar Painting', description: 'Mythological painting of Lord Vishnu', price: 5200, image: '/images/kurmaavatar.jpg' },
      { _id: 'all-8', name: 'Palm Leaf Teapot Design', description: 'Artistic engraving of traditional teapot', price: 1200, image: '/images/teapot.webp' },
      { _id: 'all-9', name: 'Metal Lamp Stand', description: 'Traditional metal lamp with wooden base', price: 1800, image: '/images/metallamp.jpg' },
      { _id: 'all-10', name: 'Handcrafted Wooden Bowl', description: 'Beautiful wooden bowl with intricate carvings', price: 2800, image: '/images/handcraftedwoodenBowl2.jpg' },
      { _id: 'all-11', name: 'Brass Sculpture', description: 'Traditional brass sculpture', price: 4500, image: '/images/sculpture.webp' },
      { _id: 'all-12', name: 'Gift Items Set', description: 'Handcrafted gift collection', price: 3200, image: '/images/GiftsItems.webp' },
      { _id: 'all-13', name: 'Home Decor Vase', description: 'Elegant home decor piece', price: 2900, image: '/images/handcraftvase.jpg' },
      { _id: 'all-14', name: 'Wooden Toys Set', description: 'Traditional wooden toys', price: 1500, image: '/images/woodentoys.jpg' },
      { _id: 'all-15', name: 'Clay Pot', description: 'Traditional clay pottery', price: 1200, image: '/images/claypot.jpg' },
      { _id: 'all-16', name: 'Glass Bottle Art', description: 'Hand-painted glass bottle', price: 1800, image: '/images/glassbottle.webp' },
      { _id: 'all-17', name: 'Elephant Figurine', description: 'Handcrafted elephant sculpture', price: 3500, image: '/images/elephant.webp' }
    ]
  },
  'pattachitra': {
    id: 'pattachitra',
    name: 'Pattachitra',
    label: 'Traditional Paintings',
    image: '/images/pattachitra1.jpg.jpg',
    heroImage: '/images/pattachitrawall.jpg',
    description: 'Pattachitra is a traditional cloth-based scroll painting from Odisha, India. The name comes from the Sanskrit words "patta" (cloth) and "chitra" (picture). These paintings depict Hindu mythology, especially stories of Lord Jagannath.',
    origin: 'Puri, Odisha (dating back to 5th century BC)',
    history: 'Originating in the Jagannath Temple of Puri, Pattachitra has been practiced for over 2000 years. Artists use natural colors made from stones, minerals, and plants to create intricate mythological scenes on treated cloth.',
    techniques: 'Natural pigments on treated cloth, palm leaf engraving, traditional brushwork',
    materials: 'Treated cloth, natural colors (conch white, lamp black, red ochre), squirrel hair brushes',
    regions: 'Puri, Raghurajpur, Chandanpur in Odisha',
    culturalSignificance: 'Closely tied to Jagannath temple traditions, used in religious ceremonies and festivals',
    artisanCount: 150,
    productCount: 450,
    artisans: [
      { id: 1, name: 'Rakesh Prusty', slug: 'rakesh-prusty', image: '/images/rakesh.jpeg', specialty: 'Lord Jagannath Paintings', years: 25 },
      { id: 2, name: 'Puspalata Jena', slug: 'puspalata-jena', image: '/images/puspalata.jpeg', specialty: 'Epic Narratives', years: 24 }
    ]
  },
  'palm-leaf': {
    id: 'palm-leaf',
    name: 'Palm Leaf Crafts',
    label: 'Ancient Art Form',
    image: '/images/pattachitrawall.jpg',
    heroImage: '/images/woodentray.jpg',
    description: 'Palm leaf engraving is an ancient Odia art form where dried palm leaves are intricately engraved with traditional patterns and mythological stories. This delicate craft requires immense patience and precision.',
    origin: 'Odisha, India (ancient Kalinga region)',
    history: 'Dating back to the 3rd century BC, palm leaf manuscripts were used to record religious texts and stories. The art evolved into decorative craft with intricate cut-work patterns.',
    techniques: 'Engraving with iron stylus, cutting, assembling multiple strips',
    materials: 'Dried talipot palm leaves, iron stylus tools',
    regions: 'Raghurajpur, Puri, Cuttack in Odisha',
    culturalSignificance: 'Used for religious texts, horoscopes, and decorative art in temples',
    artisanCount: 80,
    productCount: 320,
    artisans: [
      { id: 2, name: 'Puspalata Jena', slug: 'puspalata-jena', image: '/images/puspalata.jpeg', specialty: 'Epic Narratives', years: 24 }
    ]
  },
  'wooden': {
    id: 'wooden',
    name: 'Wooden Crafts',
    label: 'Carved Masterpieces',
    image: '/images/handcraftedwoodenBowl2.jpg',
    heroImage: '/images/handcraftwooden.jpg',
    description: 'Wood carving in Odisha is a centuries-old tradition creating beautiful decorative items, furniture, and religious artifacts. Artisans use traditional tools to carve intricate patterns into high-quality wood.',
    origin: 'Saharanpur & Odisha (dating back to Mughal era)',
    history: 'Wood carving flourished during the Mughal era and continues in regions like Saharanpur and Odisha. Each region has its distinctive style and patterns.',
    techniques: 'Hand carving with chisels and gouges, wood turning, inlay work',
    materials: 'Sheesham, Teak, Sandalwood, Rosewood',
    regions: 'Saharanpur (UP), Raghurajpur (Odisha), Karnataka',
    culturalSignificance: 'Used in temples, royal palaces, and household decor',
    artisanCount: 200,
    productCount: 600,
    artisans: [
      { id: 3, name: 'Chandan Sahoo', slug: 'chandan-sahoo', image: '/images/chandan.jpeg', specialty: 'Decorative Artifacts', years: 26 }
    ]
  },
  'sarees': {
    id: 'sarees',
    name: 'Handwoven Sarees',
    label: 'Elegant Weaves',
    image: '/images/relatedProduct.webp',
    heroImage: '/images/relatedProduct.webp',
    description: 'Indian handwoven sarees represent the pinnacle of textile artistry. Each region has unique weaving techniques, patterns, and cultural significance passed down through generations.',
    origin: 'Various regions across India',
    history: 'Handloom weaving in India dates back over 5000 years. Each region developed distinctive styles like Banarasi, Kanjeevaram, Ikat, and Bomkai.',
    techniques: 'Handloom weaving, ikat, tie-dye, embroidery, zari work',
    materials: 'Silk, cotton, zari (gold/silver thread)',
    regions: 'Varanasi, Kanchipuram, Sambalpur, Pochampally',
    culturalSignificance: 'Worn in weddings, festivals, and special occasions across India',
    artisanCount: 300,
    productCount: 800,
    artisans: []
  },
  'sculptures': {
    id: 'sculptures',
    name: 'Sculptures',
    label: 'Artistic Creations',
    image: '/images/sculpture.webp',
    heroImage: '/images/sculpture.webp',
    description: 'Indian sculpture art spans thousands of years, from ancient temple carvings to contemporary bronze and stone sculptures. Each piece tells a story of devotion, artistry, and cultural heritage.',
    origin: 'Ancient India (Indus Valley civilization)',
    history: 'Sculpture in India evolved from religious temple carvings to secular art. Bronze casting using the lost-wax technique is a specialty of Odisha and Tamil Nadu.',
    techniques: 'Stone carving, bronze casting (lost-wax), clay modeling',
    materials: 'Stone, bronze, brass, clay, wood',
    regions: 'Odisha, Tamil Nadu, Rajasthan, Madhya Pradesh',
    culturalSignificance: 'Used in temples, royal courts, and as decorative art',
    artisanCount: 120,
    productCount: 350,
    artisans: []
  },
  'decor': {
    id: 'decor',
    name: 'Home Decor',
    label: 'Beautiful Accents',
    image: '/images/decorativeplate.webp',
    heroImage: '/images/decorativeplate.webp',
    description: 'Indian home decor items blend traditional craftsmanship with modern aesthetics. From brass lamps to wooden artifacts, each piece adds warmth and cultural elegance to any space.',
    origin: 'Across India',
    history: 'Home decor crafts have been part of Indian households for centuries, with each region specializing in different materials and styles.',
    techniques: 'Metalwork, wood carving, pottery, textile crafts',
    materials: 'Brass, copper, wood, clay, textiles',
    regions: 'Moradabad (brass), Saharanpur (wood), Jaipur (pottery)',
    culturalSignificance: 'Used in daily life, festivals, and religious ceremonies',
    artisanCount: 250,
    productCount: 700,
    artisans: []
  },
  'gifts': {
    id: 'gifts',
    name: 'Gifts',
    label: 'Perfect Presents',
    image: '/images/GiftsItems.webp',
    heroImage: '/images/GiftsItems.webp',
    description: 'Handcrafted gifts from India carry the love and skill of artisans. Perfect for any occasion, these unique items tell stories of tradition and make memorable presents.',
    origin: 'Across India',
    history: 'Gift-giving has been an integral part of Indian culture. Handcrafted items have always been valued for their uniqueness and personal touch.',
    techniques: 'Various traditional crafts adapted for gift items',
    materials: 'Diverse - wood, metal, textiles, paper, clay',
    regions: 'All craft regions across India',
    culturalSignificance: 'Exchanged during festivals, weddings, and special occasions',
    artisanCount: 180,
    productCount: 500,
    artisans: []
  }
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get category data from local data structure
  const categoryInfo = categoryData[categoryId];

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      // Use local category data immediately
      if (categoryInfo) {
        setCategory(categoryInfo);
        setLoading(false);
        return;
      }

      // Only try backend if no local data
      try {
        const getApiUrl = () => {
          if (window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
          }
          if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
              window.location.hostname.includes('vercel.app')) {
            return 'https://handicraft-website.onrender.com/api';
          }
          return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        };
        const API_URL = getApiUrl();
        
        try {
          const categoryResponse = await axios.get(`${API_URL}/categories/${categoryId}`);
          setCategory(categoryResponse.data);
        } catch (err) {
          // Could not fetch category from backend
        }

        try {
          const productsResponse = await axios.get(`${API_URL}/products?category=${categoryId}`);
          setProducts(productsResponse.data);
        } catch (err) {
          // Could not fetch products from backend, using empty array
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching category or products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId, categoryInfo]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!categoryInfo && !category) return <div className="not-found">Category not found</div>;

  const displayCategory = category || categoryInfo;

  return (
    <div className="category-page">
      {/* Category Hero Section */}
      <div className="category-hero">
        <div className="category-hero-content">
          <div className="category-hero-text">
            <span className="category-label">{displayCategory.label}</span>
            <h1 className="category-title">{displayCategory.name}</h1>
            <p className="category-description">{displayCategory.description}</p>
            <div className="category-stats">
              <div className="stat-item">
                <FiUsers className="stat-icon" />
                <span className="stat-value">{displayCategory.artisanCount || 0}</span>
                <span className="stat-label">Artisans</span>
              </div>
              <div className="stat-item">
                <FiPackage className="stat-icon" />
                <span className="stat-value">{displayCategory.productCount || 0}</span>
                <span className="stat-label">Products</span>
              </div>
            </div>
          </div>
          <div className="category-hero-image">
            <img src={displayCategory.heroImage || displayCategory.image} alt={displayCategory.name} />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Craft Information Panel */}
        <div className="craft-info-panel">
          <h2 className="panel-title">About This Craft</h2>
          <div className="craft-info-grid">
            <div className="info-card">
              <h3 className="info-card-title">
                <FiMapPin className="info-icon" />
                Origin
              </h3>
              <p className="info-card-content">{displayCategory.origin}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">
                <FiAward className="info-icon" />
                History
              </h3>
              <p className="info-card-content">{displayCategory.history}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Techniques</h3>
              <p className="info-card-content">{displayCategory.techniques}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Materials</h3>
              <p className="info-card-content">{displayCategory.materials}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Regions</h3>
              <p className="info-card-content">{displayCategory.regions}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Cultural Significance</h3>
              <p className="info-card-content">{displayCategory.culturalSignificance}</p>
            </div>
          </div>
        </div>

        {/* Artisan Showcase */}
        {displayCategory.artisans && displayCategory.artisans.length > 0 && (
          <div className="artisan-showcase">
            <div className="section-header">
              <h2 className="section-title">Master Artisans</h2>
              <Link to="/artisans" className="section-link">
                View All Artisans →
              </Link>
            </div>
            <div className="artisan-grid">
              {displayCategory.artisans.map((artisan) => (
                <Link key={artisan.id} to={`/artisan/${artisan.slug}`} className="artisan-card">
                  <div className="artisan-card-image">
                    <img src={artisan.image} alt={artisan.name} />
                  </div>
                  <div className="artisan-card-info">
                    <h3 className="artisan-card-name">{artisan.name}</h3>
                    <p className="artisan-card-specialty">{artisan.specialty}</p>
                    <p className="artisan-card-years">{artisan.years} years experience</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="category-products">
          <div className="section-header">
            <h2 className="section-title">Products in {displayCategory.name}</h2>
          </div>
          {displayCategory.localProducts && displayCategory.localProducts.length > 0 ? (
            <div className="products-grid">
              {displayCategory.localProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-card-image" />
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-description">{product.description}</p>
                  <p className="product-card-price">₹{product.price}</p>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-card-image" />
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-description">{product.description}</p>
                  <p className="product-card-price">₹{product.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-products">No products available in this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
