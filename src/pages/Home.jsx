import React from 'react';
import ProductList from '../components/ProductList'; // Import ProductList component
import PattachitraSlider from '../components/PattachitraSlider'; // Import the PattachitraSlider

const Home = () => {
  return (
    <div>
      <h1 class="mt-3">Welcome To Handicraft Hub</h1>
      {/* Add PattachitraSlider here */}
      <PattachitraSlider />  {/* This will render the slider */}
      
      {/* Display Products */}
      <ProductList />  {/* This will render the product list */}
    </div>
  );
};

export default Home;
