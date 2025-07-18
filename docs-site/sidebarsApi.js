module.exports = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'endpoints',
      label: 'API Endpoints',
    },
    {
      type: 'category',
      label: 'Kimlik Doğrulama',
      items: ['auth/authentication', 'auth/jwt'],
    },
    {
      type: 'category',
      label: 'Tenant',
      items: ['tenant/tenant-management', 'tenant/domain-management'],
    },
    {
      type: 'category',
      label: 'Kullanıcılar',
      items: ['user/user-management', 'user/permissions'],
    },
  ],
};
