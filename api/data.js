import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'alkhalid-store.json';
const ADMIN_PASS = 'khalid123'; // يمكنك تغيير كلمة المرور من هنا

export default async function handler(req, res) {
  // السماح بالوصول
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_FILENAME });
      if (!blobs.length) {
        return res.status(200).json({ streams: [], ads: [] });
      }
      // جلب أحدث نسخة من الملف
      const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
      const response = await fetch(latest.url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(200).json({ streams: [], ads: [] });
    }
  }

  if (req.method === 'POST') {
    const auth = req.headers['x-admin-pass'];
    if (auth !== ADMIN_PASS) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await put(BLOB_FILENAME, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
