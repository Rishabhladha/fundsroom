import { useState } from 'react';
import { useFollowUps, useAddFollowUp } from './useCustomers';
import { MessageSquarePlus, User, Clock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FollowUpTimeline — chronological log of follow-up notes for a customer
// ─────────────────────────────────────────────────────────────────────────────

export default function FollowUpTimeline({ customerId, canAdd }) {
  const { data, isLoading } = useFollowUps(customerId);
  const { mutate: addNote, isPending } = useAddFollowUp(customerId);

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

  return (
    <div
      className="rounded-lg"
      style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: '#2B3240' }}
      >
        <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
          <MessageSquarePlus size={15} className="text-signal-amber" />
          Follow-up Timeline
          {followUps.length > 0 && (
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#2B3240', color: '#6B7280' }}
            >
              {followUps.length}
            </span>
          )}
        </h3>
      </div>

      {/* Add note form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b" style={{ borderColor: '#2B3240' }}>
          {error && (
            <div className="mb-2 text-xs px-3 py-2 rounded" style={{ backgroundColor: 'rgba(196,80,31,0.1)', color: '#C4501F' }}>
              {error}
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log a call, meeting, or note…"
            rows={2}
            className="field-input mb-2"
            style={{ resize: 'vertical' }}
            id="follow-up-note"
          />
          <button
            type="submit"
            disabled={!note.trim() || isPending}
            className="btn-primary text-sm"
          >
            {isPending ? 'Adding…' : 'Add Note'}
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
            <MessageSquarePlus size={28} className="mx-auto mb-3" style={{ color: '#2B3240' }} />
            <p className="text-sm italic" style={{ color: '#4A5568' }}>
              No follow-up notes yet — log the first interaction above.
            </p>
          </div>
        ) : (
          followUps.map((fu, i) => (
            <div key={fu.id} className="flex gap-3">
              {/* Timeline track */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#2B3240', border: '2px solid #F2A93B' }}
                >
                  <User size={10} style={{ color: '#F2A93B' }} />
                </div>
                {i < followUps.length - 1 && (
                  <div className="w-px flex-1 mt-1 mb-1" style={{ backgroundColor: '#2B3240' }} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 flex-1 ${i === followUps.length - 1 ? '' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">{fu.created_by_name}</span>
                  <span className="text-xs font-mono flex items-center gap-1" style={{ color: '#4A5568' }}>
                    <Clock size={10} />
                    {new Date(fu.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#C7CCD6' }}>
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
