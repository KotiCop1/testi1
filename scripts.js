// 1. Находим ВСЕ кнопки с классом "details-btn"
const allButtons = document.querySelectorAll('.details-btn');

// 2. Для КАЖДОЙ кнопки добавляем обработчик
for (let i = 0; i < allButtons.length; i++) {

    const button = allButtons[i];

    // 3. Событие "клик" на кнопку
    button.addEventListener('click', function() {

        // Находим блок с деталями (соседний div)
        const detailsBlock = button.parentElement.nextElementSibling;

        // Проверяем: если блок скрыт - показываем, если виден - скрываем
        if (detailsBlock.style.display === 'none' || detailsBlock.style.display === '') {
            detailsBlock.style.display = 'block';
            button.textContent = 'Скрыть';
        } else {
            detailsBlock.style.display = 'none';
            button.textContent = 'Подробнее';
        }
    });

    // 4. Событие "наведение мыши" на кнопку
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#B33A2B';
    });

    // 5. Событие "уход мыши" с кнопки
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#C9A227';
    });
}
// =============================================
// ЛАБОРАТОРНАЯ РАБОТА №5
// Чтение данных из Firestore и вывод списка игр
// =============================================

// Ждем загрузки страницы
document.addEventListener('DOMContentLoaded', function () {

    console.log('✅ Страница загружена');

    // Ждем, пока Firebase инициализируется
    // (в index.html мы установили window.firebaseReady = true)
    waitForFirebase();

});

// Функция ожидания Firebase
function waitForFirebase() {
    if (window.firebaseReady && window.db) {
        console.log('✅ Firebase готов, начинаем загрузку игр');
        loadGames();
    } else {
        // Проверяем каждые 100 мс
        setTimeout(waitForFirebase, 100);
    }
}

// =============================================
// ЗАГРУЗКА ИГР ИЗ FIRESTORE
// =============================================

