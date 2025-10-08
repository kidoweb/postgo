// ==================== Мобильное меню ====================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// ==================== Отслеживание груза ====================
const trackingBtn = document.getElementById('trackingBtn');
const trackingInput = document.getElementById('trackingInput');
const trackingEmpty = document.getElementById('trackingEmpty');
const trackingResult = document.getElementById('trackingResult');

if (trackingBtn && trackingInput) {
    trackingBtn.addEventListener('click', () => {
        const trackingNumber = trackingInput.value.trim();
        
        if (trackingNumber) {
            // Показываем результаты отслеживания
            if (trackingEmpty) trackingEmpty.style.display = 'none';
            if (trackingResult) trackingResult.style.display = 'block';
            
            // Анимация появления
            trackingResult.style.opacity = '0';
            setTimeout(() => {
                trackingResult.style.opacity = '1';
                trackingResult.style.transition = 'opacity 0.5s ease';
            }, 100);

            // Инициализируем Яндекс.Карту при первом поиске
            if (typeof ymaps !== 'undefined' && !window.__ymapInited) {
                ymaps.ready(initYMap);
            }
        } else {
            showModal({
                type: 'error',
                title: 'Нужен номер',
                message: 'Пожалуйста, введите номер отслеживания.'
            });
        }
    });

    // Отслеживание по нажатию Enter
    trackingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            trackingBtn.click();
        }
    });
}

// ==================== Яндекс.Карта ====================
function initYMap() {
    const mapContainer = document.getElementById('yandexMap');
    if (!mapContainer) return;

    // Минск по умолчанию
    const startCoords = [53.902284, 27.561831];
    const endCoords = [53.907, 27.58];

    const map = new ymaps.Map('yandexMap', {
        center: startCoords,
        zoom: 12,
        controls: ['zoomControl', 'geolocationControl']
    });

    // Метки
    const startPlacemark = new ymaps.Placemark(startCoords, {
        balloonContent: 'Пункт отправления'
    }, {
        preset: 'islands#redDotIcon'
    });

    const endPlacemark = new ymaps.Placemark(endCoords, {
        balloonContent: 'Пункт назначения'
    }, {
        preset: 'islands#blueDotIcon'
    });

    map.geoObjects.add(startPlacemark).add(endPlacemark);

    // Маршрут
    ymaps.route([startCoords, endCoords]).then(function(route) {
        route.getPaths().options.set({
            strokeColor: '#0066FF',
            opacity: 0.9,
            strokeWidth: 4
        });
        map.geoObjects.add(route);
        map.setBounds(route.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
    });

    window.__ymapInited = true;
}

// ==================== Аккаунт: вкладки ====================
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');

authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.getAttribute('data-auth-tab');
        loginForm.style.display = key === 'login' ? 'flex' : 'none';
        registerForm.style.display = key === 'register' ? 'flex' : 'none';
        resetForm.style.display = key === 'reset' ? 'flex' : 'none';
    });
});

// ==================== Показ/скрытие пароля ====================
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.textContent = isPass ? '🙈' : '👁';
    });
});

// ==================== Локальное хранилище (демо) ====================
const storageKey = 'postgo_users_v1';
function getUsers(){ try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } }
function setUsers(users){ localStorage.setItem(storageKey, JSON.stringify(users)); }
function findUserByPhone(phone){ return getUsers().find(u => u.phone === phone); }

// ==================== Регистрация ====================
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        if (!name || !phone || !password || !confirm) {
            showModal({ type: 'error', title: 'Не все поля заполнены', message: 'Пожалуйста, заполните все поля.' });
            return;
        }
        if (password.length < 6) {
            showModal({ type: 'warning', title: 'Слишком короткий пароль', message: 'Минимум 6 символов.' });
            return;
        }
        if (password !== confirm) {
            showModal({ type: 'error', title: 'Пароли не совпадают', message: 'Повторите ввод пароля.' });
            return;
        }
        if (findUserByPhone(phone)) {
            showModal({ type: 'warning', title: 'Аккаунт уже есть', message: 'Пользователь с таким номером уже зарегистрирован.' });
            return;
        }

        const users = getUsers();
        users.push({ name, phone, password });
        setUsers(users);

        showModal({
            type: 'success',
            title: 'Регистрация успешна',
            message: `${name}, аккаунт создан. Теперь можно войти.`,
            actions: [{ label: 'Войти', variant: 'primary', handler: () => {
                document.querySelector('[data-auth-tab="login"]').click();
                document.getElementById('loginPhone').value = phone;
            }}]
        });
    });
}

// ==================== Вход ====================
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!phone || !password) {
            showModal({ type: 'error', title: 'Не все поля заполнены', message: 'Введите телефон и пароль.' });
            return;
        }
        const user = findUserByPhone(phone);
        if (!user || user.password !== password) {
            showModal({ type: 'error', title: 'Неверные данные', message: 'Проверьте телефон и пароль.' });
            return;
        }

        localStorage.setItem('postgo_session_user', JSON.stringify({ name: user.name, phone: user.phone }));
        showModal({ type: 'success', title: 'Добро пожаловать!', message: `${user.name}, вы успешно вошли.`, actions: [{ label: 'В кабинет', variant: 'primary', handler: () => window.location.href = 'account.html' }] });
    });
}

