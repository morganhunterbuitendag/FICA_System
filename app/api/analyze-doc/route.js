import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function normalizeType(expected) {
  const s = String(expected || '').toLowerCase();
  // Map known UI doc ids to canonical types
  const idMap = {
    'idcopy': 'id',
    'proofofaddress': 'proof_of_address',
    'proofofforeignaddress': 'proof_of_foreign_address',
    'taxcertificate': 'tax_certificate',
    'bankingdetails': 'banking_details',
    'partnershipagreement': 'partnership_agreement',
    'authorisation': 'authorisation_letter',
    'trustdocs': 'trust_documents',
    'companydocs': 'company_documents',
    'ccdocs': 'closed_corporation_documents',
    'shareholderdocs': 'shareholder_documents',
    'partnerdocs': 'partner_documents',
    'trusteedocs': 'trustee_documents',
    'proofofinsurance': 'proof_of_insurance',
  };
  if (idMap[s]) return idMap[s];

  // Fallback heuristics
  if (s.includes('id')) return 'id';
  if (s.includes('foreign') && s.includes('address')) return 'proof_of_foreign_address';
  if (s.includes('address')) return 'proof_of_address';
  if (s.includes('tax')) return 'tax_certificate';
  if (s.includes('bank')) return 'banking_details';
  if (s.includes('partnership')) return 'partnership_agreement';
  if (s.includes('authorisation') || s.includes('authorization')) return 'authorisation_letter';
  if (s.includes('trust')) return 'trust_documents';
  if (s.includes('corporation') || s.includes('ck')) return 'closed_corporation_documents';
  if (s.includes('company')) return 'company_documents';
  if (s.includes('shareholder')) return 'shareholder_documents';
  if (s.includes('partner')) return 'partner_documents';
  if (s.includes('trustee')) return 'trustee_documents';
  if (s.includes('insurance')) return 'proof_of_insurance';
  return 'unknown';
}

