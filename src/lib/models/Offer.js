import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  image: String,
  mapLink: String,
  category: String,
  expiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
