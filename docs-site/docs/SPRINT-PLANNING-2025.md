# Sprint Planlama ve Yönetim Rehberi 2025
*İ-EP.APP Proje Sprint Planı*

## 🎯 Sprint Metodolojisi

### Sprint Temel Bilgileri
- **Sprint Süresi**: 2 hafta (10 iş günü)
- **Team Kapasitesi**: 80 Story Points per sprint
- **Sprint Sayısı (2025)**: 26 sprint
- **Çalışma Saatleri**: Hafta içi 9:00-18:00
- **Sprint Başlangıcı**: Her 2 haftada bir Pazartesi

### Story Point Estimation Guide
- **1 SP**: 1-2 saat (Çok küçük task)
- **2 SP**: Yarım gün (Basit feature)
- **3 SP**: 1 gün (Küçük feature)
- **5 SP**: 2-3 gün (Orta feature)
- **8 SP**: 1 hafta (Büyük feature)
- **13 SP**: 1.5 hafta (Çok büyük feature - split recommended)
- **21+ SP**: Split into smaller stories

---

## 📅 DETAYLI SPRINT PLANLARI

### SPRINT 1: Payment Integration Foundation - ✅ TAMAMLANDI
**Tarih**: 13-17 Ocak 2025 (5 iş günü)
**Kapasite**: 80 SP
**Theme**: Revenue Generation Başlangıcı
**Durum**: ✅ BAŞARIYLA TAMAMLANDI

#### Backlog Items

**🔥 Critical (P0) - 55 SP**
```
PF-001: İyzico Payment Gateway Setup (21 SP)
├── İyzico merchant account configuration
├── API key configuration and environment setup
├── Basic payment form implementation
├── Payment success/failure handling
└── Initial transaction logging

PF-002: Subscription Plan Foundation (21 SP)
├── Database schema for subscription plans
├── Plan configuration (Free, Standard, Premium)
├── Tenant-plan relationship setup
├── Basic plan assignment logic
└── Plan validation middleware

PF-003: Feature Gating Infrastructure (13 SP)
├── Feature flag system implementation
├── Plan-based feature restrictions
├── Middleware for feature checking
└── Basic permission infrastructure
```

**⚡ High Priority (P1) - 25 SP**
```
PF-004: Payment UI Components (13 SP)
├── Payment form UI component
├── Payment status indicators
├── Error handling UI
└── Success confirmation UI

PF-005: Basic Billing Database Schema (12 SP)
├── Payments table creation
├── Invoices table structure
├── Transaction logs table
└── Database relationships setup
```

#### Sprint Goals - ✅ TÜM HEDEFLER BAŞARILDI
- [x] İyzico payment gateway entegrasyonu tamamlanır ✅
- [x] Temel subscription planları oluşturulur ✅
- [x] Feature gating altyapısı hazır olur ✅
- [x] Payment UI komponentleri çalışır durumda olur ✅

#### Definition of Done - ✅ TÜM KRITERLER KARŞILANDI
- [x] Payment işlemi end-to-end test edildi ✅
- [x] Subscription planları database'e kaydediliyor ✅
- [x] Feature restrictions çalışıyor ✅
- [x] Code review tamamlandı ✅
- [x] Unit tests yazıldı (%80+ coverage) ✅

---

### SPRINT 1.5: Storage Infrastructure Implementation - ✅ TAMAMLANDI
**Tarih**: 14 Ocak 2025 (Accelerated Development)
**Kapasite**: 120 SP (High-velocity sprint)
**Theme**: File Management Foundation
**Durum**: ✅ BAŞARIYLA TAMAMLANDI

#### Backlog Items - ✅ TÜM ITEM'LAR TAMAMLANDI

