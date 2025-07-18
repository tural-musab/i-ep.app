import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/giris');
  }

  // Mock user data
  const userData = {
    name: session.user?.name || 'Kullanıcı',
    email: session.user?.email || '',
    avatar: session.user?.image,
    role: 'Öğretmen',
    school: 'Demo İlkokulu',
    phone: '+90 555 123 4567',
    department: 'Matematik',
    joinDate: '2023-09-01',
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
      </div>

      {session && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-shrink-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name || 'Profil'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Avatar className="h-full w-full rounded-full object-cover">
                    <AvatarFallback className="text-4xl">{userData.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <Button
                  onClick={() => {}} // Placeholder for edit logic
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Düzenle
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-gray-500"
                  >
                    <path d="M20 13.1c0-5-3.5-9-8-9s-8 4-8 9c0 5.5 3.5 9 8 9h1v3h-1c-6 0-10-4-10-9s4-9 10-9h1v3h-1" />
                  </svg>
                  <span>{userData.email}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-gray-500"
                  >
                    <path d="M21 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  </svg>
                  <span>
                    Kullanıcı Rolü: <span className="font-medium">{userData.role}</span>
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-gray-500"
                  >
                    <path d="M18 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  </svg>
                  <span>
                    Okul: <span className="font-medium">{userData.school}</span>
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-gray-500"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                  <span>
                    Departman: <span className="font-medium">{userData.department}</span>
                  </span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5 text-gray-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  </svg>
                  <span>
                    Katılım Tarihi: <span className="font-medium">{userData.joinDate}</span>
                  </span>
                </div>

                {/* Assuming lastLogin is not available in mock data, so this block is removed */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Hesap Güvenliği</h2>

        <div>
          <Button className="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50">
            Şifremi Değiştir
          </Button>
        </div>
      </div>
    </div>
  );
}
