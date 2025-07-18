# Süper Admin Dashboard Tasarımı

## Genel Düzen

Dashboard, dört ana bölümden oluşur:

1. **Sol Navigasyon Menüsü** (w-64)
2. **Üst Bilgi Çubuğu** (h-16)
3. **Ana İçerik Alanı** (esnek)
4. **Sağ Bilgi Paneli** (w-80, daraltılabilir)

```
+------------------+------------------------------------+----------------+
|                  |                                    |                |
|    Logo          |  Arama + Bildirimler + Profil     |   Sağ Panel   |
|                  |                                    |                |
+------------------+                                    |                |
|                  |                                    |                |
|    Ana Menü      |        Metrik Kartları            |   Hızlı        |
|                  |                                    |   Eylemler     |
|    - Dashboard   |  +----------+     +----------+     |                |
|    - Tenants     |  |          |     |          |    |   - Tenant     |
|    - Domains     |  |          |     |          |    |     Ekle       |
|    - Users       |  +----------+     +----------+     |                |
|    - Security    |                                    |   - Domain     |
|    - Settings    |        Grafikler                   |     Ekle       |
|                  |                                    |                |
|                  |  +-------------------------+       |   - Yedekleme   |
|                  |  |                         |      |     Başlat      |
|                  |  |                         |      |                |
|                  |  |                         |      |                |
|                  |  +-------------------------+       |                |
|                  |                                    |                |
+------------------+------------------------------------+----------------+
```

## Renk Şeması

- **Ana Renk**: `primary-900` (#1a365d)
- **İkincil Renk**: `secondary-500` (#3b82f6)
- **Arka Plan**: `gray-50` (#f9fafb)
- **Metin**: `gray-900` (#111827)
- **Başarı**: `green-500` (#22c55e)
- **Uyarı**: `yellow-500` (#eab308)
- **Hata**: `red-500` (#ef4444)

## Komponentler

### 1. Metrik Kartları

```tsx
<MetricCard
  title="Toplam Tenant"
  value={256}
  trend={+12}
  trendLabel="Geçen aya göre"
  icon={<BuildingIcon />}
/>
```

### 2. Grafik Bileşenleri

```tsx
<LineChart data={tenantGrowthData} xAxis="date" yAxis="count" title="Tenant Büyüme Trendi" />
```

### 3. Tablo Bileşenleri

```tsx
<DataTable
  columns={[
    { header: 'Tenant', accessor: 'name' },
    { header: 'Plan', accessor: 'plan' },
    { header: 'Durum', accessor: 'status' },
    { header: 'Son Aktivite', accessor: 'lastActivity' },
  ]}
  data={tenantList}
/>
```

## Responsive Davranış

- **2xl** (1536px+): Tam genişlik, sağ panel açık
- **xl** (1280px+): Tam genişlik, sağ panel daraltılmış
- **lg** (1024px+): Sağ panel gizli
- **md** (768px+): Sol menü daraltılmış
- **sm** (640px-): Sol menü gizli, hamburger menü

## İnteraktif Özellikler

1. **Canlı Güncelleme**
   - Metrikler her 30 saniyede bir güncellenir
   - Kritik uyarılar gerçek zamanlı gösterilir

2. **Filtreleme ve Arama**
   - Tarih aralığı seçimi
   - Tenant/domain bazlı filtreleme
   - Global arama fonksiyonu

3. **Özelleştirme**
   - Sürükle-bırak widget düzeni
   - Grafik türü seçimi
   - Metrik kartı sıralaması

## Erişilebilirlik

- WCAG 2.1 AA uyumlu
- Klavye navigasyonu desteği
- Ekran okuyucu optimizasyonu
- Yüksek kontrast modu desteği

## Loading States

1. **Skeleton Loading**

   ```tsx
   <MetricCardSkeleton count={4} />
   <ChartSkeleton height={300} />
   ```

2. **Progress Indicators**
   - Veri yüklenirken spinner
   - İşlem durumu göstergeleri
   - Yükleme çubuğu (uzun işlemler için)

## Error States

1. **Hata Mesajları**

   ```tsx
   <ErrorState
     title="Veri Yüklenemedi"
     message="Lütfen bağlantınızı kontrol edin"
     action={<RetryButton onClick={refetch} />}
   />
   ```

2. **Fallback UI**
   - Veri yüklenemediğinde alternatif görünüm
   - Offline modu desteği
   - Hata sınırlayıcı (Error Boundary)

## Animasyonlar

- Sayfa geçişleri: fade-in/out
- Grafik güncellemeleri: smooth transitions
- Menü açılış/kapanış: slide animations
- Hover/focus efektleri

## İlgili Komponentler

- [MetricCard](../../components/MetricCard.md)
- [LineChart](../../components/LineChart.md)
- [DataTable](../../components/DataTable.md)
- [ErrorState](../../components/ErrorState.md)

## Kullanıcı Akışı

1. Dashboard yüklenir
2. Metrikler ve grafikler gösterilir
3. Kullanıcı filtreleme yapabilir
4. Detay görüntüleme için drill-down
5. Hızlı eylemler için sağ panel

## Performans Optimizasyonları

1. **Code Splitting**

   ```tsx
   const Chart = dynamic(() => import('@/components/Chart'));
   ```

2. **Lazy Loading**
   - Görünür alandaki içerik öncelikli yüklenir
   - Scroll ile yeni içerik yüklenir

3. **Caching**
   - API yanıtları önbelleğe alınır
   - Statik içerik CDN üzerinden sunulur

## Test Senaryoları

1. **Birim Testleri**
   - Komponent render testleri
   - İnteraktif özellik testleri
   - Props validasyonu

2. **Entegrasyon Testleri**
   - Veri akışı testleri
   - API entegrasyon testleri
   - Error handling testleri

3. **E2E Testleri**
   - Kullanıcı akışı testleri
   - Responsive davranış testleri
   - Performans testleri
