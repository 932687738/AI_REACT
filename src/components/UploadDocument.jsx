import { useCallback, useEffect, useState } from 'react'
import {
  batchDeleteDocuments,
  listDocuments,
  listKnowledgeBases,
  uploadDocument,
} from '@/api/knowledge'
import FeedbackModal from '@/components/FeedbackModal'
import { messages } from '@/i18n/messages'

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.doc']

const EMPTY_MODAL = {
  open: false,
  title: '',
  message: '',
  variant: 'success',
  detail: null,
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

export default function UploadDocument({ language }) {
  const t = messages[language]
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
    if (!selectedKbId) {
      setDocuments([])
      setSelectedIds(new Set())
      return true
    }
    setDocumentsLoading(true)
    setDocumentsError('')
    try {
      const data = await listDocuments(Number(selectedKbId))
      setDocuments(data)
      setSelectedIds(new Set())
      return true
    } catch {
      setDocumentsError(t.uploadLoadDocumentsFailed)
      return false
    } finally {
      setDocumentsLoading(false)
    }
  }, [selectedKbId, t.uploadLoadDocumentsFailed])

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
    if (!file || !selectedKbId) {
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
        knowledgeBaseId: Number(selectedKbId),
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
    if (selectedIds.size === 0 || !selectedKbId) {
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
        knowledgeBaseId: Number(selectedKbId),
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
  }

  return (
    <section className="knowledge-screen">
      <header className="knowledge-screen__header">
        <h1>{t.uploadTitle}</h1>
        <p>{t.uploadSubtitle}</p>
      </header>

      <div className="knowledge-form">
        <label className="knowledge-form__label" htmlFor="kb-select">
          {t.uploadSelectKbLabel}
        </label>
        <select
          id="kb-select"
          className="knowledge-form__select"
          value={selectedKbId}
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
        className={`upload-dropzone ${dragOver ? 'upload-dropzone--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p>{t.uploadDropHint}</p>
        <p className="upload-dropzone__formats">{t.uploadFormats}</p>
        <label className="upload-dropzone__button">
          {uploading ? t.uploading : t.uploadChooseFile}
          <input type="file" hidden onChange={onFileInput} disabled={uploading || deleting} />
        </label>
      </div>

      {uploading ? (
        <div className="upload-progress">
          <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      ) : null}

      <section className="upload-documents">
        <div className="upload-documents__header">
          <h2>{t.uploadDocumentsTitle}</h2>
          <button
            type="button"
            className="upload-documents__delete"
            disabled={selectedIds.size === 0 || deleting || !selectedKbId}
            onClick={handleBatchDelete}
          >
            {deleting ? t.uploadDeleting : t.uploadBatchDelete}
          </button>
        </div>

        <div className="kb-table-wrap">
          {documentsLoading ? (
            <div className="skills-empty">{t.streamingLabel}</div>
          ) : (
            <table className="kb-table upload-documents__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      disabled={documents.length === 0 || deleting}
                      onChange={toggleSelectAll}
                      aria-label={t.uploadSelectAll}
                    />
                  </th>
                  <th>{t.uploadDocNameCol}</th>
                  <th>{t.uploadChunkCount}</th>
                  <th>{t.uploadUpdatedCol}</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={4}>{t.uploadDocumentsEmpty}</td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(document.id)}
                          disabled={deleting}
                          onChange={() => toggleDocument(document.id)}
                          aria-label={document.fileName}
                        />
                      </td>
                      <td>{document.fileName}</td>
                      <td>{document.chunkCount}</td>
                      <td>{formatDocumentTime(document.updatedAt, language)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {error ? <div className="knowledge-error">{error}</div> : null}
      {documentsError ? <div className="knowledge-warning">{documentsError}</div> : null}

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
