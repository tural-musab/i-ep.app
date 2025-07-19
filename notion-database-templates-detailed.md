# 🏫 İ-EP.APP Notion Database Templates

## 📊 Core Databases Setup

### 1. 📋 Tasks & Issues Database

**Database Name**: İ-EP Tasks
**Icon**: 📋

**Properties**:
```
1. Title (Title)
   - Task description
   
2. Priority (Select)
   - 🔴 Critical (P0) - Red
   - 🟡 High (P1) - Yellow  
   - 🟠 Medium (P2) - Orange
   - 🟢 Low (P3) - Green

3. System (Multi-select)
   - 📚 Assignment - Blue
   - 📅 Attendance - Purple
   - 📊 Grade Management - Orange
   - 🔐 Authentication - Red
   - 🏗️ Infrastructure - Gray

4. Type (Select)
   - 🐛 Bug - Red
   - ✨ Feature - Purple
   - 📚 Documentation - Blue
   - 🔧 Refactor - Orange
   - 🧪 Test - Green

5. Status (Select)
   - 📋 Backlog - Gray
   - 🚧 In Progress - Yellow
   - 👀 In Review - Blue
   - ✅ Done - Green
   - ❌ Blocked - Red

6. Sprint (Relation)
   - Link to Sprints database

7. Assignee (Person)

8. Due Date (Date)

9. Story Points (Number)
   - 1, 2, 3, 5, 8, 13

10. Created (Created time)

11. Updated (Last edited time)

12. Description (Text)
```

**Views**:
1. **Kanban Board** - Group by Status
2. **Priority Matrix** - Board view grouped by Priority
3. **Sprint Board** - Filter by current sprint
4. **My Tasks** - Filter by Assignee = Me
5. **Blocked Items** - Filter Status = Blocked

---

### 2. 🔌 API Documentation Database

**Database Name**: API Endpoints
**Icon**: 🔌

**Properties**:
```
1. Endpoint (Title)
   - e.g., /api/assignments/create

2. Method (Select)
   - GET - Green
   - POST - Blue
   - PUT - Orange
   - DELETE - Red
   - PATCH - Purple

3. System (Relation)
   - Link to Core Systems

4. Authentication (Checkbox)
   - Required/Not Required

5. Status (Select)
   - ✅ Production - Green
   - 🧪 Testing - Yellow
   - 🚧 Development - Orange
   - 📋 Planned - Gray

6. Request Schema (Code)
   - JSON schema

7. Response Schema (Code)
   - JSON schema

8. Error Codes (Multi-select)
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found
   - 500 Server Error

9. Rate Limit (Text)
   - e.g., 100 requests/hour

10. Examples (Text)
    - cURL examples

11. Documentation (URL)
    - Link to detailed docs
```

**Views**:
1. **By System** - Group by System
2. **By Status** - Group by Status
3. **REST Reference** - Table view sorted by endpoint
4. **Production APIs** - Filter Status = Production

---

### 3. 🧪 Test Coverage Database

**Database Name**: Test Suites
**Icon**: 🧪

**Properties**:
```
1. Test Suite (Title)
   - e.g., Assignment System Unit Tests

2. System (Select)
   - Assignment
   - Attendance
   - Grade Management
   - Authentication
   - Infrastructure

3. Type (Select)
   - Unit - Blue
   - Integration - Orange
   - E2E - Purple
   - Performance - Red

4. Total Tests (Number)

5. Passing Tests (Number)

6. Pass Rate (Formula)
   - round(prop("Passing Tests") / prop("Total Tests") * 100) + "%"

7. Coverage % (Number)

8. Last Run (Date & time)

9. Duration (Number)
   - In milliseconds

10. Status (Formula)
    - if(prop("Pass Rate") == "100%", "✅ All Passing", 
        if(prop("Pass Rate") >= "80%", "🟡 Some Failures", "🔴 Critical"))

11. Report Link (URL)
```

**Views**:
1. **Coverage Dashboard** - Gallery view with cards
2. **By System** - Group by System
3. **Failed Tests** - Filter where Pass Rate < 100%
4. **Test Trends** - Timeline view by Last Run

---

### 4. 🚀 Sprints Database

**Database Name**: Sprints
**Icon**: 🚀

**Properties**:
```
1. Sprint Name (Title)
   - e.g., Sprint 24 - Database Deployment

2. Sprint Number (Number)

3. Start Date (Date)

4. End Date (Date)

5. Sprint Goal (Text)

6. Status (Select)
   - 📋 Planning - Gray
   - 🏃 Active - Green
   - ✅ Completed - Blue
   - ❌ Cancelled - Red

7. Tasks (Relation)
   - Link to Tasks database

8. Velocity (Rollup)
   - Sum of Story Points where Status = Done

9. Planned Points (Rollup)
   - Sum of all Story Points

10. Completion Rate (Formula)
    - round(prop("Velocity") / prop("Planned Points") * 100) + "%"

11. Team Members (People)

12. Sprint Report (Text)
    - Retrospective notes
```

