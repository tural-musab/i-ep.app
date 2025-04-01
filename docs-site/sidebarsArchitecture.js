module.exports = {
  architectureSidebar: [
    {
      type: 'doc',
      id: 'multi-tenant-strategy',
      label: 'Multi-tenant Stratejisi',
    },
    {
      type: 'doc',
      id: 'data-isolation',
      label: 'Veri İzolasyonu',
    },
    {
      type: 'category',
      label: 'Mimari Kararları',
      items: [
        'adr/adr-index',
        'adr/adr-0001-nextjs-14',
        'adr/adr-0002-supabase-postgres',
        'adr/adr-0003-multi-tenant',
      ],
    },
    {
      type: 'category',
      label: 'Altyapı',
      items: [
        'infrastructure/overview',
        'infrastructure/database',
        'infrastructure/cache',
        'infrastructure/storage',
      ],
    },
  ],
}; 