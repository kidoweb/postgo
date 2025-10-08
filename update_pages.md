# Инструкция по добавлению системы уведомлений на все страницы

## Что нужно добавить на каждую страницу:

### 1. В `<body>` сразу после открытия тега (перед шапкой):

```html
<!-- Центр уведомлений -->
<div class="notification-center" id="notificationCenter">
    <div class="notification-center-header">
        <div class="notification-center-title">Уведомления</div>
        <div class="notification-center-actions">
            <button class="notification-center-action" id="markAllReadBtn">Прочитать все</button>
            <button class="notification-center-action" id="clearAllBtn">Очистить</button>
        </div>
    </div>
    <div class="notification-center-list" id="notificationList">
        <div class="notification-center-empty">
            <div class="notification-center-empty-icon">🔔</div>
            <div>Нет уведомлений</div>
        </div>
    </div>
</div>
```

### 2. В навигации, после `<ul class="nav-menu">` и перед кнопкой "Заказать":

```html
<button class="notification-bell-btn" id="notificationBellBtn">
    🔔
    <span class="notification-badge" style="display: none;">0</span>
</button>
```

### 3. Перед закрывающим `</body>` (скрипты):

```html
<script src="notifications.js"></script>
<script src="script.js"></script>
```

## Страницы для обновления:

- ✅ index.html (уже обновлена)
- ⬜ services.html
- ⬜ tracking.html
- ⬜ order.html
- ⬜ auth.html
- ⬜ account.html

