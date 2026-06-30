// Timezone data
const TIMEZONES = [
    'Asia/Kolkata',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'America/Los_Angeles',
    'America/Chicago',
    'Asia/Dubai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Europe/Berlin',
    'Europe/Moscow',
    'America/Toronto',
    'America/Mexico_City',
    'Asia/Bangkok',
    'Asia/Jakarta',
    'Asia/Manila',
    'Africa/Johannesburg',
    'America/Sao_Paulo',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Istanbul',
    'Europe/Athens',
    'America/Denver',
    'America/Phoenix',
    'Pacific/Auckland',
    'Pacific/Fiji',
    'Indian/Mauritius',
    'Africa/Cairo'
];

class DigitalClock {
    constructor() {
        this.clocks = [];
        this.selectedTimezone = null;
        this.timeFormat = '24';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateAllClocks();
        setInterval(() => this.updateAllClocks(), 1000);
    }

    setupEventListeners() {
        // Add timezone button
        document.getElementById('add-timezone-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirm-add-btn').addEventListener('click', () => {
            this.addTimeZone();
        });

        // Timezone input
        document.getElementById('timezone-input').addEventListener('input', (e) => {
            this.filterTimezones(e.target.value);
        });

        // Time format selector
        document.getElementById('time-format').addEventListener('change', (e) => {
            this.timeFormat = e.target.value;
            this.updateAllClocks();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('change', (e) => {
            document.body.classList.toggle('light-mode', e.target.checked);
            localStorage.setItem('darkMode', !e.target.checked);
        });

        // Load theme preference
        const darkMode = localStorage.getItem('darkMode') !== 'false';
        document.body.classList.toggle('light-mode', !darkMode);
        document.getElementById('theme-toggle').checked = !darkMode;

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('timezone-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('timezone-modal');
        modal.classList.add('show');
        document.getElementById('timezone-input').focus();
    }

    closeModal() {
        const modal = document.getElementById('timezone-modal');
        modal.classList.remove('show');
        document.getElementById('timezone-input').value = '';
        this.selectedTimezone = null;
        document.getElementById('timezone-suggestions').innerHTML = '';
    }

    filterTimezones(query) {
        const suggestionsDiv = document.getElementById('timezone-suggestions');
        suggestionsDiv.innerHTML = '';

        if (query.length === 0) {
            return;
        }

        const filtered = TIMEZONES.filter(tz => 
            tz.toLowerCase().includes(query.toLowerCase())
        );

        filtered.slice(0, 10).forEach(tz => {
            const div = document.createElement('div');
            div.className = 'timezone-suggestion';
            div.textContent = tz;
            div.addEventListener('click', () => {
                this.selectedTimezone = tz;
                document.getElementById('timezone-input').value = tz;
                suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(div);
        });
    }

    addTimeZone() {
        const timezone = this.selectedTimezone || document.getElementById('timezone-input').value;
        
        if (!timezone || !TIMEZONES.includes(timezone)) {
            alert('Please select a valid timezone!');
            return;
        }

        if (this.clocks.some(clock => clock.timezone === timezone)) {
            alert('This timezone is already added!');
            return;
        }

        this.clocks.push({ timezone });
        this.saveToLocalStorage();
        this.renderClocks();
        this.closeModal();
    }

    removeTimeZone(timezone) {
        this.clocks = this.clocks.filter(clock => clock.timezone !== timezone);
        this.saveToLocalStorage();
        this.renderClocks();
    }

    updateAllClocks() {
        this.clocks.forEach(clock => {
            this.updateClock(clock.timezone);
        });
    }

    updateClock(timezone) {
        const element = document.querySelector(`[data-timezone="${timezone}"] .time`);
        const analogClock = document.querySelector(`[data-timezone="${timezone}"] .analog-clock`);
        const dateDisplay = document.querySelector(`[data-timezone="${timezone}"] .date-display`);
        const dayDisplay = document.querySelector(`[data-timezone="${timezone}"] .day-display`);

        if (!element) return;

        try {
            const now = new Date();
            const time = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

            // Update digital time
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const seconds = String(time.getSeconds()).padStart(2, '0');

            let timeString = `${hours}:${minutes}:${seconds}`;

            if (this.timeFormat === '12') {
                const hour12 = time.getHours() % 12 || 12;
                const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
                timeString = `${String(hour12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
            }

            element.textContent = timeString;

            // Update date
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = time.toLocaleDateString('en-US', dateOptions);
            dateDisplay.textContent = dateStr;

            // Update analog clock
            if (analogClock) {
                this.updateAnalogClock(analogClock, time);
            }
        } catch (error) {
            console.error(`Error updating clock for ${timezone}:`, error);
        }
    }

    updateAnalogClock(element, time) {
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const hourHand = element.querySelector('.hour-hand');
        const minuteHand = element.querySelector('.minute-hand');
        const secondHand = element.querySelector('.second-hand');

        const hourDegrees = (hours * 30) + (minutes * 0.5);
        const minuteDegrees = (minutes * 6) + (seconds * 0.1);
        const secondDegrees = seconds * 6;

        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    }

    getTimezoneOffset(timezone) {
        try {
            const now = new Date();
            const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            const offset = (tzTime - utcTime) / (1000 * 60 * 60);
            const sign = offset >= 0 ? '+' : '';
            return `UTC ${sign}${offset.toFixed(1)}`;
        } catch {
            return 'UTC';
        }
    }

    renderClocks() {
        const grid = document.getElementById('clocks-grid');
        grid.innerHTML = '';

        if (this.clocks.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">Add a timezone to get started!</p>';
            return;
        }

        this.clocks.forEach(clock => {
            const card = document.createElement('div');
            card.className = 'clock-card';
            card.setAttribute('data-timezone', clock.timezone);
            
            const offset = this.getTimezoneOffset(clock.timezone);
            
            card.innerHTML = `
                <div class="clock-header">
                    <div>
                        <div class="timezone-name">${clock.timezone}</div>
                        <div class="timezone-offset">${offset}</div>
                    </div>
                    <button class="remove-btn" title="Remove timezone">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="clock-display">
                    <div class="time">--:--:--</div>
                    <div class="date-display">Loading...</div>
                </div>
                <div class="analog-clock">
                    <div class="hand hour-hand"></div>
                    <div class="hand minute-hand"></div>
                    <div class="hand second-hand"></div>
                    <div class="clock-center"></div>
                </div>
            `;

            card.querySelector('.remove-btn').addEventListener('click', () => {
                this.removeTimeZone(clock.timezone);
            });

            grid.appendChild(card);
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('timezones', JSON.stringify(this.clocks));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('timezones');
        if (saved) {
            try {
                this.clocks = JSON.parse(saved);
            } catch {
                this.clocks = [];
            }
        } else {
            // Add default timezones
            this.clocks = [
                { timezone: 'Asia/Kolkata' },
                { timezone: 'America/New_York' },
                { timezone: 'Europe/London' },
                { timezone: 'Asia/Tokyo' }
            ];
            this.saveToLocalStorage();
        }
        this.renderClocks();
    }
}

// Initialize the clock when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DigitalClock();
    });
} else {
    new DigitalClock();
}