async function loadGames() {
    try {
        // 1. Импортируем нужные функции
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');

        // 2. Получаем ссылку на коллекцию "games"
        const gamesCollection = collection(window.db, 'games');
        console.log('📚 Запрашиваем игры из коллекции "games"...');

        // 3. Получаем все документы из коллекции
        const querySnapshot = await getDocs(gamesCollection);
        console.log('📦 Получено документов:', querySnapshot.size);

        // 4. Преобразуем документы в массив объектов
        const games = [];
        querySnapshot.forEach(function (doc) {
            // doc.id — ID документа
            // doc.data() — данные документа
            games.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('🎮 Игры:', games);

        // 5. Отрисовываем игры на странице
        renderGames(games);

    } catch (error) {
        console.error('❌ Ошибка при загрузке игр:', error);
        showError();
    }
}

// =============================================
// ОТРИСОВКА КАРТОЧЕК ИГР
// =============================================

// =============================================
// ОТРИСОВКА КАРТОЧЕК ИГР (с кнопками управления)
// =============================================

function renderGames(games) {
    // 1. Находим контейнер для карточек
    const container = document.getElementById('games-container');

    // 2. Очищаем контейнер от старого содержимого
    container.innerHTML = '';

    // 3. Если игр нет — показываем сообщение
    if (games.length === 0) {
        container.innerHTML = '<p>Пока нет игр в базе данных</p>';
        return;
    }

    // 4. Для каждой игры создаем карточку
    games.forEach(function (game) {
        // Создаем HTML-элемент карточки
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-id', game.id); // сохраняем ID для удаления/редактирования

        // Заполняем карточку данными из Firestore
        card.innerHTML = `
            <img src="${game.imageUrl || 'https://via.placeholder.com/280x150'}" 
                 alt="${game.title}" 
                 class="game-image">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-short">Жанр: ${game.genre}</p>
            <p class="game-rating">⭐ Рейтинг: ${game.rating}/10</p>
            
            <!-- КНОПКИ УПРАВЛЕНИЯ -->
            <div class="card-actions">
                <button class="edit-btn" data-id="${game.id}">✏️ Изменить</button>
                <button class="delete-btn" data-id="${game.id}">🗑️ Удалить</button>
            </div>
        `;

        // Добавляем карточку в контейнер
        container.appendChild(card);
    });

    // 5. Навешиваем обработчики на кнопки
    attachCardHandlers();

    console.log('✅ Отрисовано карточек:', games.length);
}


// =============================================
// СООБЩЕНИЕ ОБ ОШИБКЕ
// =============================================

function showError() {
    const container = document.getElementById('games-container');
    container.innerHTML = `
        <p style="color: red;">
            ❌ Ошибка загрузки игр. Проверь консоль (F12).
        </p>
    `;
}

// =============================================
// ЛАБОРАТОРНАЯ №6: Добавление игр через форму
// =============================================

// Ждём загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // Находим форму
    const form = document.getElementById('add-game-form');
    
    if (form) {
        console.log('✅ Форма найдена');
        
        // Добавляем обработчик отправки формы
        form.addEventListener('submit', async function(event) {
            // 1. Отменяем перезагрузку страницы
            event.preventDefault();
            
            console.log('📝 Форма отправлена');
            
            // 2. Собираем данные из полей
            const title = document.getElementById('title').value.trim();
            const genre = document.getElementById('genre').value.trim();
            const rating = parseFloat(document.getElementById('rating').value);
            const imageUrl = document.getElementById('imageUrl').value.trim();
            
            // 3. Проверяем данные
            if (!title || !genre || isNaN(rating)) {
                alert('❌ Заполните все обязательные поля!');
                return;
            }
            
            console.log('📦 Данные:', { title, genre, rating, imageUrl });
            
            // 4. Отправляем в Firestore
            try {
                // Импортируем addDoc
                const { collection, addDoc } = await import(
                    'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
                );
                
                // Добавляем документ
                const docRef = await addDoc(collection(window.db, 'games'), {
                    title: title,
                    genre: genre,
                    rating: rating,
                    imageUrl: imageUrl || 'https://via.placeholder.com/280x150'
                });
                
                console.log('✅ Игра добавлена! ID:', docRef.id);
                
                // 5. Очищаем форму
                form.reset();
                
                // 6. Показываем уведомление
                alert('✅ Игра успешно добавлена!');
                
                // 7. Обновляем список игр
                if (typeof loadGames === 'function') {
                    loadGames();
                }
                
            } catch (error) {
                console.error('❌ Ошибка:', error);
                alert('❌ Ошибка при добавлении: ' + error.message);
            }
        });
    }
});
// =============================================
// ЛАБОРАТОРНАЯ №7: Удаление и редактирование
// =============================================

// ==========================================
// ФУНКЦИЯ УДАЛЕНИЯ
// ==========================================

async function deleteGame(id) {
    console.log('🗑️ Удаляем игру с ID:', id);
    
    // Спрашиваем подтверждение
    const confirmed = confirm('Вы уверены, что хотите удалить эту игру?');
    if (!confirmed) {
        console.log('❌ Удаление отменено');
        return;
    }
    
    try {
        const { doc, deleteDoc } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        // Удаляем документ по ID
        await deleteDoc(doc(window.db, 'games', id));
        
        console.log('✅ Игра удалена!');
        alert('✅ Игра успешно удалена!');
        
        // Обновляем список
        // Находим карточку по data-id и удаляем её из DOM
        const cardToRemove = document.querySelector(`.game-card[data-id="${id}"]`);
        if (cardToRemove) {
            cardToRemove.style.transition = 'opacity 0.3s, transform 0.3s';
            cardToRemove.style.opacity = '0';
            cardToRemove.style.transform = 'scale(0.8)';
    
        setTimeout(function() {
            cardToRemove.remove();
            console.log('✅ Карточка удалена из DOM');
        }, 300);
        }

    } catch (error) {
        console.error('❌ Ошибка при удалении:', error);
        alert('❌ Ошибка при удалении: ' + error.message);
    }
}


