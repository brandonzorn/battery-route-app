let map, routingControl;
let startPoint = null;
let endPoint = null;
let startMarker = null;
let endMarker = null;

// Конфигурация карты
const MAP_CONFIG = {
    center: [55.75, 37.62],
    zoom: 12,
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    tileLayerOptions: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | EV Battery Calculator',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 3
    }
};

// Инициализация карты
function initMap() {
    map = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
    L.tileLayer(MAP_CONFIG.tileLayer, MAP_CONFIG.tileLayerOptions).addTo(map);
    
    // Включаем все возможности навигации
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    
    // Обработчик клика
    map.on('click', onMapClick);
    
    // Приветственное сообщение
    showWelcomePopup();
}

// Показать приветственное окно
function showWelcomePopup() {
    setTimeout(() => {
        const popup = L.popup()
            .setLatLng(MAP_CONFIG.center)
            .setContent('🎯 <strong>Добро пожаловать!</strong><br>Перетаскивайте карту для навигации.<br>Нажмите <strong>Ctrl + клик</strong> для выбора маршрута.')
            .openOn(map);
        setTimeout(() => map.closePopup(popup), 5000);
    }, 1000);
}

// Обработчик клика по карте
function onMapClick(e) {
    const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
    
    if (!isCtrlPressed) {
        showTempPopup(e.latlng, '💡 Для установки точки нажмите <strong>Ctrl + клик</strong>');
        return;
    }
    
    if (startPoint === null) {
        setStartPoint(e.latlng);
    } else if (endPoint === null) {
        setEndPoint(e.latlng);
    } else {
        showTempPopup(e.latlng, '⚠️ Маршрут уже построен! Нажмите "Сбросить"');
    }
}

// Показать временный попап
function showTempPopup(latlng, message) {
    const popup = L.popup()
        .setLatLng(latlng)
        .setContent(message)
        .openOn(map);
    setTimeout(() => map.closePopup(popup), 2000);
}

// Установка стартовой точки
function setStartPoint(latlng) {
    startPoint = latlng;
    startMarker = L.marker(startPoint, {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color:#10b981; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            popupAnchor: [0, -9]
        })
    }).addTo(map);
    startMarker.bindPopup('📍 СТАРТ').openPopup();
    
    updateRouteInfo('✅ <strong>Статус:</strong> СТАРТ выбран<br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора ФИНИША');
}

// Установка финишной точки
function setEndPoint(latlng) {
    endPoint = latlng;
    endMarker = L.marker(endPoint, {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color:#ef4444; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            popupAnchor: [0, -9]
        })
    }).addTo(map);
    endMarker.bindPopup('🏁 ФИНИШ').openPopup();
    buildRoute();
}

// Построение маршрута
function buildRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
    }
    
    routingControl = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: false,
        show: false,
        lineOptions: { 
            styles: [{ color: '#667eea', weight: 4, opacity: 0.8 }],
            extendToWaypoints: true
        },
        router: L.Routing.osrmv1({ 
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
    }).addTo(map);
    
    routingControl.on('routesfound', function(e) {
        const route = e.routes[0];
        const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
        document.getElementById('distance').value = distanceKm;
        updateRouteInfo(`✅ <strong>Маршрут построен!</strong><br>📏 Расстояние: ${distanceKm} км<br>🗺️ Перетаскивайте карту для навигации`);
        getElevationProfile(route.coordinates);
    });
    
    routingControl.on('routingerror', function(e) {
        console.error('Ошибка построения маршрута:', e);
        updateRouteInfo('❌ <strong>Ошибка построения маршрута!</strong><br>Попробуйте выбрать другие точки');
    });
}

// Получение профиля высот
async function getElevationProfile(coords) {
    try {
        const points = coords.filter((_, i) => i % 10 === 0).slice(0, 100);
        const response = await axios.post('https://api.open-elevation.com/api/v1/lookup', {
            locations: points.map(p => ({ latitude: p.lat, longitude: p.lng }))
        });
        
        let elevations = response.data.results.map(r => r.elevation);
        let totalAscent = 0, totalDescent = 0;
        
        for (let i = 1; i < elevations.length; i++) {
            let diff = elevations[i] - elevations[i-1];
            if (diff > 0) totalAscent += diff;
            else totalDescent -= diff;
        }
        
        document.getElementById('delta_h').value = Math.round(totalAscent);
        document.getElementById('total_descent').value = Math.round(totalDescent);
    } catch(e) {
        console.log('Elevation API error:', e);
    }
}