// ==================== Восстановление пароля (демо) ====================
if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('resetPhone').value.trim();
        if (!phone) {
            showModal({ type: 'error', title: 'Телефон обязателен', message: 'Введите номер телефона.' });
            return;
        }
        const user = findUserByPhone(phone);
        if (!user) {
            showModal({ type: 'warning', title: 'Аккаунт не найден', message: 'Пользователь с таким номером отсутствует.' });
            return;
        }

        // Демонстрация: "отправляем код"
        const code = Math.floor(100000 + Math.random() * 900000);
        sessionStorage.setItem('postgo_reset_code', String(code));
        showModal({
            type: 'info',
            title: 'Код отправлен',
            message: `Код для ${phone}: <b>${code}</b>. Нажмите \"Продолжить\" для смены пароля.`,
            actions: [
                { label: 'Отмена', variant: 'outline' },
                { label: 'Продолжить', variant: 'primary', handler: () => promptNewPassword(phone) }
            ]
        });
    });
}

function promptNewPassword(phone) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="form-group" style="margin-top:10px;">
            <label class="form-label">Новый пароль</label>
            <input type="password" id="__newPass" class="form-input" placeholder="••••••" />
        </div>
        <div class="form-group" style="margin-top:10px;">
            <label class="form-label">Повторите пароль</label>
            <input type="password" id="__newPass2" class="form-input" placeholder="••••••" />
        </div>
    `;

    showModal({
        type: 'info',
        title: 'Сброс пароля',
        message: wrapper.innerHTML,
        actions: [
            { label: 'Отмена', variant: 'outline' },
            { label: 'Сохранить', variant: 'primary', handler: () => {
                const p1 = document.getElementById('__newPass').value;
                const p2 = document.getElementById('__newPass2').value;
                if (!p1 || !p2) { showModal({ type: 'error', title: 'Ошибка', message: 'Заполните оба поля.' }); return; }
                if (p1.length < 6) { showModal({ type: 'warning', title: 'Короткий пароль', message: 'Минимум 6 символов.' }); return; }
                if (p1 !== p2) { showModal({ type: 'error', title: 'Пароли не совпадают', message: 'Повторите ввод.' }); return; }

                const users = getUsers().map(u => u.phone === phone ? { ...u, password: p1 } : u);
                setUsers(users);
                showModal({ type: 'success', title: 'Пароль обновлен', message: 'Теперь вы можете войти.', actions: [{ label: 'Войти', variant: 'primary', handler: () => document.querySelector('[data-auth-tab="login"]').click() }] });
            }}
        ]
    });
}

// ==================== Маска телефона +375(xx)xxx-xx-xx ====================
function formatBYPhone(value){
    // оставим только цифры
    const digits = value.replace(/\D/g, '');
    // начинаем с 375
    let res = '+375(';
    // ожидаем: 2 цифры оператора, 3, 2, 2
    const a = digits.slice(3,5); // код после 375
    const b = digits.slice(5,8);
    const c = digits.slice(8,10);
    const d = digits.slice(10,12);
    if (digits.startsWith('375')) {
        if (a) res += a;
        if (a.length >= 2) res += ')';
        else return res;
        if (b) res += b;
        if (b.length >= 3) res += '-';
        else return res;
        if (c) res += c;
        if (c.length >= 2) res += '-';
        else return res;
        if (d) res += d;
        return res;
    } else {
        // если пользователь не начал с 375 — подставим автоматически
        const num = digits.replace(/^375?/, '');
        const op = num.slice(0,2);
        const p1 = num.slice(2,5);
        const p2 = num.slice(5,7);
        const p3 = num.slice(7,9);
        res += op;
        if (op.length >= 2) res += ')';
        if (p1) res += p1;
        if (p1.length >= 3) res += '-';
        if (p2) res += p2;
        if (p2.length >= 2) res += '-';
        if (p3) res += p3;
        return res;
    }
}

document.querySelectorAll('.phone-input').forEach((input) => {
    input.placeholder = '+375(xx)xxx-xx-xx';
    input.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatBYPhone(e.target.value);
        // упрощенно: ставим курсор в конец
        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
    input.addEventListener('focus', (e) => {
        if (!e.target.value) e.target.value = '+375(';
    });
    input.addEventListener('blur', (e) => {
        if (e.target.value === '+375(') e.target.value = '';
    });
});

// ==================== LocalDB заказов ====================
const ordersKey = 'postgo_orders_v1';
function getAllOrders(){ try { return JSON.parse(localStorage.getItem(ordersKey)) || []; } catch { return []; } }
function setAllOrders(orders){ localStorage.setItem(ordersKey, JSON.stringify(orders)); }
function getSessionUser(){ try { return JSON.parse(localStorage.getItem('postgo_session_user')); } catch { return null; } }
function generateOrderId(){ return 'ORD-' + Date.now().toString(36).toUpperCase(); }
function calcOrderPrice({ deliveryType, weight, volume }){
    const base = deliveryType?.toLowerCase().includes('экспресс') ? 350 : deliveryType?.toLowerCase().includes('грузчиками') ? 300 : 250;
    const weightFee = Math.max(0, (Number(weight)||0) * 0.8);
    const volumeFee = Math.max(0, (Number(volume)||0) * 25);
    return Math.round(base + weightFee + volumeFee);
}
function saveOrder(order){ const all = getAllOrders(); all.push(order); setAllOrders(all); }

// ==================== Форма заказа ====================
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const cargoType = document.getElementById('cargoType').value;
        const weight = document.getElementById('weight').value;
        const volume = document.getElementById('volume').value;
        const deliveryDate = document.getElementById('deliveryDate').value;
        
        if (!cargoType || !weight || !volume || !deliveryDate) {
            showModal({ type: 'error', title: 'Не все поля заполнены', message: 'Пожалуйста, заполните все поля.' });
            return;
        }
        
        const deliveryType = (document.getElementById('deliveryType')?.value || 'Стандартная доставка');
        const trackingNumber = 'TRK-' + Math.floor(Math.random() * 10000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const sessionUser = getSessionUser();
        const price = calcOrderPrice({ deliveryType, weight, volume });
        const order = {
            id: generateOrderId(),
            createdAt: new Date().toISOString(),
            userPhone: sessionUser?.phone || 'guest',
            userName: sessionUser?.name || 'Гость',
            deliveryType,
            cargoType,
            weight: Number(weight),
            volume: Number(volume),
            deliveryDate,
            trackingNumber,
            price,
            status: 'Новый'
        };
        saveOrder(order);

        showModal({ type: 'success', title: 'Заказ оформлен', message: `Трек‑номер: <b>${trackingNumber}</b><br>Сумма к оплате: <b>${price} BYN</b>`, actions: [
            { label: 'Оплатить', variant: 'primary', handler: () => openPaymentModal(order.id) },
            { label: 'К трекингу', variant: 'outline', handler: () => window.location.href = 'tracking.html' }
        ]});
    });
}

// ==================== Табы на странице заказа ====================
const orderTabs = document.querySelectorAll('.order-tab');

orderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Убираем активный класс у всех табов
        orderTabs.forEach(t => t.classList.remove('active'));
        // Добавляем активный класс к текущему табу
        tab.classList.add('active');
        
        const tabName = tab.getAttribute('data-tab');
        
        // Можно добавить логику переключения контента
        if (tabName === 'calculator') {
            showModal({ type: 'info', title: 'Скоро', message: 'Функция калькулятора в разработке.' });
        }
    });
});

// ==================== Фильтры услуг ====================
const filterTabs = document.querySelectorAll('.filter-tab');
const serviceCards = document.querySelectorAll('.service-card');

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Убираем активный класс у всех фильтров
        filterTabs.forEach(t => t.classList.remove('active'));
        // Добавляем активный класс к текущему фильтру
        tab.classList.add('active');
        
        const filterText = tab.textContent.toLowerCase();
        
        // Фильтрация карточек (базовая логика)
        serviceCards.forEach(card => {
            if (filterText === 'все') {
                card.style.display = 'flex';
            } else {
                // Здесь можно добавить более сложную логику фильтрации
                card.style.display = 'flex';
            }
        });
    });
});

// ==================== Выбор типа доставки ====================
const deliveryOptions = document.querySelectorAll('.delivery-option button, .delivery-option-card button');

deliveryOptions.forEach((button, index) => {
    button.addEventListener('click', () => {
        const deliveryCard = button.closest('.delivery-option, .delivery-option-card');
        const deliveryTitle = deliveryCard.querySelector('h3').textContent;
        
        // Убираем выделение у всех опций
        deliveryOptions.forEach(btn => {
            btn.textContent = 'Выбрать';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        });
        
        // Выделяем выбранную опцию
        button.textContent = 'Выбрано';
        button.classList.remove('btn-outline');
        button.classList.add('btn-primary');
        
        // Обновляем поле "Тип доставки" если мы на странице заказа
        const deliveryTypeInput = document.getElementById('deliveryType');
        if (deliveryTypeInput) {
            deliveryTypeInput.value = deliveryTitle;
        }
    });
});

// ==================== Анимация при скролле ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Анимация для карточек услуг
document.querySelectorAll('.service-card, .hero-card, .delivery-option, .delivery-option-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ==================== Поиск услуг ====================
const searchInputs = document.querySelectorAll('.search-input');

searchInputs.forEach(searchInput => {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        serviceCards.forEach(card => {
            const title = card.querySelector('.service-title').textContent.toLowerCase();
            const description = card.querySelector('.service-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ==================== Плавный скролл для якорей ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Валидация телефона ====================
const phoneInput = document.getElementById('phone');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        // Оставляем только цифры и символы +, -, (, )
        e.target.value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
    });
}

// ==================== Дата не может быть в прошлом ====================
const deliveryDateInput = document.getElementById('deliveryDate');

if (deliveryDateInput) {
    const today = new Date().toISOString().split('T')[0];
    deliveryDateInput.setAttribute('min', today);
}

// ==================== Автозаполнение примера номера отслеживания ====================
const trackingExampleInput = document.querySelector('.tracking-example-input');

if (trackingExampleInput) {
    trackingExampleInput.addEventListener('click', () => {
        if (trackingInput) {
            trackingInput.value = trackingExampleInput.placeholder.replace('Пример номера: ', '');
            trackingInput.focus();
        }
    });
}

// ==================== Push-уведомления ====================
let deferredPrompt;
let notificationPermission = 'default';

// Проверка поддержки уведомлений
function isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Запрос разрешения на уведомления
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        console.log('Push-уведомления не поддерживаются');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено');
            await subscribeToPush();
            return true;
        } else {
            console.log('Разрешение на уведомления отклонено');
            return false;
        }
    } catch (error) {
        console.error('Ошибка при запросе разрешения:', error);
        return false;
    }
}

// Подписка на push-уведомления
async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Проверяем существующую подписку
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            // Создаем новую подписку
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI8YF5jxaKMrN8j8KwkbWjMCZuBcizM3M8bL0y8j2olEkeua5mA_0o8M1k')
            });
        }
        
        console.log('Подписка на push-уведомления:', subscription);
        
        // Сохраняем подписку в localStorage для демонстрации
        localStorage.setItem('postgo_push_subscription', JSON.stringify(subscription));
        
        // В реальном приложении здесь бы отправляли подписку на сервер
        // await sendSubscriptionToServer(subscription);
        
        return subscription;
    } catch (error) {
        console.error('Ошибка подписки на push:', error);
        return null;
    }
}

// Отписка от push-уведомлений
async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            localStorage.removeItem('postgo_push_subscription');
            console.log('Отписка от push-уведомлений выполнена');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка отписки:', error);
        return false;
    }
}

// Проверка статуса подписки
async function checkSubscriptionStatus() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        console.error('Ошибка проверки подписки:', error);
        return false;
    }
}

// Конвертация VAPID ключа
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Показать уведомление (для тестирования)
function showTestNotification() {
    if (Notification.permission === 'granted') {
        const notification = new Notification('POST GO - Тестовое уведомление', {
            body: 'Это тестовое уведомление от POST GO',
            icon: './icons8-коробка-64.png',
            badge: './icons8-коробка-64.png',
            tag: 'test-notification',
            requireInteraction: false
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        // Автоматически закрываем через 5 секунд
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// Создание кнопки управления уведомлениями
function createNotificationButton() {
    const button = document.createElement('button');
    button.id = 'notificationToggle';
    button.className = 'btn btn-outline notification-toggle';
    button.innerHTML = '🔔 Включить уведомления';
    
    // Обновляем текст кнопки в зависимости от статуса
    updateNotificationButton();
    
    button.addEventListener('click', async () => {
        if (Notification.permission === 'granted') {
            const isSubscribed = await checkSubscriptionStatus();
            if (isSubscribed) {
                await unsubscribeFromPush();
                showModal({
                    type: 'info',
                    title: 'Уведомления отключены',
                    message: 'Вы больше не будете получать push-уведомления.'
                });
            } else {
                await subscribeToPush();
                showModal({
                    type: 'success',
                    title: 'Уведомления включены',
                    message: 'Теперь вы будете получать важные уведомления о ваших заказах.'
                });
            }
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                showModal({
                    type: 'success',
                    title: 'Уведомления включены',
                    message: 'Теперь вы будете получать важные уведомления о ваших заказах.'
                });
            } else {
                showModal({
                    type: 'warning',
                    title: 'Уведомления заблокированы',
                    message: 'Разрешите уведомления в настройках браузера, чтобы получать важные обновления.'
                });
            }
        }
        updateNotificationButton();
    });
    
    return button;
}

// Обновление текста кнопки уведомлений
async function updateNotificationButton() {
    const button = document.getElementById('notificationToggle');
    if (!button) return;
    
    if (Notification.permission === 'granted') {
        const isSubscribed = await checkSubscriptionStatus();
        if (isSubscribed) {
            button.innerHTML = '🔔 Уведомления включены';
            button.classList.remove('btn-outline');
            button.classList.add('btn-primary');
        } else {
            button.innerHTML = '🔕 Включить уведомления';
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline');
        }
    } else {
        button.innerHTML = '🔔 Включить уведомления';
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline');
    }
}

// Добавление кнопки уведомлений в интерфейс
function addNotificationButtonToUI() {
    // Добавляем кнопку в шапку сайта
    const nav = document.querySelector('.nav');
    if (nav && !document.getElementById('notificationToggle')) {
        const notificationBtn = createNotificationButton();
        nav.appendChild(notificationBtn);
    }
    
    // Добавляем кнопку в мобильное меню
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    if (mobileNav && !document.getElementById('mobileNotificationToggle')) {
        const mobileNotificationBtn = document.createElement('a');
        mobileNotificationBtn.id = 'mobileNotificationToggle';
        mobileNotificationBtn.className = 'mobile-nav-item';
        mobileNotificationBtn.innerHTML = '<span class="mobile-nav-icon">🔔</span>';
        mobileNotificationBtn.title = 'Уведомления';
        
        mobileNotificationBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (Notification.permission === 'granted') {
                const isSubscribed = await checkSubscriptionStatus();
                if (isSubscribed) {
                    await unsubscribeFromPush();
                } else {
                    await subscribeToPush();
                }
            } else {
                await requestNotificationPermission();
            }
            updateNotificationButton();
        });
        
        mobileNav.appendChild(mobileNotificationBtn);
    }
}

// ==================== Загрузка страницы ====================
window.addEventListener('load', () => {
    // Скрываем прелоадер если он есть
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
    
    // Добавляем класс loaded к body
    document.body.classList.add('loaded');

    // Регистрация сервис-воркера для PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker зарегистрирован:', registration);
                
                // Проверяем обновления Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Новый Service Worker установлен, предлагаем обновление
                            showModal({
                                type: 'info',
                                title: 'Доступно обновление',
                                message: 'Новая версия приложения готова к установке.',
                                actions: [
                                    { label: 'Обновить', variant: 'primary', handler: () => window.location.reload() }
                                ]
                            });
                        }
                    });
                });
            })
            .catch(console.error);
    }

    // Инициализация push-уведомлений
    if (isNotificationSupported()) {
        addNotificationButtonToUI();
        
        // Проверяем статус уведомлений при загрузке
        setTimeout(() => {
            updateNotificationButton();
        }, 1000);
    }

    // Обработка установки PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA можно установить');
        e.preventDefault();
        deferredPrompt = e;
        
        // Показываем кнопку установки
        showInstallButton();
    });

    // Обработка успешной установки
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA установлено');
        showModal({
            type: 'success',
            title: 'Приложение установлено',
            message: 'POST GO успешно установлено на ваше устройство!'
        });
    });
});

// Показать кнопку установки PWA
function showInstallButton() {
    if (document.getElementById('installButton')) return;
    
    const installButton = document.createElement('button');
    installButton.id = 'installButton';
    installButton.className = 'btn btn-primary install-button';
    installButton.innerHTML = '📱 Установить приложение';
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('Пользователь установил PWA');
            } else {
                console.log('Пользователь отклонил установку PWA');
            }
            
            deferredPrompt = null;
            installButton.remove();
        }
    });
    
    // Добавляем кнопку в шапку
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.appendChild(installButton);
    }
}

// ==================== Консольное сообщение ====================
console.log('%cPOST GO', 'font-size: 40px; font-weight: bold; color: #0066FF;');
console.log('%cПрофессиональные грузоперевозки', 'font-size: 16px; color: #666;');
console.log('Сайт разработан с использованием HTML, CSS и JavaScript');

// ==================== Модальные окна ====================
function showModal({ type = 'info', title = '', message = '', actions = [] }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = `modal modal-${type}`;

    const iconMap = {
        success: '✔',
        error: '✖',
        info: 'ℹ',
        warning: '⚠'
    };

    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${iconMap[type] || 'ℹ'}</div>
            <div class="modal-title">${title}</div>
        </div>
        <div class="modal-body">${message}</div>
        <div class="modal-actions"></div>
    `;

    const actionsContainer = modal.querySelector('.modal-actions');

    // Кнопка по умолчанию
    const defaultAction = { label: 'Ок', variant: 'primary' };
    const allActions = actions.length ? actions : [defaultAction];

    allActions.forEach(({ label, variant = 'primary', handler }) => {
        const btn = document.createElement('button');
        btn.className = `btn ${variant === 'primary' ? 'btn-primary' : variant === 'dark' ? 'btn-dark' : 'btn-outline'}`;
        btn.textContent = label;
        btn.addEventListener('click', () => {
            close();
            if (typeof handler === 'function') handler();
        });
        actionsContainer.appendChild(btn);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Активация анимации
    requestAnimationFrame(() => overlay.classList.add('open'));

    function close() {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 200);
    }

    // Закрытие по клику на фон и по Esc
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onEsc(e){ if (e.key === 'Escape'){ close(); document.removeEventListener('keydown', onEsc);} });
}

