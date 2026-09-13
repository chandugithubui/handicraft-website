const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Testimonial = require('./models/testimonial');

dotenv.config();

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Amazing quality! The Pattachitra painting I ordered exceeded my expectations. Will definitely order again.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    active: true
  },
  {
    name: 'Rahul Verma',
    location: 'Delhi',
    rating: 5,
    text: 'Beautiful craftsmanship and fast delivery. The wooden bowl is a centerpiece in my home now.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    active: true
  },
  {
    name: 'Anita Desai',
    location: 'Bengaluru',
    rating: 4,
    text: 'Love supporting local artisans through this platform. Great collection and reasonable prices.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    active: true
  }
];

const seedTestimonials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    await Testimonial.deleteMany({});
    await Testimonial.insertMany(testimonials);

    console.log('Testimonials seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
};

seedTestimonials();