**🔥 Critical (P0) - 120 SP**
```
SF-001: Storage Abstraction Layer (40 SP) ✅
├── Multi-provider storage interface
├── Provider switching capability  
├── Configuration-based routing
└── Future Cloudflare R2 readiness

SF-002: Database Schema Implementation (35 SP) ✅
├── Files table with metadata
├── File sharing and permissions
├── Storage quotas management
├── File migrations tracking
└── RLS policies and security

SF-003: Supabase Storage Provider (25 SP) ✅
├── Complete provider implementation
├── File upload/download operations
├── Signed URL generation
├── Error handling and validation
└── Integration with storage service

SF-004: Utility Functions (20 SP) ✅
├── File validation and security checks
├── Path generation and management
├── File type detection and icons
├── Size formatting and calculations
└── File hash generation
```

#### Sprint Goals - ✅ TÜM HEDEFLER BAŞARILDI
- [x] Enterprise-ready storage abstraction layer ✅
- [x] Multi-provider support (Supabase + R2 ready) ✅
- [x] Comprehensive file management database ✅
- [x] Security-first file handling ✅

#### Definition of Done - ✅ TÜM KRITERLER KARŞILANDI
- [x] Storage service interface complete ✅
- [x] Database migrations applied ✅
- [x] File operations working end-to-end ✅
- [x] Type definitions comprehensive ✅
- [x] Security policies implemented ✅

---

### SPRINT 2: Core Academic Features with Storage
**Tarih**: 15-26 Ocak 2025 (2 hafta)
**Kapasite**: 160 SP
**Theme**: Academic Functionality + File Management Integration

#### Backlog Items

**🔥 Critical (P0) - 80 SP**
```
AA-001: Attendance System with File Support (35 SP)
├── Daily attendance recording backend
├── Attendance calculation engine
├── Teacher attendance interface
├── Student/parent attendance views
├── Attendance document attachments
└── Absence excuse file uploads

AA-002: Assignment Management System (45 SP)
├── Assignment creation with file attachments
├── Student submission interface
├── File upload/download for assignments
├── Assignment feedback with documents
├── Grade recording for submissions
├── Bulk download of submissions
└── Assignment archive management
```

**⚡ High Priority (P1) - 80 SP**
```
AA-003: Document Sharing for Classes (25 SP)
├── Class document library
├── Teacher resource sharing
├── Student access to class materials
├── Folder organization
├── File version management
└── Download tracking

AA-004: Grade Management Enhancement (30 SP)
├── Grade calculation engine
├── Grade import/export (Excel)
├── Grade analytics and trends
├── Progress report generation
├── Parent grade notifications
└── Grade history tracking

AA-005: Basic Messaging with Files (25 SP)
├── Teacher-parent messaging
├── File attachment support
├── Message read receipts
├── Message search functionality
└── Communication history
```

#### Sprint Goals
- [ ] Core academic features operational
- [ ] File management fully integrated
- [ ] Assignment submission workflow complete
- [ ] Teacher-student document exchange working
- [ ] Basic messaging with attachments functional

---

### SPRINT 3: Attendance System Implementation
**Tarih**: 27-31 Ocak 2025 (5 iş günü)
**Kapasite**: 80 SP
**Theme**: Core Academic Features - Attendance

#### Backlog Items

**🔥 Critical (P0) - 55 SP**
```
AS-001: Attendance Backend System (30 SP)
├── Daily attendance recording API
├── Attendance calculation engine
├── Historical attendance data management
├── Attendance status definitions
├── Bulk attendance operations
└── Attendance data validation

AS-002: Teacher Attendance Interface (25 SP)
├── Daily attendance taking UI
├── Class roster with attendance
├── Quick attendance marking
├── Attendance correction interface
└── Bulk attendance entry
```

**⚡ High Priority (P1) - 25 SP**
```
AS-003: Student/Parent Attendance View (15 SP)
├── Student attendance calendar
├── Attendance percentage display
├── Parent attendance notifications
└── Attendance history view

AS-004: Basic Attendance Reporting (10 SP)
├── Daily attendance reports
├── Weekly/monthly summaries
├── Absence statistics
└── Attendance trend charts
```

#### Sprint Goals
- [ ] Teachers can take daily attendance efficiently
- [ ] Students and parents can view attendance
- [ ] Basic attendance reports are generated
- [ ] Attendance data is accurate and validated

---

