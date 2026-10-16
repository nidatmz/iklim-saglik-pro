document.addEventListener('DOMContentLoaded', () => {
    // DOM Öğeleri
    const form = document.getElementById('riskForm');
    const cityNameInput = document.getElementById('cityName');
    const healthProfileSelect = document.getElementById('healthProfile');
    const geoBtn = document.getElementById('geoBtn');
    const submitBtn = document.getElementById('submitBtn');
    const loadingState = document.getElementById('loading');
    
    const welcomePanel = document.getElementById('welcomePanel');
    const resultCard = document.getElementById('resultCard');
    const riskBanner = document.getElementById('riskBanner');
    const resultContent = document.getElementById('resultContent');
    const reportTimestamp = document.getElementById('reportTimestamp');

    // KPI Öğeleri
    const kpiTemp = document.getElementById('kpiTemp');
    const kpiApparent = document.getElementById('kpiApparent');
    const kpiHumidity = document.getElementById('kpiHumidity');
    const kpiHumidityStatus = document.getElementById('kpiHumidityStatus');
    const kpiPm25 = document.getElementById('kpiPm25');
    const kpiAqi = document.getElementById('kpiAqi');

    // Durum ve Navigasyon
    const liveEmergencyStatus = document.getElementById('liveEmergencyStatus');
    const statusText = document.getElementById('statusText');
    const currentTimeBadge = document.getElementById('currentTimeBadge');
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favButtons = document.getElementById('favButtons');
    const printBtn = document.getElementById('printBtn');
    const printShortcutBtn = document.getElementById('printShortcutBtn');

    // Modallar
    const ilkYardimModal = document.getElementById('ilkYardimModal');
    const bultenModal = document.getElementById('bultenModal');
    const openIlkYardimModal = document.getElementById('openIlkYardimModal');
    const closeIlkYardimModal = document.getElementById('closeIlkYardimModal');
    const openBultenModal = document.getElementById('openBultenModal');
    const closeBultenModal = document.getElementById('closeBultenModal');
    const newsContent = document.getElementById('newsContent');
    const bultenSearchInput = document.getElementById('bultenSearchInput');
    const bultenTags = document.getElementById('bultenTags');

    let tempChart = null;
    let envChart = null;
    let leafletMap = null;
    let mapMarker = null;

    // Zengin Bülten Haber Veri Tabanı
    const newsDatabase = [
        {
            title: "Kentsel Isı Ada Etkisi ve Şehir İklimi",
            category: "iklim",
            categoryName: "Kentsel İklim",
            date: "Bugün",
            summary: "Asfalt ve beton yüzeyler, güneş enerjisini emerek gece dahi sıcaklıkların kırsal alanlara kıyasla 3-5°C daha yüksek kalmasına sebep olmaktadır. Binalarda yeşil çatı uygulamaları hayati önem taşır."
        },
        {
            title: "PM2.5 Solunabilir Partiküllerin Akciğer Sağlığına Etkisi",
            category: "kirlilik",
            categoryName: "Hava Kalitesi",
            date: "Dün",
            summary: "Çapı 2.5 mikrondan küçük olan partiküller, akciğer alveollerine kadar ulaşarak kılcal damarlarla kana karışabilir. Hava kirliliğinin yüksek olduğu günlerde N95/FFP2 maske kullanımı önerilir."
        },
        {
            title: "Güneş UV İndeksi ve Cilt Hasarı Dengesi",
            category: "saglik",
            categoryName: "Güneş & UV",
            date: "14 Ekim",
            summary: "UV indeksi 6 ve üzeri olduğu saatlerde (özellikle 11:00-15:00 arası) koruyucu krem kullanılmalı ve doğrudan güneş ışığına maruz kalma süresi 15 dakikayı geçmemelidir."
        },
        {
            title: "Nem ve Vücut Sıcaklık Kontrolü (Heat Index)",
            category: "iklim",
            categoryName: "Kentsel İklim",
            date: "12 Ekim",
            summary: "Bağıl nem %70'in üzerine çıktığında, cildin terleme yoluyla serinleme mekanizması durma noktasına gelir. Bu durum hissedilen sıcaklığın 4-6°C daha yüksek algılanmasına yol açar."
        }
    ];

    // --- İLKLENDİRME ---
    updateClock();
    setInterval(updateClock, 1000);
    initMap();
    loadFavorites();
    renderBulten(newsDatabase);
    initModalTabs();

    function updateClock() {
        const now = new Date();
        currentTimeBadge.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    // --- HARİTA MODÜLÜ ---
    function initMap() {
        if (!document.getElementById('airQualityMap')) return;
        
        leafletMap = L.map('airQualityMap').setView([39.0, 35.0], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMap);

        L.tileLayer('https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=demo', {
            attribution: 'Air Quality &copy; WAQI',
            opacity: 0.65
        }).addTo(leafletMap);
    }

    function updateMapFocus(lat, lon, title) {
        if (!leafletMap) return;
        leafletMap.setView([lat, lon], 9);

        if (mapMarker) leafletMap.removeLayer(mapMarker);

        mapMarker = L.marker([lat, lon]).addTo(leafletMap)
            .bindPopup(`<b>${escapeHtml(title)}</b><br>İklim & Hava Kalitesi İstasyonu`)
            .openPopup();
    }

    // --- ARAMA VE VERİ ÇEKME ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = cityNameInput.value.trim();
        const profile = healthProfileSelect.value;

        if (!city) return;

        setLoading(true);

        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("Girilen şehir bulunamadı.");
            }

            const loc = geoData.results[0];
            const fullTitle = `${loc.name}, ${loc.country || 'TR'}`;

            await processTelemetry(loc.latitude, loc.longitude, fullTitle, profile);
            saveFavorite(loc.name);

        } catch (err) {
            alert(err.message || "Ağ hatası oluştu.");
            setLoading(false);
        }
    });

    geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) return alert("Konum servisleri desteklenmiyor.");
        setLoading(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr`);
                const data = await res.json();
                const city = data.address.city || data.address.town || "Mevcut Konum";
                cityNameInput.value = city;
                
                await processTelemetry(lat, lon, city, healthProfileSelect.value);
            } catch {
                await processTelemetry(lat, lon, "Mevcut Konum", healthProfileSelect.value);
            }
        }, () => {
            setLoading(false);
            alert("Konum izni alınamadı.");
        });
    });

    async function processTelemetry(lat, lon, cityTitle, profile) {
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index`;
            const airUrl = `https://api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;

            const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
            const wData = await wRes.json();
            const aData = await aRes.json();

            const cur = wData.current;
            const pm25 = (aData.current && aData.current.pm2_5 !== undefined) ? aData.current.pm2_5 : 12;

            renderDashboard(cityTitle, cur.temperature_2m, cur.apparent_temperature, cur.relative_humidity_2m, pm25, profile, wData.hourly);
            updateMapFocus(lat, lon, cityTitle);

        } finally {
            setLoading(false);
        }
    }

    // --- DASHBOARD RENDER ---
    function renderDashboard(city, temp, apparent, humidity, pm25, profile, hourly) {
        welcomePanel.classList.add('hidden');
        resultCard.classList.remove('hidden');

        reportTimestamp.textContent = `Son Güncelleme: ${new Date().toLocaleTimeString('tr-TR')}`;

        const aqi = calculateAqi(pm25);

        kpiTemp.textContent = `${temp}°C`;
        kpiApparent.textContent = `Hissedilen: ${apparent}°C`;
        kpiHumidity.textContent = `%${humidity}`;
        kpiHumidityStatus.textContent = humidity > 70 ? "Yüksek Nem" : "Normal Nem";
        kpiPm25.textContent = `${pm25} µg/m³`;
        kpiAqi.textContent = `AQI: ${aqi}`;

        let score = 0;
        let reasons = [];

        if (temp > 35 || apparent > 37) { score += 3; reasons.push(`Aşırı yüksek termal yük (${apparent}°C hissedilen).`); }
        else if (temp > 30) { score += 1; reasons.push(`Yüksek sıcaklık seviyesi (${temp}°C).`); }

        if (pm25 > 35.4) { score += 3; reasons.push(`Sağlıksız PM2.5 hava kirlilik seviyesi (${pm25} µg/m³).`); }
        else if (pm25 > 12) { score += 1; reasons.push(`Hassas gruplar için sınırda PM2.5 seviyesi.`); }

        if (profile === 'asthma' || profile === 'sensitive') score += 1;

        let riskText = "Düşük Risk", badgeClass = "badge-low";
        if (score >= 4) { riskText = "Yüksek Risk"; badgeClass = "badge-high"; }
        else if (score >= 2) { riskText = "Orta Risk"; badgeClass = "badge-medium"; }

        riskBanner.className = `risk-banner ${badgeClass}`;
        riskBanner.textContent = `⚠️ BÖLGE RİSK SEVİYESİ: ${riskText.toUpperCase()}`;

        if (score >= 4) {
            liveEmergencyStatus.className = "status-pill status-danger";
            statusText.innerHTML = `<strong>Kritik Uyarı (${escapeHtml(city)}):</strong> Çevresel koşullar yüksek risk taşıyor!`;
        } else if (score >= 2) {
            liveEmergencyStatus.className = "status-pill status-warning";
            statusText.innerHTML = `<strong>Dikkat (${escapeHtml(city)}):</strong> Hassas gruplar açık havada tedbirli olmalıdır.`;
        } else {
            liveEmergencyStatus.className = "status-pill status-normal";
            statusText.innerHTML = `<strong>Sistem Aktif (${escapeHtml(city)}):</strong> Çevresel koşullar güvenli sınırlar içinde.`;
        }

        resultContent.innerHTML = `
            <div class="detail-box">
                <h4>🔍 Tespit Edilen Risk Faktörleri</h4>
                <ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
            <div class="detail-box">
                <h4>🛡️ Profil Bazlı Korunma Önerileri</h4>
                <ul>
                    <li>Açık havada kalış sürelerini sıvı tüketimi ile dengede tutun.</li>
                    ${score >= 2 ? '<li>Öğle saatlerinde doğrudan güneş ışığına maruz kalmamaya özen gösterin.</li>' : ''}
                    ${profile === 'asthma' ? '<li>Yanınızda koruyucu medikal aerosol/sprey bulundurunuz.</li>' : ''}
                </ul>
            </div>
        `;

        renderHourly(hourly);
        renderCharts(hourly);
        sendN8nWebhook(city, temp, apparent, humidity, riskText, profile);
    }

    function calculateAqi(pm) {
        if (pm <= 12.0) return Math.round((50 / 12.0) * pm);
        if (pm <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm - 12.1) + 51);
        if (pm <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm - 35.5) + 101);
        return 200;
    }

    function renderHourly(hourly) {
        const hourlyRiskContent = document.getElementById('hourlyRiskContent');
        const times = [9, 13, 18];
        const labels = ["Sabah (09:00)", "Öğle Pik (13:00)", "Akşamüstü (18:00)"];

        hourlyRiskContent.innerHTML = times.map((tIdx, i) => {
            const temp = hourly.temperature_2m[tIdx] || 20;
            const uv = hourly.uv_index ? hourly.uv_index[tIdx] : 1;
            const isWarn = temp > 31 || uv > 5;

            return `
                <div class="hourly-card ${isWarn ? 'warn' : ''}">
                    <div class="hourly-time">${labels[i]}</div>
                    <p>Sıcaklık: <strong>${temp}°C</strong></p>
                    <p>UV İndeksi: <strong>${uv}</strong></p>
                </div>
            `;
        }).join('');
    }

    function renderCharts(hourly) {
        const times = hourly.time.slice(0, 24).map(t => t.split('T')[1]);
        const temps = hourly.temperature_2m.slice(0, 24);
        const apparents = hourly.apparent_temperature.slice(0, 24);
        const humidities = hourly.relative_humidity_2m.slice(0, 24);
        const uvs = hourly.uv_index ? hourly.uv_index.slice(0, 24) : Array(24).fill(0);

        if (tempChart) tempChart.destroy();
        tempChart = new Chart(document.getElementById('tempChart'), {
            type: 'line',
            data: {
                labels: times,
                datasets: [
                    { label: 'Sıcaklık (°C)', data: temps, borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', fill: true, tension: 0.3 },
                    { label: 'Hissedilen (°C)', data: apparents, borderColor: '#f59e0b', borderDash: [4,4], tension: 0.3 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }
        });

        if (envChart) envChart.destroy();
        envChart = new Chart(document.getElementById('envChart'), {
            type: 'line',
            data: {
                labels: times,
                datasets: [
                    { label: 'Nem (%)', data: humidities, borderColor: '#10b981', tension: 0.3 },
                    { label: 'UV', data: uvs, borderColor: '#ef4444', tension: 0.3 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }
        });
    }

    // --- REHBER MODAL SEKMELERİ (TABS) ---
    function initModalTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const targetTab = btn.getAttribute('data-tab');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    // --- BÜLTEN ARAMA VE FİLTRELEME ENGINE ---
    function renderBulten(articles) {
        if (!newsContent) return;

        newsContent.innerHTML = articles.map(art => `
            <div class="news-article-card">
                <div class="article-header">
                    <span class="article-badge badge-${art.category}">${art.categoryName}</span>
                    <span class="article-date">${art.date}</span>
                </div>
                <h4>${art.title}</h4>
                <p>${art.summary}</p>
            </div>
        `).join('');
    }

    if (bultenSearchInput) {
        bultenSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = newsDatabase.filter(art => 
                art.title.toLowerCase().includes(query) || art.summary.toLowerCase().includes(query)
            );
            renderBulten(filtered);
        });
    }

    if (bultenTags) {
        bultenTags.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                bultenTags.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cat = btn.getAttribute('data-category');
                if (cat === 'all') {
                    renderBulten(newsDatabase);
                } else {
                    const filtered = newsDatabase.filter(art => art.category === cat);
                    renderBulten(filtered);
                }
            });
        });
    }

    // --- N8N WEBHOOK ---
    function sendN8nWebhook(city, temp, apparent, humidity, riskLevel, profile) {
        fetch('https://nidatmz.app.n8n.cloud/webhook/sicaklik-uyari', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, temp, apparentTemp: apparent, humidity, riskLevel, profile })
        }).catch(err => console.log("n8n aktarım bildirimi.", err));
    }

    // --- UTILS ---
    function setLoading(isLoading) {
        if (isLoading) {
            loadingState.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            loadingState.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    function saveFavorite(city) {
        let favs = JSON.parse(localStorage.getItem('iklim_favs_pro')) || [];
        if (!favs.includes(city)) {
            favs.unshift(city);
            if (favs.length > 4) favs.pop();
            localStorage.setItem('iklim_favs_pro', JSON.stringify(favs));
        }
        loadFavorites();
    }

    function loadFavorites() {
        let favs = JSON.parse(localStorage.getItem('iklim_favs_pro')) || [];
        if (favs.length > 0) {
            favoritesContainer.classList.remove('hidden');
            favButtons.innerHTML = favs.map(c => `<button type="button" class="fav-btn">${escapeHtml(c)}</button>`).join('');
            favButtons.querySelectorAll('.fav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    cityNameInput.value = btn.textContent;
                    form.dispatchEvent(new Event('submit'));
                });
            });
        }
    }

    // Modal Listener'ları
    openIlkYardimModal.addEventListener('click', () => ilkYardimModal.classList.remove('hidden'));
    closeIlkYardimModal.addEventListener('click', () => ilkYardimModal.classList.add('hidden'));
    openBultenModal.addEventListener('click', () => bultenModal.classList.remove('hidden'));
    closeBultenModal.addEventListener('click', () => bultenModal.classList.add('hidden'));

    printBtn.addEventListener('click', () => window.print());
    printShortcutBtn.addEventListener('click', () => window.print());

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
});