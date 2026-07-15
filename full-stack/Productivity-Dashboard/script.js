/**
 * Productivity Dashboard
 * Single Page Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // UTILITIES
    // ==========================================
    const showToast = (message) => {
        const toast = document.getElementById('notification-toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    };

    // ==========================================
    // NAVIGATION MODULE
    // ==========================================
    const Navigation = (() => {
        const dashboardView = document.getElementById('view-dashboard');
        const featureView = document.getElementById('view-feature');
        const featureContents = document.querySelectorAll('.feature-content');
        const cards = document.querySelectorAll('.feature-card');
        const backBtn = document.getElementById('back-btn');

        const openFeature = (targetId) => {
            // Hide dashboard
            dashboardView.classList.remove('active');
            dashboardView.classList.add('hidden');
            
            // Hide all feature contents
            featureContents.forEach(content => content.classList.add('hidden'));
            
            // Show target feature content
            const targetContent = document.getElementById(`feature-${targetId}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
            
            // Show feature view container
            featureView.classList.remove('hidden');
            featureView.classList.add('active');
        };

        const goBack = () => {
            // Hide feature view
            featureView.classList.remove('active');
            featureView.classList.add('hidden');
            
            // Show dashboard
            dashboardView.classList.remove('hidden');
            dashboardView.classList.add('active');
        };

        const init = () => {
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const target = card.getAttribute('data-target');
                    if (target) openFeature(target);
                });
            });

            backBtn.addEventListener('click', goBack);
        };

        return { init };
    })();

    // ==========================================
    // THEME & BACKGROUND MODULE
    // ==========================================
    const ThemeAndBg = (() => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        const initTheme = () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.replace('theme-light', 'theme-dark');
                themeIcon.classList.replace('bx-moon', 'bx-sun');
            }
        };

        const toggleTheme = () => {
            const isLight = document.body.classList.contains('theme-light');
            if (isLight) {
                document.body.classList.replace('theme-light', 'theme-dark');
                themeIcon.classList.replace('bx-moon', 'bx-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.replace('theme-dark', 'theme-light');
                themeIcon.classList.replace('bx-sun', 'bx-moon');
                localStorage.setItem('theme', 'light');
            }
        };

        const updateDynamicBackground = (hour) => {
            document.body.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night');
            
            if (hour >= 5 && hour < 12) {
                document.body.classList.add('time-morning');
            } else if (hour >= 12 && hour < 17) {
                document.body.classList.add('time-afternoon');
            } else if (hour >= 17 && hour < 21) {
                document.body.classList.add('time-evening');
            } else {
                document.body.classList.add('time-night');
            }
        };

        const init = () => {
            initTheme();
            themeToggle.addEventListener('click', toggleTheme);
        };

        return { init, updateDynamicBackground };
    })();

    // ==========================================
    // CLOCK & DATE MODULE
    // ==========================================
    const Clock = (() => {
        const timeDisplay = document.getElementById('time-display');
        const dateDisplay = document.getElementById('date-display');
        let currentHour = -1;

        const tick = () => {
            const now = new Date();
            
            // Format Time
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            // Check if hour changed to update background
            if (hours !== currentHour) {
                currentHour = hours;
                ThemeAndBg.updateDynamicBackground(currentHour);
            }

            hours = hours % 12;
            hours = hours ? hours : 12; 
            timeDisplay.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

            // Format Date
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = now.toLocaleDateString(undefined, options);
        };

        const init = () => {
            tick();
            setInterval(tick, 1000);
        };

        return { init };
    })();

    // ==========================================
    // TODO MODULE
    // ==========================================
    const Todo = (() => {
        const form = document.getElementById('todo-form');
        const input = document.getElementById('todo-input');
        const list = document.getElementById('todo-list');
        let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];

        const save = () => localStorage.setItem('todoTasks', JSON.stringify(tasks));

        const render = () => {
            list.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = `list-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}`;
                li.innerHTML = `
                    <span class="item-text">${task.text}</span>
                    <div class="item-actions">
                        <button class="action-icon important" data-index="${index}" title="Important"><i class='bx ${task.important ? 'bxs-star' : 'bx-star'}'></i></button>
                        <button class="action-icon complete" data-index="${index}" title="Complete"><i class='bx ${task.completed ? 'bxs-check-circle' : 'bx-check-circle'}'></i></button>
                        <button class="action-icon delete" data-index="${index}" title="Delete"><i class='bx bx-trash'></i></button>
                    </div>
                `;
                list.appendChild(li);
            });
        };

        const addTask = (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            tasks.push({ text, completed: false, important: false });
            save();
            render();
            input.value = '';
        };

        // Event delegation
        const handleActions = (e) => {
            const btn = e.target.closest('.action-icon');
            if (!btn) return;

            const index = btn.dataset.index;
            if (btn.classList.contains('delete')) {
                tasks.splice(index, 1);
            } else if (btn.classList.contains('complete')) {
                tasks[index].completed = !tasks[index].completed;
            } else if (btn.classList.contains('important')) {
                tasks[index].important = !tasks[index].important;
            }
            save();
            render();
        };

        const init = () => {
            form.addEventListener('submit', addTask);
            list.addEventListener('click', handleActions);
            render();
        };

        return { init };
    })();

    // ==========================================
    // DAILY PLANNER MODULE
    // ==========================================
    const Planner = (() => {
        const container = document.getElementById('planner-container');
        let plannerData = JSON.parse(localStorage.getItem('plannerData')) || {};

        const save = () => localStorage.setItem('plannerData', JSON.stringify(plannerData));

        const render = () => {
            container.innerHTML = '';
            const currentHour = new Date().getHours();

            // 6:00 AM to 10:00 PM (22:00)
            for (let hour = 6; hour <= 22; hour++) {
                const isCurrent = hour === currentHour;
                const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                const key = `hour-${hour}`;

                const slot = document.createElement('div');
                slot.className = `planner-slot ${isCurrent ? 'current-hour' : ''}`;
                slot.innerHTML = `
                    <div class="planner-time">${timeStr}</div>
                    <input type="text" class="planner-input" data-key="${key}" placeholder="Add note..." value="${plannerData[key] || ''}">
                    <button class="action-icon delete" data-action="clear" data-key="${key}" title="Clear"><i class='bx bx-x'></i></button>
                `;
                container.appendChild(slot);
            }
        };

        const handleActions = (e) => {
            // Auto save on input
            if (e.target.classList.contains('planner-input')) {
                const key = e.target.dataset.key;
                plannerData[key] = e.target.value;
                save();
            }
            
            // Clear button
            const btn = e.target.closest('.action-icon');
            if (btn && btn.dataset.action === 'clear') {
                const key = btn.dataset.key;
                plannerData[key] = '';
                save();
                render(); // Re-render to clear input visually
            }
        };

        const init = () => {
            container.addEventListener('input', handleActions);
            container.addEventListener('click', handleActions);
            render();
            // Update highlight every minute
            setInterval(render, 60000); 
        };

        return { init };
    })();

    // ==========================================
    // POMODORO MODULE
    // ==========================================
    const Pomodoro = (() => {
        const timeDisplay = document.getElementById('pomodoro-time');
        const statusDisplay = document.getElementById('pomodoro-status');
        const btnStart = document.getElementById('btn-pomodoro-start');
        const btnPause = document.getElementById('btn-pomodoro-pause');
        const btnReset = document.getElementById('btn-pomodoro-reset');

        const DEFAULT_TIME = 25 * 60; // 25 minutes
        let timeLeft = DEFAULT_TIME;
        let timerId = null;

        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            timeDisplay.textContent = `${m}:${s}`;
        };

        const start = () => {
            if (timerId) return; // Prevent multiple timers
            statusDisplay.textContent = "Focusing...";
            timerId = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    statusDisplay.textContent = "Session Complete!";
                    showToast("Pomodoro Session Complete!");
                    // Native notification if permitted
                    if (Notification.permission === 'granted') {
                        new Notification("Pomodoro Complete", { body: "Time to take a break!" });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission();
                    }
                }
            }, 1000);
        };

        const pause = () => {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
                statusDisplay.textContent = "Paused";
            }
        };

        const reset = () => {
            pause();
            timeLeft = DEFAULT_TIME;
            statusDisplay.textContent = "Ready to focus?";
            updateDisplay();
        };

        const init = () => {
            updateDisplay();
            btnStart.addEventListener('click', start);
            btnPause.addEventListener('click', pause);
            btnReset.addEventListener('click', reset);
            
            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
            }
        };

        return { init };
    })();

    // ==========================================
    // QUOTES MODULE
    // ==========================================
    const Quotes = (() => {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        const btnNew = document.getElementById('btn-new-quote');

        const fetchQuote = async () => {
            quoteText.textContent = "Loading inspiration...";
            quoteAuthor.textContent = "";
            
            try {
                const response = await fetch('https://api.quotable.io/random');
                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                quoteText.textContent = `"${data.content}"`;
                quoteAuthor.textContent = `- ${data.author}`;
            } catch (error) {
                // Fallback quote on error or offline
                quoteText.textContent = `"The only way to do great work is to love what you do."`;
                quoteAuthor.textContent = `- Steve Jobs`;
            }
        };

        const init = () => {
            fetchQuote();
            btnNew.addEventListener('click', fetchQuote);
        };

        return { init };
    })();

    // ==========================================
    // WEATHER MODULE
    // ==========================================
    const Weather = (() => {
        const container = document.getElementById('weather-container');
        // Fallback default city coordinates (Delhi)
        const DEFAULT_LAT = 28.6139;
        const DEFAULT_LON = 77.2090;

        const getWeatherIcon = (weathercode) => {
            // Mapping Open-Meteo WMO codes to boxicons
            if (weathercode === 0) return 'bx-sun'; // clear
            if (weathercode >= 1 && weathercode <= 3) return 'bx-cloud'; // partly cloudy
            if (weathercode >= 45 && weathercode <= 48) return 'bx-water'; // fog
            if (weathercode >= 51 && weathercode <= 67) return 'bx-cloud-drizzle'; // rain
            if (weathercode >= 71 && weathercode <= 77) return 'bx-cloud-snow'; // snow
            if (weathercode >= 80 && weathercode <= 82) return 'bx-cloud-rain'; // rain showers
            if (weathercode >= 95 && weathercode <= 99) return 'bx-cloud-lightning'; // thunderstorm
            return 'bx-cloud-sun';
        };

        const fetchWeatherData = async (lat, lon, cityName = "Your Location") => {
            try {
                // Using Open-Meteo as it doesn't require API key for this requirement
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`;
                const response = await fetch(url);
                if (!response.ok) throw new Error("Weather API failed");
                
                const data = await response.json();
                const temp = Math.round(data.current_weather.temperature);
                const wind = data.current_weather.windspeed;
                const icon = getWeatherIcon(data.current_weather.weathercode);
                // Humidity from hourly array (getting the first one as an approximation for current)
                const humidity = data.hourly.relativehumidity_2m[0] || 50; 

                renderWeather(cityName, temp, icon, humidity, wind);
            } catch (error) {
                container.innerHTML = `
                    <div class="weather-data">
                        <i class='bx bx-error weather-loader-icon' style="color:var(--theme-danger)"></i>
                        <p>Failed to load weather data.</p>
                    </div>`;
            }
        };

        const renderWeather = (city, temp, icon, humidity, wind) => {
            container.innerHTML = `
                <div class="weather-data">
                    <div class="weather-city">${city}</div>
                    <i class='bx ${icon}' style="font-size: 5rem; color: var(--theme-primary)"></i>
                    <div class="weather-temp">${temp}°C</div>
                    <div class="weather-details">
                        <div><i class='bx bx-water'></i> ${humidity}%</div>
                        <div><i class='bx bx-wind'></i> ${wind} km/h</div>
                    </div>
                </div>
            `;
        };

        const init = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeatherData(position.coords.latitude, position.coords.longitude, "Local Weather");
                    },
                    (error) => {
                        // Denied or failed, use default
                        fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, "Delhi");
                        showToast("Location denied. Using default city (Delhi).");
                    }
                );
            } else {
                fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, "Delhi");
            }
        };

        return { init };
    })();

    // ==========================================
    // DAILY GOALS MODULE
    // ==========================================
    const Goals = (() => {
        const form = document.getElementById('goals-form');
        const input = document.getElementById('goals-input');
        const list = document.getElementById('goals-list');
        const progressText = document.getElementById('goals-progress-text');
        const progressBar = document.getElementById('goals-progress-bar');
        
        let dailyGoals = JSON.parse(localStorage.getItem('dailyGoals')) || [];

        const save = () => localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));

        const updateProgress = () => {
            const total = dailyGoals.length;
            const completed = dailyGoals.filter(g => g.completed).length;
            progressText.textContent = total === 0 ? 'No goals set' : `${completed} of ${total} Completed`;
            
            const percentage = total === 0 ? 0 : (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;
        };

        const render = () => {
            list.innerHTML = '';
            dailyGoals.forEach((goal, index) => {
                const li = document.createElement('li');
                li.className = `list-item ${goal.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <span class="item-text">${goal.text}</span>
                    <div class="item-actions">
                        <button class="action-icon complete" data-index="${index}" title="Complete"><i class='bx ${goal.completed ? 'bxs-check-square' : 'bx-check-square'}'></i></button>
                        <button class="action-icon delete" data-index="${index}" title="Delete"><i class='bx bx-trash'></i></button>
                    </div>
                `;
                list.appendChild(li);
            });
            updateProgress();
        };

        const addGoal = (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            dailyGoals.push({ text, completed: false });
            save();
            render();
            input.value = '';
        };

        // Event delegation
        const handleActions = (e) => {
            const btn = e.target.closest('.action-icon');
            if (!btn) return;

            const index = btn.dataset.index;
            if (btn.classList.contains('delete')) {
                dailyGoals.splice(index, 1);
            } else if (btn.classList.contains('complete')) {
                dailyGoals[index].completed = !dailyGoals[index].completed;
            }
            save();
            render();
        };

        const init = () => {
            form.addEventListener('submit', addGoal);
            list.addEventListener('click', handleActions);
            render();
        };

        return { init };
    })();

    // ==========================================
    // INITIALIZATION
    // ==========================================
    const initApp = () => {
        ThemeAndBg.init();
        Clock.init();
        Navigation.init();
        Todo.init();
        Planner.init();
        Pomodoro.init();
        Quotes.init();
        Weather.init();
        Goals.init();
    };

    initApp();
});
