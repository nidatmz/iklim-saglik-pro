# 🌿 İklimSağlık PRO — Çevre Sağlığı, Erken Uyarı & Analitik Portalı

> **Açık veri API'leri, küresel iklim haritaları ve n8n AI otomasyonu ile güçlendirilmiş; bireysel sağlık profillerine göre anlık çevre ve iklim risk analizi sunan karar destek platformu.**

---

## 📌 Proje Hakkında

**İklimSağlık PRO**, aşırı sıcaklık dalgaları, yüksek nem ve ince partikül ($PM_{2.5}$) kirliliğinin insan sağlığı üzerindeki olumsuz etkilerini minimize etmek amacıyla geliştirilmiş modern bir web uygulamasıdır. 

Kullanıcılar arattıkları şehir ve seçtikleri sağlık profili (Astım, Çocuk/Yaşlı, Sporcu vb.) doğrultusunda anlık risk değerlendirmesi alır. Sistem, arka planda **n8n Webhook** ve **Yapay Zeka (Google Gemini)** entegrasyonu çalıştırarak kullanıcıya özel kişiselleştirilmiş bülten kartlarını otomatik olarak e-posta olarak ulaştırır.

---

## ✨ Öne Çıkan Özellikler

- 📊 **Anlık İklim & Risk Analizi:** Open-Meteo API kullanılarak 24 saatlik sıcaklık, hissedilen sıcaklık, bağıl nem ve UV indeksi takibi.
- 🌫️ **AQI & $PM_{2.5}$ Kirlilik İndeksi:** US EPA standartlarında hesaplanan hava kirlilik göstergesi ve profil bazlı risk skorlaması.
- 🌍 **Canlı Isı & Hava Kalitesi Haritası:** Leaflet.js ve WAQI Tile sunucuları ile Türkiye ve dünya genelini kapsayan etkileşimli canlı kirlilik haritası.
- 🤖 **n8n & AI Bülten Otomasyonu:** Sitede arama yapıldığı an tetiklenen webhook ve Google Gemini altyapısı ile oluşturulan neşeli, samimi ve kişiselleştirilmiş e-posta bülten kartları.
- 🚨 **Gelişmiş İlk Yardım & Acil Durum Rehberi:** WHO ve AFAD standartlarında hazırlanmış sekmeli sıcak çarpması, solunum krizleri ve acil hat protokolü.
- 📰 **Çevre Sağlığı Bülten Portalı:** Kentsel iklim, hava kalitesi ve UV başlıklarında filtrelenebilir haber/makale modülü.
- 🖨️ **Raporlama:** Tek tıkla çıktıya veya PDF formatına uygun temizlenmiş kurumsal rapor alma desteği.

---

## 🛠️ Teknik Yığın (Tech Stack)

| Alan | Teknolojiler |
| :--- | :--- |
| **Ön Yüz (Frontend)** | HTML5, CSS3 (Custom Variables, Flexbox, Grid), Vanilla JavaScript (ES6+) |
| **Harita & Grafikler** | Leaflet.js, Chart.js, OpenStreetMap Tiles, WAQI Air Quality Tiles |
| **API & Veri Sağlayıcılar** | Open-Meteo Weather API, Open-Meteo Air Quality API, Nominatim Geocoding |
| **Otomasyon & AI** | n8n Webhook Workflow, Google Gemini AI (LLM), Gmail API |
| **Barındırma (Hosting)** | GitHub Pages |

---

## 🚀 Kurulum ve Yerel Çalıştırma

Bu proje tamamen **Client-Side** (sunucu gerektirmeyen) yapıda tasarlandığı için herhangi bir bağımlılık kurulumu (`npm install` vb.) gerektirmez.

1. Depoyu bilgisayarınıza klonlayın:
   ```bash
   git clone [https://github.com/KULLANICI_ADIN/saglik-sicaklik-iliskisi.git](https://github.com/KULLANICI_ADIN/saglik-sicaklik-iliskisi.git)
