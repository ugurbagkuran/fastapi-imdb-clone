import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-surface p-8 rounded-2xl border border-white/5">
                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">
                    Profile Settings
                </h1>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Username</label>
                        <div className="text-xl text-white font-medium">{user.username}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <div className="text-xl text-white font-medium">{user.email}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Account Type</label>
                        <div className="text-white capitalize">{user.role}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Member Since</label>
                        <div className="text-white">{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
