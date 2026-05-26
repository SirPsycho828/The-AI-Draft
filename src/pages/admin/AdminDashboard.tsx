import { useMoveEvents } from '../../hooks/useMoveEvents';

export default function AdminDashboard() {
  const { events: pending } = useMoveEvents({ status: 'pending_review' });
  const { events: published } = useMoveEvents({ status: 'published', maxResults: 50 });

  return (
    <div>
      <h1 className="font-heading text-2xl tracking-[0.03em] text-foreground mb-6">OVERVIEW</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
          <p className="font-heading text-4xl text-warning">{pending.length}</p>
          <p className="text-[0.8125rem] text-muted-foreground mt-1">Pending Reviews</p>
        </div>
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
          <p className="font-heading text-4xl text-success">{published.length}</p>
          <p className="text-[0.8125rem] text-muted-foreground mt-1">Published Moves</p>
        </div>
      </div>
    </div>
  );
}