// Сброс маршрута
function resetRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    startPoint = null;
    endPoint = null;
    
    document.getElementById('distance').value = '0';
    document.getElementById('delta_h').value = '0';
    document.getElementById('total_descent').value = '0';
    document.getElementById('results').innerHTML = '';
    
    updateRouteInfo('🗺️ <strong>Статус:</strong> Маршрут сброшен<br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора старта');
}

// Обновление информации о маршруте
function updateRouteInfo(message) {
    const routeInfo = document.getElementById('routeInfo');
    routeInfo.innerHTML = message;
    routeInfo.classList.add('fade-in');
    setTimeout(() => routeInfo.classList.remove('fade-in'), 300);
}

// Установка пресетов
function setPreset(type) {
    const presets = {
        bike: {
            mass: 100, speed: 25, rolling_resistance: 2, wheel_radius: 350,
            drag_coefficient: 1.0, frontal_area: 0.4, regen_efficiency: 10, battery_voltage: 48
        },
        car: {
            mass: 1500, speed: 60, rolling_resistance: 2, wheel_radius: 320,
            drag_coefficient: 0.35, frontal_area: 2.2, regen_efficiency: 60, battery_voltage: 400
        },
        scooter: {
            mass: 85, speed: 20, rolling_resistance: 2.5, wheel_radius: 200,
            drag_coefficient: 1.1, frontal_area: 0.3, regen_efficiency: 5, battery_voltage: 36
        }
    };
    
    const preset = presets[type];
    if (preset) {
        Object.entries(preset).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.value = value;
        });
    }
}

// Расчет и отображение результатов
async function calculateAndDisplay() {
    const fields = [
        'mass', 'speed', 'rolling_resistance', 'wheel_radius', 'drag_coefficient',
        'frontal_area', 'inefficiency', 'delta_h', 'total_descent', 'distance',
        'regen_efficiency', 'battery_voltage', 'charger_efficiency', 'bms_losses', 'thermal_losses'
    ];
    
    const data = {};
    fields.forEach(field => {
        data[field] = parseFloat(document.getElementById(field).value);
    });
    
    if (data.distance === 0) {
        alert('⚠️ Сначала постройте маршрут! Нажмите Ctrl + клик для выбора точек.');
        return;
    }
    
    // Показываем индикатор загрузки
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="result-card loading"><div class="text-center">⏳ Расчет...</div></div>';
    
    try {
        const response = await axios.post('/calculate', data);
        const res = response.data;
        
        resultsDiv.innerHTML = `
            <div class="result-card">
                <h3><i class="fas fa-chart-line"></i> Энергозатраты на движение</h3>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-mountain"></i> Подъем:</span>
                    <span class="result-value">${res.energy.climb_energy} кДж</span>
                </div>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-tire"></i> Трение качения:</span>
                    <span class="result-value">${res.energy.rolling_energy} кДж</span>
                </div>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-wind"></i> Аэродинамика:</span>
                    <span class="result-value">${res.energy.air_energy} кДж</span>
                </div>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-rocket"></i> Инерция:</span>
                    <span class="result-value">${res.energy.inertia_energy} кДж</span>
                </div>
                <div class="result-item">
                    <span class="result-label"><strong>Всего энергии:</strong></span>
                    <span class="result-value"><strong>${res.energy.total_energy_kj} кДж / ${res.energy.total_energy_wh} Вт·ч</strong></span>
                </div>
            </div>
            <div class="result-card">
                <h3><i class="fas fa-battery-full"></i> Расчет батареи</h3>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-charging-station"></i> КПД зарядки:</span>
                    <span class="result-value">${res.battery.total_efficiency}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label"><i class="fas fa-database"></i> Энергия с потерями:</span>
                    <span class="result-value">${res.battery.required_energy_wh} Вт·ч</span>
                </div>
                <div class="big-result">
                    ⚡ ${res.battery.required_capacity_ah} А·ч
                </div>
                <div class="result-item">
                    <span class="result-label">Рекомендуемая батарея:</span>
                    <span class="result-value">${data.battery_voltage}В ${res.battery.required_capacity_ah}А·ч</span>
                </div>
                <div class="note">* С учетом потерь при зарядке (ЗУ, BMS, нагрев)</div>
            </div>
        `;
    } catch(e) {
        resultsDiv.innerHTML = `<div class="result-card"><div class="text-center">❌ Ошибка: ${e.message}</div></div>`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // Добавляем анимацию для инпутов
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});