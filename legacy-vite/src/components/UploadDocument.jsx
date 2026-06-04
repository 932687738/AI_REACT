import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  batchDeleteDocuments,
  listDocuments,
  listKnowledgeBases,
  uploadDocument,
} from '@/api/knowledge'
import FeedbackModal from '@/components/FeedbackModal'
import { messages } from '@/i18n/messages'

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.doc']
const FORMAT_LABELS = ['TXT', 'MD', 'PDF', 'DOCX', 'DOC']

const EMPTY_MODAL = {
  open: false,
  title: '',
  message: '',
  variant: 'success',
  detail: null,
}

function UploadIcon() {
  return (
    <svg
      className="upload-dropzone__icon"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DocumentEmptyIcon() {
  return (
    <svg
      className="upload-empty__icon"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UploadSkeleton() {
  return (
    <div className="upload-skeleton" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="upload-skeleton__row">
          <span className="upload-skeleton__cell upload-skeleton__cell--check" />
          <span className="upload-skeleton__cell upload-skeleton__cell--name" />
          <span className="upload-skeleton__cell upload-skeleton__cell--short" />
          <span className="upload-skeleton__cell upload-skeleton__cell--medium" />
        </div>
      ))}
    </div>
  )
}

function isAllowedFile(file) {
  const name = file.name.toLowerCase()
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function formatDocumentTime(value, language) {
  if (!value) {
    return '—'
  }
  return new Date(value).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')
}

function buildUploadDetail(response, t) {
  if (!response) {
    return null
  }
  return [
    `${t.uploadDocId}: ${response.documentId ?? '—'}`,
    `${t.uploadLanguage}: ${response.language ?? '—'}`,
    `${t.uploadChunkCount}: ${response.chunkCount ?? 0}`,
  ]
}

export default function UploadDocument({
  language,
  initialKnowledgeBaseId,
  highlightDocumentId,
  onHighlightConsumed,
}) {
  const t = messages[language]
  const fileInputId = useId()
  const [knowledgeBases, setKnowledgeBases] = useState([])
  const [selectedKbId, setSelectedKbId] = useState('')
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [feedbackModal, setFeedbackModal] = useState(EMPTY_MODAL)
  const [deleting, setDeleting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [documentsError, setDocumentsError] = useState('')
  const highlightRowRef = useRef(null)

  const resolvedKbId =
    initialKnowledgeBaseId != null && initialKnowledgeBaseId !== ''
      ? String(initialKnowledgeBaseId)
      : selectedKbId

  const kbReady = knowledgeBases.length > 0 && Boolean(resolvedKbId)
  const dropzoneDisabled = !kbReady || uploading || deleting

  const closeFeedbackModal = useCallback(() => {
    setFeedbackModal(EMPTY_MODAL)
  }, [])

  const showFeedbackModal = useCallback((payload) => {
    setFeedbackModal({
      open: true,
      title: payload.title,
      message: payload.message ?? '',
      variant: payload.variant ?? 'success',
      detail: payload.detail ?? null,
    })
  }, [])

  const loadDocuments = useCallback(async () => {
    if (!resolvedKbId) {
      setDocuments([])
      setSelectedIds(new Set())
      return true
    }
    setDocumentsLoading(true)
    setDocumentsError('')
    try {
      const data = await listDocuments(Number(resolvedKbId))
      setDocuments(data)
      setSelectedIds(new Set())
      return true
    } catch {
      setDocumentsError(t.uploadLoadDocumentsFailed)
      return false
    } finally {
      setDocumentsLoading(false)
    }
  }, [resolvedKbId, t.uploadLoadDocumentsFailed])

  useEffect(() => {
    listKnowledgeBases()
      .then((data) => {
        setKnowledgeBases(data)
        if (data.length > 0) {
          setSelectedKbId(String(data[0].id))
        }
      })
      .catch(() => setError(t.uploadLoadKbFailed))
  }, [t.uploadLoadKbFailed])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  useEffect(() => {
    if (!highlightDocumentId || documentsLoading || !highlightRowRef.current) {
      return
    }
    highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    const timer = window.setTimeout(() => onHighlightConsumed?.(), 3200)
    return () => window.clearTimeout(timer)
  }, [highlightDocumentId, documents, documentsLoading, onHighlightConsumed])

  const allSelected =
    documents.length > 0 && documents.every((document) => selectedIds.has(document.id))

  function toggleDocument(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(documents.map((document) => document.id)))
  }

  async function handleUpload(file, replace = false) {
    if (!file || !resolvedKbId) {
      setError(t.uploadSelectKb)
      return
    }
    if (!isAllowedFile(file)) {
      setError(t.uploadInvalidFormat)
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setDocumentsError('')
    closeFeedbackModal()

    try {
      const response = await uploadDocument({
        file,
        knowledgeBaseId: Number(resolvedKbId),
        replace,
        onProgress: setProgress,
      })
      showFeedbackModal({
        title: response.alreadyExists ? t.uploadExists : t.uploadSuccess,
        message: response.message || (response.alreadyExists ? t.uploadExists : t.uploadSuccess),
        variant: response.alreadyExists ? 'warning' : 'success',
        detail: {
          lines: buildUploadDetail(response, t),
          alreadyExists: response.alreadyExists,
          onReplace: response.alreadyExists
            ? () => {
                closeFeedbackModal()
                const input = window.document.createElement('input')
                input.type = 'file'
                input.onchange = (event) => {
                  const nextFile = event.target.files?.[0]
                  if (nextFile) {
                    handleUpload(nextFile, true)
                  }
                }
                input.click()
              }
            : null,
        },
      })
    } catch {
      setError(t.uploadFailed)
      return
    } finally {
      setUploading(false)
    }

    await loadDocuments()
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0 || !resolvedKbId) {
      return
    }
    const count = selectedIds.size
    const confirmText = t.uploadBatchDeleteConfirm.replace('{count}', String(count))
    if (!window.confirm(confirmText)) {
      return
    }

    setDeleting(true)
    setError('')
    closeFeedbackModal()

    try {
      const response = await batchDeleteDocuments({
        knowledgeBaseId: Number(resolvedKbId),
        documentIds: [...selectedIds],
      })
      await loadDocuments()

      if (response.failedDocumentIds?.length > 0) {
        if (response.deletedCount === 0) {
          setSelectedIds(new Set(response.failedDocumentIds))
          showFeedbackModal({
            title: t.uploadDeleteAllFailed,
            message: response.message || t.uploadDeleteAllFailed,
            variant: 'warning',
          })
        } else {
          setSelectedIds(new Set(response.failedDocumentIds))
          showFeedbackModal({
            title: t.uploadDeletePartialFailed,
            message: response.message || t.uploadDeletePartialFailed,
            variant: 'warning',
          })
        }
      } else {
        setSelectedIds(new Set())
        showFeedbackModal({
          title: t.uploadDeleteSuccess,
          message: response.message || t.uploadDeleteSuccess,
          variant: 'success',
        })
      }
    } catch {
      setError(t.uploadDeleteFailed)
    } finally {
      setDeleting(false)
    }
  }

  function onFileInput(event) {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    event.target.value = ''
  }

  function onDrop(event) {
    event.preventDefault()
    setDragOver(false)
    if (dropzoneDisabled) {
      return
    }
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  function onKnowledgeBaseChange(event) {
    setSelectedKbId(event.target.value)
    setSelectedIds(new Set())
    closeFeedbackModal()
    setDocumentsError('')
    setError('')
    onHighlightConsumed?.()
  }

  const deleteLabel =
    selectedIds.size > 0
      ? `${t.uploadBatchDelete} · ${t.uploadSelectedCount.replace('{count}', String(selectedIds.size))}`
      : t.uploadBatchDelete

  return (
    <section className="knowledge-screen upload-screen">
      <header className="knowledge-screen__header">
        <h1>{t.uploadTitle}</h1>
        <p>{t.uploadSubtitle}</p>
      </header>

      <div className="upload-layout">
        <div className="upload-panel knowledge-panel">
          <div className="knowledge-form">
            <label className="knowledge-form__label" htmlFor="kb-select">
              {t.uploadSelectKbLabel}
            </label>
            <select
              id="kb-select"
              className="knowledge-form__select"
              value={resolvedKbId}
              onChange={onKnowledgeBaseChange}
              disabled={uploading || deleting}
            >
              {knowledgeBases.length === 0 ? (
                <option value="">{t.uploadNoKb}</option>
              ) : (
                knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div
            className={[
              'upload-dropzone',
              dragOver && kbReady ? 'upload-dropzone--active' : '',
              !kbReady ? 'upload-dropzone--disabled' : '',
              uploading ? 'upload-dropzone--uploading' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="region"
            aria-label={t.uploadTitle}
            aria-disabled={dropzoneDisabled}
            onDragOver={(event) => {
              if (dropzoneDisabled) {
                return
              }
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <UploadIcon />
            <p className="upload-dropzone__hint">
              {kbReady ? t.uploadDropHint : t.uploadDropDisabled}
            </p>
            <div className="upload-dropzone__formats" aria-label={t.uploadFormats}>
              {FORMAT_LABELS.map((label) => (
                <span key={label} className="upload-format-chip">
                  {label}
                </span>
              ))}
            </div>
            <label
              className="upload-dropzone__button"
              htmlFor={dropzoneDisabled ? undefined : fileInputId}
              aria-disabled={dropzoneDisabled}
            >
              {uploading ? t.uploading : t.uploadChooseFile}
              <input
                id={fileInputId}
                type="file"
                hidden
                onChange={onFileInput}
                disabled={dropzoneDisabled}
                accept={ALLOWED_EXTENSIONS.join(',')}
              />
            </label>
          </div>

          {uploading ? (
            <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="upload-progress__track">
                <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="upload-progress__label">{progress}%</span>
            </div>
          ) : null}

          {error ? (
            <div className="knowledge-error upload-panel__error" role="alert">
              {error}
            </div>
          ) : null}
        </div>

        <section className="upload-documents knowledge-panel" aria-labelledby="upload-documents-title">
          <div className="upload-documents__header">
            <div className="upload-documents__heading">
              <h2 id="upload-documents-title">{t.uploadDocumentsTitle}</h2>
              {documents.length > 0 ? (
                <span className="upload-documents__count">{documents.length}</span>
              ) : null}
            </div>
            <button
              type="button"
              className="upload-documents__delete"
              disabled={selectedIds.size === 0 || deleting || !resolvedKbId}
              onClick={handleBatchDelete}
            >
              {deleting ? t.uploadDeleting : deleteLabel}
            </button>
          </div>

          {documentsError ? (
            <div className="knowledge-warning upload-documents__alert" role="alert">
              {documentsError}
            </div>
          ) : null}

          <div className="kb-table-wrap">
            {documentsLoading ? (
              <div className="upload-loading" aria-live="polite">
                <span className="upload-loading__label">{t.uploadLoadingDocuments}</span>
                <UploadSkeleton />
              </div>
            ) : documents.length === 0 ? (
              <div className="upload-empty">
                <DocumentEmptyIcon />
                <strong>{t.uploadDocumentsEmpty}</strong>
                <p>{t.uploadEmptyHint}</p>
              </div>
            ) : (
              <table className="kb-table upload-documents__table">
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        disabled={documents.length === 0 || deleting}
                        onChange={toggleSelectAll}
                        aria-label={t.uploadSelectAll}
                      />
                    </th>
                    <th scope="col">{t.uploadDocNameCol}</th>
                    <th scope="col">{t.uploadChunkCount}</th>
                    <th scope="col">{t.uploadUpdatedCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      ref={
                        Number(highlightDocumentId) === Number(document.id)
                          ? highlightRowRef
                          : null
                      }
                      data-document-id={document.id}
                      className={[
                        selectedIds.has(document.id) ? 'is-selected' : '',
                        Number(highlightDocumentId) === Number(document.id) ? 'is-highlighted' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(document.id)}
                          disabled={deleting}
                          onChange={() => toggleDocument(document.id)}
                          aria-label={document.fileName}
                        />
                      </td>
                      <td className="upload-documents__name">{document.fileName}</td>
                      <td>{document.chunkCount}</td>
                      <td>{formatDocumentTime(document.updatedAt, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <FeedbackModal
        open={feedbackModal.open}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        confirmLabel={t.modalOk}
        onClose={closeFeedbackModal}
      >
        {feedbackModal.detail?.lines?.length ? (
          <ul className="feedback-modal__meta">
            {feedbackModal.detail.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {feedbackModal.detail?.onReplace ? (
          <button type="button" className="feedback-modal__secondary" onClick={feedbackModal.detail.onReplace}>
            {t.uploadReplace}
          </button>
        ) : null}
      </FeedbackModal>
    </section>
  )
}
