import { Locale } from "../types";

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // General
    "save": "Save", "cancel": "Cancel", "delete": "Delete", "confirm": "Confirm", "edit": "Edit", "add": "Add", "urgent": "Urgent", "high": "High", "medium": "Medium", "low": "Low", "priority": "Priority", "parentTask": "Parent Task", "parent": "Parent", "severity": "Severity",
    // Sidebar
    "dashboard": "Dashboard", "tasks": "Tasks", "calendar": "Calendar", "team": "Team", "budget": "Budget", "risks": "Risks", "projects": "Projects", "settings": "Settings", "reports": "Reports",
    // Header
    "signOut": "Sign Out", "profile": "Profile",
    // Login
    "loginTitle": "ProjectHub Login", "email": "Email", "password": "Password", "logIn": "Log In", "fetchProjectsError": "Failed to fetch projects: {message}",
    // Modals
    "newProject": "New Project", "editProject": "Edit Project", "projectName": "Project Name", "description": "Description", "startDate": "Start Date", "endDate": "End Date", "createProject": "Create Project", "updateProject": "Update Project",
    "deleteProjectTitle": "Delete Project", "deleteProjectMessage": "Are you sure you want to delete this project? This will permanently delete all associated tasks, team members, budget items, and risks. This action cannot be undone.",
    "deleteItemTitle": "Confirm Deletion", "deleteItemMessage": "Are you sure? This cannot be undone.",
    "addTask": "Add Task", "editTask": "Edit Task", "taskName": "Task Name", "status": "Status", "assignee": "Assignee", "dueDate": "Due Date", "progress": "Progress", "reminderDate": "Reminder Date",
    "addTeamMember": "Add Team Member", "editTeamMember": "Edit Team Member", "memberName": "Member Name", "role": "Role", "addMemberByEmail": "Add member by email",
    "addBudgetItem": "Add Budget Item", "editBudgetItem": "Edit Budget Item", "category": "Category", "plannedBudget": "Planned Budget", "actualSpending": "Actual Spending",
    "addRisk": "Add Risk", "editRisk": "Edit Risk", "likelihood": "Likelihood", "impact": "Impact", "mitigation": "Mitigation Strategy",
    "parentTaskNotDoneError": "Cannot complete this task. Please finish parent task '{parentTaskName}' first.",
    "reminderToast": "Reminder for task: \"{taskName}\"",
    // CRUD Feedback
    "saveProjectSuccess": "Project '{name}' saved successfully.", "createProjectSuccess": "Project '{name}' created successfully.", "saveProjectError": "Failed to save project. Please try again.",
    "deleteProjectSuccess": "Project '{name}' and all its data have been deleted.", "deleteProjectError": "Failed to delete project. Please try again.",
    "teamMemberAdded": "Team member added successfully.", "teamMemberExists": "This user is already a member of the project.", "userNotFound": "User with this email not found.", "addMemberError": "Failed to add team member.",
    // Pages
    "noProjectSelected": "No Project Selected", "noProjectMessage": "Please select a project to begin.",
    "dashboardTitle": "Dashboard: {projectName}",
    "totalTasks": "Total Tasks", "teamMembers": "Team Members", "openRisks": "Open Risks", "budgetSpent": "Budget Spent", "taskStatus": "Task Status", "budgetOverview": "Budget Overview", "avgProjectProgress": "Avg. Project Progress",
    "tasksTitle": "Tasks for {projectName}", "noTasks": "No Tasks", "noTasksMessage": "Get started by creating a new task.",
    "calendarTitle": "Calendar for {projectName}",
    "teamTitle": "Team for {projectName}", "noTeam": "No Team Members", "noTeamMessage": "Add team members to your project.",
    "budgetTitle": "Budget for {projectName}", "noBudget": "No Budget Items", "noBudgetMessage": "Add budget items to track project expenses.", "planned": "Planned", "actual": "Actual", "remaining": "Remaining", "total": "Total",
    "risksTitle": "Risks for {projectName}", "noRisks": "No Risks Identified", "noRisksMessage": "Add potential risks to your project.",
    "profileTitle": "User Profile", "myTasks": "My Assigned Tasks", "myProjects": "My Projects", "achievements": "Achievements", "noAssignedTasks": "You have no tasks assigned to you.", "achievementCompletedProjects": "Completed {count} projects.",
    "settingsTitle": "Global Activity Log", "activityLog": "Activity Log", "noActivity": "No activity recorded yet.", "action": "Action", "user": "User", "project": "Project", "timestamp": "Timestamp",
    "reportsTitle": "Reports for {projectName}", "projectSummary": "Project Summary", "exportToCsv": "Export to CSV", "exportToPdf": "Export to PDF",
    // Task Page enhancements
    "filterByAssignee": "Filter by assignee", "filterByStatus": "Filter by status", "sortBy": "Sort By", "priorityDesc": "Priority (High to Low)", "priorityAsc": "Priority (Low to High)", "dueDateSort": "Due Date",
    // Task Statuses
    "toDo": "To Do", "inProgress": "In Progress", "done": "Done", "archived": "Archived"
  },
  ar: {
    // General
    "save": "حفظ", "cancel": "إلغاء", "delete": "حذف", "confirm": "تأكيد", "edit": "تعديل", "add": "إضافة", "urgent": "عاجل", "high": "مرتفع", "medium": "متوسط", "low": "منخفض", "priority": "الأولوية", "parentTask": "المهمة الرئيسية", "parent": "رئيسي", "severity": "الخطورة",
    // Sidebar
    "dashboard": "لوحة التحكم", "tasks": "المهام", "calendar": "التقويم", "team": "الفريق", "budget": "الميزانية", "risks": "المخاطر", "projects": "المشاريع", "settings": "الإعدادات", "reports": "التقارير",
    // Header
    "signOut": "تسجيل الخروج", "profile": "الملف الشخصي",
    // Login
    "loginTitle": "تسجيل الدخول إلى ProjectHub", "email": "البريد الإلكتروني", "password": "كلمة المرور", "logIn": "تسجيل الدخول", "fetchProjectsError": "فشل في جلب المشاريع: {message}",
    // Modals
    "newProject": "مشروع جديد", "editProject": "تعديل المشروع", "projectName": "اسم المشروع", "description": "الوصف", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء", "createProject": "إنشاء مشروع", "updateProject": "تحديث المشروع",
    "deleteProjectTitle": "حذف المشروع", "deleteProjectMessage": "هل أنت متأكد أنك تريد حذف هذا المشروع؟ سيؤدي هذا إلى حذف جميع المهام وأعضاء الفريق وبنود الميزانية والمخاطر المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
    "deleteItemTitle": "تأكيد الحذف", "deleteItemMessage": "هل أنت متأكد؟ لا يمكن التراجع عن هذا.",
    "addTask": "إضافة مهمة", "editTask": "تعديل المهمة", "taskName": "اسم المهمة", "status": "الحالة", "assignee": "المسؤول", "dueDate": "تاريخ الاستحقاق", "progress": "التقدم", "reminderDate": "تاريخ التذكير",
    "addTeamMember": "إضافة عضو للفريق", "editTeamMember": "تعديل عضو الفريق", "memberName": "اسم العضو", "role": "الدور", "addMemberByEmail": "إضافة عضو بالبريد الإلكتروني",
    "addBudgetItem": "إضافة بند ميزانية", "editBudgetItem": "تعديل بند الميزانية", "category": "الفئة", "plannedBudget": "الميزانية المخططة", "actualSpending": "الإنفاق الفعلي",
    "addRisk": "إضافة مخاطرة", "editRisk": "تعديل المخاطرة", "likelihood": "الاحتمالية", "impact": "التأثير", "mitigation": "استراتيجية التخفيف",
    "parentTaskNotDoneError": "لا يمكن إكمال هذه المهمة. يرجى إنهاء المهمة الرئيسية '{parentTaskName}' أولاً.",
    "reminderToast": "تذكير للمهمة: \"{taskName}\"",
    // CRUD Feedback
    "saveProjectSuccess": "تم حفظ المشروع '{name}' بنجاح.", "createProjectSuccess": "تم إنشاء المشروع '{name}' بنجاح.", "saveProjectError": "فشل حفظ المشروع. يرجى المحاولة مرة أخرى.",
    "deleteProjectSuccess": "تم حذف المشروع '{name}' وجميع بياناته.", "deleteProjectError": "فشل حذف المشروع. يرجى المحاولة مرة أخرى.",
    "teamMemberAdded": "تمت إضافة عضو الفريق بنجاح.", "teamMemberExists": "هذا المستخدم عضو بالفعل في المشروع.", "userNotFound": "لم يتم العثور على مستخدم بهذا البريد الإلكتروني.", "addMemberError": "فشل في إضافة عضو الفريق.",
    // Pages
    "noProjectSelected": "لم يتم تحديد مشروع", "noProjectMessage": "يرجى تحديد مشروع للبدء.",
    "dashboardTitle": "لوحة التحكم: {projectName}",
    "totalTasks": "إجمالي المهام", "teamMembers": "أعضاء الفريق", "openRisks": "المخاطر القائمة", "budgetSpent": "الميزانية المصروفة", "taskStatus": "حالة المهام", "budgetOverview": "نظرة عامة على الميزانية", "avgProjectProgress": "متوسط تقدم المشروع",
    "tasksTitle": "مهام مشروع {projectName}", "noTasks": "لا توجد مهام", "noTasksMessage": "ابدأ بإنشاء مهمة جديدة.",
    "calendarTitle": "تقويم: {projectName}",
    "teamTitle": "فريق مشروع {projectName}", "noTeam": "لا يوجد أعضاء في الفريق", "noTeamMessage": "أضف أعضاء الفريق إلى مشروعك.",
    "budgetTitle": "ميزانية مشروع {projectName}", "noBudget": "لا توجد بنود في الميزانية", "noBudgetMessage": "أضف بنود الميزانية لتتبع نفقات المشروع.", "planned": "المخطط له", "actual": "الفعلي", "remaining": "المتبقي", "total": "الإجمالي",
    "risksTitle": "مخاطر مشروع {projectName}", "noRisks": "لم يتم تحديد مخاطر", "noRisksMessage": "أضف المخاطر المحتملة لمشروعك.",
    "profileTitle": "الملف الشخصي للمستخدم", "myTasks": "المهام المسندة إلي", "myProjects": "مشاريعي", "achievements": "الإنجازات", "noAssignedTasks": "ليس لديك مهام مسندة إليك.", "achievementCompletedProjects": "أكملت {count} مشاريع.",
    "settingsTitle": "سجل النشاط العالمي", "activityLog": "سجل النشاط", "noActivity": "لم يتم تسجيل أي نشاط بعد.", "action": "الإجراء", "user": "المستخدم", "project": "المشروع", "timestamp": "الوقت",
    "reportsTitle": "تقارير مشروع {projectName}", "projectSummary": "ملخص المشروع", "exportToCsv": "تصدير إلى CSV", "exportToPdf": "تصدير إلى PDF",
    // Task Page enhancements
    "filterByAssignee": "تصفية حسب المسؤول", "filterByStatus": "تصفية حسب الحالة", "sortBy": "فرز حسب", "priorityDesc": "الأولوية (من الأعلى إلى الأقل)", "priorityAsc": "الأولوية (من الأقل إلى الأعلى)", "dueDateSort": "تاريخ الاستحقاق",
    // Task Statuses
    "toDo": "قيد التنفيذ", "inProgress": "جاري التنفيذ", "done": "مكتمل", "archived": "مؤرشف"
  }
};
