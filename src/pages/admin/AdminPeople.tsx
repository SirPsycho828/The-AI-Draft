import { usePeople } from '../../hooks/usePeople';
import { PeopleTable } from '../../components/admin/PeopleTable';

export default function AdminPeople() {
  const { people, loading } = usePeople();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">People Management</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <PeopleTable people={people} />
      )}
    </div>
  );
}
