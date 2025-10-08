// ==================== Система уведомлений POST GO ====================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.loadNotifications();
        this.setupEventListeners();
    }

    // Загрузка сохраненных уведомлений
    loadNotifications() {
        try {
            const saved = localStorage.getItem('postgo_notifications');
            this.notifications = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
            this.notifications = [];
        }
    }

    // Сохранение уведомлений
    saveNotifications() {
        try {
            localStorage.setItem('postgo_notifications', JSON.stringify(this.notifications));
            this.updateBadge();
        } catch (error) {
            console.error('Ошибка сохранения уведомлений:', error);
        }
    }

    // Создание нового уведомления
    async create(options) {
        const notification = {
            id: this.generateId(),
            title: options.title || 'POST GO',
            message: options.message || '',
            type: options.type || 'info', // info, success, warning, error
            category: options.category || 'general', // order, payment, delivery, system
            timestamp: Date.now(),
            read: false,
            data: options.data || {}
        };

        // Добавляем в историю
        this.notifications.unshift(notification);
        
        // Ограничиваем количество уведомлений
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        this.saveNotifications();

        // Проверяем настройки пользователя
        if (this.shouldShowNotification(notification.category)) {
            // Показываем in-app уведомление
            this.showInAppNotification(notification);

            // Отправляем push-уведомление если разрешено
            await this.sendPushNotification(notification);
        }

        // Триггерим событие
        this.dispatchEvent('notification:created', notification);

        return notification;
    }

    // Проверка, нужно ли показывать уведомление
    shouldShowNotification(category) {
        const settings = this.getSettings();
        
        const categoryMap = {
            'order': 'notifyOrderStatus',
            'payment': 'notifyPayment',
            'delivery': 'notifyDelivery',
            'promotion': 'notifyPromotions',
            'system': 'notifyOrderStatus'
        };

        const settingKey = categoryMap[category] || 'notifyOrderStatus';
        return settings[settingKey] !== false;
    }

    // Получение настроек уведомлений
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem('postgo_notification_settings') || '{}');
        } catch {
            return {};
        }
    }

    // Показ in-app уведомления (toast)
    showInAppNotification(notification) {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-toast-${notification.type}`;
        toast.innerHTML = `
            <div class="notification-toast-icon">${this.getIcon(notification.type)}</div>
            <div class="notification-toast-content">
                <div class="notification-toast-title">${notification.title}</div>
                <div class="notification-toast-message">${notification.message}</div>
            </div>
            <button class="notification-toast-close">✕</button>
        `;

        document.body.appendChild(toast);

        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 100);

        // Закрытие по клику
        const closeBtn = toast.querySelector('.notification-toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => this.hideToast(toast), 5000);

        // Клик по уведомлению
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-toast-close')) {
                this.handleNotificationClick(notification);
                this.hideToast(toast);
            }
        });
    }

    // Скрытие toast уведомления
    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    // Получение иконки для типа уведомления
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }

    // Отправка push-уведомления
    async sendPushNotification(notification) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        try {
            // Проверяем, активен ли Service Worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                
                // Отправляем уведомление через Service Worker
                registration.showNotification(notification.title, {
                    body: notification.message,
                    icon: './icons8-коробка-64.png',
                    badge: './icons8-коробка-64.png',
                    tag: notification.id,
                    requireInteraction: notification.type === 'error',
                    vibrate: [200, 100, 200],
                    data: {
                        notificationId: notification.id,
                        category: notification.category,
                        ...notification.data
                    },
                    actions: this.getNotificationActions(notification.category)
                });
            }
        } catch (error) {
            console.error('Ошибка отправки push-уведомления:', error);
        }
    }

    // Получение действий для уведомления
    getNotificationActions(category) {
        const actions = {
            order: [
                { action: 'view', title: 'Посмотреть', icon: './icons8-коробка-64.png' },
                { action: 'track', title: 'Отследить', icon: './icons8-коробка-64.png' }
            ],
            payment: [
                { action: 'pay', title: 'Оплатить', icon: './icons8-коробка-64.png' },
                { action: 'view', title: 'Посмотреть', icon: './icons8-коробка-64.png' }
            ],
            delivery: [
                { action: 'track', title: 'Отследить', icon: './icons8-коробка-64.png' }
            ]
        };

        return actions[category] || [
            { action: 'view', title: 'Посмотреть', icon: './icons8-коробка-64.png' }
        ];
    }

    // Обработка клика по уведомлению
    handleNotificationClick(notification) {
        // Отмечаем как прочитанное
        this.markAsRead(notification.id);

        // Навигация в зависимости от категории
        switch (notification.category) {
            case 'order':
                window.location.href = 'account.html?tab=orders';
                break;
            case 'payment':
                window.location.href = 'account.html?tab=payments';
                break;
            case 'delivery':
                window.location.href = 'tracking.html';
                break;
            default:
                window.location.href = 'account.html';
        }
    }

    // Генерация уникального ID
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Отметить как прочитанное
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.dispatchEvent('notification:read', notification);
        }
    }

    // Отметить все как прочитанные
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.dispatchEvent('notifications:allread');
    }

    // Удалить уведомление
    delete(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.dispatchEvent('notification:deleted', { id });
    }

    // Очистить все уведомления
    clear() {
        this.notifications = [];
        this.saveNotifications();
        this.dispatchEvent('notifications:cleared');
    }

    // Получить все уведомления
    getAll() {
        return [...this.notifications];
    }

    // Получить непрочитанные
    getUnread() {
        return this.notifications.filter(n => !n.read);
    }

    // Получить количество непрочитанных
    getUnreadCount() {
        return this.getUnread().length;
    }

    // Обновить badge счетчик
    updateBadge() {
        const count = this.getUnreadCount();
        const badges = document.querySelectorAll('.notification-badge');
        
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });

        // Обновляем заголовок страницы
        this.updatePageTitle(count);
    }

    // Обновить заголовок страницы
    updatePageTitle(count) {
        const baseTitle = document.title.replace(/^\(\d+\+?\)\s*/, '');
        document.title = count > 0 ? `(${count > 99 ? '99+' : count}) ${baseTitle}` : baseTitle;
    }

    // Установка слушателей событий
    setupEventListeners() {
        // Слушаем изменения в других вкладках
        window.addEventListener('storage', (e) => {
            if (e.key === 'postgo_notifications') {
                this.loadNotifications();
                this.updateBadge();
                this.dispatchEvent('notifications:updated');
            }
        });
    }

    // Диспатч кастомных событий
    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

// ==================== Предустановленные шаблоны уведомлений ====================

const NotificationTemplates = {
    // Уведомления о заказах
    orderCreated: (orderData) => ({
        title: '✅ Заказ создан',
        message: `Ваш заказ #${orderData.trackingNumber} успешно оформлен`,
        type: 'success',
        category: 'order',
        data: { orderId: orderData.id, trackingNumber: orderData.trackingNumber }
    }),

    orderPaid: (orderData) => ({
        title: '💳 Заказ оплачен',
        message: `Оплата за заказ #${orderData.trackingNumber} прошла успешно`,
        type: 'success',
        category: 'payment',
        data: { orderId: orderData.id, amount: orderData.price }
    }),

    orderInProgress: (orderData) => ({
        title: '🚚 Заказ в пути',
        message: `Ваш заказ #${orderData.trackingNumber} находится в пути`,
        type: 'info',
        category: 'delivery',
        data: { orderId: orderData.id, trackingNumber: orderData.trackingNumber }
    }),

    orderDelivered: (orderData) => ({
        title: '🎉 Заказ доставлен',
        message: `Заказ #${orderData.trackingNumber} успешно доставлен`,
        type: 'success',
        category: 'delivery',
        data: { orderId: orderData.id }
    }),

    orderCancelled: (orderData) => ({
        title: '❌ Заказ отменен',
        message: `Заказ #${orderData.trackingNumber} был отменен`,
        type: 'warning',
        category: 'order',
        data: { orderId: orderData.id }
    }),

    // Уведомления об оплате
    paymentRequired: (orderData) => ({
        title: '💰 Требуется оплата',
        message: `Оплатите заказ #${orderData.trackingNumber} на сумму ${orderData.price} BYN`,
        type: 'warning',
        category: 'payment',
        data: { orderId: orderData.id, amount: orderData.price }
    }),

    paymentFailed: (orderData) => ({
        title: '❌ Ошибка оплаты',
        message: `Не удалось оплатить заказ #${orderData.trackingNumber}`,
        type: 'error',
        category: 'payment',
        data: { orderId: orderData.id }
    }),

    // Системные уведомления
    welcome: (userName) => ({
        title: '👋 Добро пожаловать!',
        message: `${userName}, рады видеть вас в POST GO!`,
        type: 'success',
        category: 'system'
    }),

    accountCreated: (userName) => ({
        title: '✨ Аккаунт создан',
        message: `${userName}, ваш аккаунт успешно создан`,
        type: 'success',
        category: 'system'
    }),

    // Промо уведомления
    promotion: (promoData) => ({
        title: '🎁 Специальное предложение',
        message: promoData.message || 'У нас есть специальное предложение для вас!',
        type: 'info',
        category: 'promotion',
        data: promoData
    })
};

// ==================== Инициализация глобального экземпляра ====================
window.notificationManager = new NotificationManager();
window.NotificationTemplates = NotificationTemplates;

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationManager, NotificationTemplates };
}

