// src/services/productService.js
import axios from 'axios';

// Local products data as fallback
const localProducts = [
  // Pattachitra (5 products)
  { _id: 'pattachitra-1', name: 'Lord Jagannath Pattachitra', description: 'Traditional Pattachitra painting depicting Lord Jagannath with intricate details and natural colors', price: 4500, image: '/images/pattachitra1.jpg.jpg', category: 'pattachitra', material: 'Fabric' },
  { _id: 'pattachitra-2', name: 'Jagannath Temple Scene', description: 'Beautiful portrayal of Jagannath temple with traditional Pattachitra art style', price: 3800, image: '/images/jagannathpainting.jpg', category: 'pattachitra', material: 'Fabric' },
  { _id: 'pattachitra-3', name: 'Kurma Avatar Painting', description: 'Mythological painting of Lord Vishnu in Kurma avatar form', price: 5200, image: '/images/kurmaavatar.jpg', category: 'pattachitra', material: 'Fabric' },
  { _id: 'pattachitra-4', name: 'Tiled Pattachitra Panel', description: 'Beautiful tiled Pattachitra panel with traditional motifs', price: 2500, image: '/images/tilledpattachitra.webp', category: 'pattachitra', material: 'Fabric' },
  { _id: 'pattachitra-5', name: 'Pattachitra Wall Art', description: 'Large Pattachitra wall painting depicting Hindu mythology', price: 6500, image: '/images/pattachitrawall.jpg', category: 'pattachitra', material: 'Fabric' },
  
  // Palm Leaf (4 products)
  { _id: 'palm-1', name: 'Palm Leaf Tray', description: 'Intricately engraved palm leaf tray with traditional patterns', price: 1800, image: '/images/woodentray.jpg', category: 'palm-leaf', material: 'Bamboo' },
  { _id: 'palm-2', name: 'Palm Leaf Teapot Design', description: 'Artistic engraving of traditional teapot on palm leaf', price: 1200, image: '/images/teapot.webp', category: 'palm-leaf', material: 'Bamboo' },
  { _id: 'palm-3', name: 'Pattachitra Wall Painting', description: 'Palm leaf wall art with traditional Pattachitra motifs', price: 2200, image: '/images/pattachitrawallpainting.webp', category: 'palm-leaf', material: 'Bamboo' },
  { _id: 'palm-4', name: 'Pattachitra Art Panel', description: 'Traditional Pattachitra art on palm leaf panel', price: 2800, image: '/images/pattachitra1.jpg.jpeg', category: 'palm-leaf', material: 'Bamboo' },
  
  // Sarees (3 products)
  { _id: 'saree-1', name: 'Handwoven Sambalpuri Saree', description: 'Traditional handwoven Sambalpuri saree with ikat patterns', price: 8500, image: '/images/pattachitra2.jpg.jpg', category: 'sarees', material: 'Fabric' },
  { _id: 'saree-2', name: 'Traditional Ikat Saree', description: 'Beautiful ikat saree with traditional Odisha patterns', price: 7200, image: '/images/pattachitra2.jpg.jpeg', category: 'sarees', material: 'Fabric' },
  { _id: 'saree-3', name: 'Bomkai Handloom Saree', description: 'Authentic Bomkai handloom saree with temple border', price: 9200, image: '/images/pattachitra3.jpg.jpg', category: 'sarees', material: 'Fabric' },
  
  // Wooden Crafts (6 products)
  { _id: 'wooden-1', name: 'Decorative Wooden Plate', description: 'Hand-carved decorative plate with floral patterns', price: 2200, image: '/images/decorativeplate.webp', category: 'wooden', material: 'Wood' },
  { _id: 'wooden-2', name: 'Handcrafted Wooden Vase', description: 'Elegant wooden vase with carved motifs', price: 3500, image: '/images/handmadevase.webp', category: 'wooden', material: 'Wood' },
  { _id: 'wooden-3', name: 'Metal Lamp Stand', description: 'Traditional metal lamp with wooden base', price: 1800, image: '/images/metallamp.jpg', category: 'wooden', material: 'Metal' },
  { _id: 'wooden-4', name: 'Handcrafted Wooden Bowl', description: 'Beautiful wooden bowl with intricate carvings', price: 2800, image: '/images/handcraftedwoodenBowl2.jpg', category: 'wooden', material: 'Wood' },
  { _id: 'wooden-5', name: 'Carved Wooden Handcraft', description: 'Intricately carved wooden handicraft piece', price: 3200, image: '/images/carvedwooden.jpg', category: 'wooden', material: 'Wood' },
  { _id: 'wooden-6', name: 'Wooden Handcraft Art', description: 'Traditional wooden handcraft with artistic carvings', price: 2900, image: '/images/woodenhandcraft.jpg', category: 'wooden', material: 'Wood' },
  
  // Sculptures (4 products)
  { _id: 'sculpture-1', name: 'Brass Sculpture', description: 'Traditional brass sculpture with intricate details', price: 4500, image: '/images/sculpture.webp', category: 'sculptures', material: 'Metal' },
  { _id: 'sculpture-2', name: 'Elephant Figurine', description: 'Handcrafted elephant sculpture in traditional style', price: 3500, image: '/images/elephant.webp', category: 'sculptures', material: 'Metal' },
  { _id: 'sculpture-3', name: 'Decorative Toys', description: 'Traditional wooden toys set with hand-painted details', price: 1500, image: '/images/toys.jpg', category: 'sculptures', material: 'Wood' },
  { _id: 'sculpture-4', name: 'Wooden Toys Set', description: 'Traditional wooden toys for children', price: 1800, image: '/images/woodentoys.jpg', category: 'sculptures', material: 'Wood' },
  
  // Home Decor (5 products)
  { _id: 'decor-1', name: 'Home Decor Vase', description: 'Elegant home decor vase with hand-painted design', price: 2900, image: '/images/handcraftvase.jpg', category: 'decor', material: 'Clay' },
  { _id: 'decor-2', name: 'Clay Pot', description: 'Traditional clay pottery with artistic design', price: 1200, image: '/images/claypot.jpg', category: 'decor', material: 'Clay' },
  { _id: 'decor-3', name: 'Glass Bottle Art', description: 'Hand-painted glass bottle with traditional motifs', price: 1800, image: '/images/glassbottle.webp', category: 'decor', material: 'Clay' },
  { _id: 'decor-4', name: 'Handcrafted Wooden Bowl Premium', description: 'Premium wooden bowl with artistic carvings', price: 3200, image: '/images/handcraftedwoodenBowl3.webp', category: 'decor', material: 'Wood' },
  { _id: 'decor-5', name: 'Handcrafted Wooden Bowl Classic', description: 'Classic wooden bowl for home decor', price: 2400, image: '/images/HandcraftedWoodenBowl.webp', category: 'decor', material: 'Wood' },
  
  // Gifts (4 products)
  { _id: 'gift-1', name: 'Gift Items Set', description: 'Handcrafted gift collection with multiple items', price: 3200, image: '/images/GiftsItems.webp', category: 'gifts', material: 'Wood' },
  { _id: 'gift-2', name: 'Related Product Set', description: 'Curated gift set with related handicraft items', price: 2800, image: '/images/relatedProduct.webp', category: 'gifts', material: 'Wood' },
  { _id: 'gift-3', name: 'Traditional Craft Gift', description: 'Traditional handicraft gift collection', price: 3600, image: '/images/pattachitra3.jpg.jpeg', category: 'gifts', material: 'Fabric' },
  { _id: 'gift-4', name: 'Wooden Craft Gift Set', description: 'Wooden handicraft gift collection', price: 4200, image: '/images/handcraftwooden.jpg', category: 'gifts', material: 'Wood' },
  
  // Additional products for better material distribution
  { _id: 'extra-1', name: 'Stone Sculpture', description: 'Traditional stone sculpture with intricate carvings', price: 5500, image: '/images/sculpture.webp', category: 'sculptures', material: 'Stone' },
  { _id: 'extra-2', name: 'Clay Decorative Pot', description: 'Handcrafted clay pot with traditional designs', price: 1600, image: '/images/claypot.jpg', category: 'decor', material: 'Clay' },
  { _id: 'extra-3', name: 'Metal Wall Art', description: 'Traditional metal wall art piece', price: 2800, image: '/images/metallamp.jpg', category: 'decor', material: 'Metal' },
  { _id: 'extra-4', name: 'Bamboo Basket', description: 'Handwoven bamboo basket for storage', price: 1400, image: '/images/woodentray.jpg', category: 'decor', material: 'Bamboo' }
];