### SPRINT 4: Grade Management System
**Tarih**: 3-7 Şubat 2025 (5 iş günü)
**Kapasite**: 80 SP
**Theme**: Core Academic Features - Grading

#### Backlog Items

**🔥 Critical (P0) - 50 SP**
```
GM-001: Grade Calculation Engine (25 SP)
├── Weighted grade calculations
├── Multiple exam types support
├── Grade scales and rubrics
├── Automatic GPA calculation
└── Grade validation rules

GM-002: Grade Entry Interface (25 SP)
├── Teacher grade input forms
├── Grade book interface
├── Bulk grade import (Excel)
├── Grade correction workflows
└── Grade submission confirmations
```

**⚡ High Priority (P1) - 30 SP**
```
GM-003: Student Grade Portal (15 SP)
├── Grade viewing for students
├── Grade history tracking
├── Grade statistics display
└── Grade notifications

GM-004: Parent Grade Access (15 SP)
├── Parent grade viewing portal
├── Grade change notifications
├── Progress tracking
└── Grade report downloads
```

#### Sprint Goals
- [ ] Complete grade calculation system working
- [ ] Teachers can enter and manage grades
- [ ] Students can view their grades
- [ ] Parents have access to child's grades

---

### SPRINT 5: Communication Foundation
**Tarih**: 10-14 Şubat 2025 (5 iş günü)
**Kapasite**: 80 SP
**Theme**: Stakeholder Communication

#### Backlog Items

**🔥 Critical (P0) - 55 SP**
```
CF-001: In-App Messaging System (30 SP)
├── Teacher-parent messaging
├── Admin-teacher messaging
├── Message threading
├── Message status tracking
├── Attachment support
└── Message search functionality

CF-002: Email Notification System (25 SP)
├── SMTP integration setup
├── Email template system
├── Automated email triggers
├── Email delivery tracking
└── Email preference management
```

**⚡ High Priority (P1) - 25 SP**
```
CF-003: Announcement System (15 SP)
├── School-wide announcements
├── Class-specific announcements
├── Announcement scheduling
├── Priority announcement system
└── Announcement read receipts

CF-004: Notification Preferences (10 SP)
├── User notification settings
├── Communication channel preferences
├── Frequency settings
└── Do-not-disturb modes
```

#### Sprint Goals
- [ ] Basic messaging between stakeholders works
- [ ] Email notifications are delivered reliably
- [ ] Announcement system is functional
- [ ] Users can manage their notification preferences

---

### SPRINT 6: Advanced Communication
**Tarih**: 17-21 Şubat 2025 (5 iş günü)
**Kapasite**: 80 SP
**Theme**: Enhanced Communication Features

#### Backlog Items

**⚡ High Priority (P1) - 60 SP**
```
AC-001: SMS Notification Integration (25 SP)
├── Turkish SMS provider integration (Netgsm/İleti Merkezi)
├── SMS template system
├── SMS delivery tracking
├── SMS cost management
└── SMS opt-in/opt-out

AC-002: Push Notification System (20 SP)
├── Web push notifications
├── Progressive Web App manifest
├── Push subscription management
├── Notification scheduling
└── Push analytics

AC-003: Communication Dashboard (15 SP)
├── Message center interface
├── Notification history
├── Communication analytics
├── Unread message management
└── Quick communication actions
```

**🔧 Medium Priority (P2) - 20 SP**
```
AC-004: Advanced Messaging Features (12 SP)
├── Message templates
├── Group messaging
├── Message priority levels
└── Auto-reply functionality

AC-005: Communication Reports (8 SP)
├── Communication statistics
├── Message delivery reports
├── Engagement analytics
└── Communication compliance reports
```

#### Sprint Goals
- [ ] SMS notifications working for critical events
- [ ] Push notifications implemented
- [ ] Communication dashboard functional
- [ ] Advanced messaging features available

---

### SPRINT 7-8: Essential Reporting System
**Tarih**: 24 Şubat - 7 Mart 2025 (10 iş günü)
**Kapasite**: 160 SP (2 sprint)
**Theme**: Analytics and Reporting

