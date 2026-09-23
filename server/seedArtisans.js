const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Artisan = require('./models/artisan');
const Product = require('./models/product');

dotenv.config({ path: path.join(__dirname, '.env') });

const artisans = [
  // =====================================================
  // 1. RAKESH PRUSTY - WOOD CARVING
  // =====================================================
  {
    name: 'Rakesh Prusty',
    slug: 'rakesh-prusty',
    craft: 'Wood Carving',
    location: 'Puri, Odisha',
    years: 5,
    specialty: 'Traditional Decorative Woodwork',
    featured: true,

    story:
      'Rakesh practices traditional wood carving with a focus on handcrafted decorative pieces. His work combines careful shaping, detailed hand carving, and finishing techniques to create distinctive wooden handicrafts.',

    image: '/images/rakesh.png',

    craftProcess: [
      {
        step: 1,
        title: 'Wood Selection',
        description:
          'Suitable wood is selected according to the design and requirements of the handcrafted piece.',
        image: '/images/wood-selection.png'
      },
      {
        step: 2,
        title: 'Shaping the Wood',
        description:
          'The selected wood is cut and shaped to prepare the basic form of the design.',
        image: '/images/wood-shaping.png'
      },
      {
        step: 3,
        title: 'Hand Carving',
        description:
          'Carving tools are used to create detailed patterns and decorative elements by hand.',
        image: '/images/wood-hand-carving.png'
      },
      {
        step: 4,
        title: 'Sanding & Finishing',
        description:
          'The completed carving is carefully sanded and finished to enhance its final appearance.',
        image: '/images/wood-finishing.png'
      }
    ]
  },

  // =====================================================
  // 2. MONALISA SAHOO - PATTACHITRA
  // =====================================================
  {
    name: 'Monalisa Sahoo',
    slug: 'monalisa-sahoo',
    craft: 'Pattachitra Painting',
    location: 'Khurda, Odisha',
    years: 7,
    specialty: 'Traditional Pattachitra Art',
    featured: true,

    story:
      'Monalisa practices Pattachitra painting inspired by Odisha’s traditional visual storytelling. Her work focuses on detailed linework, decorative borders, traditional motifs, and vibrant hand-painted compositions.',

    image: '/images/monalisa.png',

    craftProcess: [
      {
        step: 1,
        title: 'Preparing the Canvas',
        description:
          'The painting surface is carefully prepared to create a smooth and durable base for the artwork.',
        image: '/images/monalisa-preparing-canvas.png'
      },
      {
        step: 2,
        title: 'Sketching the Design',
        description:
          'Traditional motifs and figures are carefully outlined before colors are applied.',
        image: '/images/monalisa-sketching-design.png'
      },
      {
        step: 3,
        title: 'Applying Colors',
        description:
          'Colors are carefully applied to build the detailed patterns and visual character of the artwork.',
        image: '/images/monalisa-applying-colors.png'
      },
      {
        step: 4,
        title: 'Final Detailing',
        description:
          'Fine outlines, decorative borders, and finishing details complete the Pattachitra artwork.',
        image: '/images/monalisa-final-detailing.png'
      }
    ]
  },

  // =====================================================
  // 3. JAGANNATH DAS - PALM LEAF
  // =====================================================
  {
    name: 'Jagannath Das',
    slug: 'jagannath-das',
    craft: 'Palm Leaf Engraving',
    location: 'Puri, Odisha',
    years: 4,
    specialty: 'Traditional Palm Leaf Engraving',
    featured: true,

    story:
      'Jagannath practices the traditional art of palm leaf engraving, creating detailed compositions inspired by Odisha’s cultural and artistic traditions. The craft requires patience, precision, and careful work on prepared palm leaves.',

    image: '/images/jaga.png',

    craftProcess: [
      {
        step: 1,
        title: 'Preparing Palm Leaves',
        description:
          'Palm leaves are selected, dried, and prepared before the engraving process begins.',
        image: '/images/palm-leaf-preparation.png'
      },
      {
        step: 2,
        title: 'Planning the Design',
        description:
          'The composition is carefully planned across the prepared palm leaf surface.',
        image: '/images/palm-leaf-design.png'
      },
      {
        step: 3,
        title: 'Hand Engraving',
        description:
          'Traditional tools are used to engrave fine lines, patterns, and figures onto the palm leaf.',
        image: '/images/palm-leaf-engraving.png'
      },
      {
        step: 4,
        title: 'Finishing the Artwork',
        description:
          'The engraved sections are cleaned, arranged, and finished to reveal the complete artwork.',
        image: '/images/palm-leaf-finishing.png'
      }
    ]
  }
];

// =====================================================
// EXISTING PRODUCT IDS
// =====================================================

const productAssignments = {
  rakesh: [
    '6a9d676aa51ec288673e8170', // Carved Wooden Handcraft
    '6a9d676aa51ec288673e816d', // Handcrafted Wooden Vase
    '6a9d676aa51ec288673e816c'  // Decorative Wooden Plate
  ],

  monalisa: [
    '6a9d676aa51ec288673e8160', // Lord Jagannath Pattachitra
    '6a9d676aa51ec288673e8161', // Jagannath Temple Scene
    '6a9d676aa51ec288673e8162'  // Kurma Avatar Painting
  ],

  jagannath: [
    '6a9d676aa51ec288673e8168', // Pattachitra Art Panel
    '6a9d676aa51ec288673e8167', // Pattachitra Wall Painting
    '6a9d676aa51ec288673e8166'  // Palm Leaf Teapot Design
  ]
};

const seedArtisans = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    // =====================================================
    // 1. SEED / UPDATE ARTISANS
    // =====================================================

    const savedArtisans = {};

    for (const artisan of artisans) {
      const savedArtisan = await Artisan.findOneAndUpdate(
        { slug: artisan.slug },
        { $set: artisan },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      savedArtisans[artisan.slug] = savedArtisan;

      console.log(
        `${savedArtisan.name} -> ${savedArtisan.craft}`
      );
    }

    // =====================================================
    // 2. ASSIGN PRODUCTS TO CORRECT ARTISANS
    // =====================================================

    const rakeshResult = await Product.updateMany(
      {
        _id: {
          $in: productAssignments.rakesh
        }
      },
      {
        $set: {
          artisan: savedArtisans['rakesh-prusty']._id
        }
      }
    );

    const monalisaResult = await Product.updateMany(
      {
        _id: {
          $in: productAssignments.monalisa
        }
      },
      {
        $set: {
          artisan: savedArtisans['monalisa-sahoo']._id
        }
      }
    );

    const jagannathResult = await Product.updateMany(
      {
        _id: {
          $in: productAssignments.jagannath
        }
      },
      {
        $set: {
          artisan: savedArtisans['jagannath-das']._id
        }
      }
    );

    // =====================================================
    // 3. REMOVE OLD DEMO ARTISAN
    // =====================================================

    await Artisan.deleteOne({
      slug: 'chandan-sahoo'
    });

    // =====================================================
    // 4. OUTPUT RESULT
    // =====================================================

    console.log('\nProduct assignments:');

    console.log(
      `Rakesh -> ${rakeshResult.modifiedCount} product(s) updated`
    );

    console.log(
      `Monalisa -> ${monalisaResult.modifiedCount} product(s) updated`
    );

    console.log(
      `Jagannath -> ${jagannathResult.modifiedCount} product(s) updated`
    );

    console.log('\nArtisan seed completed successfully');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Artisan seed failed:', error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seedArtisans();