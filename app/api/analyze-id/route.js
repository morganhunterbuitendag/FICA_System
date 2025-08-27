import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-5';
    if (!apiKey) {
      return NextResponse.json({ message: 'Server not configured: OPENAI_API_KEY missing' }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // 1) Upload file to OpenAI Files API
    const uploadForm = new FormData();
    uploadForm.append('file', file, file.name || 'id-document.pdf');
    uploadForm.append('purpose', 'assistants');

    const uploadRes = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '');
      return NextResponse.json({ message: 'Failed to upload file for analysis', details: errText }, { status: 502 });
    }
    const uploaded = await uploadRes.json();
    const fileId = uploaded.id;

    // 2) Ask GPT-4o-mini to verify: is an ID? is blurry?
    const systemPrompt = [
      'You are an ID checker. Your job is to assess the attached document and answer strictly in JSON.',
      'Be very lenient for blur: only mark is_blurry=true if most key fields or the face are substantially unreadable. Minor blur or slight glare/shadows are acceptable.',
      'If both sides of an ID card appear anywhere in the uploaded file (e.g., both in one page), consider front/back satisfied.',
      'Decide:',
      '- is_id: true if this is a government-issued identification document (ID/passport/driver license), else false.',
      '- is_blurry: true only if the document is substantially unreadable (not for minor blur).',
      '- reason: a short, user-friendly reason.',
      'Respond ONLY with JSON matching this schema: {"is_id": boolean, "is_blurry": boolean, "reason": string}.',
    ].join('\n');

    const respRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: systemPrompt },
              { type: 'input_file', file_id: fileId },
            ],
          },
        ],
        temperature: 0,
      }),
    });

    if (!respRes.ok) {
      const errText = await respRes.text().catch(() => '');
      return NextResponse.json({ message: 'Analysis request failed', details: errText }, { status: 502 });
    }
    const respJson = await respRes.json();

    // Try to extract text output from Responses API
    let text = '';
    if (typeof respJson.output_text === 'string') {
      text = respJson.output_text;
    } else if (respJson.output && Array.isArray(respJson.output)) {
      // Fallback traversal
      const first = respJson.output[0];
      const content = first?.content?.[0]?.text;
      if (typeof content === 'string') text = content;
    }

    // Extract JSON from text
    let parsed = null;
    if (text) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    if (!parsed) {
      parsed = { is_id: false, is_blurry: true, reason: 'Unable to parse analysis result.' };
    }

    // Optionally, delete file from OpenAI to avoid storage
    try {
      await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {}

    const result = {
      isId: Boolean(parsed.is_id),
      isBlurry: Boolean(parsed.is_blurry),
      reason: typeof parsed.reason === 'string' ? parsed.reason : '',
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Unexpected server error', error: err?.message || String(err) }, { status: 500 });
  }
}