#### Sprint 7 Backlog Items

**⚡ High Priority (P1) - 70 SP**
```
ER-001: Student Progress Reports (30 SP)
├── Academic progress tracking
├── Attendance summaries in reports
├── Behavioral notes integration
├── Progress trend analysis
└── Parent-friendly report format

ER-002: Class Performance Analytics (25 SP)
├── Class average calculations
├── Performance comparison charts
├── Grade distribution analysis
├── Improvement trend tracking
└── Class ranking (optional)

ER-003: Basic PDF Export Engine (15 SP)
├── Report card PDF generation
├── Progress report PDFs
├── Custom report templates
├── Turkish PDF formatting
└── Bulk PDF generation
```

#### Sprint 8 Backlog Items

**⚡ High Priority (P1) - 65 SP**
```
ER-004: Administrative Dashboards (25 SP)
├── School overview metrics
├── Enrollment statistics
├── Teacher performance metrics
├── Financial summary dashboard
└── Real-time school statistics

ER-005: Excel Export Functionality (20 SP)
├── Student data exports
├── Grade data exports
├── Attendance data exports
├── Custom report builder
└── Scheduled report exports

ER-006: Parent Portal Reports (20 SP)
├── Child progress tracking
├── Attendance summaries
├── Communication history
├── Report card access
└── Progress notification setup
```

#### Combined Sprint 7-8 Goals
- [ ] Comprehensive student progress reports
- [ ] Administrative dashboard fully functional
- [ ] PDF and Excel export capabilities
- [ ] Parent portal reporting complete

---

## 🛠️ SPRINT EXECUTION BEST PRACTICES

### Pre-Sprint Planning

#### Sprint Planning Meeting (2 hours)
**Participants**: Development Team, Product Owner, Scrum Master
**Agenda**:
1. **Sprint Goal Definition** (15 min)
2. **Backlog Refinement** (30 min)
3. **Story Point Estimation** (45 min)
4. **Capacity Planning** (30 min)
5. **Sprint Commitment** (20 min)

#### Story Estimation Techniques
**Planning Poker Process**:
1. Product Owner explains the story
2. Team asks clarifying questions
3. Each member estimates privately
4. Reveal estimates simultaneously
5. Discuss differences and re-estimate
6. Reach consensus

### Daily Sprint Execution

#### Daily Standup (15 minutes)
**Format**:
- **What did I complete yesterday?**
- **What will I work on today?**
- **What blockers do I have?**

**Best Practices**:
- Keep it time-boxed to 15 minutes
- Focus on blockers and dependencies
- Update sprint board during standup
- Schedule follow-up discussions offline

#### Sprint Board Management
**Columns**:
- **To Do**: Sprint backlog items
- **In Progress**: Currently being worked on
- **Code Review**: Awaiting review
- **Testing**: In QA/testing phase
- **Done**: Meets definition of done

### Sprint Review & Retrospective

#### Sprint Review (1 hour)
**Agenda**:
1. **Demo of completed features** (40 min)
2. **Stakeholder feedback** (15 min)
3. **Sprint metrics review** (5 min)

#### Sprint Retrospective (45 minutes)
**Agenda**:
1. **What went well?** (15 min)
2. **What could be improved?** (15 min)
3. **What should we try next sprint?** (10 min)
4. **Action items assignment** (5 min)

---

## 📊 SPRINT TRACKING & METRICS

### Key Sprint Metrics

#### Velocity Tracking
- **Sprint Velocity**: Completed story points per sprint
- **Average Velocity**: Rolling 3-sprint average
- **Velocity Trend**: Sprint-over-sprint improvement
- **Target Velocity**: 80 SP per sprint

#### Quality Metrics
- **Bug Rate**: Bugs per story point
- **Rework Rate**: Stories requiring rework
- **Test Coverage**: Unit test coverage percentage
- **Code Review Time**: Average review turnaround

#### Delivery Metrics
- **Sprint Commitment**: Planned vs. delivered story points
- **Sprint Goal Achievement**: Percentage of sprint goals met
- **Feature Completion Rate**: Features fully completed
- **Technical Debt**: Story points allocated to tech debt

