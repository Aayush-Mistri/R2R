import { useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Modal from '../components/ui/Modal.jsx';
import Field from '../components/ui/Field.jsx';
import FormError from '../components/ui/FormError.jsx';
import ColorSwatches from '../components/ui/ColorSwatches.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { toast } from '../components/ui/toast.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../lib/api.js';
import { CATEGORY_COLORS, EMOJI_CHOICES } from '../lib/constants.js';

const SECTIONS = [
  { key: 'expense', title: 'Expense categories', hint: 'Where your money goes' },
  { key: 'income', title: 'Income categories', hint: 'Where it comes from' },
];

const emptyForm = (type = 'expense') => ({
  name: '',
  type,
  color: CATEGORY_COLORS[0],
  icon: '🏷️',
});

export default function Categories() {
  const { categories, reload } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = (type = 'expense') => {
    setEditing(null);
    setForm(emptyForm(type));
    setError('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    setError('');
    setModalOpen(true);
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Give the category a name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        color: form.color,
        icon: form.icon,
      };
      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload);
        toast.success('Category updated', {
          description: `${payload.name} · ${payload.type}`,
        });
      } else {
        await api.post('/categories', payload);
        toast.success('Category added', {
          description: `${payload.name} · ${payload.type}`,
        });
      }
      await reload();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${toDelete.id}`);
      await reload();
      toast.success('Category deleted', { description: toDelete.name });
      setToDelete(null);
    } catch (err) {
      toast.error('Could not delete category', { description: err.message });
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        subtitle="Categories power the breakdown on your dashboard."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => openNew('expense')}>
            <Plus className="h-4 w-4" />
            Add category
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {SECTIONS.map((section) => {
          const list = categories[section.key] || [];
          return (
            <section key={section.key} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <h2 className="section-title">{section.title}</h2>
                  <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {section.hint} · {list.length}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openNew(section.key)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              {list.length === 0 ? (
                <div className="border-t border-zinc-100 px-5 py-10 text-center dark:border-zinc-800/80">
                  <Tags className="mx-auto h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    No {section.key} categories yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800/70 dark:border-zinc-800/80">
                  {list.map((category) => (
                    <li key={category.id} className="group flex items-center gap-3 px-5 py-2.5">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm"
                        style={{ backgroundColor: `${category.color}1f` }}
                        aria-hidden="true"
                      >
                        {category.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-100">
                        {category.name}
                      </span>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <div className="flex items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(category)}
                          className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="category-form" className="btn btn-primary" disabled={saving}>
              {saving && <Spinner />}
              {editing ? 'Save changes' : 'Add category'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSave} className="space-y-4" noValidate>
          <FormError message={error} />

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
            {['expense', 'income'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => update('type', type)}
                className={`rounded-md py-1.5 text-sm font-medium capitalize transition ${
                  form.type === type
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Field label="Name" htmlFor="category-name">
            <input
              id="category-name"
              className="input"
              placeholder="e.g. Subscriptions"
              maxLength={40}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoFocus
            />
          </Field>

          <div>
            <span className="label">Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update('icon', emoji)}
                  aria-label={`Use ${emoji}`}
                  aria-pressed={form.icon === emoji}
                  className={`grid h-8 w-8 place-items-center rounded-md text-base transition ${
                    form.icon === emoji
                      ? 'bg-zinc-900 ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:bg-zinc-100 dark:ring-zinc-100 dark:ring-offset-zinc-950'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Color</span>
            <ColorSwatches value={form.color} onChange={(color) => update('color', color)} />
          </div>

          {editing && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              The type can&apos;t change once the category has transactions.
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        message={
          toDelete
            ? `"${toDelete.name}" will be removed. Categories in use by transactions can't be deleted.`
            : ''
        }
        loading={deleting}
      />
    </div>
  );
}
