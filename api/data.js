
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'alkhalid-store.json';
const ADMIN_PASS = 'khalid123';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // تحميل البيانات
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({
        prefix: BLOB_FILENAME
      });

      if (!blobs.length) {
        return res.status(200).json({
          streams: [],
          ads: []
        });
      }

      const latest = blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];

      const response = await fetch(latest.url);

      if (!response.ok) {
        throw new Error('تعذر تحميل البيانات من Blob');
      }

      const data = await response.json();

      return res.status(200).json(data);

    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  // حفظ البيانات
  if (req.method === 'POST') {
    const auth = req.headers['x-admin-pass'];

    if (auth !== ADMIN_PASS) {
      return res.status(401).json({
        error: 'كلمة المرور غير صحيحة'
      });
    }

    try {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

      if (!body || typeof body !== 'object') {
        throw new Error('بيانات الحفظ غير صحيحة');
      }

      await put(
        BLOB_FILENAME,
        JSON.stringify(body),
        {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json'
        }
      );

      return res.status(200).json({
        ok: true,
        message: 'تم حفظ البيانات بنجاح'
      });

    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  return res.status(405).json({
    error: 'Method not allowed'
  });
}
