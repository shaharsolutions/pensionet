// Use config values (falling back to inline if config not loaded)
const PENSION_NET_URL = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG.URL : "";
const PENSION_NET_KEY = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG.ANON_KEY : "";

const pNetSupabase = getSupabase();
let PNET_MAX_CAPACITY = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.MAX_CAPACITY : 15;

function calculateDaysLocal(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights + 1;
}

function getMonthName(monthIndex) {
    if (window.i18n) return window.i18n.getTranslation('month_' + monthIndex);
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return months[monthIndex];
}

function formatCurrencyLocal(amount) {
    const lang = window.i18n ? (window.i18n.getCurrentLang() === 'he' ? 'he-IL' : 'en-US') : 'he-IL';
    const symbol = window.i18n ? (window.i18n.getCurrentLang() === 'he' ? '₪' : '₪') : '₪'; // Keeping Shekel for now but formatting it
    return (window.i18n && window.i18n.getCurrentLang() === 'en' ? 'ILS ' : '₪') + amount.toLocaleString(lang);
}

function translateSize(size) {
    if (!window.i18n) return size;
    const map = {
        'גדול': 'dog_size_large',
        'בינוני': 'dog_size_medium',
        'קטן': 'dog_size_small',
        'לא צוין': 'dog_size_none'
    };
    return window.i18n.getTranslation(map[size] || size);
}

