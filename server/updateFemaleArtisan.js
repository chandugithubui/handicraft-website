const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Artisan = require('./models/artisan');

dotenv.config({ path: path.join(__dirname, '.env') });

const updateArtisan = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    const artisan = await Artisan.findOneAndUpdate(
      { slug: 'chandan-sahoo' },
      {
        $set: {
          name: 'Monalisa Sahoo',
          slug: 'monalisa-sahoo',
          craft: 'Wood Carving',
          location: 'Khurda, Odisha',
          years: 26,
          specialty: 'Traditional Decorative Woodwork',

          story:
            'Monalisa practices traditional wood carving with a focus on decorative handcrafted pieces inspired by Indian craft traditions. Her work combines careful hand carving, shaping, and finishing to create distinctive wooden decor.',

          image: '/images/monalisa.jpeg',

          craftProcess: [
            {
              step: 1,
              title: 'Wood Selection',
              description:
                'Suitable wood is selected based on the size, design, and type of handcrafted piece.',
              image: '/images/monalisa.jpeg'
            },
            {
              step: 2,
              title: 'Shaping Wood',
              description:
                'The selected wood is carefully shaped to prepare the basic form of the design.',
              image: '/images/monalisa.jpeg'
            },
            {
              step: 3,
              title: 'Hand Carving',
              description:
                'Traditional hand tools are used to carve patterns and decorative details into the wood.',
              image: '/images/monalisa.jpeg'
            },
            {
              step: 4,
              title: 'Sanding & Finishing',
              description:
                'The finished carving is smoothed and prepared with final detailing for a polished appearance.',
              image: '/images/monalisa.jpeg'
            }
          ]
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!artisan) {
      throw new Error('chandan-sahoo artisan was not found');
    }

    console.log('Female artisan updated successfully');
    console.log(`${artisan.name} - ${artisan.slug}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Artisan update failed:', error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

updateArtisan();