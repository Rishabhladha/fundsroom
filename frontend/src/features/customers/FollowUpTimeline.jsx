import { useState } from 'react';
import { useFollowUps, useAddFollowUp, useDeleteFollowUp } from './useCustomers';
import { MessageSquarePlus, User, Clock, Trash2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FollowUpTimeline — chronological log of follow-up notes for a customer
// ─────────────────────────────────────────────────────────────────────────────

export default function FollowUpTimeline({ customerId, canAdd }) {
  const { data, isLoading } = useFollowUps(customerId);
  const { mutate: addNote, isPending } = useAddFollowUp(customerId);
  const { mutate: deleteNote } = useDeleteFollowUp(customerId);

  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const followUps = data?.data || [];

  function handleAdd(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setError(null);
    addNote(note.trim(), {
      onSuccess: () => setNote(''),
      onError: (err) => setError(err.message || 'Failed to add note'),
    });
  }

  function handleDelete(followUpId) {
    if (window.confirm('Delete this follow-up note?')) {
      deleteNote(followUpId);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & counter */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--edge)' }}>
        <h3 className="font-display font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--ink-dark)' }}>
          <MessageSquarePlus size={16} style={{ color: 'var(--violet)' }} />
          Follow-up Log
          {followUps.length > 0 && (
            <span
              className="font-mono text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}
            >
              {followUps.length}
            </span>
          )}
        </h3>
      </div>

      {/* Add note form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="p-3.5 rounded-xl space-y-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--edge)' }}>
          {error && (
            <div className="text-xs px-3 py-2 rounded-lg font-medium" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log call outcome, next meeting, or dispatch update…"
            rows={2}
            className="field-input text-xs"
            style={{ resize: 'vertical' }}
            id="follow-up-note"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!note.trim() || isPending}
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              {isPending ? 'Saving…' : 'Log Note'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline entries */}
      <div className="pt-2 space-y-0">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full" style={{ background: 'var(--edge)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-32" style={{ background: 'var(--edge)' }} />
                  <div className="h-3 rounded w-full" style={{ background: 'var(--surface-2)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquarePlus size={26} className="mx-auto mb-2 opacity-40" style={{ color: 'var(--ink-muted)' }} />
            <p className="text-xs italic" style={{ color: 'var(--ink-muted)' }}>
              No follow-up notes recorded yet. Use the log box above to record notes.
            </p>
          </div>
        ) : (
          followUps.map((fu, i) => (
            <div key={fu.id} className="flex gap-3 group">
              {/* Timeline track */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--violet-light)', border: '1.5px solid var(--violet)', color: 'var(--violet)' }}
                >
                  <User size={11} />
                </div>
                {i < followUps.length - 1 && (
                  <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--edge)' }} />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--ink-dark)' }}>{fu.created_by_name}</span>
                    <span className="text-[11px] font-mono flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                      <Clock size={10} />
                      {new Date(fu.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {canAdd && (
                    <button
                      type="button"
                      onClick={() => handleDelete(fu.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                      style={{ color: '#EF4444' }}
                      title="Delete note"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--edge)', color: 'var(--ink-mid)' }}>
                  {fu.note}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
