# Modern UI/UX Examples for Pages

Complete examples showing how to redesign existing pages with modern patterns.

---

## 🏠 Dashboard Hero Section

Replace the current dashboard header with this modern hero:

```tsx
// At the top of page.tsx
export default function DashboardPage() {
  // ... existing code ...

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - Add this */}
      <motion.div
        className="relative overflow-hidden rounded-3xl mb-8 p-12"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(59,130,246,0.1) 100%)"
        }}
      >
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "var(--accent)", filter: "blur(80px)" }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Good {greetingTime}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
              You're crushing it. {completedToday} completed today, {overdueTasks.length} overdue.
            </p>
          </motion.div>

          {/* Quick action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-3 mt-6"
          >
            <ModernButton variant="primary" size="md" icon="🔥">
              New Task
            </ModernButton>
            <ModernButton variant="secondary" size="md" icon="🧠">
              New Note
            </ModernButton>
            <ModernButton variant="secondary" size="md" icon="⚡">
              New Idea
            </ModernButton>
          </motion.div>
        </div>
      </motion.div>

      {/* PRODUCTIVITY SCORE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-3xl p-8 mb-8 backdrop-blur-xl border border-white/10"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: "var(--text-muted)" }}>Today's Productivity</p>
            <h2 className="text-4xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
              {productivityScore}%
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              {productivityScore >= 75 ? "🔥 Excellent work!" : "Keep pushing!"}
            </p>
          </div>

          {/* Circular progress */}
          <div className="relative w-32 h-32">
            <svg width="128" height="128" className="transform -rotate-90">
              <circle r="56" cx="64" cy="64" fill="none" stroke="#333" strokeWidth="8" opacity="0.3"/>
              <motion.circle
                r="56" cx="64" cy="64"
                fill="none" stroke="var(--accent)"
                strokeWidth="8"
                strokeDasharray="351"
                initial={{ strokeDashoffset: 351 }}
                animate={{ strokeDashoffset: 351 - (productivityScore / 100) * 351 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{productivityScore}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rest of existing dashboard code... */}
    </div>
  );
}
```

---

## 📋 Modern Task Card (FireList)

Redesign task cards with glassmorphism:

```tsx
// In FireList page or component
{sorted.map((task, i) => (
  <motion.div
    key={task.id}
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ delay: i * 0.05 }}
    className="group rounded-2xl p-5 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all"
    style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
    }}
    whileHover={{
      boxShadow: `0 20px 40px ${PRIORITY_STYLES[task.priority].color}33`,
      y: -2
    }}
  >
    <div className="flex items-center gap-4">
      <CircleCheckbox
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        size={24}
        color={task.completed ? "var(--accent)" : PRIORITY_STYLES[task.priority].color}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{
          color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
          textDecoration: task.completed ? "line-through" : "none"
        }}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <motion.span
            className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
            style={{
              background: PRIORITY_STYLES[task.priority].bg,
              color: PRIORITY_STYLES[task.priority].color
            }}
            whileHover={{ scale: 1.05 }}
          >
            {task.priority}
          </motion.span>

          {task.dueDate && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              📅 {new Date(task.dueDate + "T00:00:00").toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}

          {task.subtasks?.length > 0 && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              ✓ {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons with hover reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="flex gap-2 opacity-0 group-hover:opacity-100"
      >
        {task.status !== 'done' && (
          <motion.button
            className="p-2 rounded-lg"
            style={{
              background: "rgba(34,197,94,0.2)",
              color: "var(--accent)"
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ⏱️
          </motion.button>
        )}
        <motion.button
          className="p-2 rounded-lg"
          style={{
            background: "rgba(239,68,68,0.2)",
            color: "#ef4444"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => deleteTask(task.id)}
        >
          🗑️
        </motion.button>
      </motion.div>
    </div>
  </motion.div>
))}
```

---

## 🧠 Modern Note Card (Brain Dump)

Redesign note cards with color backgrounds and hover effects:

```tsx
// In braindump page
{sorted.map((note, i) => {
  const noteColor = getNoteColor(note.color || "default");

  return (
    <motion.div
      key={note.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: i * 0.05 }}
      className="rounded-3xl p-6 group cursor-pointer overflow-hidden backdrop-blur-sm"
      style={{
        background: noteColor,
        border: "1px solid rgba(255,255,255,0.1)"
      }}
      whileHover={{
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        y: -4
      }}
      onClick={() => setExpandedNote(isExpanded ? null : note.id)}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
        }}
        whileHover={{ opacity: 1 }}
        pointerEvents="none"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{CATEGORY_ICONS[note.category]}</span>
              <h3 className="text-lg font-semibold flex-1">{note.title}</h3>
            </div>
          </div>

          {/* Quick action buttons */}
          <motion.div
            className="flex gap-1 opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
          >
            <motion.button
              className="p-2 rounded-lg hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              📌
            </motion.button>
            <motion.button
              className="p-2 rounded-lg hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ⭐
            </motion.button>
            <motion.button
              className="p-2 rounded-lg hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✏️
            </motion.button>
          </motion.div>
        </div>

        {/* Content preview */}
        <p className={`text-sm mb-4 ${isExpanded ? "" : "line-clamp-3"}`}>
          {note.content}
        </p>

        {/* Checklist progress */}
        {note.checklist?.length > 0 && (
          <div className="mb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "rgba(255,255,255,0.4)" }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(note.checklist.filter(c => c.done).length / note.checklist.length) * 100}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {note.tags.map(tag => (
            <motion.span
              key={tag}
              className="text-[10px] px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.8)"
              }}
              whileHover={{ scale: 1.05 }}
            >
              #{tag}
            </motion.span>
          ))}
        </div>

        {/* Date */}
        <p className="text-[10px] mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
})}
```

---

## ⭐ Modern Ideas/Spark Cards

```tsx
// In spark page
{ideas.map((idea, i) => (
  <motion.div
    key={idea.id}
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ delay: i * 0.05 }}
    className="rounded-3xl p-6 group backdrop-blur-sm border border-white/5"
    style={{
      background: `linear-gradient(135deg, ${idea.color}22 0%, ${idea.color}11 100%)`
    }}
    whileHover={{
      boxShadow: `0 20px 40px ${idea.color}33`,
      y: -4,
      scale: 1.02
    }}
  >
    {/* Heat rating */}
    <div className="flex items-center justify-between mb-4">
      <motion.div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.span
            key={i}
            className="text-lg"
            whileHover={{ scale: 1.2 }}
            style={{
              opacity: i < idea.heat ? 1 : 0.3,
              animation: i < idea.heat ? "flicker 2s ease-in-out infinite" : "none"
            }}
          >
            🔥
          </motion.span>
        ))}
      </motion.div>

      <motion.span
        className="text-xs px-3 py-1 rounded-full font-semibold"
        style={{
          background: idea.color + "33",
          color: idea.color
        }}
      >
        {idea.status}
      </motion.span>
    </div>

    <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
    <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
      {idea.description}
    </p>

    {/* Action buttons */}
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <ModernButton variant="secondary" size="sm">
        Develop
      </ModernButton>
      <ModernButton variant="ghost" size="sm">
        Details
      </ModernButton>
    </div>
  </motion.div>
))}
```

---

## 📊 Modern Stats/Analytics

```tsx
// Add to any stats display
<motion.div
  className="grid grid-cols-2 md:grid-cols-4 gap-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {stats.map((stat, i) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="rounded-2xl p-6 backdrop-blur-sm border border-white/5 group"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
      }}
      whileHover={{
        boxShadow: "0 10px 30px rgba(34,197,94,0.1)",
        y: -2
      }}
    >
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        {stat.label}
      </p>

      <motion.h3
        className="text-3xl font-bold mt-2"
        style={{ color: stat.color }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
      >
        {stat.value}
      </motion.h3>

      <motion.p
        className="text-[10px] mt-2"
        style={{ color: "var(--text-muted)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 + 0.4 }}
      >
        {stat.trend} from last month
      </motion.p>
    </motion.div>
  ))}
</motion.div>
```

---

## 🎯 Implementation Order

1. **Update Auth Pages** (Login/Signup) ✅
2. **Dashboard Hero Section** - Replace header
3. **Update Task Cards** - Modern task display
4. **Style Note Cards** - Color-coded notes
5. **Redesign Idea Cards** - Heat rating visual
6. **Update Stats Display** - Animated metrics
7. **Modern Sidebar** - Navigation refresh
8. **Add Toast Notifications** - Success/error feedback
9. **Loading Skeletons** - Better async UX
10. **Page Transitions** - Smooth animations

---

## 📦 Component Copy-Paste Formula

All modern cards follow this pattern:

```tsx
<motion.div
  className="rounded-3xl p-6 backdrop-blur-sm border border-white/5 group"
  style={{
    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
  }}
  whileHover={{
    boxShadow: "0 20px 40px rgba(34,197,94,0.15)",
    y: -4
  }}
>
  {/* Content */}
</motion.div>
```

Change colors by adjusting the rgba values and shadows.

---

## 🚀 Performance Tips

1. Use `layout` on list items for smooth reordering
2. Use `whileHover` instead of CSS hover for 60fps animations
3. Keep `transition` durations under 500ms for snappiness
4. Use `scale` and `opacity` for better GPU performance
5. Lazy load images and heavy components

---

Ready to implement these? Start with the dashboard hero section above!