function checklistFor(type) {
  switch (type) {
    case 'id':
      return [
        'check blurriness; text is readable',
        'check ID photo present; face unobstructed',
        'check front and back uploaded (for card IDs) if applicable',
        'check no glare/shadows/cropped edges; orientation upright',
        'check ID number, full names, and DOB are present and readable',
      ];
    case 'proof_of_address':
      return [
        'check full name and street address are present and readable',
        'check issue date is present and within last 3 months',
        'check issuer/logo or document type label is visible',
        'check full page captured (not partial), legible',
      ];
    case 'proof_of_foreign_address':
      return [
        'check name and foreign address are present and readable',
        'check document date is present and recent (last 3-6 months)',
        'check issuer/logo visible',
        'if not in English, check a translation doc/section is also provided',
      ];
    case 'tax_certificate':
      return [
        'check name/entity present and readable',
        'check tax/reference number present',
        'check period/year and/or issue date present',
        'check issuer/authority name or logo is visible; full page legible',
      ];
    case 'banking_details':
      return [
        'check bank name/logo and document date present (recent, last 3 months)',
        'check account holder name present and readable',
        'check account number and branch/IBAN present',
        'check it is a bank letter/statement (not just a photo of a bank card)',
      ];
    case 'partnership_agreement':
      return [
        'check parties’ names are present and readable',
        'check signature page(s) included (presence only)',
        'check dates present and readable',
        'check all pages present and legible',
      ];
    case 'authorisation_letter':
      return [
        'check on letterhead or includes org details',
        'check authorised person’s name and ID/passport number present',
        'check signed and dated (presence only)',
        'check scope of authorisation is described in the text',
      ];
    case 'trust_documents':
      return [
        'check trust deed included (all pages) and legible',
        'check registration/letters of authority number present',
        'check list of current trustees present and readable',
        'check signatures/stamps present (presence only)',
      ];
    case 'company_documents':
      return [
        'check incorporation/registration certificate included; reg. number present',
        'check current directors/members list included and legible',
        'check issuer/registry details visible',
        'if not in English, check translation attached',
      ];
    case 'closed_corporation_documents':
      return [
        'check founding docs/CK certificate included; reg. number present',
        'check members list included and legible',
        'check issuer/registry details visible',
        'check complete set; pages readable',
      ];
    case 'shareholder_documents':
      return [
        'check share certificates/register included; shows holder names and share amounts/%',
        'check dates and signatures present (presence only)',
        'check names appear in uploaded ID documents (cross-check if available)',
      ];
    case 'partner_documents':
      return [
        'check each partner’s ID uploaded and legible (use ID checks)',
        'check partner names appear in the partnership agreement (if available)',
        'check completeness and legibility',
      ];
    case 'trustee_documents':
      return [
        'check each trustee’s ID uploaded and legible (use ID checks)',
        'check trustee names appear in trust documents (if available)',
        'check completeness and legibility',
      ];
    case 'proof_of_insurance':
      return [
        'check policy schedule/certificate included and legible',
        'check insured party name appears in the applicant/entity docs (if available)',
        'check policy number and valid from/to dates present',
        'check insurer name/logo visible',
      ];
    default:
      return [
        'check the document is legible (not blurry, no obstructions)',
        'check issuer/source and date are visible if applicable',
        'check names and identifiers are present if applicable',
      ];
  }
}

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-5';
    if (!apiKey) {
      return NextResponse.json({ message: 'Server not configured: OPENAI_API_KEY missing' }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get('file');
    const expectedRaw = form.get('expected_type');
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }
    const expectedType = normalizeType(expectedRaw);
    const checks = checklistFor(expectedType);

    // 1) Upload file to OpenAI Files API
    const uploadForm = new FormData();
    uploadForm.append('file', file, file.name || 'document.pdf');
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

    const leniency = expectedType === 'id'
      ? [
          'Leniency rules for ID checks:',
          '- Only set quality_ok=false if the majority of key fields are unreadable OR the face is obscured to the point of not being recognizable.',
          '- Minor blur, small glare, light shadows, or slight cropping are OK if names, ID number, and DOB can be read.',
          '- Consider front/back satisfied if both sides appear anywhere in the file (even if on the same page or as a collage), or if the visible side contains all required info.',
          '- Do NOT include nitpicks in fail_reasons; include only material issues that would block acceptance.',
        ]
      : [
          'General leniency: Only set quality_ok=false if key required fields are unreadable. Ignore minor blur, small glare, light shadows, or slight cropping.',
          'Do NOT include nitpicks in fail_reasons; include only material issues that would block acceptance.',
        ];

    const instruction = [
      'You are a document checker for KYC/FICA workflows. You receive a single uploaded document and an expected document category.',
      `Expected category: ${expectedType}`,
      'Perform the following checks for this expected category:',
      ...checks.map((c, i) => `${i + 1}. ${c}`),
      ...leniency,
      'Additionally, first classify the document type you believe this file is (high level, e.g., id, proof_of_address, tax_certificate, banking_details, etc.).',
      'Decide if this file matches the expected category (expected_type_ok).',
      'Assess legibility/quality (quality_ok).',
      'Only include fail_reasons that materially affect acceptance. Do not include minor nitpicks.',
      'Return ONLY strict JSON. Keys: detected_type (string), expected_type_ok (boolean), quality_ok (boolean), fail_reasons (array of strings). No markdown or extra text.',
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
              { type: 'input_text', text: instruction },
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

    let text = '';
    if (typeof respJson.output_text === 'string') {
      text = respJson.output_text;
    } else if (respJson.output && Array.isArray(respJson.output)) {
      const first = respJson.output[0];
      const content = first?.content?.[0]?.text;
      if (typeof content === 'string') text = content;
    }

    let parsed = null;
    if (text) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }
    if (!parsed) {
      parsed = { detected_type: 'unknown', expected_type_ok: false, quality_ok: false, fail_reasons: ['Unable to parse analysis result'] };
    }

    // Optionally delete uploaded file
    try {
      await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {}

    return NextResponse.json({
      detectedType: parsed.detected_type,
      expectedTypeOk: Boolean(parsed.expected_type_ok),
      qualityOk: Boolean(parsed.quality_ok),
      failReasons: Array.isArray(parsed.fail_reasons) ? parsed.fail_reasons : [],
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Unexpected server error', error: err?.message || String(err) }, { status: 500 });
  }
}


