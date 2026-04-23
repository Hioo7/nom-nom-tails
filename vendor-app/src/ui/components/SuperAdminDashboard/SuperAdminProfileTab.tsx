import ProfileTab from '../shared/ProfileTab';

export default function SuperAdminProfileTab() {
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-base-content">Profile</h1>
          <p className="text-sm text-base-content/60">
            Manage your sign-in details and session preferences.
          </p>
        </div>
      </div>

      <ProfileTab />
    </div>
  );
}