// ==================== Кабинет: профиль, заказы, оплата ====================
function renderStatusBadge(status){
    const map = { 'Новый':'badge badge-new', 'Оплачен':'badge badge-done', 'В пути':'badge badge-progress', 'Отменен':'badge badge-cancel' };
    return `<span class="${map[status]||'badge'}">${status}</span>`;
}

function formatDate(d){ try { return new Date(d).toLocaleString('ru-RU'); } catch { return d; } }
function formatByn(n){ return `${Number(n||0).toFixed(2)} BYN`; }

function updateOrder(id, patch){
    const all = getAllOrders();
    const idx = all.findIndex(o => o.id === id);
    if (idx >= 0){ all[idx] = { ...all[idx], ...patch }; setAllOrders(all); }
}

function openPaymentModal(orderId){
    const o = getAllOrders().find(x => x.id === orderId);
    if (!o){ showModal({ type:'error', title:'Оплата', message:'Заказ не найден.'}); return; }
    const body = `Сумма к оплате: <b>${formatByn(o.price)}</b><br><br>
        <div class="form-row">
            <button class="btn btn-primary" id="payCloud">CloudPayments</button>
            <button class="btn btn-outline" id="payYandex">Яндекс Pay</button>
            <button class="btn btn-outline" id="payStripe">Stripe</button>
        </div>`;
    showModal({ type: 'info', title: 'Оплата заказа', message: body, actions: [{ label: 'Отмена', variant: 'outline' }] });
    setTimeout(() => {
        const openCardForm = (provider) => {
            const formHtml = `
                <div class="form-group"><label class="form-label">Номер карты</label>
                    <input type="text" id="cardNumber" class="form-input" placeholder="4111 1111 1111 1111" />
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1;"><label class="form-label">MM/YY</label>
                        <input type="text" id="cardExp" class="form-input" placeholder="12/29" />
                    </div>
                    <div class="form-group" style="flex:1;"><label class="form-label">CVC</label>
                        <input type="password" id="cardCvc" class="form-input" placeholder="123" />
                    </div>
                </div>`;
            showModal({ type:'info', title:`${provider}: Оплата ${formatByn(o.price)}`, message: formHtml, actions:[
                { label:'Отмена', variant:'outline' },
                { label:'Оплатить', variant:'primary', handler:()=>{
                    const num = (document.getElementById('cardNumber')?.value||'').replace(/\s+/g,'');
                    const exp = document.getElementById('cardExp')?.value||'';
                    const cvc = document.getElementById('cardCvc')?.value||'';
                    if (num.length < 13 || !/^[0-9]{13,19}$/.test(num)) { showModal({type:'error', title:'Ошибка', message:'Неверный номер карты'}); return; }
                    if (!/^\d{2}\/\d{2}$/.test(exp)) { showModal({type:'error', title:'Ошибка', message:'Неверный срок действия'}); return; }
                    if (!/^\d{3,4}$/.test(cvc)) { showModal({type:'error', title:'Ошибка', message:'Неверный CVC'}); return; }
                    // эмуляция подтверждения провайдером
                    setTimeout(()=>{
                        updateOrder(orderId, { status:'Оплачен', paidAt:new Date().toISOString(), provider });
                        showModal({ type:'success', title:'Оплата успешна', message:`Провайдер: ${provider}`, actions:[{label:'Готово', variant:'primary', handler:()=>location.reload()}]});
                    }, 600);
                }}
            ]});
        };
        document.getElementById('payCloud')?.addEventListener('click', () => openCardForm('CloudPayments'));
        document.getElementById('payYandex')?.addEventListener('click', () => openCardForm('Yandex Pay'));
        document.getElementById('payStripe')?.addEventListener('click', () => openCardForm('Stripe'));
    }, 0);
}

