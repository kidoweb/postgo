# POST GO — Современный сайт для грузоперевозок

Полированный README и набор стартовых файлов / рекомендаций для проекта **POST GO**. Цель — привести проект к профессиональному виду: качественная документация, структура, рекомендации по доступности, деплою, безопасности и примеры файлов `index.html`, `styles.css`, `script.js`.

---

## 🚀 Быстрый обзор

**POST GO** — статический фронтенд-прототип сервиса грузоперевозок, реализованный на чистом HTML/CSS (Flexbox) и vanilla JavaScript. Поддерживает адаптивный дизайн, формы, модальные окна, страницу отслеживания с Яндекс.Картой и PWA‑функции.

---

## 📁 Структура проекта (рекомендуемая)

```
post-go/
├── public/
│   ├── index.html
│   ├── services.html
│   ├── tracking.html
│   ├── order.html
│   ├── auth.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── styles/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   └── maps.js
│   └── sw.js
├── assets/
│   ├── images/
│   └── icons/
├── README.md
├── LICENSE
└── package.json   # опционально для сборки/линтинга
```

---

## ✅ Что улучшено в этой версии

* Чёткая документация + быстрый старт
* Разделы по деплою, безопасности и доступности
* Стартовые шаблоны файлов: `index.html`, `styles.css`, `script.js` (готовые к кастомизации)
* Рекомендации по PWA, Service Worker и offline-first

---

## 📦 Быстрый старт (локально)

1. Клонируйте репозиторий.
2. Откройте `public/index.html` в браузере OR используйте лёгкий сервер:

   ```bash
   npx http-server public -c-1
   ```
3. Для страницы `tracking.html` укажите ваш ключ Яндекс.Карт:

   ```html
   <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=YOUR_YANDEX_API_KEY" defer></script>
   ```
4. Для PWA убедитесь, что `manifest.json` и `sw.js` доступны по HTTPS.

---

## 🧾 Лицензия

MIT — см. `LICENSE`.

---

## ♿ Доступность и качество

Рекомендации:

* Используйте семантические теги (`<main>`, `<nav>`, `<header>`, `<footer>`, `<form>`, `<label>`).
* Каждая форма должна иметь `label` с `for` и `id` на поле.
* Контраст текста и фона — минимум 4.5:1 для основного текста.
* Все интерактивные элементы — фокусируемые, с visible focus outline.
* Добавьте `aria-live` для уведомлений/модалок.

---

## 🔒 Безопасность (клиентский прототип)

* Не храните реальные пароли в `localStorage` в проде.
* Для продакшена используйте HTTPS, серверную регистрацию, вход по JWT и отправку кода восстановления через SMS/Email.
* Valide и санитизируйте все данные на сервере.

---

## 📄 Примеры файлов

### `public/index.html` (шаблон — адаптивный лендинг)

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>POST GO — Грузоперевозки</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/styles/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo">POST <span>GO</span></a>
      <nav class="main-nav">
        <a href="/services.html">Услуги</a>
        <a href="/tracking.html">Отслеживание</a>
        <a href="/order.html">Оформить</a>
        <a href="/auth.html">Аккаунт</a>
      </nav>
      <button class="btn-primary">Заказать</button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <h1>Надёжная доставка грузов по всему миру</h1>
          <p>Быстро. Безопасно. С удобным онлайн‑отслеживанием и поддержкой 24/7.</p>
          <div class="actions">
            <a class="btn-large btn-primary" href="/order.html">Оформить заказ</a>
            <a class="btn-outline" href="/services.html">Услуги и цены</a>
          </div>
        </div>
        <div class="hero-card">
          <!-- пример карточки / быстрый калькулятор доставки -->
          <form class="quick-order form" id="quickOrder">
            <label for="from">Откуда</label>
            <input id="from" name="from" class="form-input" required>

            <label for="to">Куда</label>
            <input id="to" name="to" class="form-input" required>

            <label for="phone">Телефон</label>
            <input id="phone" name="phone" class="form-input phone-mask" placeholder="+375(xx)xxx-xx-xx" required>

            <button class="btn-primary" type="submit">Рассчитать</button>
          </form>
        </div>
      </div>
    </section>

    <section class="features container">
      <h2>Почему выбирают нас</h2>
      <div class="features-grid">
        <article class="feature-card">
          <h3>Отслеживание в реальном времени</h3>
          <p>Яндекс.Карта с метками и маршрутом.</p>
        </article>
        <article class="feature-card">
          <h3>Безопасность груза</h3>
          <p>Стандартные страховые опции и упаковка.</p>
        </article>
        <article class="feature-card">
          <h3>Поддержка 24/7</h3>
          <p>Связь через Telegram, Email и горячую линию.</p>
        </article>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div>© POST GO — Все права защищены</div>
      <div>Контакты: support@postgo.by | +375 (29) 123-45-67</div>
    </div>
  </footer>

  <script src="/js/main.js" defer></script>