// ==========================================
// ФУНКЦИЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА
// ==========================================

async function openEditModal(id) {
    console.log('✏️ Открываем редактирование для ID:', id);
    
    try {
        const { doc, getDoc } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        // Получаем текущие данные документа
        const docSnap = await getDoc(doc(window.db, 'games', id));
        
        if (!docSnap.exists()) {
            alert('❌ Игра не найдена');
            return;
        }
        
        const game = docSnap.data();
        console.log('📦 Текущие данные:', game);
        
        // Заполняем форму текущими данными
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-title').value = game.title || '';
        document.getElementById('edit-genre').value = game.genre || '';
        document.getElementById('edit-rating').value = game.rating || 0;
        document.getElementById('edit-imageUrl').value = game.imageUrl || '';
        
        // Показываем модальное окно
        document.getElementById('edit-modal').classList.add('active');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert('❌ Ошибка загрузки данных: ' + error.message);
    }
}

// ==========================================
// НАВЕШИВАЕМ ОБРАБОТЧИКИ НА КНОПКИ КАРТОЧЕК
// ==========================================

function attachCardHandlers() {
    
    // Кнопки «Удалить»
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const gameId = button.getAttribute('data-id');
            deleteGame(gameId);
        });
    });
    
    // Кнопки «Изменить»
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const gameId = button.getAttribute('data-id');
            openEditModal(gameId);
        });
    });
}

// ==========================================
// ОБРАБОТКА ФОРМЫ РЕДАКТИРОВАНИЯ
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    const editForm = document.getElementById('edit-form');
    const modal = document.getElementById('edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    
    // Отправка формы редактирования
    if (editForm) {
        editForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Собираем данные из формы
            const id = document.getElementById('edit-id').value;
            const title = document.getElementById('edit-title').value.trim();
            const genre = document.getElementById('edit-genre').value.trim();
            const rating = parseFloat(document.getElementById('edit-rating').value);
            const imageUrl = document.getElementById('edit-imageUrl').value.trim();
            
            // Проверка
            if (!title || !genre || isNaN(rating)) {
                alert('❌ Заполните все обязательные поля!');
                return;
            }
            
            try {
                const { doc, updateDoc } = await import(
                    'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
                );
                
                // Обновляем документ
                await updateDoc(doc(window.db, 'games', id), {
                    title: title,
                    genre: genre,
                    rating: rating,
                    imageUrl: imageUrl
                });
                
                console.log('✅ Игра обновлена!');
                alert('✅ Игра успешно обновлена!');
                
                // Закрываем модальное окно
                modal.classList.remove('active');
                editForm.reset();
                
                // Обновляем список
                loadGames();
                
            } catch (error) {
                console.error('❌ Ошибка обновления:', error);
                alert('❌ Ошибка при обновлении: ' + error.message);
            }
        });
    }
    
    // Кнопка «Отмена»
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            editForm.reset();
        });
    }
    
    // Клик по фону — закрыть модальное окно
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('active');
                editForm.reset();
            }
        });
    }
    
    // Esc — закрыть модальное окно
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            editForm.reset();
        }
    });
});
// =============================================
// ЛАБОРАТОРНАЯ №9: Лидерборд
// =============================================

// ==========================================
// ЗАГРУЗКА ТОП-10 РЕКОРДОВ
// ==========================================