function openInvoice(orderId){
    const all = getAllOrders();
    const o = all.find(x => x.id === orderId);
    if (!o){ showModal({ type: 'error', title: 'Счет', message: 'Заказ не найден.' }); return; }
    const user = getSessionUser() || { name: 'Гость', phone: '—' };
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Счет ${o.id}</title>
    <style>body{font-family:Segoe UI,Arial,sans-serif;padding:24px;} h1{margin:0 0 10px} table{width:100%;border-collapse:collapse;margin-top:16px} td,th{border:1px solid #ddd;padding:8px;text-align:left} .right{text-align:right}</style>
    </head><body>
    <h1>Счет / Акт № ${o.id}</h1>
    <div>Клиент: ${user.name} · Тел: ${user.phone}</div>
    <div>Дата: ${formatDate(o.createdAt)}</div>
    <table>
        <thead><tr><th>Услуга</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
        <tbody>
            <tr><td>${o.deliveryType} — ${o.cargoType} (вес ${o.weight} кг, объем ${o.volume} м³)</td><td>1</td><td class="right">${formatByn(o.price)}</td><td class="right">${formatByn(o.price)}</td></tr>
        </tbody>
        <tfoot><tr><th colspan="3" class="right">Итого</th><th class="right">${formatByn(o.price)}</th></tr></tfoot>
    </table>
    <p>Подписи сторон: _____________ / _____________</p>
    <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}

function renderAccount(){
    if (!document.querySelector('.account-tabs')) return;
    const user = getSessionUser();
    if (!user){
        showModal({ type: 'info', title: 'Требуется вход', message: 'Авторизуйтесь, чтобы увидеть кабинет.', actions: [{ label: 'Войти', variant: 'primary', handler: () => window.location.href = 'auth.html' }] });
        return;
    }

    // Вкладки кабинета
    const accTabs = document.querySelectorAll('[data-account-tab]');
    const sections = {
        profile: document.getElementById('accountProfile'),
        orders: document.getElementById('accountOrders'),
        payments: document.getElementById('accountPayments'),
        notifications: document.getElementById('accountNotifications')
    };
    accTabs.forEach(t => t.addEventListener('click', () => {
        accTabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        const key = t.getAttribute('data-account-tab');
        Object.keys(sections).forEach(k => sections[k].style.display = k === key ? 'block' : 'none');
    }));

    // Профиль
    const accName = document.getElementById('accName');
    const accPhone = document.getElementById('accPhone');
    if (accName) accName.value = user.name || '';
    if (accPhone) accPhone.value = user.phone || '';

    const profileForm = document.getElementById('profileForm');
    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = accName.value.trim();
        const phone = accPhone.value.trim();
        if (!name || !phone){ showModal({ type:'error', title:'Ошибка', message:'Имя и телефон обязательны.'}); return; }
        localStorage.setItem('postgo_session_user', JSON.stringify({ ...user, name, phone }));
        showModal({ type:'success', title:'Сохранено', message:'Профиль обновлен.'});
    });
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        showModal({ type:'warning', title:'Выход', message:'Выйти из аккаунта?', actions:[{label:'Отмена', variant:'outline'},{label:'Выйти', variant:'primary', handler:()=>{ localStorage.removeItem('postgo_session_user'); window.location.href='index.html'; }}]});
    });
    document.getElementById('btnDeleteAcc')?.addEventListener('click', () => {
        showModal({ type:'error', title:'Удаление аккаунта', message:'Все данные будут удалены локально. Продолжить?', actions:[{label:'Отмена', variant:'outline'},{label:'Удалить', variant:'dark', handler:()=>{ localStorage.clear(); window.location.href='index.html'; }}]});
    });

    // Адреса
    const addrKey = 'postgo_addresses_v1';
    const getAddrs = ()=>{ try { return JSON.parse(localStorage.getItem(addrKey))||[]; } catch { return []; } };
    const setAddrs = (v)=> localStorage.setItem(addrKey, JSON.stringify(v));
    const renderAddrs = ()=>{
        const tb = document.querySelector('#addressesTable tbody'); if (!tb) return;
        tb.innerHTML='';
        getAddrs().forEach((a,i)=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i+1}</td><td>${a.from}</td><td>${a.to}</td><td><button class="btn btn-outline" data-del="${i}">Удалить</button></td>`;
            tb.appendChild(tr);
        });
    };
    document.getElementById('addressForm')?.addEventListener('submit', (e)=>{
        e.preventDefault();
        const from = document.getElementById('addrFrom').value.trim();
        const to = document.getElementById('addrTo').value.trim();
        if(!from || !to){ showModal({type:'error', title:'Ошибка', message:'Заполните адреса.'}); return; }
        const arr = getAddrs(); arr.push({ from, to }); setAddrs(arr);
        document.getElementById('addrFrom').value=''; document.getElementById('addrTo').value='';
        renderAddrs();
    });
    document.getElementById('addressesTable')?.addEventListener('click', (e)=>{
        const btn = e.target.closest('button[data-del]'); if(!btn) return;
        const idx = Number(btn.getAttribute('data-del'));
        const arr = getAddrs(); arr.splice(idx,1); setAddrs(arr); renderAddrs();
    });
    renderAddrs();

    // Заказы
    const tbody = document.querySelector('#ordersTable tbody');
    const summary = document.getElementById('accountSummary');
    if (tbody){
        const all = getAllOrders().filter(o => o.userPhone === user.phone);
        tbody.innerHTML = '';
        let total = 0;
        all.forEach((o, idx) => {
            total += o.price || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx+1}</td>
                <td>${formatDate(o.createdAt)}</td>
                <td>${o.deliveryType}</td>
                <td>${o.cargoType}</td>
                <td>${o.weight}</td>
                <td>${o.volume}</td>
                <td>${formatByn(o.price)}</td>
                <td>${renderStatusBadge(o.status)}</td>
                <td>
                    <button class="btn btn-primary" data-action="pay" data-id="${o.id}">Оплатить</button>
                    <button class="btn btn-outline" data-action="invoice" data-id="${o.id}">Счет</button>
                    <button class="btn btn-outline" data-action="cancel" data-id="${o.id}">Отмена</button>
                </td>`;
            tbody.appendChild(tr);
        });
        if (summary) summary.textContent = `Всего заказов: ${all.length} · На сумму: ${formatByn(total)}`;

        document.getElementById('ordersTable')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            if (action === 'pay') openPaymentModal(id);
            if (action === 'invoice') openInvoice(id);
            if (action === 'cancel') {
                showModal({ type:'warning', title:'Отмена заказа', message:'Подтвердите отмену заказа.', actions:[{label:'Нет', variant:'outline'},{label:'Да', variant:'primary', handler:()=>{ updateOrder(id, { status:'Отменен' }); location.reload(); }}]});
            }
        });
    }

    // Способы оплаты (мок)
    const payKey = 'postgo_payments_v1';
    const getPays = ()=>{ try { return JSON.parse(localStorage.getItem(payKey))||[]; } catch { return []; } };
    const setPays = (v)=> localStorage.setItem(payKey, JSON.stringify(v));
    const renderPays = ()=>{
        const tb = document.querySelector('#paymentsTable tbody'); if(!tb) return;
        tb.innerHTML='';
        getPays().forEach((p,i)=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i+1}</td><td>${p.provider}</td><td>${p.label||''}</td><td><button class=\"btn btn-outline\" data-rm=\"${i}\">Удалить</button></td>`;
            tb.appendChild(tr);
        });
    };
    document.getElementById('paymentForm')?.addEventListener('submit', (e)=>{
        e.preventDefault();
        const provider = document.getElementById('payProvider').value;
        const label = document.getElementById('payLabel').value.trim();
        const arr = getPays(); arr.push({ provider, label }); setPays(arr);
        document.getElementById('payLabel').value='';
        renderPays();
    });
    document.getElementById('paymentsTable')?.addEventListener('click', (e)=>{
        const btn = e.target.closest('button[data-rm]'); if(!btn) return;
        const idx = Number(btn.getAttribute('data-rm'));
        const arr = getPays(); arr.splice(idx,1); setPays(arr); renderPays();
    });
    renderPays();

    // Инициализация секции уведомлений
    initNotificationSection();
}

