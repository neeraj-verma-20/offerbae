import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  areas: { type: [String], required: true }
});

export default mongoose.models.Location || mongoose.model('Location', LocationSchema); 