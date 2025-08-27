import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();

    const entityType = formData.get('entityType');
    const accountType = formData.get('accountType');
    const clientName = formData.get('clientName');
    const caseNumber = formData.get('caseNumber');
    const consent = formData.get('consent') === 'true';

    const documentsRaw = formData.getAll('documents[]');
    const documents = documentsRaw.map((d) => {
      try { return JSON.parse(d); } catch { return null; }
    }).filter(Boolean);

    // Gather files keyed by doc id
    const files = {};
    documents.forEach((doc) => {
      const file = formData.get(`files[${doc.id}]`);
      if (file && typeof file === 'object') {
        files[doc.id] = file;
      }
    });

    // Forward to main system
    const endpoint = process.env.MAIN_SYSTEM_ENDPOINT;
    if (!endpoint) {
      return NextResponse.json({ message: 'Server not configured: MAIN_SYSTEM_ENDPOINT missing' }, { status: 500 });
    }

    // Build multipart form-data for upstream, preserving files
    const upstreamForm = new FormData();
    upstreamForm.append('entityType', entityType || '');
    upstreamForm.append('accountType', accountType || '');
    upstreamForm.append('clientName', clientName || '');
    upstreamForm.append('caseNumber', caseNumber || '');
    upstreamForm.append('consent', String(consent));
    documents.forEach((doc) => upstreamForm.append('documents[]', JSON.stringify(doc)));
    Object.entries(files).forEach(([docId, file]) => {
      upstreamForm.append(`files[${docId}]`, file, file.name || 'upload.pdf');
    });

    const upstreamRes = await fetch(endpoint, {
      method: 'POST',
      body: upstreamForm,
      headers: {
        ...(process.env.MAIN_SYSTEM_TOKEN ? { Authorization: `Bearer ${process.env.MAIN_SYSTEM_TOKEN}` } : {}),
      },
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text().catch(() => '');
      return NextResponse.json({ message: 'Upstream rejected submission', details: errText }, { status: 502 });
    }

    const data = await upstreamRes.json().catch(() => ({}));
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Unexpected server error', error: err?.message || String(err) }, { status: 500 });
  }
}


