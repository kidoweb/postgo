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
        showModal({ type: 'success', title: 'Добро пожаловать!', message: `${user.name}, вы успешно вошли.`, actions: [{ label: 'На главную', variant: 'primary', handler: () => window.location.href = 'index.html' }] });
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
        
        // Успешное оформление заказа
        showModal({ type: 'success', title: 'Заказ оформлен', message: 'Мы свяжемся с вами в ближайшее время.' });
        
        // Генерируем номер отслеживания
        const trackingNumber = 'TRK-' + Math.floor(Math.random() * 10000) + '-' + 
                               Math.random().toString(36).substring(2, 6).toUpperCase();
        
        showModal({
            type: 'info',
            title: 'Номер отслеживания',
            message: `Ваш трек-номер: <b>${trackingNumber}</b>`,
            actions: [
                { label: 'К трекингу', variant: 'primary', handler: () => window.location.href = 'tracking.html' },
                { label: 'Закрыть', variant: 'outline' }
            ]
        });
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
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
});

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

