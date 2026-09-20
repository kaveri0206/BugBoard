const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const env = require('../config/env');

const uploadFile = async (file) => {
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'bugboard_attachments',
      resource_type: 'auto',
    });
    // Remove local temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.originalname,
      fileType: file.mimetype,
      size: file.size,
    };
  }

  // Local Storage fallback
  const localUrl = `${env.CLIENT_URL.replace('5173', '5000')}/uploads/${file.filename}`;
  return {
    url: localUrl,
    publicId: file.filename,
    fileName: file.originalname,
    fileType: file.mimetype,
    size: file.size,
  };
};

const deleteFile = async (publicId) => {
  if (!publicId) return;
  if (isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId);
  } else {
    const localPath = path.join(__dirname, '../uploads', publicId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};

module.exports = { uploadFile, deleteFile };