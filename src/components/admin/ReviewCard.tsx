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
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <MoveTypeBadge type={event.type} />
        <ConfidenceBadge confidence={event.confidence} />
        <span className="text-xs text-muted-foreground ml-auto">
          Model: {event.aiModel}
        </span>
      </div>

      <h3 className="text-lg font-600 text-foreground">{person?.name ?? 'Unknown'}</h3>
      <div className="mt-1 text-sm text-card-foreground">
        {event.fromOrg && <span>{event.fromOrg}</span>}
        {event.fromOrg && event.toOrg && <span className="mx-2 text-muted-foreground">&rarr;</span>}
        {event.toOrg && <span>{event.toOrg}</span>}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-[0.625rem] font-600 tracking-[0.08em] uppercase text-muted-foreground">Signals</p>
        {event.signals.map((s, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">[{s.source}]</span> {s.description}
          </p>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[0.625rem] font-600 tracking-[0.08em] uppercase text-muted-foreground mb-1">AI Summary</p>
        {editing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-secondary border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none resize-none transition-colors duration-[var(--duration-fast)]"
          />
        ) : (
          <p className="text-sm text-card-foreground">{event.aiSummary}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handlePublish}
          disabled={acting}
          className="bg-success hover:brightness-110 disabled:opacity-50 text-white px-4 py-1.5 rounded-[var(--radius-md)] text-[0.8125rem] font-600 transition-all duration-[var(--duration-fast)]"
        >
          {editing ? 'Save & Publish' : 'Publish'}
        </button>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-secondary hover:bg-muted text-card-foreground px-4 py-1.5 rounded-[var(--radius-md)] text-[0.8125rem] font-600 transition-all duration-[var(--duration-fast)]"
          >
            Edit & Publish
          </button>
        )}
        <button
          onClick={handleDismiss}
          disabled={acting}
          className="text-muted-foreground hover:text-destructive px-4 py-1.5 rounded-[var(--radius-md)] text-[0.8125rem] transition-colors duration-[var(--duration-fast)] ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
