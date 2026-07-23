import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Home as HomeIcon,
  LoaderCircle,
  Plus,
  ReceiptText,
  Sparkles,
  Trash2,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

export const Route = createFileRoute('/')({ component: Home })

type Expense = {
  id: number
  month: string
  category: string
  name: string
  plannedCents: number
  actualCents: number
  notes: string
}

type ExpenseForm = Omit<Expense, 'id' | 'plannedCents' | 'actualCents'> & {
  id?: number
  planned: string
  actual: string
}

const categories = [
  'Rent',
  'Electricity',
  'School fees',
  'Maid fees',
  'Transport',
  'Grocery',
  'Shopping',
  'Activities',
  'Healthcare',
  'Subscriptions',
  'Food',
  'Other',
]

const categoryColors: Record<string, string> = {
  Rent: '#d85d3b',
  Electricity: '#dc9d28',
  'School fees': '#6457a6',
  'Maid fees': '#a16846',
  Transport: '#387780',
  Grocery: '#558b6e',
  Shopping: '#b55478',
  Activities: '#4f6d9a',
  Healthcare: '#b04b4b',
  Subscriptions: '#68737d',
  Food: '#F59E0B',
  Other: '#8a765d',
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KWD',
  maximumFractionDigits: 3,
})

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month: string, format: 'short' | 'long' = 'long') {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: format === 'short' ? 'short' : 'long',
    year: 'numeric',
  }).format(new Date(year, monthNumber - 1, 1))
}

function amountToCents(value: string) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0
}

function emptyForm(month: string): ExpenseForm {
  return { month, category: 'Rent', name: '', planned: '', actual: '', notes: '' }
}

