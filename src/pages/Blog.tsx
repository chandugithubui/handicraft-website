import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { blogPosts, categories } from '../data/blogPosts';
import './Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let posts = blogPosts;

    // Filter by category
    if (selectedCategory !== 'All') {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      );
    }

    return posts;
  }, [selectedCategory, searchQuery]);

  const featuredPost = blogPosts.find((post) => post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-decoration blog-hero-decoration-one" />
        <div className="blog-hero-decoration blog-hero-decoration-two" />

        <div className="blog-hero-inner">
          <div className="blog-hero-content">
            <span className="blog-eyebrow">
              ✦ THE HANDICRAFT JOURNAL
            </span>

            <h1>
              Stories Behind <em>Every Creation</em>
            </h1>

            <p>
              Explore the rich traditions, artisan techniques, and cultural
              heritage that bring India's handmade crafts to life.
            </p>
          </div>
        </div>
      </section>

      <div className="blog-container">
        {/* Featured Article */}
        {featuredPost && selectedCategory === 'All' && !searchQuery && (
          <section className="blog-featured">
            <span className="blog-section-label">Featured Article</span>
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="blog-featured-card"
            >
              <div className="blog-featured-image">
                <img
                  src={featuredPost.heroImage}
                  alt={featuredPost.title}
                  loading="eager"
                />
              </div>
              <div className="blog-featured-content">
                <span className="blog-card-category">
                  {featuredPost.category}
                </span>
                <h2 className="blog-featured-title">{featuredPost.title}</h2>
                <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
                <div className="blog-featured-footer">
                  <span className="blog-card-date">
                    <FiCalendar />
                    {formatDate(featuredPost.publishedDate)}
                  </span>
                  <span className="blog-featured-cta">
                    Read Article <FiArrowRight />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Filters and Search */}
        <section className="blog-controls">
          <div className="blog-categories">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`blog-category-btn ${
                  selectedCategory === category ? 'active' : ''
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="blog-search">
            <FiSearch className="blog-search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
          </div>
        </section>

        {/* Articles Grid */}
        <section className="blog-articles">
          {filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <div className="blog-empty-icon">
                <FiBookOpen />
              </div>
              <h3 className="blog-empty-title">No Articles Found</h3>
              <p className="blog-empty-text">
                {searchQuery
                  ? `No articles match "${searchQuery}". Try a different search term.`
                  : `No articles in this category yet. Check back soon for new content.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="blog-grid">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-image">
                    <img src={post.heroImage} alt={post.title} loading="lazy" />
                  </div>
                  <div className="blog-card-content">
                    <span className="blog-card-category">{post.category}</span>
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-footer">
                      <span className="blog-card-date">
                        <FiCalendar />
                        {formatDate(post.publishedDate)}
                      </span>
                      <span className="blog-card-link">
                        Read More <FiArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Blog;
