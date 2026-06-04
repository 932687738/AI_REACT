function SidebarModuleDropdown({ title, expanded, onToggle, hasActiveChild, children }) {
  return (
    <div className={`sidebar__module sidebar__module--dropdown ${expanded ? 'is-expanded' : ''}`}>
      <button
        type="button"
        className={`sidebar__module-trigger ${hasActiveChild ? 'is-active' : ''}`}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="sidebar__module-trigger-title">{title}</span>
        <span className={`sidebar__module-trigger-arrow ${expanded ? 'is-expanded' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {expanded ? <div className="sidebar__menu sidebar__menu--nested">{children}</div> : null}
    </div>
  )
}

export default SidebarModuleDropdown
