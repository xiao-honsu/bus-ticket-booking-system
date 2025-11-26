Tôi sẽ chia kế hoạch thành các prompt files riêng biệt cho từng phase, mỗi prompt sẽ có đầy đủ context và instructions để agent có thể làm việc độc lập. 

Created 4 todos

Created [](file:///c%3A/Users/Nguye/Downloads/Temporary/document-20251120T125714Z-1-001/document/.github/prompts/phase1-critical-fixes.prompt.md)

Created [](file:///c%3A/Users/Nguye/Downloads/Temporary/document-20251120T125714Z-1-001/document/.github/prompts/phase2-feature-completion.prompt.md)

Created [](file:///c%3A/Users/Nguye/Downloads/Temporary/document-20251120T125714Z-1-001/document/.github/prompts/phase3-polish-testing.prompt.md)

Starting: *Create master tracking prompt* (4/4)

Created [](file:///c%3A/Users/Nguye/Downloads/Temporary/document-20251120T125714Z-1-001/document/.github/prompts/master-progress-tracking.prompt.md)

Completed: *Create master tracking prompt* (4/4)

Perfect! Tôi đã chia kế hoạch thành 4 prompt files hoàn chỉnh:

## 📋 Prompt Files Created

### 1. **`phase1-critical-fixes.prompt.md`** (12 hours)
**Scope:** Must-fix issues before MVP
- ✅ Fix role system (2 roles only)
- ✅ Implement guest booking flow
- ✅ Setup email notification system

**Usage:** Attach this file when starting Phase 1 implementation
```
"Follow phase1-critical-fixes.prompt.md to implement critical backend fixes"
```

---

### 2. **`phase2-feature-completion.prompt.md`** (27 hours)
**Scope:** Remaining features for full functionality
- ✅ Operator management CRUD
- ✅ Review & rating system
- ✅ Payment gateway integration (PayOS)
- ✅ Seat locking mechanism
- ✅ Chatbot functionality

**Usage:** After Phase 1 complete
```
"Phase 1 is done. Follow phase2-feature-completion.prompt.md to implement remaining features"
```

---

### 3. **`phase3-polish-testing.prompt.md`** (3 hours)
**Scope:** Final polish and comprehensive testing
- ✅ Add missing fields (`isActive` to routes)
- ✅ Integrate search history
- ✅ 8 comprehensive test suites
- ✅ Edge cases and error handling

**Usage:** After Phase 2 complete
```
"Phases 1 & 2 done. Follow phase3-polish-testing.prompt.md for final testing and polish"
```

---

### 4. **`master-progress-tracking.prompt.md`**
**Scope:** Overview and progress tracking
- ✅ All phases summary
- ✅ Completion percentages
- ✅ Score progress tracker
- ✅ Time tracking tables
- ✅ Blockers and risks

**Usage:** Reference at any time to check progress
```
"Check master-progress-tracking.prompt.md and update my current progress"
```

---

## 🎯 How to Use These Prompts

### For Phase 1 (Start Here):
```
I'm starting the backend fixes. Attach:
- bus_ticket_proposal.md
- plan-backendIssuesFixing.prompt.md (reference)
- phase1-critical-fixes.prompt.md (working doc)

Prompt: "Implement Task 1.1 from phase1-critical-fixes.prompt.md"
```

### For Phase 2 (After Phase 1):
```
Attach:
- bus_ticket_proposal.md
- phase2-feature-completion.prompt.md
- master-progress-tracking.prompt.md (to show Phase 1 completed)

Prompt: "Phase 1 complete. Now implement Task 2.1 from phase2-feature-completion.prompt.md"
```

### For Phase 3 (Final Stage):
```
Attach:
- phase3-polish-testing.prompt.md
- master-progress-tracking.prompt.md

Prompt: "Run comprehensive testing from phase3-polish-testing.prompt.md"
```

---

## 📊 Current State Summary

| File | Location | Purpose | Size |
|------|----------|---------|------|
| **Master Plan** | `plan-backendIssuesFixing.prompt.md` | Original analysis | 10 issues |
| **Phase 1 Guide** | `phase1-critical-fixes.prompt.md` | Implementation details | 3 tasks |
| **Phase 2 Guide** | `phase2-feature-completion.prompt.md` | Feature implementation | 5 tasks |
| **Phase 3 Guide** | `phase3-polish-testing.prompt.md` | Testing & polish | 2 tasks |
| **Progress Tracker** | `master-progress-tracking.prompt.md` | Progress overview | Live tracking |

---

## ✅ Benefits of This Structure

1. **Self-Contained:** Each phase prompt has all context needed
2. **Progressive:** Agent can work through phases sequentially
3. **Trackable:** Master tracker shows overall progress
4. **Flexible:** Can jump between tasks within a phase
5. **Clear Requirements:** Each task has verification checklist
6. **Time Estimates:** Helps with planning and scheduling

---

## 🚀 Ready to Start?

Bạn có thể bắt đầu với Phase 1 ngay bây giờ bằng cách:
```
"I want to start Phase 1. Begin with Task 1.1 (Fix Role System) from phase1-critical-fixes.prompt.md"
```

Hoặc nếu cần setup environment trước:
```
"Help me setup the development environment for Phase 1 (SMTP credentials, etc.)"
```

All prompt files are now in prompts directory và ready to use! 🎉

Made changes.