"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// --- Helper Data & Configuration ---

const documentRequirements = {
    Individual: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'idCopy', title: 'Copy of ID Document', helpText: 'A clear, certified copy of your valid ID document or passport.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
    ],
    Partnership: [
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'partnershipAgreement', title: 'Partnership Agreement', helpText: 'The official agreement document for the partnership.' },
        { id: 'partnerIds', title: 'Copy of Partners’ IDs', helpText: 'Certified ID copies for all partners.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the person authorized to act on behalf of the partnership.' },
        { id: 'partnerDocs', title: 'Copy of Partner Documents', helpText: 'Any other relevant documents for the partners.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    Trust: [
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'trustDocs', title: 'Trust Documents', helpText: 'The official trust deed and any amendments.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'trusteeBeneficiaryIds', title: 'Copy of Trustee and Beneficiary ID', helpText: 'Certified ID copies for all trustees and beneficiaries.' },
        { id: 'founderId', title: 'Copy of Founder ID', helpText: 'Certified ID copy of the founder of the trust.' },
        { id: 'trusteeDocs', title: 'Copy of Trustee Documents', helpText: 'Any other relevant documents for the trustees.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    ClosedCorporation: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'ccDocs', title: 'Closed Corporation Documents', helpText: 'Founding statements and certificates of the CC.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'memberIds', title: 'Copy of Members’ ID', helpText: 'Certified ID copies for all members of the CC.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    PrivateCompany: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'companyDocs', title: 'Company Documents', helpText: 'Certificate of Incorporation, Memorandum of Incorporation.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'directorId', title: 'Copy of Director ID', helpText: 'Certified ID copies for all directors.' },
        { id: 'shareholderDocs', title: 'Copy of Shareholder Documents', helpText: 'Shareholder register and relevant documents.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    PublicCompany: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'companyDocs', title: 'Company Documents', helpText: 'Certificate of Incorporation, Memorandum of Incorporation.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'directorId', title: 'Copy of Director ID', helpText: 'Certified ID copies for all directors.' },
        { id: 'shareholderDocs', title: 'Copy of Shareholder Documents', helpText: 'Shareholder register and relevant documents.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    ForeignCompany: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'proofOfForeignAddress', title: 'Proof of Foreign Address', helpText: 'Proof of address from the country of origin.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'foreignCompanyDocs', title: 'Foreign Company Documents', helpText: 'Official documents for the foreign company.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'directorId', title: 'Copy of Director ID', helpText: 'Certified ID copies for all directors.' },
        { id: 'shareholderDocs', title: 'Copy of Shareholder Documents', helpText: 'Shareholder register and relevant documents.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    OtherLegalEntity: [
        { id: 'proofOfAddress', title: 'Proof of Address', helpText: 'Utility bill or bank statement no older than 3 months.' },
        { id: 'taxCertificate', title: 'Copy of Tax Certificate', helpText: 'Your latest tax certificate from the revenue service.' },
        { id: 'bankingDetails', title: 'Confirmation of Banking Details', helpText: 'A bank-stamped letter confirming your account details.' },
        { id: 'otherLegalDocs', title: 'Other Legal Person Documents', helpText: 'Relevant legal documents for the entity.' },
        { id: 'authPersonId', title: 'Copy of Authorised Person ID', helpText: 'Certified ID copy of the authorized person.' },
        { id: 'authorisation', title: 'Authorisation', helpText: 'A letter authorising the representative to act on behalf of the entity.' },
    ],
    Transporter: [
        { id: 'proofOfInsurance', title: 'Proof of Insurance', helpText: 'Required for Transporter accounts. Please provide your insurance certificate.' },
    ],
};

const statusConfig = {
    Missing: { text: 'Missing', bg: 'bg-red-50', text_color: 'text-red-700', border: 'border-gray-300' },
    Uploaded: { text: 'Uploaded', bg: 'bg-blue-50', text_color: 'text-blue-700', border: 'border-gray-300' },
    Approved: { text: 'Approved', bg: 'bg-green-50', text_color: 'text-green-700', border: 'border-green-300' },
    'Needs Resubmission': { text: 'Needs Resubmission', bg: 'bg-yellow-50', text_color: 'text-yellow-700', border: 'border-yellow-400' },
};


// --- SVG Icons ---
const icons = {
    upload: <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>,
    pdf: <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.414-4.414A2 2 0 0011.172 2H4zm6 10a1 1 0 00-1.414.086L6.914 14H6a1 1 0 100 2h1.086l1.672-1.914a1 1 0 00-.086-1.414zM12 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>,
    warning: <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
    x: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
    check: <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    error: <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
};


// --- Components ---

const Header = ({ clientName, caseNumber, progress }) => (
    <header
        className="w-full shadow-lg sticky top-0 z-10 relative"
        style={{
            backgroundImage: 'linear-gradient(115deg, #ffffff 0%, #ffffff 40%, #dc2626 100%)'
        }}
    >
        <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
                backgroundImage:
                    'radial-gradient(1200px 600px at -10% -20%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(800px 400px at 110% -10%, rgba(255,255,255,0.25), transparent 55%), repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)'
            }}
        />
        <div className="container mx-auto max-w-4xl px-4 py-5 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
                <Image
                    src="/silostrat-logo.png"
                    alt="Silostrat Logo"
                    width={180}
                    height={52}
                    priority
                />
            </div>
            <div className="text-right">
                <p className="text-sm text-black">FICA Document Upload</p>
                <p className="text-sm font-semibold text-black">{clientName}</p>
                <p className="text-xs text-black">Case #{caseNumber}</p>
                <div className="mt-2 inline-block align-middle">
                    <div className="w-40 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-red-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const ProgressBar = ({ progress, totalSteps }) => (
    <div className="mb-8 mt-8">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Submission Progress</h2>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-red-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

