/**
 * Native Internalization (i18n) for Pensionet
 */
window.i18n = (function() {
  const dictionary = {
    he: {
      "tab_ongoing": "ניהול שוטף",
      "tab_history": "היסטוריית הזמנות",
      "tab_audit": "יומן פעולות",
      "tab_clients": "לקוחות",
      "tab_settings": "הגדרות",
      "header_whats_new": "מה חדש?",
      "header_logout": "יציאה",
      "header_booking_link": "קישור להזמנות",
      "header_admin_panel": "פאנל ניהול",
      "header_insights": "מדריך תובנות",
      "header_reports": "דוחות",
      "settings_title": "הגדרות פנסיון",
      "settings_subtitle": "צפה בפרטי העסק והגדרות המערכת",
      "settings_my_profile": "הפרופיל האישי שלי",
      "settings_my_profile_desc": "ניהול הפרטים האישיים המזוהים איתך במערכת",
      "settings_display_name": "שם תצוגה:",
      "settings_email_readonly": "כתובת אימייל (לקריאה בלבד):",
      "settings_update_profile": "עדכן פרופיל",
      "settings_business_details": "פרטי עסק",
      "settings_business_name": "שם הפנסיון / העסק:",
      "settings_admin_name": "שם מנהל המערכת:",
      "settings_location": "מיקום הפנסיון:",
      "settings_operational": "הגדרות תפעוליות",
      "settings_whatsapp_phone": "טלפון לווטסאפ (לקוחות יחזרו אליו):",
      "settings_capacity": "קיבולת (כלבים):",
      "settings_default_price": "מחיר ברירת מחדל ליום:",
      "settings_language": "שפת מערכת (System Language):",
      "settings_save_all": "שמור את כל השינויים",
      "ongoing_movements": "תנועות להיום",
      "ongoing_entering": "נכנסים היום",
      "ongoing_leaving": "יוצאים היום",
      "ongoing_schedule_title": "לוח זמנים חודשי (נוכחות כלבים)",
      "ongoing_btn_monthly": "חודשי",
      "ongoing_btn_weekly": "שבועי",
      "ongoing_btn_today": "נוכחות היום",
      "ongoing_btn_collapse": "כווץ",
      "ongoing_btn_add_event": "הוספת אירוע",
      "ongoing_btn_prev_month": "חודש קודם",
      "ongoing_btn_next_month": "חודש הבא",
      "future_orders_title": "הזמנות עתידיות",
      "search_placeholder": "חיפוש חופשי (שם, טלפון, כלב)...",
      "col_order_date": "מועד הזמנה",
      "col_owner_name": "שם הבעלים",
      "col_phone": "טלפון",
      "col_order_confirm": "אישור הזמנה",
      "col_checkin": "כניסה",
      "col_checkout": "יציאה",
      "col_dog_name": "שם הכלב",
      "col_age": "גיל",
      "col_size": "גודל",
      "col_neutered": "מסורס / מעוקרת",
      "col_notes": "הערות מיוחדות",
      "col_addons": "תוספות",
      "col_daily_price": "מחיר ליום",
      "col_total_stay": "סה\"כ לשהייה",
      "col_total_with_addons": "סה\"כ כולל תוספות",
      "col_status": "סטטוס",
      "col_admin_notes": "הערות מנהל",
      "history_title": "היסטוריית הזמנות",
      "history_search_placeholder": "חיפוש בהיסטוריה (שם, טלפון, כלב)...",
      "audit_title": "יומן פעולות מערכת",
      "audit_desc": "תיעוד בזמן אמת של כל הפעולות שבוצעו במערכת על ידי הצוות והמנהל",
      "clients_stats_total": "סה\"כ לקוחות",
      "clients_stats_avg": "ממוצע הזמנות ללקוח",
      "clients_stats_dogs": "סה\"כ כלבים במערכת",
      "clients_title": "מאגר לקוחות",
      "clients_search_placeholder": "חיפוש לפי שם, טלפון, שם כלב...",
      "clients_col_name": "שם הלקוח",
      "clients_col_phone": "טלפון",
      "clients_col_city": "עיר מגורים",
      "clients_col_associated_dogs": "כלבים משויכים",
      "clients_col_total_orders": "סה\"כ הזמנות",
      "clients_col_last_order": "הזמנה אחרונה",
      "clients_col_total_revenue": "הכנסה מהלקוח",
      "clients_col_default_price": "מחיר ברירת מחדל",
      "clients_col_manage": "ניהול",
      "save_changes": "שמור שינויים",
      "filter_all_statuses": "כל הסטטוסים",
      "status_pending": "ממתין (חדש)",
      "status_approved": "מאושר",
      "status_canceled": "בוטל",
      "sort_checkin_asc": "כניסה (מהקרוב לרחוק)",
      "sort_checkin_desc": "כניסה (מהרחוק לקרוב)",
      "sort_order_date": "תאריך הזמנה (חדש לישן)",
      "sort_dog_name": "שם הכלב (א-ת)",
      "no_checkins_today": "אין כניסות היום",
      "no_checkouts_today": "אין יציאות היום",
      "weekly_view": "תצוגה שבועית:",
      "monthly_view": "תצוגה חודשית:",
      "day_sun": "ראשון",
      "day_mon": "שני",
      "day_tue": "שלישי",
      "day_wed": "רביעי",
      "day_thu": "חמישי",
      "day_fri": "שישי",
      "day_sat": "שבת",
      "day_sun_short": "א׳",
      "day_mon_short": "ב׳",
      "day_tue_short": "ג׳",
      "day_wed_short": "ד׳",
      "day_thu_short": "ה׳",
      "day_fri_short": "ו׳",
      "day_sat_short": "ש׳",
      "month_0": "ינואר",
      "month_1": "פברואר",
      "month_2": "מרץ",
      "month_3": "אפריל",
      "month_4": "מאי",
      "month_5": "יוני",
      "month_6": "יולי",
      "month_7": "אוגוסט",
      "month_8": "ספטמבר",
      "month_9": "אוקטובר",
      "month_10": "נובמבר",
      "month_11": "דצמבר",
      "btn_prev_week": "שבוע קודם",
      "btn_next_week": "שבוע הבא"
    },
    en: {
      "tab_ongoing": "Ongoing Mgmt",
      "tab_history": "Order History",
      "tab_audit": "Audit Log",
      "tab_clients": "Clients",
      "tab_settings": "Settings",
      "header_whats_new": "What's New?",
      "header_logout": "Logout",
      "header_booking_link": "Booking Link",
      "header_admin_panel": "Admin Panel",
      "header_insights": "Insights Guide",
      "header_reports": "Reports",
      "settings_title": "Pension Settings",
      "settings_subtitle": "View business details and system settings",
      "settings_my_profile": "My Personal Profile",
      "settings_my_profile_desc": "Manage your personal details identified in the system",
      "settings_display_name": "Display Name:",
      "settings_email_readonly": "Email Address (Read-Only):",
      "settings_update_profile": "Update Profile",
      "settings_business_details": "Business Details",
      "settings_business_name": "Pension / Business Name:",
      "settings_admin_name": "System Admin Name:",
      "settings_location": "Pension Location:",
      "settings_operational": "Operational Settings",
      "settings_whatsapp_phone": "WhatsApp Phone (Clients return to):",
      "settings_capacity": "Capacity (Dogs):",
      "settings_default_price": "Default Daily Price:",
      "settings_language": "System Language (שפת מערכת):",
      "settings_save_all": "Save All Changes",
      "ongoing_movements": "Today's Movements",
      "ongoing_entering": "Check-ins Today",
      "ongoing_leaving": "Check-outs Today",
      "ongoing_schedule_title": "Monthly Schedule (Dog Occupancy)",
      "ongoing_btn_monthly": "Monthly",
      "ongoing_btn_weekly": "Weekly",
      "ongoing_btn_today": "Today's",
      "ongoing_btn_collapse": "Collapse",
      "ongoing_btn_add_event": "Add Event",
      "ongoing_btn_prev_month": "Prev Month",
      "ongoing_btn_next_month": "Next Month",
      "future_orders_title": "Future Orders",
      "search_placeholder": "Search (Name, Phone, Dog)...",
      "col_order_date": "Order Date",
      "col_owner_name": "Owner Name",
      "col_phone": "Phone",
      "col_order_confirm": "Order Confirm",
      "col_checkin": "Check-in",
      "col_checkout": "Check-out",
      "col_dog_name": "Dog Name",
      "col_age": "Age",
      "col_size": "Size",
      "col_neutered": "Neutered / Spayed",
      "col_notes": "Special Notes",
      "col_addons": "Add-ons",
      "col_daily_price": "Daily Price",
      "col_total_stay": "Total for Stay",
      "col_total_with_addons": "Total w/ Add-ons",
      "col_status": "Status",
      "col_admin_notes": "Admin Notes",
      "history_title": "Order History",
      "history_search_placeholder": "Search history (Name, Phone, Dog)...",
      "audit_title": "System Audit Log",
      "audit_desc": "Real-time record of all actions performed in the system by the staff and administration",
      "clients_stats_total": "Total Clients",
      "clients_stats_avg": "Avg Orders per Client",
      "clients_stats_dogs": "Total Dogs",
      "clients_title": "Clients Database",
      "clients_search_placeholder": "Search by Name, Phone, Dog Name...",
      "clients_col_name": "Client Name",
      "clients_col_phone": "Phone",
      "clients_col_city": "City",
      "clients_col_associated_dogs": "Associated Dogs",
      "clients_col_total_orders": "Total Orders",
      "clients_col_last_order": "Last Order",
      "clients_col_total_revenue": "Total Revenue",
      "clients_col_default_price": "Default Price",
      "clients_col_manage": "Manage",
      "save_changes": "Save Changes",
      "filter_all_statuses": "All Statuses",
      "status_pending": "Pending (New)",
      "status_approved": "Approved",
      "status_canceled": "Canceled",
      "sort_checkin_asc": "Check-in (Asc)",
      "sort_checkin_desc": "Check-in (Desc)",
      "sort_order_date": "Order Date (New to Old)",
      "sort_dog_name": "Dog Name (A-Z)",
      "no_checkins_today": "No check-ins today",
      "no_checkouts_today": "No check-outs today",
      "weekly_view": "Weekly View:",
      "monthly_view": "Monthly View:",
      "day_sun": "Sunday",
      "day_mon": "Monday",
      "day_tue": "Tuesday",
      "day_wed": "Wednesday",
      "day_thu": "Thursday",
      "day_fri": "Friday",
      "day_sat": "Saturday",
      "day_sun_short": "Sun",
      "day_mon_short": "Mon",
      "day_tue_short": "Tue",
      "day_wed_short": "Wed",
      "day_thu_short": "Thu",
      "day_fri_short": "Fri",
      "day_sat_short": "Sat",
      "month_0": "January",
      "month_1": "February",
      "month_2": "March",
      "month_3": "April",
      "month_4": "May",
      "month_5": "June",
      "month_6": "July",
      "month_7": "August",
      "month_8": "September",
      "month_9": "October",
      "month_10": "November",
      "month_11": "December",
      "btn_prev_week": "Prev Week",
      "btn_next_week": "Next Week"
    }
  };

  let currentLang = localStorage.getItem('pensionet_lang') || 'he';

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'he' ? 'rtl' : 'ltr';

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dictionary[currentLang] && dictionary[currentLang][key]) {
        // preserve icon if there is one
        const icon = el.querySelector('i');
        if (icon) {
           el.innerHTML = '';
           el.appendChild(icon);
           el.appendChild(document.createTextNode(' ' + dictionary[currentLang][key]));
        } else {
           if (el.tagName === 'INPUT' && el.type === 'text') {
             el.placeholder = dictionary[currentLang][key];
           } else {
             el.textContent = dictionary[currentLang][key];
           }
        }
      }
    });
    
    // Update language select if it exists
    const langSelect = document.getElementById('settings-language');
    if (langSelect) {
        langSelect.value = currentLang;
    }
  }

  function setLanguage(lang) {
    if (dictionary[lang]) {
      currentLang = lang;
      localStorage.setItem('pensionet_lang', lang);
      applyLanguage();
    }
  }

  // Auto-apply on load
  document.addEventListener('DOMContentLoaded', applyLanguage);

  return {
    setLanguage,
    applyLanguage,
    getCurrentLang: () => currentLang,
    getTranslation: (key) => dictionary[currentLang][key] || key
  };
})();
