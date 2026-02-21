// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import { getProducts,  deleteProduct } from "../services/productService";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productList.css";
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await getProducts();
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="text-center fw-bold mb-4">Our Products</h2>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {filteredProducts.length === 0 ? (
          <div className="text-center">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 product-card">
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                     src={
                     product.imageUrl
                     ? product.imageUrl.startsWith("http")
                     ? product.imageUrl
                     : `http://localhost:5000${product.imageUrl}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                 }
                     className="card-img-top"
                     alt={product.name}
                     style={{ height: "220px", objectFit: "cover" }}
                    />
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{product.name}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {product.description?.substring(0, 80)}...
                  </p>
                  <h6 className="text-success fw-bold">₹ {product.price}</h6>

                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-outline-primary btn-sm">
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;