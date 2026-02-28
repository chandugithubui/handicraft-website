import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryId } = useParams(); // Get categoryId from URL
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch category and products based on categoryId
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Fetch category details
        const categoryResponse = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
        setCategory(categoryResponse.data);

        // Fetch products belonging to this category
        const productsResponse = await axios.get(`http://localhost:5000/api/products?category=${categoryId}`);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching category or products:', error);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]); // Re-run the effect when categoryId changes

  if (!category) return <div>Loading...</div>; // Loading state

  return (
    <div>
      <h1>{category.name}</h1>
      <p>{category.description}</p>

      <h3>Products in this category:</h3>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