function Home() {
  const months = useMemo(() => {
    const start = new Date()
    start.setDate(1)
    return Array.from({ length: 36 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1)
      return toMonthKey(date)
    })
  }, [])
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [form, setForm] = useState<ExpenseForm>(() => emptyForm(months[0]))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetch(`/api/expenses?start=${months[0]}&end=${months[35]}`)
        if (!response.ok) throw new Error('Unable to load your expense plan.')
        setExpenses((await response.json()) as Expense[])
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Unable to load your expense plan.')
      } finally {
        setLoading(false)
      }
    }
    void loadExpenses()
  }, [months])

  const selectedExpenses = expenses.filter((expense) => expense.month === selectedMonth)
  const selectedPlanned = selectedExpenses.reduce((sum, expense) => sum + expense.plannedCents, 0)
  const selectedActual = selectedExpenses.reduce((sum, expense) => sum + expense.actualCents, 0)
  const rollingPlanned = expenses.reduce((sum, expense) => sum + expense.plannedCents, 0)
  const rollingActual = expenses.reduce((sum, expense) => sum + expense.actualCents, 0)
  const selectedIndex = months.indexOf(selectedMonth)
  const actualRatio = selectedPlanned ? Math.min((selectedActual / selectedPlanned) * 100, 100) : 0

  const categoryTotals = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        value: selectedExpenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + expense.actualCents, 0),
      }))
      .filter((item) => item.value > 0)
      .sort((left, right) => right.value - left.value)
  }, [selectedExpenses])

  const openNewExpense = (category = 'Rent') => {
    setForm({ ...emptyForm(selectedMonth), category })
    setError('')
    setDrawerOpen(true)
  }

  const openEditExpense = (expense: Expense) => {
    setForm({
      id: expense.id,
      month: expense.month,
      category: expense.category,
      name: expense.name,
      planned: (expense.plannedCents / 100).toString(),
      actual: (expense.actualCents / 100).toString(),
      notes: expense.notes,
    })
    setError('')
    setDrawerOpen(true)
  }

  const saveExpense = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Add a name for this expense.')
      return
    }

    setSaving(true)
    setError('')
    const payload = {
      id: form.id,
      month: form.month,
      category: form.category,
      name: form.name,
      plannedCents: amountToCents(form.planned),
      actualCents: amountToCents(form.actual),
      notes: form.notes,
    }

    try {
      const response = await fetch('/api/expenses', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as Expense | { error: string }
      if (!response.ok) throw new Error('error' in result ? result.error : 'Unable to save this expense.')

      const saved = result as Expense
      setExpenses((current) =>
        form.id ? current.map((expense) => (expense.id === saved.id ? saved : expense)) : [...current, saved],
      )
      setSelectedMonth(saved.month)
      setDrawerOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save this expense.')
    } finally {
      setSaving(false)
    }
  }

  const deleteExpense = async (id: number) => {
    if (!window.confirm('Remove this expense from the month?')) return
    try {
      const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to remove this expense.')
      setExpenses((current) => current.filter((expense) => expense.id !== id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to remove this expense.')
    }
  }

  const moveMonth = (direction: number) => {
    const next = Math.max(0, Math.min(months.length - 1, selectedIndex + direction))
    setSelectedMonth(months[next])
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><TrendingUp size={21} /></div>
          <div><strong>THREEFOLD</strong><span>36-month household planner</span></div>
        </div>
        <div className="horizon-pill"><CalendarDays size={16} /> {monthLabel(months[0], 'short')} — {monthLabel(months[35], 'short')}</div>
        <button className="primary-button compact" onClick={() => openNewExpense()}><Plus size={17} /> Add expense</button>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR ROLLING MONEY MAP</div>
          <h1>See the month.<br /><em>Shape the years.</em></h1>
          <p>Plan the essentials, record what you spend, and keep the next 36 months in view.</p>
        </div>
        <div className="hero-summary">
          <div className="summary-label">36-month outlook</div>
          <div className="summary-total">{money.format(rollingPlanned / 100)}</div>
          <div className="summary-meta"><span>planned</span><span>{money.format(rollingActual / 100)} recorded</span></div>
          <div className="mini-lines">
            {months.slice(0, 12).map((month) => {
              const total = expenses.filter((expense) => expense.month === month).reduce((sum, expense) => sum + expense.plannedCents, 0)
              const max = Math.max(...months.map((candidate) => expenses.filter((expense) => expense.month === candidate).reduce((sum, expense) => sum + expense.plannedCents, 0)), 1)
              return <span key={month} style={{ height: `${Math.max(8, (total / max) * 100)}%` }} />
            })}
          </div>
        </div>
      </section>

      <section className="month-navigator">
        <button aria-label="Previous month" disabled={selectedIndex === 0} onClick={() => moveMonth(-1)}><ChevronLeft /></button>
        <div className="month-track">
          {months.map((month, index) => {
            const total = expenses.filter((expense) => expense.month === month).reduce((sum, expense) => sum + expense.plannedCents, 0)
            return (
              <button key={month} className={selectedMonth === month ? 'month-chip active' : 'month-chip'} onClick={() => setSelectedMonth(month)}>
                <span>{index === 0 ? 'NOW' : month.slice(0, 4)}</span>
                <strong>{monthLabel(month).split(' ')[0].slice(0, 3)}</strong>
                <small>{total ? money.format(total / 100) : '—'}</small>
              </button>
            )
          })}
        </div>
        <button aria-label="Next month" disabled={selectedIndex === months.length - 1} onClick={() => moveMonth(1)}><ChevronRight /></button>
      </section>

      <section className="dashboard-grid">
        <div className="main-column">
          <div className="section-heading">
            <div><span className="section-kicker">MONTH {selectedIndex + 1} OF 36</span><h2>{monthLabel(selectedMonth)}</h2></div>
            <button className="outline-button" onClick={() => openNewExpense()}><Plus size={16} /> New item</button>
          </div>

          <div className="stat-grid">
            <article className="stat-card terracotta"><div className="stat-icon"><WalletCards /></div><span>Planned</span><strong>{money.format(selectedPlanned / 100)}</strong><small>{selectedExpenses.length} expense {selectedExpenses.length === 1 ? 'item' : 'items'}</small></article>
            <article className="stat-card moss"><div className="stat-icon"><ReceiptText /></div><span>Recorded</span><strong>{money.format(selectedActual / 100)}</strong><small>{selectedActual <= selectedPlanned ? <><ArrowDownRight /> Within plan</> : <><ArrowUpRight /> Over plan</>}</small></article>
            <article className="stat-card ink"><div className="stat-icon"><CircleDollarSign /></div><span>Remaining</span><strong>{money.format((selectedPlanned - selectedActual) / 100)}</strong><small>{Math.round(actualRatio)}% of plan used</small></article>
          </div>

          <article className="ledger-card">
            <div className="ledger-header"><div><span className="section-kicker">MONTHLY LEDGER</span><h3>Expense details</h3></div><div className="ledger-total">Actual <strong>{money.format(selectedActual / 100)}</strong></div></div>
            {loading ? (
              <div className="state-panel"><LoaderCircle className="spinner" /><h3>Opening your ledger</h3><p>Gathering the next 36 months.</p></div>
            ) : selectedExpenses.length === 0 ? (
              <div className="state-panel empty-state"><div className="empty-icon"><HomeIcon /></div><h3>This month is a clean page</h3><p>Start with a regular cost such as rent, grocery, electricity, or school fees.</p><button className="primary-button" onClick={() => openNewExpense()}><Plus size={17} /> Add first expense</button></div>
            ) : (
              <div className="expense-list">
                {selectedExpenses.map((expense) => {
                  const difference = expense.plannedCents - expense.actualCents
                  return (
                    <div className="expense-row" key={expense.id}>
                      <div className="category-dot" style={{ background: categoryColors[expense.category] ?? categoryColors.Other }} />
                      <div className="expense-name"><strong>{expense.name}</strong><span>{expense.category}{expense.notes ? ` · ${expense.notes}` : ''}</span></div>
                      <div className="expense-number"><span>Planned</span><strong>{money.format(expense.plannedCents / 100)}</strong></div>
                      <div className="expense-number"><span>Actual</span><strong>{money.format(expense.actualCents / 100)}</strong></div>
                      <div className={difference >= 0 ? 'variance good' : 'variance over'}>{difference >= 0 ? <Check size={14} /> : <ArrowUpRight size={14} />}{difference >= 0 ? `${money.format(difference / 100)} left` : `${money.format(Math.abs(difference) / 100)} over`}</div>
                      <div className="row-actions"><button aria-label={`Edit ${expense.name}`} onClick={() => openEditExpense(expense)}><Edit3 size={16} /></button><button aria-label={`Delete ${expense.name}`} onClick={() => void deleteExpense(expense.id)}><Trash2 size={16} /></button></div>
                    </div>
                  )
                })}
              </div>
            )}
          </article>
        </div>

        <aside className="side-column">
          <article className="progress-card">
            <span className="section-kicker">MONTHLY PACE</span><div className="progress-heading"><h3>{Math.round(actualRatio)}%</h3><span>used</span></div>
            <div className="progress-track"><span style={{ width: `${actualRatio}%` }} /></div>
            <p>{selectedPlanned ? `${money.format(Math.abs(selectedPlanned - selectedActual) / 100)} ${selectedActual <= selectedPlanned ? 'still available' : 'above your plan'}.` : 'Add planned amounts to track your pace.'}</p>
          </article>

          <article className="category-card">
            <div className="card-title-row"><div><span className="section-kicker">WHERE IT WENT</span><h3>By category</h3></div><span>{categoryTotals.length}</span></div>
            {categoryTotals.length ? categoryTotals.map((item) => (
              <div className="category-line" key={item.category}><i style={{ background: categoryColors[item.category] ?? categoryColors.Other }} /><span>{item.category}</span><strong>{money.format(item.value / 100)}</strong></div>
            )) : <p className="muted-copy">Recorded spending appears here by category.</p>}
          </article>

          <article className="quick-card">
            <span className="section-kicker">QUICK ADD</span><h3>Common expenses</h3><div className="quick-grid">{categories.slice(0, 8).map((category) => <button key={category} onClick={() => openNewExpense(category)}><Plus size={13} /> {category}</button>)}</div>
          </article>
        </aside>
      </section>

      {drawerOpen && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false) }}>
          <aside className="expense-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <div className="drawer-top"><div><span className="section-kicker">{form.id ? 'UPDATE RECORD' : 'ADD TO YOUR PLAN'}</span><h2 id="drawer-title">{form.id ? 'Edit expense' : 'New expense'}</h2></div><button aria-label="Close" onClick={() => setDrawerOpen(false)}><X /></button></div>
            <form onSubmit={(event) => void saveExpense(event)}>
              <label>Month<select value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })}>{months.map((month) => <option value={month} key={month}>{monthLabel(month)}</option>)}</select></label>
              <label>Expense name<input autoFocus placeholder="e.g. Apartment rent" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
              <div className="amount-grid"><label>Planned amount<div className="money-input"><span>$</span><input type="number" min="0" step="0.01" placeholder="0.00" value={form.planned} onChange={(event) => setForm({ ...form, planned: event.target.value })} /></div></label><label>Actual amount<div className="money-input"><span>$</span><input type="number" min="0" step="0.01" placeholder="0.00" value={form.actual} onChange={(event) => setForm({ ...form, actual: event.target.value })} /></div></label></div>
              <label>Notes <span className="optional">Optional</span><textarea rows={3} placeholder="Payment date, reminder, or detail" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              {error && <div className="form-error">{error}</div>}
              <div className="drawer-actions"><button type="button" className="outline-button" onClick={() => setDrawerOpen(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spinner" size={17} /> : <Check size={17} />}{saving ? 'Saving' : 'Save expense'}</button></div>
            </form>
          </aside>
        </div>
      )}
      {error && !drawerOpen && <button className="error-toast" onClick={() => setError('')}><span>{error}</span><X size={16} /></button>}
    </main>
  )
}
