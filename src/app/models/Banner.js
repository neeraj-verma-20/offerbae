import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false,
    trim: true
  },
  openInNewTab: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
BannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model exists before creating it to prevent overwriting
const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

export default Banner;