// Инициализация секции уведомлений в кабинете
function initNotificationSection() {
    const notificationToggleBtn = document.getElementById('notificationToggleBtn');
    const testNotificationBtn = document.getElementById('testNotificationBtn');
    const notificationStatusText = document.getElementById('notificationStatusText');
    
    if (!notificationToggleBtn || !testNotificationBtn || !notificationStatusText) return;

    // Обновление статуса уведомлений
    async function updateNotificationStatus() {
        if (!isNotificationSupported()) {
            notificationStatusText.textContent = 'Push-уведомления не поддерживаются в этом браузере';
            notificationToggleBtn.textContent = 'Недоступно';
            notificationToggleBtn.disabled = true;
            return;
        }

        const permission = Notification.permission;
        const isSubscribed = await checkSubscriptionStatus();

        if (permission === 'granted' && isSubscribed) {
            notificationStatusText.textContent = '✅ Уведомления включены';
            notificationToggleBtn.textContent = 'Отключить';
            notificationToggleBtn.className = 'btn btn-outline';
            testNotificationBtn.disabled = false;
        } else if (permission === 'granted' && !isSubscribed) {
            notificationStatusText.textContent = '⚠️ Разрешены, но не подписаны';
            notificationToggleBtn.textContent = 'Подписаться';
            notificationToggleBtn.className = 'btn btn-primary';
            testNotificationBtn.disabled = false;
        } else if (permission === 'denied') {
            notificationStatusText.textContent = '❌ Уведомления заблокированы';
            notificationToggleBtn.textContent = 'Заблокированы';
            notificationToggleBtn.disabled = true;
            testNotificationBtn.disabled = true;
        } else {
            notificationStatusText.textContent = '❓ Разрешение не запрошено';
            notificationToggleBtn.textContent = 'Включить';
            notificationToggleBtn.className = 'btn btn-primary';
            testNotificationBtn.disabled = true;
        }
    }

    // Обработчик кнопки переключения уведомлений
    notificationToggleBtn.addEventListener('click', async () => {
        if (Notification.permission === 'granted') {
            const isSubscribed = await checkSubscriptionStatus();
            if (isSubscribed) {
                await unsubscribeFromPush();
                showModal({
                    type: 'info',
                    title: 'Уведомления отключены',
                    message: 'Вы больше не будете получать push-уведомления.'
                });
            } else {
                await subscribeToPush();
                showModal({
                    type: 'success',
                    title: 'Уведомления включены',
                    message: 'Теперь вы будете получать важные уведомления о ваших заказах.'
                });
            }
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                showModal({
                    type: 'success',
                    title: 'Уведомления включены',
                    message: 'Теперь вы будете получать важные уведомления о ваших заказах.'
                });
            } else {
                showModal({
                    type: 'warning',
                    title: 'Уведомления заблокированы',
                    message: 'Разрешите уведомления в настройках браузера, чтобы получать важные обновления.'
                });
            }
        }
        updateNotificationStatus();
    });

    // Обработчик тестового уведомления
    testNotificationBtn.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
            showTestNotification();
            showModal({
                type: 'success',
                title: 'Тестовое уведомление отправлено',
                message: 'Проверьте, появилось ли уведомление в вашей системе.'
            });
        } else {
            showModal({
                type: 'warning',
                title: 'Нет разрешения',
                message: 'Сначала включите уведомления, чтобы отправить тестовое уведомление.'
            });
        }
    });

    // Сохранение настроек уведомлений
    const notificationCheckboxes = document.querySelectorAll('#accountNotifications input[type="checkbox"]');
    notificationCheckboxes.forEach(checkbox => {
        // Загружаем сохраненные настройки
        const savedSettings = JSON.parse(localStorage.getItem('postgo_notification_settings') || '{}');
        checkbox.checked = savedSettings[checkbox.id] !== false;

        // Сохраняем изменения
        checkbox.addEventListener('change', () => {
            const settings = JSON.parse(localStorage.getItem('postgo_notification_settings') || '{}');
            settings[checkbox.id] = checkbox.checked;
            localStorage.setItem('postgo_notification_settings', JSON.stringify(settings));
        });
    });

    // Обновляем статус при загрузке
    updateNotificationStatus();
}

// Инициализация кабинета
renderAccount();