function generateBusinessInsights(orders, thisMonthRev, lastMonthRev, occupancy, topCustomers, sizeBreakdown) {
    const insights = [];
    const t = (key, params = {}) => {
        let text = window.i18n ? window.i18n.getTranslation(key) : key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    };

    // Growth analysis
    const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
    if (revenueGrowth > 10) {
        insights.push({
            icon: "<i class='fas fa-rocket'></i>",
            title: t('insight_growth_title'),
            analysis: t('insight_growth_analysis', { val: revenueGrowth.toFixed(1) }),
            recommendation: t('insight_growth_rec')
        });
    } else if (revenueGrowth < -10) {
        insights.push({
            icon: "<i class='fas fa-exclamation-triangle'></i>",
            title: t('insight_decline_title'),
            analysis: t('insight_decline_analysis', { val: Math.abs(revenueGrowth).toFixed(1) }),
            recommendation: t('insight_decline_rec')
        });
    }

    // Occupancy analysis
    const occupancyNum = parseFloat(occupancy);
    if (occupancyNum > 80) {
        insights.push({
            icon: "<i class='fas fa-bullseye'></i>",
            title: t('insight_occupancy_title'),
            analysis: t('insight_occupancy_analysis', { val: occupancyNum.toFixed(1) }),
            recommendation: t('insight_occupancy_rec')
        });
    } else if (occupancyNum < 50) {
        insights.push({
            icon: "<i class='fas fa-bullhorn'></i>",
            title: t('insight_potential_title'),
            analysis: t('insight_potential_analysis', { val: occupancyNum.toFixed(1) }),
            recommendation: t('insight_potential_rec')
        });
    }

    // Loyalty analysis
    const repeatCustomers = {};
    orders.forEach((order) => {
        repeatCustomers[order.phone] = (repeatCustomers[order.phone] || 0) + 1;
    });
    const loyalCustomers = Object.values(repeatCustomers).filter((count) => count >= 3).length;
    const totalCustomers = Object.keys(repeatCustomers).length;
    const loyaltyRate = totalCustomers > 0 ? (loyalCustomers / totalCustomers) * 100 : 0;

    if (loyaltyRate > 30) {
        insights.push({
            icon: "<i class='fas fa-heart'></i>",
            title: t('insight_loyalty_title'),
            analysis: t('insight_loyalty_analysis', { val: loyaltyRate.toFixed(1) }),
            recommendation: t('insight_loyalty_rec')
        });
    } else {
        insights.push({
            icon: "<i class='fas fa-gift'></i>",
            title: t('insight_retention_title'),
            analysis: t('insight_retention_analysis', { val: loyaltyRate.toFixed(1) }),
            recommendation: t('insight_retention_rec')
        });
    }

    // Dependency analysis
    const top20PercentCount = Math.ceil(totalCustomers * 0.2);
    const top20Revenue = topCustomers.slice(0, top20PercentCount).reduce((sum, c) => sum + c.revenue, 0);
    const totalRevenue = topCustomers.reduce((sum, c) => sum + c.revenue, 0);
    const top20Percentage = totalRevenue > 0 ? (top20Revenue / totalRevenue) * 100 : 0;

    if (top20Percentage > 70) {
        insights.push({
            icon: "<i class='fas fa-star'></i>",
            title: t('insight_dependency_title'),
            analysis: t('insight_dependency_analysis', { val: top20Percentage.toFixed(1) }),
            recommendation: t('insight_dependency_rec')
        });
    }

    // Expertise analysis
    const sortedSizes = Object.entries(sizeBreakdown).sort((a, b) => b[1] - a[1]);
    if (sortedSizes.length > 0) {
        const topSize = sortedSizes[0];
        const topSizePercent = orders.length > 0 ? (topSize[1] / orders.length) * 100 : 0;
        if (topSizePercent > 40) {
            insights.push({
                icon: "<i class='fas fa-dog'></i>",
                title: t('insight_expertise_title', { val: translateSize(topSize[0]) }),
                analysis: t('insight_expertise_analysis', { val: topSizePercent.toFixed(1), size: translateSize(topSize[0]) }),
                recommendation: t('insight_expertise_rec')
            });
        }
    }

    // Seasonality analysis
    const monthlyDistribution = {};
    orders.forEach((order) => {
        const month = new Date(order.check_in).getMonth();
        monthlyDistribution[month] = (monthlyDistribution[month] || 0) + 1;
    });

    const entries = Object.entries(monthlyDistribution);
    if (entries.length > 0) {
        const maxMonth = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["0", 0]);
        const minMonth = entries.reduce((min, curr) => (curr[1] < min[1] ? curr : min), ["0", 999]);
        if (maxMonth[1] > minMonth[1] * 2) {
            insights.push({
                icon: "<i class='fas fa-calendar-alt'></i>",
                title: t('insight_seasonality_title'),
                analysis: t('insight_seasonality_analysis', { max: getMonthName(parseInt(maxMonth[0])), min: getMonthName(parseInt(minMonth[0])) }),
                recommendation: t('insight_seasonality_rec')
            });
        }
    }

    const insightsElement = document.getElementById("businessInsights");
    if (!insightsElement) return;

    let html = '<div class="business-insights-container">';
    insights.forEach((insight) => {
        let typeClass = 'info';
        if (insight.icon.includes('fa-rocket') || insight.icon.includes('fa-heart') || insight.icon.includes('fa-star')) typeClass = 'success';
        if (insight.icon.includes('fa-exclamation-triangle')) typeClass = 'warning';
        if (insight.icon.includes('fa-bullhorn') || insight.icon.includes('fa-gift')) typeClass = 'opportunity';

        html += `
            <div class="insight-card ${typeClass}">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <h4 class="insight-title">${insight.title}</h4>
                </div>
                <div class="insight-body">
                    <div class="insight-analysis">${insight.analysis}</div>
                    <div class="insight-recommendation">
                        <span class="rec-label"><i class="fas fa-lightbulb"></i> ${window.i18n ? window.i18n.getTranslation('recommendation_label') : 'Recommendation'}:</span>
                        ${insight.recommendation}
                    </div>
                </div>
            </div>
        `;
    });
    html += "</div>";
    insightsElement.innerHTML = html;
}