**Views**:
1. **Current Sprint** - Filter Status = Active
2. **Sprint Timeline** - Timeline view
3. **Velocity Chart** - Gallery view showing metrics
4. **Sprint History** - Table view sorted by Sprint Number

---

### 5. 📦 Core Systems Database

**Database Name**: Core Systems
**Icon**: 📦

**Properties**:
```
1. System Name (Title)

2. Progress (Number)
   - 0-100%

3. Phase (Select)
   - 📋 Planning - Gray
   - 🚧 Development - Yellow
   - 🧪 Testing - Orange
   - ✅ Production - Green

4. Unit Tests (Number)

5. Integration Tests (Number)

6. Total Tests (Formula)
   - prop("Unit Tests") + prop("Integration Tests")

7. Database Tables (Number)

8. API Endpoints (Relation)
   - Link to API Documentation

9. Dependencies (Multi-select)
   - Authentication
   - Storage
   - Notification
   - Payment

10. Key Features (Text)
    - Bullet points

11. Documentation (URL)

12. Owner (Person)

13. Last Update (Last edited time)
```

**Views**:
1. **System Overview** - Gallery view with progress bars
2. **By Phase** - Board view grouped by Phase
3. **Test Coverage** - Table view with test metrics
4. **Dependencies Map** - Board view

---

### 6. 📈 Metrics Database

**Database Name**: Project Metrics
**Icon**: 📈

**Properties**:
```
1. Metric Name (Title)

2. Category (Select)
   - Performance
   - Quality
   - Progress
   - Team
   - Business

3. Value (Number)

4. Unit (Select)
   - Percentage
   - Count
   - Milliseconds
   - Kilobytes
   - Hours

5. Target (Number)

6. Status (Formula)
   - if(prop("Value") >= prop("Target"), "✅ On Track", 
       if(prop("Value") >= prop("Target") * 0.8, "🟡 At Risk", "🔴 Off Track"))

7. Date (Date)

8. Week (Formula)
   - formatDate(prop("Date"), "W")

9. Trend (Select)
   - ⬆️ Improving
   - ➡️ Stable
   - ⬇️ Declining
```

**Views**:
1. **Metrics Dashboard** - Gallery view
2. **Weekly Trends** - Line chart by Week
3. **By Category** - Group by Category
4. **Critical Metrics** - Filter Status = Off Track

---

## 🎨 Page Templates

### Home Dashboard Template
```markdown
# 🏫 İ-EP.APP Dashboard

## 📊 Project Status
/linked-database Project Metrics
Filter: Category = Progress, Latest entry

## 🚀 Current Sprint
/linked-database Sprints
Filter: Status = Active

## 🔥 High Priority Tasks
/linked-database Tasks
Filter: Priority = Critical OR High, Status != Done
Sort: Due Date ascending

## 📈 System Progress
/linked-database Core Systems
View: Gallery

## 🧪 Test Coverage
/linked-database Test Suites
View: Coverage Dashboard
```

### Sprint Planning Template
```markdown
# 🚀 Sprint {{Number}} Planning

**Sprint Goal**: {{Goal}}
**Duration**: {{Start Date}} - {{End Date}}

## 👥 Team Capacity
- 

## 📋 Sprint Backlog
/linked-database Tasks
Filter: Sprint = Current Sprint

## 📊 Velocity Planning
- **Previous Sprint**: {{Previous Velocity}} points
- **Team Capacity**: {{Capacity}} points
- **Planned**: {{Planned}} points

## 🎯 Success Criteria
- [ ] 
- [ ] 
- [ ] 
```

---

## 🔧 Setup Instructions

1. **Create Main Page**
   ```
   Title: 🏫 İ-EP.APP Documentation
   Cover: Add a modern cover image
   Icon: 🏫
   ```

2. **Create Database Structure**
   - Create each database using templates above
   - Set up all properties with correct types
   - Configure formulas and rollups
   - Create initial views

3. **Link Databases**
   - Connect Relations between databases
   - Set up bi-directional links
   - Configure rollup properties

4. **Import Initial Data**
   - Current tasks from markdown files
   - API endpoints from code
   - Test results from reports
   - System progress from CLAUDE.md

5. **Configure Automations**
   - Recurring sprint creation
   - Task status updates
   - Metric calculations
   - Report generation

6. **Set Permissions**
   - Admin: Full access
   - Developer: Edit tasks, view all
   - Viewer: Read-only access

---

## 🎯 Best Practices

1. **Consistent Naming**
   - Use emojis for visual hierarchy
   - Follow naming conventions
   - Keep titles concise

2. **Regular Updates**
   - Daily: Task status
   - Weekly: Metrics & progress
   - Sprint: Full review

3. **Use Templates**
   - Sprint planning
   - Task creation
   - API documentation
   - Test reports

4. **Maintain Links**
   - Keep relations updated
   - Fix broken links
   - Archive old items

5. **Visual Design**
   - Use color coding
   - Add progress indicators
   - Include charts/graphs
   - Keep it clean

---

*Template Version: 1.0*
*Created for İ-EP.APP by Development Assistant*
*Date: 19 Temmuz 2025*