const FileUploadZone = ({ onFileSelect, error, file }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = React.useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const baseClasses = "relative w-full sm:w-64 h-32 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4 transition-colors duration-200";
    const draggingClasses = isDragging ? "border-red-500 bg-red-50" : "border-gray-300";
    const errorClasses = error ? "border-red-500 bg-red-50" : "";

    return (
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`${baseClasses} ${draggingClasses} ${errorClasses}`}>
            <input type="file" ref={inputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
            {icons.upload}
            <p className="text-sm text-gray-600 mt-2">
                Drag & drop or <button type="button" onClick={() => inputRef.current.click()} className="font-semibold text-red-600 hover:underline focus:outline-none">browse files</button>
            </p>
            {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
        </div>
    );
};

const FilePreview = ({ file, onRemove }) => (
    <div className="w-full sm:w-64 bg-gray-50 p-3 rounded-lg flex items-center gap-3 border border-gray-200">
        {icons.pdf}
        <div className="flex-1 overflow-hidden">
            <p className="text-sm text-gray-800 font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-500 hover:text-red-600 p-1 rounded-full transition-colors duration-200">
            {icons.x}
        </button>
    </div>
);

const DocumentCard = ({ doc, onUpdate, onAnalyze }) => {
    const { title, helpText, status, file, error, resubmissionReason } = doc;
    const config = statusConfig[status];

    const handleFileSelect = (selectedFile) => {
        if (selectedFile.type !== 'application/pdf') {
            onUpdate({ ...doc, error: 'Invalid file type. Please upload a PDF.' });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            onUpdate({ ...doc, error: 'File is too large. Max size is 5MB.' });
            return;
        }
        onUpdate({ ...doc, file: selectedFile, status: 'Uploaded', error: null, resubmissionReason: null });

        // Trigger generic doc analysis for expected type
        if (onAnalyze) {
            onAnalyze(doc.id, selectedFile);
        }
    };

    const handleRemoveFile = () => {
        onUpdate({ ...doc, file: null, status: 'Missing', error: null, idCheckLoading: false, idCheckMessage: null, idCheckOk: null, analysis: null });
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-5 border ${config.border} transition-all duration-300`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-md font-bold text-gray-900">{title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.bg} ${config.text_color}`}>{config.text}</span>
                    </div>
                    <p className="text-sm text-gray-500">{helpText}</p>
                    <p className="text-xs text-gray-400 mt-2">Accepted file type: PDF only • Max file size: 5MB</p>
                    {status === 'Needs Resubmission' && resubmissionReason && (
                        <div className="mt-3 flex items-start gap-2 text-yellow-800 bg-yellow-50 p-3 rounded-md text-sm">
                            {icons.warning}
                            <div>
                                <span className="font-semibold">Action Required:</span> {resubmissionReason}
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-full sm:w-auto">
                    {file ? (
                        <FilePreview file={file} onRemove={handleRemoveFile} />
                    ) : (
                        <FileUploadZone onFileSelect={handleFileSelect} error={error} />
                    )}
                </div>
            </div>
            <div className="mt-3">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Validation</div>
                {(doc.analysisLoading || doc.idCheckLoading) ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Analyzing document...</span>
                    </div>
                ) : (
                    <>
                        {doc.id === 'idCopy' && doc.idCheckMessage && (
                            <div className={`flex items-start gap-2 text-sm px-3 py-2 rounded-md border ${doc.idCheckOk ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                {doc.idCheckOk ? icons.check : icons.error}
                                <span>{doc.idCheckMessage}</span>
                            </div>
                        )}
                        {doc.analysis && (
                            <div className={`mt-2 flex items-start gap-2 text-sm px-3 py-2 rounded-md border ${doc.analysis.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                {doc.analysis.ok ? icons.check : icons.error}
                                <div>
                                    <div>{doc.analysis.message}</div>
                                    {!doc.analysis.ok && doc.analysis.reasons?.length > 0 && (
                                        <ul className="mt-2 text-xs text-gray-700 list-disc list-inside">
                                            {doc.analysis.reasons.slice(0, 3).map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                        {!doc.idCheckMessage && !doc.analysis && (
                            <div className="text-xs text-gray-500">No validation yet. Upload a document to start.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const Footer = ({ isEnabled, onConsentChange, consent }) => (
    <footer className="mt-8 pt-6 border-t">
        <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-start">
                <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={onConsentChange}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                />
                <label htmlFor="consent" className="ml-3 block text-sm text-gray-700">
                    I hereby declare that the information and documents provided are true and correct to the best of my knowledge.
                </label>
            </div>
        </div>
        <div className="mt-6">
            <button
                type="submit"
                disabled={!isEnabled}
                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed enabled:bg-red-600 enabled:hover:bg-red-700 enabled:shadow-md"
            >
                Submit for Review
            </button>
        </div>
    </footer>
);

// --- Main App Component ---

export default function App() {
    // --- Mock Backend Data ---
    const entityType = 'Individual';
    const accountType = 'Transporter';
    const clientName = "Jane Doe";
    const caseNumber = "67890";

    const [documents, setDocuments] = useState([]);
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        let requiredDocs = documentRequirements[entityType] ? [...documentRequirements[entityType]] : [];
        if (accountType === 'Transporter') {
            requiredDocs.push(...documentRequirements.Transporter);
        }

        const initialDocs = requiredDocs.map(doc => ({
            ...doc,
            status: 'Missing',
            file: null,
            error: null,
            resubmissionReason: null,
            idCheckLoading: false,
            idCheckMessage: null,
            idCheckOk: null,
            analysis: null,
            analysisLoading: false,
        }));
        
        setDocuments(initialDocs);
    }, [entityType, accountType]);

    const handleDocumentUpdate = (updatedDoc) => {
        setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));

        if (updatedDoc.id === 'idCopy') {
            if (updatedDoc.file) {
                setDocuments(prev => prev.map(doc =>
                    doc.id === 'idCopy'
                        ? { ...doc, idCheckLoading: true, idCheckMessage: null, idCheckOk: null }
                        : doc
                ));
                analyzeIdDocument('idCopy', updatedDoc.file).catch(() => {});
            } else {
                setDocuments(prev => prev.map(doc =>
                    doc.id === 'idCopy'
                        ? { ...doc, idCheckLoading: false, idCheckMessage: null, idCheckOk: null }
                        : doc
                ));
            }
        }
    };

    const analyzeIdDocument = async (docId, file) => {
        try {
            const form = new FormData();
            form.append('file', file, file.name);
            const res = await fetch('/api/analyze-id', { method: 'POST', body: form });
            if (!res.ok) {
                throw new Error('Analysis failed');
            }
            const data = await res.json();
            const isOk = Boolean(data.isId) && !Boolean(data.isBlurry);
            const message = isOk
                ? 'ID correct'
                : (!data.isId ? 'No ID document detected' : 'ID blurry or low quality');

            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? { ...doc, idCheckLoading: false, idCheckMessage: message, idCheckOk: isOk }
                    : doc
            ));
        } catch (err) {
            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? { ...doc, idCheckLoading: false, idCheckMessage: 'Unable to verify ID at the moment', idCheckOk: false }
                    : doc
            ));
        }
    };

    const analyzeGenericDocument = async (docId, file) => {
        try {
            // show loading
            setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, analysisLoading: true, analysis: null } : doc));
            const form = new FormData();
            form.append('file', file, file.name);
            form.append('expected_type', docId);
            const res = await fetch('/api/analyze-doc', { method: 'POST', body: form });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();

            const ok = Boolean(data.expectedTypeOk) && Boolean(data.qualityOk);
            const wrongPlace = !Boolean(data.expectedTypeOk);
            const message = wrongPlace
                ? 'Wrong document for this section'
                : (ok ? 'Document looks correct' : 'Please re-upload: quality issues');

            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? { ...doc, analysisLoading: false, analysis: { ok: ok && !wrongPlace, message, reasons: data.failReasons || [] } }
                    : doc
            ));
        } catch (err) {
            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? { ...doc, analysisLoading: false, analysis: { ok: false, message: 'Unable to analyze document right now', reasons: [] } }
                    : doc
            ));
        }
    };
    
    const completedDocs = documents.filter(doc => doc.status === 'Uploaded' || doc.status === 'Approved').length;
    const progress = documents.length > 0 ? (completedDocs / documents.length) * 100 : 0;
    const allUploaded = documents.every(doc => doc.status === 'Uploaded' || doc.status === 'Approved');
    const isSubmitEnabled = allUploaded && consent;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSubmitEnabled || submitting) return;
        setSubmitting(true);
        setSubmitMessage(null);
        setSubmitError(null);

        try {
            const formData = new FormData();
            formData.append('entityType', entityType);
            formData.append('accountType', accountType);
            formData.append('clientName', clientName);
            formData.append('caseNumber', caseNumber);
            formData.append('consent', String(consent));

            documents.forEach((doc) => {
                formData.append('documents[]', JSON.stringify({ id: doc.id, title: doc.title, status: doc.status }));
                if (doc.file) {
                    formData.append(`files[${doc.id}]`, doc.file, doc.file.name);
                }
            });

            const response = await fetch('/api/submit', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Submission failed' }));
                throw new Error(err.message || 'Submission failed');
            }

            await response.json().catch(() => ({}));
            setSubmitMessage('Your documents were submitted successfully.');
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong while submitting.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header clientName={clientName} caseNumber={caseNumber} progress={progress} />
            <div className="container mx-auto max-w-4xl p-4 sm:p-6">
                <main>
                    <form onSubmit={handleSubmit}>
                        {/* Progress bar moved into Header; keeping here commented for reference */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Required Documents for: <span className="font-bold">{entityType}</span>
                                {accountType && <span className="font-bold"> ({accountType})</span>}
                            </h2>
                            {documents.map(doc => (
                                <DocumentCard
                                    key={doc.id}
                                    doc={doc}
                                    onUpdate={handleDocumentUpdate}
                                    onAnalyze={analyzeGenericDocument}
                                />
                            ))}
                        </div>
                        {submitMessage && (
                            <div className="mt-6 bg-green-50 text-green-800 border border-green-200 rounded-md p-3 text-sm">
                                {submitMessage}
                            </div>
                        )}
                        {submitError && (
                            <div className="mt-6 bg-red-50 text-red-800 border border-red-200 rounded-md p-3 text-sm">
                                {submitError}
                            </div>
                        )}
                        <Footer isEnabled={isSubmitEnabled && !submitting} consent={consent} onConsentChange={(e) => setConsent(e.target.checked)} />
                    </form>
                </main>
            </div>
        </div>
    );
}


