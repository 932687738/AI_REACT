import { useEffect, useState } from 'react'
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBases,
  updateKnowledgeBase,
} from '@/api/knowledge'
import { messages } from '@/i18n/messages'

const EMPTY_FORM = { name: '', description: '' }

export default function KnowledgeBaseManager({ language }) {
  const t = messages[language]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)

  async function loadItems() {
    setLoading(true)
    setError('')
    try {
      const data = await listKnowledgeBases()
      setItems(data)
    } catch {
      setError(t.kbLoadFailed)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError(t.kbNameRequired)
      return
    }

    setError('')
    try {
      if (editingId) {
        await updateKnowledgeBase(editingId, form)
      } else {
        await createKnowledgeBase(form)
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      await loadItems()
    } catch {
      setError(t.kbSaveFailed)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t.kbDeleteConfirm)) {
      return
    }
    try {
      await deleteKnowledgeBase(id)
      if (editingId === id) {
        setEditingId(null)
        setForm(EMPTY_FORM)
      }
      await loadItems()
    } catch {
      setError(t.kbDeleteFailed)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({ name: item.name, description: item.description || '' })
  }

  return (
    <section className="knowledge-screen">
      <header className="knowledge-screen__header">
        <h1>{t.kbManagerTitle}</h1>
        <p>{t.kbManagerSubtitle}</p>
      </header>

      <form className="kb-form" onSubmit={handleSubmit}>
        <input
          className="kb-form__input"
          placeholder={t.kbNamePlaceholder}
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="kb-form__input"
          placeholder={t.kbDescPlaceholder}
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
        <div className="kb-form__actions">
          <button type="submit" className="kb-form__submit">
            {editingId ? t.kbUpdate : t.kbCreate}
          </button>
          {editingId ? (
            <button
              type="button"
              className="kb-form__cancel"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_FORM)
              }}
            >
              {t.kbCancel}
            </button>
          ) : null}
        </div>
      </form>

      {error ? <div className="knowledge-error">{error}</div> : null}

      <div className="kb-table-wrap">
        {loading ? (
          <div className="skills-empty">{t.streamingLabel}</div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t.kbNameCol}</th>
                <th>{t.kbDescCol}</th>
                <th>{t.kbActionsCol}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4}>{t.kbEmpty}</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td className="kb-table__actions">
                      <button type="button" onClick={() => startEdit(item)}>
                        {t.kbEdit}
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)}>
                        {t.kbDelete}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
