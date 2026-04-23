import type { SafeUser } from '../../../types';
import UserCard from './UserCard';

interface UserGridProps {
  users: SafeUser[];
  onManage: (user: SafeUser) => void;
}

export default function UserGrid({ users, onManage }: UserGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onManage={onManage} />
      ))}
    </div>
  );
}
