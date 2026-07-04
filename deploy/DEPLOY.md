# Evginler — VPS Deploy Rehberi

Bu rehber, proje dosyaları VPS'e atıldıktan sonra siteyi `evginlerevtekstil.com` üzerinde
yayına almak için izlenecek adımları içerir. VPS'te Node.js, MongoDB araçları ve PM2'nin
zaten kurulu olduğu varsayılıyor.

## 0) Ön koşul — Iyzico kontrolü

`Website-Evginler/.env` içindeki `IYZIPAY_URI` zaten **canlı** endpoint'e (`https://api.iyzipay.com`)
ayarlı. VPS'e taşımadan önce Iyzico üye işyeri panelinden `IYZIPAY_API_KEY` / `IYZIPAY_SECRET_KEY`
değerlerinin gerçek (sandbox değil) canlı anahtarlar olduğunu teyit edin — aksi halde ödemeler hata verir.

## 1) DNS Kayıtları

Domain sağlayıcınızda (evginlerevtekstil.com) VPS'in IP adresine işaret eden 4 A kaydı oluşturun:

| Host | Tip | Değer |
|---|---|---|
| @ (ve `www`) | A | VPS_IP |
| admin | A | VPS_IP |
| api | A | VPS_IP |
| adminapi | A | VPS_IP |

DNS yayılımı birkaç dakika–birkaç saat sürebilir; devam etmeden önce `dig api.evginlerevtekstil.com`
ile doğrulayın.

## 2) Proje dosyalarını VPS'e kopyalama

Projeyi VPS'te örn. `/var/www/evginler` altına yerleştirin. `node_modules/` klasörlerini
kopyalamanıza gerek yok — adım 3'te sunucuda yeniden kurulacak.

## 3) Backend bağımlılıkları

```bash
cd /var/www/evginler/Website-Evginler && npm install --omit=dev
cd /var/www/evginler/Admin-Evginler && npm install --omit=dev
```

`.env` dosyaları zaten `https://` domain değerleriyle güncellenmiş halde repo içinde geliyor
(`NODE_ENV=production` dahil) — VPS'e ayrıca dokunmanıza gerek yok, sadece dosyaların
gerçekten kopyalandığını doğrulayın.

## 4) React client'ları build etme

```bash
cd /var/www/evginler/evginler-store-client
npm install
npm run build   # .env.production otomatik okunur, dist/ oluşur
```

**Önemli:** `evginler-store-client`'ın `build` script'i, `vite build`'den önce
`scripts/generate-sitemap.js`'i çalıştırır — bu script `https://api.evginlerevtekstil.com/api/store/products`'a
gerçek bir HTTP isteği atıp **canlı ürün listesiyle** `public/sitemap.xml`'i üretir. Yani:
- Build'i çalıştırdığınız makinenin (yerel Mac veya VPS, hangisiyse) o an `api.evginlerevtekstil.com`'a
  internet üzerinden erişimi olmalı, aksi halde script sadece 2 statik URL (`/` ve `/products`) içeren
  bir yedek sitemap yazar ve konsola uyarı basar (build'i durdurmaz).
- Ürün eklediğinizde/sildiğinizde sitemap otomatik güncellenmez — yeni bir `npm run build` almanız gerekir.

```bash
cd /var/www/evginler/evginler-admin-client
npm install
npm run build
```

Build sonrası doğrulama (localhost değil gerçek domain gömülü mü?):

```bash
grep -o "https://api[a-z.]*evginlerevtekstil.com" evginler-store-client/dist/assets/*.js | head -1
grep -o "https://adminapi.evginlerevtekstil.com" evginler-admin-client/dist/assets/*.js | head -1
```

## 5) Nginx kurulumu

```bash
sudo cp deploy/nginx/*.conf /etc/nginx/sites-available/
for f in store admin api adminapi; do
  sudo ln -s /etc/nginx/sites-available/$f.conf /etc/nginx/sites-enabled/
done
```

**Önemli:** `deploy/nginx/store.conf` ve `admin.conf` içindeki `root /var/www/evginler/...`
satırlarını projeyi gerçekten kopyaladığınız dizine göre güncelleyin.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6) SSL (Let's Encrypt / certbot)

```bash
sudo certbot --nginx -d evginlerevtekstil.com -d www.evginlerevtekstil.com
sudo certbot --nginx -d admin.evginlerevtekstil.com
sudo certbot --nginx -d api.evginlerevtekstil.com
sudo certbot --nginx -d adminapi.evginlerevtekstil.com
```

certbot nginx conf dosyalarını otomatik güncelleyip 80→443 yönlendirmesi ekleyecektir.

## 7) Backend'leri PM2 ile başlatma

Repo kökünden (`/var/www/evginler`):

```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup   # sunucu yeniden başladığında pm2'nin otomatik ayağa kalkması için (bir kereye mahsus)
```

## 8) Doğrulama

```bash
curl -I https://api.evginlerevtekstil.com/api/csrf-token
curl -I https://adminapi.evginlerevtekstil.com/api/csrf-token
curl -I https://evginlerevtekstil.com
curl -I https://admin.evginlerevtekstil.com
```

Tarayıcıdan manuel test edilmesi gerekenler:
- Mağaza: ana sayfa, ürün detay, sepete ekleme, kayıt/giriş, **gerçek para ile küçük bir test siparişi** (Iyzico canlı).
- Admin panel: giriş, ürün/kategori/marka CRUD, sipariş yönetimi.
- Admin panelinde `/register` sayfasının artık **403** döndüğünü doğrulayın (prod guard).

## Notlar / Sınırlamalar

- `evginler-store-client/public/sitemap.xml` sadece statik sayfaları (`/`, `/products`) içerir —
  ürün/kategori sayfaları dinamik olduğu için otomatik sitemap üretimi bu kapsamda değildi.
  İleride backend'den ürün listesiyle dinamik sitemap üretmek SEO için faydalı olur.
- PM2 zaten kurulu olduğu belirtildiği için Node/PM2 kurulum adımları bu rehbere dahil edilmedi.
- Mongo Atlas cluster'ı ("evginlertest2026") kullanıcı tarafından gerçek prod veritabanı
  olarak onaylandı, değiştirilmedi.
