const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function createCompositeImage(backgroundUrl, characterUrl, userId, compositeId) {
  try {
    console.log('Uploading background image...');
    const bgUpload = await cloudinary.uploader.upload(backgroundUrl, {
      folder: 'nft-stamp-rally/backgrounds',
    });
    console.log('Background uploaded:', bgUpload.public_id);

    console.log('Uploading character image...');
    const charUpload = await cloudinary.uploader.upload(characterUrl, {
      folder: 'nft-stamp-rally/characters',
    });
    console.log('Character uploaded:', charUpload.public_id);

    const transformedUrl = cloudinary.url(bgUpload.public_id, {
      transformation: [
        { width: 1200, height: 1200, crop: 'fill' },
        {
          overlay: charUpload.public_id.replace(/\//g, ':'),
          width: 800,
          height: 800,
          gravity: 'center',
          crop: 'fit',
          flags: 'layer_apply'
        }
      ],
      format: 'png',
      quality: 'auto:best'
    });
    
    console.log('Transformed URL:', transformedUrl);

    const compositePublicId = `nft-stamp-rally/composites/${userId}/${compositeId}`;
    const finalUpload = await cloudinary.uploader.upload(transformedUrl, {
      public_id: compositePublicId,
    });

    console.log('Final composite uploaded:', finalUpload.secure_url);
    return finalUpload.secure_url;
  } catch (error) {
    console.error('Composite creation error:', error);
    throw error;
  }
}

module.exports = {
  createCompositeImage,
};