import { usePeople } from '../../hooks/usePeople';
import { PeopleTable } from '../../components/admin/PeopleTable';

export default function AdminPeople() {
  const { people, loading } = usePeople();

  return (
    <div>
      <h1 className="font-heading text-2xl tracking-[0.03em] text-foreground mb-6">PEOPLE MANAGEMENT</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <PeopleTable people={people} />
      )}
    </div>
  );
}
