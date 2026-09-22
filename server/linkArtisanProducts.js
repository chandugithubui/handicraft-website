const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Artisan = require('./models/artisan');
const Product = require('./models/product');

dotenv.config({ path: path.join(__dirname, '.env') });

const linkProducts = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    const rakesh = await Artisan.findOne({
      slug: 'rakesh-prusty'
    });

    const jagannath = await Artisan.findOne({
      slug: 'jagannath-das'
    });

    const chandan = await Artisan.findOne({
      slug: 'chandan-sahoo'
    });

    if (!rakesh || !jagannath || !chandan) {
      throw new Error('One or more artisans were not found');
    }

    // Rakesh - Pattachitra
    await Product.updateMany(
      {
        _id: {
          $in: [
            '6a9d676aa51ec288673e8160',
            '6a9d676aa51ec288673e8161',
            '6a9d676aa51ec288673e8162'
          ]
        }
      },
      {
        $set: {
          artisan: rakesh._id
        }
      }
    );

    // Jagannath - Palm Leaf
    await Product.updateMany(
      {
        _id: {
          $in: [
            '6a9d676aa51ec288673e8168',
            '6a9d676aa51ec288673e8167',
            '6a9d676aa51ec288673e8166'
          ]
        }
      },
      {
        $set: {
          artisan: jagannath._id
        }
      }
    );

    // Chandan - Wood Carving
    await Product.updateMany(
      {
        _id: {
          $in: [
            '6a9d676aa51ec288673e816c',
            '6a9d676aa51ec288673e816d',
            '6a9d676aa51ec288673e8170'
          ]
        }
      },
      {
        $set: {
          artisan: chandan._id
        }
      }
    );

    console.log('Artisan products linked successfully');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Product linking failed:', error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

linkProducts();