async function loadLeaderboard(gameFilter) {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Загрузка...</td></tr>';
    
    try {
        const { collection, query, orderBy, limit, where, getDocs } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        // Собираем запрос
        let q;
        
        if (gameFilter) {
            // С фильтром по игре
            q = query(
                collection(window.db, 'scores'),
                where('gameTitle', '==', gameFilter),
                orderBy('score', 'desc'),
                limit(10)
            );
        } else {
            // Без фильтра
            q = query(
                collection(window.db, 'scores'),
                orderBy('score', 'desc'),
                limit(10)
            );
        }
        
        const querySnapshot = await getDocs(q);
        
        const scores = [];
        querySnapshot.forEach(function(doc) {
            scores.push(doc.data());
        });
        
        console.log('🏆 Загружено рекордов:', scores.length);
        
        renderLeaderboard(scores);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки лидерборда:', error);
        
        // Если нужен индекс — показываем ссылку
        if (error.message && error.message.includes('index')) {
            tbody.innerHTML = `
                <tr><td colspan="4" style="text-align: center; color: #e74c3c;">
                    ⚠️ Требуется создать индекс в Firestore.<br>
                    Проверь консоль (F12) и перейди по ссылке.
                </td></tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr><td colspan="4" style="text-align: center; color: #e74c3c;">
                    ❌ Ошибка загрузки: ${error.message}
                </td></tr>
            `;
        }
    }
}

// ==========================================
// ОТРИСОВКА ТАБЛИЦЫ
// ==========================================

function renderLeaderboard(scores) {
    const tbody = document.getElementById('leaderboard-body');
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Пока нет рекордов</td></tr>';
        return;
    }
    
    // Медали для топ-3
    const medals = ['🥇', '🥈', '🥉'];
    
    tbody.innerHTML = '';
    
    scores.forEach(function(score, index) {
        const tr = document.createElement('tr');
        
        const place = index < 3 ? medals[index] + ' ' + (index + 1) : index + 1;
        
        tr.innerHTML = `
            <td><strong>${place}</strong></td>
            <td>${score.playerName}</td>
            <td><strong>${score.score.toLocaleString()}</strong></td>
            <td>${score.gameTitle}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// ==========================================
// ДОБАВЛЕНИЕ НОВОГО РЕКОРДА
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    const scoreForm = document.getElementById('score-form');
    
    if (scoreForm) {
        scoreForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const playerName = document.getElementById('player-name').value.trim();
            const score = parseInt(document.getElementById('player-score').value);
            const gameTitle = document.getElementById('game-title').value;
            
            if (!playerName || isNaN(score) || !gameTitle) {
                alert('❌ Заполните все поля!');
                return;
            }
            
            try {
                const { collection, addDoc } = await import(
                    'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
                );
                
                await addDoc(collection(window.db, 'scores'), {
                    playerName: playerName,
                    score: score,
                    gameTitle: gameTitle,
                    createdAt: new Date()
                });
                
                console.log('✅ Рекорд добавлен!');
                alert('✅ Рекорд успешно добавлен!');
                
                scoreForm.reset();
                
                // Обновляем таблицу
                const filter = document.getElementById('leaderboard-game-filter').value;
                loadLeaderboard(filter);
                
            } catch (error) {
                console.error('❌ Ошибка:', error);
                alert('❌ Ошибка: ' + error.message);
            }
        });
    }
    
    // Фильтр по игре
    const gameFilter = document.getElementById('leaderboard-game-filter');
    if (gameFilter) {
        gameFilter.addEventListener('change', function() {
            loadLeaderboard(this.value);
        });
    }
    
    // Загружаем лидерборд при старте
    setTimeout(function() {
        if (window.firebaseReady) {
            loadLeaderboard('');
        } else {
            setTimeout(arguments.callee, 100);
        }
    }, 500);
});
// =============================================
// ЛАБОРАТОРНАЯ №11: Тактический поиск и фильтрация (v2.0)
// =============================================

let allGames = []; // База данных подразделений (игр)

async function loadAllGames() {
    // Показываем заглушки ДО загрузки
    showSkeletons(6);
    
    try {
        const { collection, getDocs } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        console.log('📡 Запрос к штабу: получение списка игр...');
        const querySnapshot = await getDocs(collection(window.db, 'games'));
        
        allGames = [];
        querySnapshot.forEach(function(doc) {
            allGames.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Данные получены. В строю: ${allGames.length} ед. техники.`);
        applyFilters();
        
    } catch (error) {
        console.error('❌ ОШИБКА СВЯЗИ СО ШТАБОМ:', error);
        // Если ошибка — показываем сообщение
        const container = document.getElementById('games-container');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #B33A2B; font-family: \'Black Ops One\', monospace;">❌ ОШИБКА ПОЛУЧЕНИЯ ДАННЫХ</p>';
        }
    }
}