</body>
</html>
```

---

### `src/styles/styles.css` (основные правила, Flexbox)

```css
:root{
  --bg:#f7f8fb;
  --card:#ffffff;
  --accent:#1d4ed8;
  --muted:#6b7280;
  --radius:12px;
}
*{box-sizing:border-box}
html,body{height:100%}
body{font-family:Inter,system-ui,Arial,sans-serif;margin:0;background:var(--bg);color:#111}
.container{max-width:1100px;margin:0 auto;padding:1rem}
.site-header{background:transparent;padding:1rem 0}
.logo{font-weight:700;text-decoration:none;color:#111}
.main-nav a{margin-right:1rem;text-decoration:none;color:var(--muted)}
.hero{padding:3rem 0}
.hero-grid{display:flex;gap:2rem;align-items:center}
.hero-content{flex:1}
.hero-card{width:360px;background:var(--card);padding:1rem;border-radius:var(--radius);box-shadow:0 6px 18px rgba(15,23,42,0.06)}
.btn-primary{background:var(--accent);color:#fff;padding:0.6rem 1rem;border-radius:10px;border:0;cursor:pointer}
.btn-outline{background:transparent;border:1px solid #e5e7eb;padding:0.5rem 0.8rem;border-radius:10px}
.form-input{display:block;width:100%;padding:0.6rem;border-radius:8px;border:1px solid #e6e9ee;margin-bottom:0.75rem}
@media (max-width:768px){
  .hero-grid{flex-direction:column}
  .hero-card{width:100%}
}
```

---

### `src/js/main.js` (логика UI — модалки, маска телефона, валидация)

```javascript
// Главный файл: инициализация UI
document.addEventListener('DOMContentLoaded', () => {
  initPhoneMasks();
  bindQuickOrder();
});

function initPhoneMasks(){
  // Простая маска для +375(xx)xxx-xx-xx
  document.querySelectorAll('.phone-mask').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').slice(0,12);
      if(!v) return e.target.value='';
      // +375 (xx) xxx-xx-xx
      v = '+375' + v.replace(/^375/,'');
      const parts = [];
      parts.push(v.slice(0,4));
      if(v.length>4) parts.push(' ('+v.slice(4,6)+')');
      if(v.length>6) parts.push(v.slice(6,9));
      if(v.length>9) parts.push('-'+v.slice(9,11));
      if(v.length>11) parts.push('-'+v.slice(11,13));
      e.target.value = parts.join('');
    })
  })
}

function bindQuickOrder(){
  const form = document.getElementById('quickOrder');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    // Простая валидация
    const from = form.from.value.trim();
    const to = form.to.value.trim();
    const phone = form.phone.value.trim();
    if(!from || !to || !phone){
      showModal({ title:'Ошибка', message:'Пожалуйста, заполните все поля.' });
      return;
    }
    // Здесь: вызов API расчёта/создание заказа
    showModal({ title:'Готово', message:'Запрос отправлен. Мы свяжемся с вами.' });
  })
}

function showModal({title='Сообщение', message='', actions=[]}){
  // Простейшая реализация модалки
  const modal = document.createElement('div');
  modal.className='modal';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn-primary modal-close">ОК</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').focus();
  modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
  modal.querySelector('.modal-close').addEventListener('click', close);
  function close(){ modal.remove(); }
}
```

---

## 🌍 Яндекс.Карты (tracking.html)

* Подключайте скрипт Яндекс.Карт с вашим `apikey`.
* В `maps.js` — инициализация карты, добавление меток и построение маршрута.
* Помните про ограничение использования API и политику Яндекса.

Пример подключения (в `tracking.html`):

```html
<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=YOUR_YANDEX_API_KEY" defer></script>
<script src="/js/maps.js" defer></script>
```

---

## 🖥 PWA и Service Worker

* Добавьте `manifest.json` с иконками и `start_url`.
* `sw.js` — кешируйте статические ассеты и обеспечьте offline-страницу.
* Подписка push — опционально; для push нужна серверная часть.

Минимальный `sw.js`:

```javascript
const CACHE = 'postgo-v1';
self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/styles/styles.css'])));
});
self.addEventListener('fetch', ev => {
  ev.respondWith(caches.match(ev.request).then(r=>r||fetch(ev.request)));
});
```

---

## ✅ CI / Lint / Tests (рекомендации)

* Добавьте `eslint` и `prettier` для единообразия кода.
* Добавьте GitHub Actions для проверки линтинга при push.
* Используйте простые unit‑тесты для ключевых util-функций (Jest, Vitest).

---

## 📣 Деплой

Проект статический — подойдёт любой static-хостинг:

* GitHub Pages — пушьте в `gh-pages` или настройте ветку `main`.
* Netlify / Vercel — drag & drop или подключение репозитория.
* nginx — разместите содержимое `public`.

---

## 🧭 UX / Дизайн советы

* Используйте 8‑пиксельную сетку для отступов.
* Максимальная ширина контента — ~1100px.
* Фокус на CTA: одна главная целевая кнопка — «Оформить заказ».
* Минимизируйте форму регистрации — имя, телефон, пароль.

---

## 📬 Контакты

**Разработчик**: kidoweb — Telegram: @kidoweb — Email: [support@postgo.by](mailto:support@postgo.by)

---
