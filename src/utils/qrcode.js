// src/utils/qrcode.js
const QRCode = require('qrcode');

/**
 * QRコードを生成する
 * @param {string} data - QRコードに埋め込むデータ
 * @returns {Promise<string>} Base64エンコードされたQRコード画像
 */
async function generateQRCode(data) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QRコード生成エラー:', error);
    throw new Error('QRコードの生成に失敗しました');
  }
}

/**
 * スタンプ獲得用のURLを生成
 * @param {string} stampCode - スタンプコード
 * @returns {string} 完全なURL
 */
function generateStampAcquireUrl(stampCode) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
  return `${baseUrl}/acquire?code=${stampCode}`;
}

module.exports = {
  generateQRCode,
  generateStampAcquireUrl
};