function applyFilters() {
    const searchText = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const genreFilter = document.getElementById('genre-filter')?.value || '';
    const ratingFilter = parseFloat(document.getElementById('rating-filter')?.value) || 0;
    const sortFilter = document.getElementById('sort-filter')?.value || 'default';
    
    let filtered = [...allGames];
    
    // 1. 🔍 УЛУЧШЕННЫЙ ПОИСК: по названию ИЛИ жанру одновременно
    if (searchText) {
        filtered = filtered.filter(g => 
            g.title.toLowerCase().includes(searchText) || 
            (g.genre && g.genre.toLowerCase().includes(searchText))
        );
    }
    
    // 2. Фильтр по роду войск (жанру из выпадающего списка)
    if (genreFilter) {
        filtered = filtered.filter(g => g.genre === genreFilter);
    }
    
    // 3. Фильтр по боеготовности (рейтингу)
    if (ratingFilter > 0) {
        filtered = filtered.filter(g => parseFloat(g.rating) >= ratingFilter);
    }
    
    // 4. Тактическая сортировка
    switch (sortFilter) {
        case 'rating-desc':
            filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            break;
        case 'rating-asc':
            filtered.sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
            break;
        case 'title-asc':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filtered.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    // Обновление сводки на экране
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `РАЗВЕДКА ДОКЛАДЫВАЕТ: НАЙДЕНО ${filtered.length} ОБЪЕКТ(ОВ)`;
    }
    
    // Показываем skeleton перед рендером (опционально, если данных много)
    if (filtered.length > 10) {
        showSkeletons(Math.min(filtered.length, 6));
        setTimeout(() => {
            if (typeof renderGames === 'function') {
                renderGames(filtered);
            }
        }, 300); // Небольшая задержка для эффекта
    } else {
        // Рендер (функция должна быть объявлена в основном коде)
        if (typeof renderGames === 'function') {
            renderGames(filtered);
        }
    }
    
    console.log(`🔍 Фильтры применены. Отсеяно целей: ${allGames.length - filtered.length}. Осталось в списке: ${filtered.length}`);
}
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚙️ Инициализация панели тактического управления...');
    
    // Обработчики фильтров
    document.getElementById('search-input')?.addEventListener('input', applyFilters);
    document.getElementById('genre-filter')?.addEventListener('change', applyFilters);
    document.getElementById('rating-filter')?.addEventListener('input', applyFilters);
    document.getElementById('sort-filter')?.addEventListener('change', applyFilters);
    
    // Сброс настроек
    document.getElementById('reset-filters')?.addEventListener('click', function() {
        document.getElementById('search-input').value = '';
        document.getElementById('genre-filter').value = '';
        document.getElementById('rating-filter').value = '';
        document.getElementById('sort-filter').value = 'default';
        console.log('🔄 Настройки фильтров сброшены до заводских.');
        applyFilters();
    });
    
    // Загружаем данные при старте
    setTimeout(function() {
        if (window.firebaseReady) {
            loadAllGames();
        } else {
            console.warn('⚠️ Firebase ещё не инициализирован. Ожидание...');
        }
    }, 500);
});
document.addEventListener('DOMContentLoaded', () => {
    const burgerToggle = document.getElementById('burger-toggle');
    const navItems = document.querySelectorAll('.main-nav a, .main-nav button');

    // При клике на любую ссылку или кнопку внутри меню — снимаем галочку с чекбокса (меню скроется)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            burgerToggle.checked = false;
        });
    });
});
function showSkeletons(count = 3) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        `;
        container.appendChild(skeleton);
    }
}
я