import { useState } from 'react';
import type { MoveEvent, Person } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { publishMoveEvent, dismissMoveEvent } from '../../services/firestore';

interface Props {
  event: MoveEvent;
  person?: Person;
}

export function ReviewCard({ event, person }: Props) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(event.aiSummary);
  const [acting, setActing] = useState(false);

  const handlePublish = async () => {
    setActing(true);
    await publishMoveEvent(event.id, editing ? summary : undefined);
    setActing(false);
  };

  const handleDismiss = async () => {
    setActing(true);
    await dismissMoveEvent(event.id);
    setActing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MoveTypeBadge type={event.type} />
        <ConfidenceBadge confidence={event.confidence} />
        <span className="text-xs text-gray-500 ml-auto">
          Model: {event.aiModel}
        </span>
      </div>

      <h3 className="text-lg font-semibold">{person?.name ?? 'Unknown'}</h3>
      <div className="mt-1 text-sm text-gray-400">
        {event.fromOrg && <span>{event.fromOrg}</span>}
        {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
        {event.toOrg && <span>{event.toOrg}</span>}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-gray-400">Signals:</p>
        {event.signals.map((s, i) => (
          <p key={i} className="text-xs text-gray-500">
            [{s.source}] {s.description}
          </p>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-400 mb-1">AI Summary:</p>
        {editing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
          />
        ) : (
          <p className="text-sm text-gray-300">{event.aiSummary}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handlePublish}
          disabled={acting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {editing ? 'Save & Publish' : 'Publish'}
        </button>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Edit & Publish
          </button>
        )}
        <button
          onClick={handleDismiss}
          disabled={acting}
          className="text-gray-500 hover:text-red-400 px-4 py-1.5 rounded-lg text-sm transition-colors ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
