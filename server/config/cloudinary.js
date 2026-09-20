const cloudinary = require('cloudinary').v2;
const env = require('./env');

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('[STORAGE] Cloudinary storage configured successfully.');
} else {
  console.log('[STORAGE] Cloudinary credentials missing. Falling back to local disk storage.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: isConfigured,
};