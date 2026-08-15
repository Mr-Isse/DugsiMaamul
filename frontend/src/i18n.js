import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      overview: "Overview",
      branches: "Branches",
      classes: "Classes",
      subjects: "Subjects",
      students: "Students",
      teachers: "Teachers",
      schedule: "Schedule",
      attendance: "Attendance",
      exams: "Exams",
      examHalls: "Exam Halls",
      finance: "Finance",
      announcements: "Announcements",
      websiteContent: "Website Content",
      schoolEvents: "School Events",
      reports: "Reports",
      settings: "Settings",
      academicYears: "Academic Years",
      promotions: "Promotions",
      logout: "Logout",
      welcome: "Welcome back",
      active_branch: "Active Branch",
      switch_branch: "Switch Branch",
      all_branches: "All Branches"
    }
  },
  so: {
    translation: {
      dashboard: "Dashboard",
      overview: "Guudmar",
      branches: "Laamaha",
      classes: "Fasallada",
      subjects: "Madooyinka",
      students: "Ardayda",
      teachers: "Macalimiinta",
      schedule: "Jadwalka",
      attendance: "Isku-tagga",
      exams: "Imtixaanada",
      examHalls: "Hoolalka Imtixaanka",
      finance: "Maaliyadda",
      announcements: "Ogaysiisyada",
      websiteContent: "Mawduuca Websaydhka",
      schoolEvents: "Dhacdooyinka Iskuulka",
      reports: "Warbixinada",
      settings: "Habsami-socodka",
      academicYears: "Sannad-Dugsiyeedka",
      promotions: "Dalacsiinta",
      logout: "Ka bax",
      welcome: "Ku soo dhawaada",
      active_branch: "Laanta Firfircoon",
      switch_branch: "Beddel Laanta",
      all_branches: "Dhammaan Laamaha"
    }
  },
  ar: {
    translation: {
      dashboard: "لوحة القيادة",
      overview: "نظرة عامة",
      branches: "الفروع",
      classes: "الفصول",
      subjects: "المواد",
      students: "الطلاب",
      teachers: "المعلمون",
      schedule: "الجدول الزمني",
      attendance: "الحضور",
      exams: "الامتحانات",
      examHalls: "قاعات الامتحانات",
      finance: "المالية",
      announcements: "الإعلانات",
      websiteContent: "محتوى الموقع",
      schoolEvents: "فعاليات المدرسة",
      reports: "التقارير",
      settings: "الإعدادات",
      academicYears: "السنوات الأكاديمية",
      promotions: "الترقيات",
      logout: "تسجيل الخروج",
      welcome: "مرحباً بك",
      active_branch: "الفرع النشط",
      switch_branch: "تبديل الفرع",
      all_branches: "جميع الفروع"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
