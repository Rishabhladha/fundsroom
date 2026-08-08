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
    <div
      className="rounded-lg border border-steel bg-ink-raised"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-steel"
      >
        <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
          <MessageSquarePlus size={15} className="text-signal-amber" />
          Follow-up History
          {followUps.length > 0 && (
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded bg-steel text-slate-text"
            >
              {followUps.length}
            </span>
          )}
        </h3>
      </div>

      {/* Add note form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b border-steel">
          {error && (
            <div className="mb-2 text-xs px-3 py-2 rounded bg-rust-alert/10 text-rust-alert border border-rust-alert/30">
              {error}
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log call outcome, next meeting, or order update…"
            rows={2}
            className="field-input mb-2"
            style={{ resize: 'vertical' }}
            id="follow-up-note"
          />
          <button
            type="submit"
            disabled={!note.trim() || isPending}
            className="btn-primary text-xs"
          >
            {isPending ? 'Saving…' : 'Log Note'}
          </button>
        </form>
      )}

      {/* Timeline entries */}
      <div className="p-5 space-y-0">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 bg-steel rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-steel rounded w-32" />
                  <div className="h-3 bg-steel/50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="py-6 text-center">
            <MessageSquarePlus size={28} className="mx-auto mb-2 text-steel" />
            <p className="text-sm italic text-slate-text/50">
              No follow-up notes yet — log interaction details above.
            </p>
          </div>
        ) : (
          followUps.map((fu, i) => (
            <div key={fu.id} className="flex gap-3 group">
              {/* Timeline track */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-steel border-2 border-signal-amber"
                >
                  <User size={10} className="text-signal-amber" />
                </div>
                {i < followUps.length - 1 && (
                  <div className="w-px flex-1 mt-1 mb-1 bg-steel" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{fu.created_by_name}</span>
                    <span className="text-xs font-mono text-slate-text/50 flex items-center gap-1">
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
                      className="opacity-0 group-hover:opacity-100 text-rust-alert hover:bg-rust-alert/10 p-1 rounded transition-all"
                      title="Delete note"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-text/90">
                  {fu.note}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