async function loadAnalytics() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const isDemo = urlParams.get('demo') === 'true';

        let session = null;
        if (!isDemo) {
            session = await Auth.getSession();
            if (!session) {
                window.location.href = "login.html";
                return;
            }
        }

        let allOrders = [];
        if (isDemo) {
            // Mock data for demo mode
            allOrders = [
                { dog_name: "בוני", check_in: "2026-03-01", check_out: "2026-03-05", status: "מאושר", phone: "0501111111", price_per_day: 130, owner_name: "ישראל ישראלי", dog_breed: "גדול" },
                { dog_name: "לוקה", check_in: "2026-03-02", check_out: "2026-03-10", status: "מאושר", phone: "0502222222", price_per_day: 150, owner_name: "מיכל כהן", dog_breed: "בינוני" },
                { dog_name: "מקס", check_in: "2026-03-10", check_out: "2026-03-15", status: "מאושר", phone: "0503333333", price_per_day: 130, owner_name: "דוד לוי", dog_breed: "קטן" },
                { dog_name: "בלה", check_in: "2026-02-15", check_out: "2026-02-20", status: "מאושר", phone: "0504444444", price_per_day: 140, owner_name: "שרה גולד", dog_breed: "גדול" },
                { dog_name: "צ'ארלי", check_in: "2026-02-10", check_out: "2026-02-18", status: "מאושר", phone: "0505555555", price_per_day: 130, owner_name: "יוסי כהן", dog_breed: "בינוני" }
            ];
        } else {
            // 1. Ensure Auth is ready
            if (window.authCheckPromise) await window.authCheckPromise;
            
            const profile = window.currentUserProfile;
            const pension = window.currentPension;

            if (!profile || !profile.pension_id) {
                console.warn("No pension profile found, falling back to individual user filter");
                const { data, error } = await pNetSupabase
                    .from("orders")
                    .select("id, dog_name, check_in, check_out, status, created_at, phone, price_per_day, dog_breed, owner_name")
                    .eq("user_id", session.user.id)
                    .eq("status", "מאושר")
                    .order("check_in", { ascending: true });
                if (error) throw error;
                allOrders = data;
            } else {
                // 2. Fetch all staff members for this pension
                const { data: staffList } = await pNetSupabase
                    .from("profiles")
                    .select("user_id")
                    .eq("pension_id", profile.pension_id);
                
                const staffIds = staffList ? staffList.map(s => s.user_id) : [session.user.id];
                console.log("Analytics: Fetching for staff IDs:", staffIds);

                const { data, error } = await pNetSupabase
                    .from("orders")
                    .select("id, dog_name, check_in, check_out, status, created_at, phone, price_per_day, dog_breed, owner_name")
                    .in("user_id", staffIds)
                    .eq("status", "מאושר")
                    .order("check_in", { ascending: true });

                if (error) throw error;
                allOrders = data;
            }
        }



        if (isDemo) {
            const headSub = document.getElementById('header-business-name');
            if (headSub) headSub.textContent = (window.i18n ? window.i18n.getTranslation('demo_pension_name') : "הפנסיון המדגים");
            PNET_MAX_CAPACITY = 10;
        } else if (session) {
            // Fetch owner's profile for max_capacity and business_name
            const { data: profile } = await pNetSupabase
                .from("profiles")
                .select("max_capacity, business_name")
                .eq("user_id", session.user.id)
                .single();
            
            if (profile) {
                if (profile.business_name) {
                    const headSub = document.getElementById('header-business-name');
                    if (headSub) headSub.textContent = profile.business_name;
                }
                if (profile.max_capacity) {
                    PNET_MAX_CAPACITY = profile.max_capacity;
                    const capLabel = document.querySelector(".stat-label");
                    if (capLabel && capLabel.textContent.includes("קיבולת מקסימלית")) {
                        capLabel.textContent = `קיבולת מקסימלית: ${PNET_MAX_CAPACITY} כלבים`;
                    }
                }
            }
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const ordersWithDates = allOrders.map(o => ({
            ...o,
            _check_in: new Date(o.check_in + 'T00:00:00'),
            _check_out: new Date(o.check_out + 'T00:00:00')
        }));

        const thisMonthOrders = ordersWithDates.filter((order) => {
            const checkIn = order._check_in;
            return (checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear);
        });

        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => {
            const days = calculateDaysLocal(order.check_in, order.check_out);
            const price = order.price_per_day || 130;
            return sum + days * price;
        }, 0);

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthOrders = ordersWithDates.filter((order) => {
            const checkIn = order._check_in;
            return (checkIn.getMonth() === lastMonth && checkIn.getFullYear() === lastMonthYear);
        });

        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => {
            const days = calculateDaysLocal(order.check_in, order.check_out);
            const price = order.price_per_day || 130;
            return sum + days * price;
        }, 0);

        const revenueChange = lastMonthRevenue > 0 ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : 0;
        const revenueChangeNum = parseFloat(revenueChange);

        document.getElementById("monthlyRevenue").textContent = formatCurrencyLocal(thisMonthRevenue);
        const revChangeEl = document.getElementById("revenueChange");
        
        if (revenueChangeNum === 0) {
            revChangeEl.textContent = `אין שינוי מהחודש הקודם`;
            revChangeEl.className = `stat-change neutral`;
        } else {
            revChangeEl.textContent = `${revenueChangeNum > 0 ? "+" : ""}${revenueChange}% מהחודש הקודם`;
            revChangeEl.className = `stat-change ${revenueChangeNum > 0 ? "positive" : "negative"}`;
        }

        const uniqueDogsThisMonth = new Set(thisMonthOrders.map((o) => o.dog_name)).size;
        const uniqueDogsLastMonth = new Set(lastMonthOrders.map((o) => o.dog_name)).size;
        const dogsChange = uniqueDogsLastMonth > 0 ? (((uniqueDogsThisMonth - uniqueDogsLastMonth) / uniqueDogsLastMonth) * 100).toFixed(1) : 0;
        const dogsChangeNum = parseFloat(dogsChange);

        document.getElementById("monthlyDogs").textContent = uniqueDogsThisMonth;
        const dogsChangeEl = document.getElementById("dogsChange");

        if (dogsChangeNum === 0) {
            dogsChangeEl.textContent = `אין שינוי מהחודש הקודם`;
            dogsChangeEl.className = `stat-change neutral`;
        } else {
            dogsChangeEl.textContent = `${dogsChangeNum > 0 ? "+" : ""}${dogsChange}% מהחודש הקודם`;
            dogsChangeEl.className = `stat-change ${dogsChangeNum > 0 ? "positive" : "negative"}`;
        }

        // Efficient Occupancy Calculation
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthOccupancyMap = new Array(daysInMonth + 1).fill(0);
        
        thisMonthOrders.forEach(order => {
            const start = order._check_in.getDate();
            const end = order._check_out.getDate();
            // Simplify: assume order is within this month for this calculation if month matches
            for (let d = start; d <= Math.min(end, daysInMonth); d++) {
                monthOccupancyMap[d]++;
            }
        });

        const totalOccupancy = monthOccupancyMap.reduce((a, b) => a + b, 0);

        const avgOccupancy = ((totalOccupancy / daysInMonth / PNET_MAX_CAPACITY) * 100).toFixed(1);
        document.getElementById("avgOccupancy").textContent = avgOccupancy + "%";

        const uniqueCustomersAll = new Set(allOrders.map((o) => o.phone)).size;
        const customerOrderCounts = {};
        allOrders.forEach(o => {
            customerOrderCounts[o.phone] = (customerOrderCounts[o.phone] || 0) + 1;
        });
        const returningCustomersCount = Object.values(customerOrderCounts).filter(count => count > 1).length;
        const retentionRate = uniqueCustomersAll > 0 ? ((returningCustomersCount / uniqueCustomersAll) * 100).toFixed(1) : 0;

        const newCustomersThisMonth = new Set(
            thisMonthOrders.filter((order) => {
                const firstOrder = allOrders.filter((o) => o.phone === order.phone).sort((a, b) => new Date(a.check_in) - new Date(b.check_in))[0];
                return (new Date(firstOrder.check_in).getMonth() === currentMonth && new Date(firstOrder.check_in).getFullYear() === currentYear);
            }).map((o) => o.phone)
        ).size;

        document.getElementById("retentionRate").textContent = retentionRate + "%";
        document.getElementById("newCustomers").textContent = `${newCustomersThisMonth} לקוחות חדשים החודש`;

        const revenueByMonth = {};
        allOrders.forEach((order) => {
            const checkIn = new Date(order.check_in);
            const monthKey = `${checkIn.getFullYear()}-${checkIn.getMonth()}`;
            if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
            const days = calculateDaysLocal(order.check_in, order.check_out);
            const price = order.price_per_day || 130;
            revenueByMonth[monthKey] += days * price;
        });

        const recentMonths = Object.values(revenueByMonth).slice(-3);
        const avgRevenue = recentMonths.length > 0 ? recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length : 0;
        const growthRate = 1.05;

        for (let i = 1; i <= 3; i++) {
            const futureMonth = new Date(currentYear, currentMonth + i, 1);
            const prediction = avgRevenue * Math.pow(growthRate, i);
            document.getElementById(`nextMonth${i}`).textContent = getMonthName(futureMonth.getMonth()) + " " + futureMonth.getFullYear();
            document.getElementById(`prediction${i}`).textContent = formatCurrencyLocal(Math.round(prediction));
        }

        const last6Months = [];
        const last6MonthsRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(currentYear, currentMonth - i, 1);
            const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
            last6Months.push(getMonthName(monthDate.getMonth()));
            last6MonthsRevenue.push(revenueByMonth[monthKey] || 0);
        }

        new Chart(document.getElementById("revenueChart"), {
            type: "bar",
            data: {
                labels: last6Months,
                datasets: [{
                    label: "הכנסות (₪)",
                    data: last6MonthsRevenue,
                    backgroundColor: "rgba(102, 126, 234, 0.6)",
                    borderColor: "rgba(102, 126, 234, 1)",
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: function(value) { return "₪" + value.toLocaleString(); } },
                    },
                },
            },
        });

        const last6MonthsOccupancy = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(currentYear, currentMonth - i, 1);
            const m = monthDate.getMonth();
            const y = monthDate.getFullYear();
            const daysInThisMonth = new Date(y, m + 1, 0).getDate();
            
            const monthOrders = ordersWithDates.filter(o => o._check_in.getMonth() === m && o._check_in.getFullYear() === y);
            
            const map = new Array(daysInThisMonth + 1).fill(0);
            monthOrders.forEach(order => {
                const start = order._check_in.getDate();
                const end = order._check_out.getDate();
                for (let d = start; d <= Math.min(end, daysInThisMonth); d++) {
                    map[d]++;
                }
            });
            
            const monthTotalOccupancy = map.reduce((a, b) => a + b, 0);
            const monthAvgOccupancy = ((monthTotalOccupancy / daysInThisMonth / PNET_MAX_CAPACITY) * 100).toFixed(1);
            last6MonthsOccupancy.push(parseFloat(monthAvgOccupancy));
        }

        new Chart(document.getElementById("occupancyChart"), {
            type: "bar",
            data: {
                labels: last6Months,
                datasets: [{
                    label: "תפוסה ממוצעת (%)",
                    data: last6MonthsOccupancy,
                    backgroundColor: "rgba(76, 175, 80, 0.8)",
                    borderColor: "rgba(76, 175, 80, 1)",
                    borderWidth: 2,
                    borderRadius: 8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + "%"; } } },
                },
                plugins: { legend: { display: false } },
            },
        });

        const customerStats = {};
        allOrders.forEach((order) => {
            if (!customerStats[order.phone]) {
                customerStats[order.phone] = { name: order.owner_name, phone: order.phone, orders: 0, revenue: 0 };
            }
            customerStats[order.phone].orders++;
            const days = calculateDaysLocal(order.check_in, order.check_out);
            const price = order.price_per_day || 130;
            customerStats[order.phone].revenue += days * price;
        });

        const topCustomers = Object.values(customerStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const tbody = document.querySelector("#topCustomersTable tbody");
        tbody.innerHTML = "";
        topCustomers.forEach((customer, index) => {
            const avgPerVisit = customer.revenue / customer.orders;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${customer.name}</td>
                <td><a href="https://wa.me/${customer.phone.replace(/\D/g, '').replace(/^0/, '972')}" target="_blank" style="color: #25D366; text-decoration: none; font-weight: bold;">${customer.phone} <i class="fab fa-whatsapp"></i></a></td>
                <td>${customer.orders}</td>
                <td><strong>${formatCurrencyLocal(customer.revenue)}</strong></td>
                <td>${formatCurrencyLocal(Math.round(avgPerVisit))}</td>
            `;
            tbody.appendChild(tr);
        });

        const sizeBreakdown = {};
        allOrders.forEach((order) => {
            const size = order.dog_breed || "לא צוין";
            sizeBreakdown[size] = (sizeBreakdown[size] || 0) + 1;
        });

        let breedHtml = "";
        Object.entries(sizeBreakdown).sort((a, b) => b[1] - a[1]).forEach(([size, count]) => {
            const percentage = allOrders.length > 0 ? ((count / allOrders.length) * 100).toFixed(1) : "0";
            breedHtml += `
                <div class="metric-row">
                    <span class="metric-label">${size}</span>
                    <span class="metric-value">${count} (${percentage}%)</span>
                </div>
            `;
        });
        document.getElementById("breedBreakdown").innerHTML = breedHtml;

        generateBusinessInsights(allOrders, thisMonthRevenue, lastMonthRevenue, avgOccupancy, topCustomers, sizeBreakdown);

        document.getElementById("loadingIndicator").style.display = "none";
        document.getElementById("dashboardContent").style.display = "block";
    } catch (error) {
        console.error("Error loading analytics:", error);
        document.getElementById("loadingIndicator").innerHTML = "❌ שגיאה בטעינת הנתונים: " + error.message;
    }
}

document.addEventListener('DOMContentLoaded', loadAnalytics);
