```mermaid
flowchart TD
    subgraph "Veri İzolasyon Stratejileri"
        A[Multi-tenant Veri İzolasyonu]

        A --> B[Şema-bazlı İzolasyon]
        A --> C[Satır-bazlı İzolasyon]
        A --> D[Hibrit İzolasyon]

        B --> B1[Tenant 1 Şeması]
        B --> B2[Tenant 2 Şeması]
        B --> B3[Tenant 3 Şeması]

        C --> C1[tenant_id Filtreleme]
        C --> C2[Row Level Security]

        D --> D1[Şema-bazlı\n+\nSeçici RLS]
    end

    subgraph "Veritabanı"
        E[(PostgreSQL Veritabanı)]

        B1 -.-> E
        B2 -.-> E
        B3 -.-> E

        C1 -.-> E
        C2 -.-> E

        D1 -.-> E
    end

    subgraph "İ-EP.APP Mimarisi"
        F[İ-EP.APP]

        F --> G[Tenant-bazlı Şemalar\n(Birincil)]
        F --> H[Satır-bazlı Güvenlik\n(Yardımcı)]

        G --> G1[tenant_X Şeması]
        G --> G2[tenant_Y Şeması]
        G --> G3[tenant_Z Şeması]

        H --> H1[Çapraz-tenant\nSorgular]

        G1 -.-> E
        G2 -.-> E
        G3 -.-> E
        H1 -.-> E
    end

    subgraph "Avantajlar ve Dezavantajlar"
        I[Şema-bazlı\nİzolasyon]
        J[Satır-bazlı\nİzolasyon]
        K[Hibrit\nİzolasyon]

        I --> I1[+ Güçlü İzolasyon]
        I --> I2[+ Basit Yönetim]
        I --> I3[- Çapraz-tenant\nSorgu Zorluğu]

        J --> J1[+ Çapraz-tenant\nSorgular Kolay]
        J --> J2[+ Az Şema]
        J --> J3[- Güvenlik Riskleri]

        K --> K1[+ En İyi İki Dünya]
        K --> K2[+ Esnek Mimari]
        K --> K3[- Karmaşık Yapı]
    end

    style A fill:#ff5722,stroke:#333,stroke-width:2px
    style B fill:#e91e63,stroke:#333,stroke-width:1px
    style C fill:#9c27b0,stroke:#333,stroke-width:1px
    style D fill:#673ab7,stroke:#333,stroke-width:1px
    style E fill:#2196f3,stroke:#333,stroke-width:2px
    style F fill:#4caf50,stroke:#333,stroke-width:2px
    style G fill:#8bc34a,stroke:#333,stroke-width:1px
    style H fill:#cddc39,stroke:#333,stroke-width:1px
    style I fill:#ffc107,stroke:#333,stroke-width:1px
    style J fill:#ff9800,stroke:#333,stroke-width:1px
    style K fill:#ff5722,stroke:#333,stroke-width:1px
```
