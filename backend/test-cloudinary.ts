import dotenv from 'dotenv';
dotenv.config();
import cloudinary from './src/lib/cloudinary';

cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', { folder: 'chai_adda' })
  .then(res => console.log('SUCCESS:', res.secure_url))
  .catch(err => console.error('ERROR:', err));
