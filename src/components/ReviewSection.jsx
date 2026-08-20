import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getProductReviews, createReview } from '../services/reviewService';
import './ReviewSection.css';

const ReviewSection = ({ productId }) => {
  const { isAuthenticated, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductReviews(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      setError('Please login to submit a review');
      return;
    }

    try {
      await createReview(
        {
          product: productId,
          rating: formData.rating,
          comment: formData.comment
        },
        token
      );
      setSuccess('Review submitted successfully!');
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-empty" />);
      }
    }
    return stars;
  };

  const renderStarInput = () => {
    return (
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= formData.rating ? 'star-filled' : 'star-empty'}
            onClick={() => setFormData({ ...formData, rating: star })}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center my-3">Loading reviews...</div>;
  }

  return (
    <div className="review-section">
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Customer Reviews</h4>
          
          {/* Rating Summary */}
          <Row className="mb-4">
            <Col md={3} className="text-center">
              <div className="rating-summary">
                <h2>{averageRating}</h2>
                <div className="stars">{renderStars(averageRating)}</div>
                <p className="text-muted">{totalReviews} reviews</p>
              </div>
            </Col>
            <Col md={9}>
              {/* Rating Distribution */}
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="rating-bar">
                    <span className="star-label">{star} star</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="count-label">{count}</span>
                  </div>
                );
              })}
            </Col>
          </Row>

          <hr />

          {/* Write Review Button */}
          {isAuthenticated && (
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              className="mb-3"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </Button>
          )}

          {/* Review Form */}
          {showForm && (
            <Card className="review-form mb-4">
              <Card.Body>
                <h5>Write a Review</h5>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    {renderStarInput()}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Review</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      required
                      placeholder="Share your experience with this product..."
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary">
                    Submit Review
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <Card key={review._id} className="review-card mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{review.user?.name || 'Anonymous'}</h6>
                        <div className="stars mb-2">{renderStars(review.rating)}</div>
                      </div>
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReviewSection;