### Sprint Health Dashboard

#### Daily Tracking
```
Sprint Burndown Chart:
- Remaining story points per day
- Ideal burndown line
- Actual burndown tracking
- Sprint completion forecast
```

#### Sprint Summary Report
```
Sprint X Summary:
- Committed: 80 SP
- Completed: 75 SP (94%)
- Bugs Found: 3
- Stories Carried Over: 1
- Sprint Goal: ✅ Achieved
```

---

## 🚨 RISK MANAGEMENT IN SPRINTS

### Common Sprint Risks

#### Technical Risks
- **Integration Complexity**: Payment gateway complications
- **Performance Issues**: Database query optimization needs
- **Third-party Dependencies**: External service downtime
- **Technical Debt**: Legacy code slowing development

#### Process Risks
- **Scope Creep**: Requirements changing mid-sprint
- **Team Availability**: Sick leave, vacations
- **Dependency Blocking**: Waiting for external inputs
- **Estimation Accuracy**: Stories taking longer than expected

### Risk Mitigation Strategies

#### Proactive Measures
- **20% Sprint Buffer**: Reserve capacity for unknowns
- **Technical Spikes**: Research spikes for complex features
- **Pair Programming**: Knowledge sharing and quality
- **Continuous Integration**: Early issue detection

#### Reactive Measures
- **Daily Risk Assessment**: Identify blockers daily
- **Sprint Scope Adjustment**: Remove items if needed
- **Cross-training**: Team members can cover multiple areas
- **Escalation Paths**: Clear escalation for blockers

---

## 🎯 SPRINT SUCCESS CRITERIA

### Definition of Ready (for Sprint Planning)
- [ ] User story is well-defined with acceptance criteria
- [ ] Story is estimated and sized appropriately (<13 SP)
- [ ] Dependencies are identified and resolved
- [ ] Design mockups available (if UI work)
- [ ] Technical approach is understood
- [ ] Test scenarios are defined

### Definition of Done (for Sprint Completion)
- [ ] Feature implemented according to acceptance criteria
- [ ] Unit tests written with 80%+ coverage
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Security review completed (if applicable)
- [ ] Performance impact assessed
- [ ] Product owner acceptance received

---

## 📋 SPRINT TEMPLATES & CHECKLISTS

### Sprint Planning Checklist
```
Pre-Meeting:
- [ ] Backlog groomed and prioritized
- [ ] Stories estimated and sized
- [ ] Team capacity calculated
- [ ] Sprint goal drafted

During Meeting:
- [ ] Sprint goal finalized
- [ ] Stories selected for sprint
- [ ] Tasks broken down
- [ ] Capacity confirmed
- [ ] Sprint committed

Post-Meeting:
- [ ] Sprint board updated
- [ ] Team notified of sprint start
- [ ] Stakeholders informed of sprint goal
- [ ] Sprint tracking set up
```

### Daily Standup Template
```
Team Member: [Name]
Yesterday: [Completed tasks]
Today: [Planned tasks]
Blockers: [Issues needing help]
Sprint Progress: [On track/Behind/Ahead]
```

### Sprint Review Template
```
Sprint X Review - [Date]

Sprint Goal: [Goal statement]
Goal Achievement: [Achieved/Partial/Not Achieved]

Completed Stories:
- [Story ID]: [Brief description]
- [Story ID]: [Brief description]

Demonstrated Features:
- [Feature 1]: [Demo notes]
- [Feature 2]: [Demo notes]

Stakeholder Feedback:
- [Feedback item 1]
- [Feedback item 2]

Metrics:
- Planned SP: [X]
- Completed SP: [Y]
- Velocity: [Z]
```

---

Bu sprint planlama rehberi, i-ep.app projesinin 2025 yılındaki gelişim sürecini sistematik ve ölçülebilir şekilde yönetmek için tasarlanmıştır. Her sprint, projenin MVP hedefine doğru somut adımlar atacak şekilde planlanmıştır.