// Detect environment and set API URL
const getApiUrl = () => {
  // Check if we're in local development
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Check if we're in production (Vercel deployment)
  if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
      window.location.hostname.includes('vercel.app')) {
    return 'https://handicraft-website.onrender.com/api';
  }
  // Fallback to environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Get all products
export const getProducts = async (queryParams = '') => {
  try {
    const url = queryParams ? `${API_URL}/products${queryParams}` : `${API_URL}/products`;
    await axios.get(url);
    
    // Use local products as primary source for now (backend has duplicate images)
    return filterLocalProducts(queryParams);
  } catch (error) {
    console.error("Error fetching products, using local data", error);
    // Return local products as fallback
    return filterLocalProducts(queryParams);
  }
};

// Filter local products based on query params
const filterLocalProducts = (queryParams) => {
  let filtered = [...localProducts];
  
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    const category = params.get('category');
    const search = params.get('search');
    const material = params.get('material');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (material) {
      filtered = filtered.filter(p => p.material === material);
    }
    
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
    }
  }
  
  return filtered;
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product", error);
    return null;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;  // Return the added product data
  } catch (error) {
    console.error("Error adding product", error);
    return null;  // Return null if there's an error
  }
};

// Edit an existing product
export const editProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}`, productData);
    return response.data;  // Return the updated product data
  } catch (error) {
    console.error("Error editing product", error);
    return null;  // Return null if there's an error
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${productId}`);
    return response.data;  // Return the response from the server (e.g., success message)
  } catch (error) {
    console.error("Error deleting product", error);
    return null;  // Return null if there's an error
  }
};
