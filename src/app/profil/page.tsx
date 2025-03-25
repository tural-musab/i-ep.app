'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { User, Mail, Phone, Calendar, Building, Shield } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

export default function ProfilPage() {
  const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // Düzenleme modunu aç
  const startEditing = () => {
    if (user?.profile) {
      setFullName(user.profile.fullName || '');
      setIsEditing(true);
    }
  };
  
  // Düzenlemeleri kaydet
  const saveChanges = async () => {
    if (!user || !user.profile) return;
    
    try {
      await updateUser({
        profile: {
          userId: user.id,
          fullName,
          avatar: user.profile.avatar,
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  };
  
  // Düzenlemeyi iptal et
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  const ProfileContent = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
        <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
      </div>
      
      {user && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {user.profile?.avatar ? (
                  <img 
                    src={user.profile.avatar} 
                    alt={user.profile?.fullName || 'Profil'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={64} />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">
                      {user.profile?.fullName || 'İsimsiz Kullanıcı'}
                    </h2>
                    <button
                      onClick={startEditing}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Düzenle
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 mr-2 text-gray-500" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Shield className="w-5 h-5 mr-2 text-gray-500" />
                      <span>
                        Kullanıcı Rolü: <span className="font-medium">{user.role}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Building className="w-5 h-5 mr-2 text-gray-500" />
                      <span>
                        Tenant ID: <span className="font-medium">{user.tenantId}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                      <span>
                        Kayıt Tarihi: <span className="font-medium">{formatTimestamp(user.createdAt)}</span>
                      </span>
                    </div>
                    
                    {user.lastLogin && (
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                        <span>
                          Son Giriş: <span className="font-medium">{formatTimestamp(user.lastLogin)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Hesap Güvenliği</h2>
        
        <div>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Şifremi Değiştir
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <RoleGuard 
      fallback={<AccessDenied />} 
      redirectTo="/auth/giris"
    >
      <ProfileContent />
    </RoleGuard>
  );
} 