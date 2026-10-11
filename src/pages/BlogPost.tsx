import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiShare2,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { blogPosts } from '../data/blogPosts';
import './Blog.css';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [shareStatus, setShareStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle');

  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Handicraft Hub Blog`;
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="blog-page">
        <div className="blog-container">
          <div className="blog-not-found">
            <h1 className="blog-not-found-title">Article Not Found</h1>
            <p className="blog-not-found-text">
              The article you're looking for doesn't exist or may have been
              moved.
            </p>
            <div className="blog-not-found-actions">
              <button onClick={() => navigate(-1)} className="btn btn-outline">
                <FiArrowLeft /> Go Back
              </button>
              <Link to="/blog" className="btn btn-primary">
                Browse All Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.category === post.category || p.featured)
    )
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShareStatus('error');
          setTimeout(() => setShareStatus('idle'), 2000);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  };

  return (
    <div className="blog-page">
      <div className="blog-post-container">
        {/* Breadcrumb */}
        <nav className="blog-breadcrumb">
          <Link to="/" className="blog-breadcrumb-link">
            Home
          </Link>
          <span className="blog-breadcrumb-separator">/</span>
          <Link to="/blog" className="blog-breadcrumb-link">
            Blog
          </Link>
          <span className="blog-breadcrumb-separator">/</span>
          <span className="blog-breadcrumb-current">{post.category}</span>
        </nav>

        {/* Article Header */}
        <article className="blog-post">
          <header className="blog-post-header">
            <span className="blog-post-category">{post.category}</span>
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span className="blog-post-date">
                <FiCalendar />
                {formatDate(post.publishedDate)}
              </span>
              <button
                onClick={handleShare}
                className="blog-share-btn"
                aria-label="Share article"
              >
                {shareStatus === 'success' ? (
                  <>
                    <FiCheck /> Copied!
                  </>
                ) : shareStatus === 'error' ? (
                  <>
                    <FiX /> Error
                  </>
                ) : (
                  <>
                    <FiShare2 /> Share
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Hero Image */}
          <div className="blog-post-hero">
            <img src={post.heroImage} alt={post.title} loading="eager" />
          </div>

          {/* Article Content */}
          <div className="blog-post-content">
            {post.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className="blog-post-paragraph">
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'heading') {
                const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
                return (
                  <HeadingTag key={index} className="blog-post-heading">
                    {block.text}
                  </HeadingTag>
                );
              }

              if (block.type === 'image' && block.src) {
                return (
                  <figure key={index} className="blog-post-figure">
                    <img src={block.src} alt={block.alt || ''} loading="lazy" />
                    {block.alt && (
                      <figcaption className="blog-post-caption">
                        {block.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              return null;
            })}
          </div>

          {/* Editorial Note */}
          <div className="blog-post-note">
            <p>
              <strong>Editorial Note:</strong> This article presents general
              information about traditional Indian crafts based on commonly
              documented practices. Individual artisans and regional variations
              may differ.
            </p>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="blog-related">
            <h2 className="blog-related-title">Related Articles</h2>
            <div className="blog-related-grid">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  to={`/blog/${relatedPost.slug}`}
                  className="blog-related-card"
                >
                  <div className="blog-related-image">
                    <img
                      src={relatedPost.heroImage}
                      alt={relatedPost.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-related-content">
                    <span className="blog-card-category">
                      {relatedPost.category}
                    </span>
                    <h3 className="blog-related-card-title">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="blog-post-actions">
          <Link to="/blog" className="btn btn-outline">
            <FiArrowLeft /> Back to Blog
          </Link>
          <Link to="/products" className="btn btn-primary">
            Explore Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
