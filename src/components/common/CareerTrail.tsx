interface CareerTrailProps {
  previousOrgs: string[];
  currentOrg: string;
  className?: string;
}

export function CareerTrail({
  previousOrgs,
  currentOrg,
  className = '',
}: CareerTrailProps) {
  const orgs = [...previousOrgs, currentOrg];

  if (orgs.length <= 1) {
    return <span className={`text-sm text-gray-400 ${className}`}>{currentOrg}</span>;
  }

  return (
    <div className={`flex items-center flex-wrap gap-1 text-sm ${className}`}>
      {orgs.map((org, i) => (
        <span key={`${org}-${i}`} className="flex items-center gap-1">
          <span className={i === orgs.length - 1 ? 'text-white font-medium' : 'text-gray-500'}>
            {org}
          </span>
          {i < orgs.length - 1 && (
            <span className="text-gray-600">&rarr;</span>
          )}
        </span>
      ))}
    </div>
  );
}
