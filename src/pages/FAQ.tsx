
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiSearch, FiHelpCircle } from 'react-icons/fi';
import './FAQ.css';

type FAQCategory = 'All' | 'Orders' | 'Payments' | 'Shipping' | 'Returns' | 'Products';

type FAQItem = {
  id: number;
  category: Exclude<FAQCategory, 'All'>;
  question: string;
  answer: string;
};

const categories: FAQCategory[] = [
  'All', 'Orders', 'Payments', 'Shipping', 'Returns', 'Products'
];

const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'Orders',
    question: 'How can I place an order?',
    answer: 'Browse our handicraft collection, add products to your cart, proceed to checkout, enter your delivery details, and complete the available payment process.'
  },
  {
    id: 2,
    category: 'Orders',
    question: 'How can I track my order?',
    answer: 'Visit the Track Order page or open your order history in your account dashboard to check the latest available order status.'
  },
  {
    id: 3,
    category: 'Orders',
    question: 'Can I change or cancel my order?',
    answer: 'Please contact our support team with your order details. Whether changes or cancellation are possible depends on the current order status.'
  },
  {
    id: 4,
    category: 'Payments',
    question: 'Which payment methods are available?',
    answer: 'The payment options supported by the website will be shown during checkout. Availability may depend on the current checkout configuration.'
  },
  {
    id: 5,
    category: 'Payments',
    question: 'Is online payment secure?',
    answer: 'Online payment processing uses an integrated payment provider. Please verify the payment details shown at checkout before completing a transaction.'
  },
  {
    id: 6,
    category: 'Shipping',
    question: 'How long does delivery take?',
    answer: 'Delivery times depend on the product, destination, and shipping arrangements. Contact support for information about a specific order.'
  },
  {
    id: 7,
    category: 'Shipping',
    question: 'How much does shipping cost?',
    answer: 'Any applicable shipping charges are displayed in your order summary during checkout.'
  },
  {
    id: 8,
    category: 'Returns',
    question: 'Can I return a product?',
    answer: 'Please contact support with your order number and reason for requesting a return. Eligibility and next steps will depend on the applicable return policy.'
  },
  {
    id: 9,
    category: 'Returns',
    question: 'What should I do if my product arrives damaged?',
    answer: 'Contact support as soon as possible with your order details and clear photos of the product and packaging so the issue can be reviewed.'
  },
  {
    id: 10,
    category: 'Products',
    question: 'Are handicraft products handmade?',
    answer: 'Our collection focuses on Indian handicrafts and traditional craftsmanship. Check individual product descriptions for information about materials and production methods.'
  },
  {
    id: 11,
    category: 'Products',
    question: 'Will every handmade item look exactly like its photograph?',
    answer: 'Handcrafted products may have small variations in color, pattern, texture, or finish. These differences can be part of their handmade character.'
  }
];

export default function FAQ() {
  const [category, setCategory] = useState<FAQCategory>('All');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredFAQs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory = category === 'All' || faq.category === category;
      const matchesSearch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-inner">
          <span className="faq-eyebrow">
            <FiHelpCircle /> HELP CENTER
          </span>
          <h1>Frequently Asked <em>Questions</em></h1>
          <p>
            Find helpful answers about shopping, orders, payments,
            delivery, and handcrafted products.
          </p>
        </div>
      </section>

      <section className="faq-container">
        <div className="faq-search-wrap">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Search your questions..."
            aria-label="Search frequently asked questions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="faq-categories" aria-label="FAQ categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`faq-category ${category === item ? 'active' : ''}`}
              onClick={() => {
                setCategory(item);
                setOpenId(null);
              }}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="faq-list">
          {filteredFAQs.length === 0 ? (
            <div className="faq-empty">
              <h2>No matching questions found</h2>
              <p>Try another search term or choose a different category.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <article
                  key={faq.id}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                >
                  <h2>
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                    >
                      <span>{faq.question}</span>
                      <FiChevronDown aria-hidden="true" />
                    </button>
                  </h2>

                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="faq-answer"
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        <div className="faq-support">
          <span className="faq-support-label">NEED MORE HELP?</span>
          <h2>Still have a question?</h2>
          <p>
            Our contact page is available if you need assistance
            with an order or product.
          </p>
          <Link to="/contact" className="faq-contact-btn">
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
