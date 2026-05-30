import { useEffect, useState } from 'react'
import { listKnowledgeBases, uploadDocument } from '@/api/knowledge'
import { messages } from '@/i18n/messages'

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.doc']

function isAllowedFile(file) {
  const name = file.name.toLowerCase()
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export default function UploadDocument({ language }) {
  const t = messages[language]
  const [knowledgeBases, setKnowledgeBases] = useState([])
  const [selectedKbId, setSelectedKbId] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

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
    setResult(null)

    try {
      const response = await uploadDocument({
        file,
        knowledgeBaseId: Number(selectedKbId),
        replace,
        onProgress: setProgress,
      })
      setResult(response)
    } catch {
      setError(t.uploadFailed)
    } finally {
      setUploading(false)
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
          onChange={(event) => setSelectedKbId(event.target.value)}
          disabled={uploading}
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
          <input type="file" hidden onChange={onFileInput} disabled={uploading} />
        </label>
      </div>

      {uploading ? (
        <div className="upload-progress">
          <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      ) : null}

      {error ? <div className="knowledge-error">{error}</div> : null}

      {result ? (
        <section className="upload-result">
          <h2>{result.alreadyExists ? t.uploadExists : t.uploadSuccess}</h2>
          <p>{result.message}</p>
          <ul className="upload-result__meta">
            <li>{t.uploadDocId}: {result.documentId}</li>
            <li>{t.uploadLanguage}: {result.language}</li>
            <li>{t.uploadChunkCount}: {result.chunkCount}</li>
          </ul>

          {result.alreadyExists ? (
            <button
              type="button"
              className="upload-result__replace"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.onchange = (event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    handleUpload(file, true)
                  }
                }
                input.click()
              }}
            >
              {t.uploadReplace}
            </button>
          ) : null}

          {result.chunksPreview?.length > 0 ? (
            <table className="upload-preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.uploadPreviewCol}</th>
                </tr>
              </thead>
              <tbody>
                {result.chunksPreview.map((chunk, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{chunk.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
