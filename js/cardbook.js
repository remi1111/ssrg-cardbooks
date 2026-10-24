// Grade Configurations
const gradeConfig = {
    'x': { badge: '-' },
    'c': { badge: 'C' },
    'b': { badge: 'B' },
    'a': { badge: 'A' },
    's': { badge: 'S' },
    'r': { badge: 'R' }
};
const gradeCycle = ['x', 'c', 'b', 'a', 's', 'r'];

const gradePicker = document.getElementById('gradePicker');
let selectedCard = null;

function openGradePicker(cardElement) {
    selectedCard = cardElement;
    const currentGrade = cardElement.dataset.grade || 'x';
    const options = gradePicker.querySelectorAll('.grade-option');
    let selectedOption = null;

    options.forEach(option => {
        const isSelected = option.dataset.grade === currentGrade;
        option.setAttribute('aria-pressed', isSelected);
        if (isSelected) selectedOption = option;
    });

    gradePicker.showModal();
    (selectedOption || options[0]).focus();
}

function selectCardGrade(grade) {
    if (!selectedCard || !gradeConfig[grade]) return;

    const previousGrade = selectedCard.dataset.grade || 'x';
    selectedCard.classList.remove(`grade-${previousGrade}`);
    selectedCard.classList.add(`grade-${grade}`);
    selectedCard.dataset.grade = grade;
    selectedCard.querySelector('.grade-badge').textContent = gradeConfig[grade].badge;

    gradePicker.close();
}

function closeGradePicker() {
    gradePicker.close();
}

gradePicker.addEventListener('close', () => {
    if (selectedCard) selectedCard.focus();
    selectedCard = null;
});

gradePicker.addEventListener('click', event => {
    if (event.target === gradePicker) gradePicker.close();
});

// 2. Render all games or filter by a specific game ID
function renderCardbook(games, filterGameId = null) {
    const container = document.getElementById('cardbook-container');
    container.innerHTML = '';

    const gamesToRender = filterGameId
        ? games.filter(game => game.id === filterGameId)
        : games;

    gamesToRender.forEach(game => {
        let gameHTML = `<div class="game-section">`;

        game.artists.forEach(artist => {
            // Check if this artist has any non-removed cards to display
            const hasVisibleCards = artist.themes.some(theme =>
                theme.cards.some(card => card.removed !== true)
            );

            if (!hasVisibleCards) return; // Skip artist entirely if all cards are removed

            gameHTML += `<div class="artist-section"><div class="artist-title">${artist.name}</div>`;

            artist.themes.forEach(theme => {
                // Filter out removed cards for this theme
                const activeCards = theme.cards.filter(card => !card.removed);
                if (activeCards.length === 0) return; // Skip theme if empty

                let badgeHTML = '';
                const type = (theme.themeType || 'normal').toLowerCase();
                if (type === 'limited') {
                    badgeHTML = `<span class="theme-badge limited">Limited Theme</span>`;
                } else if (type === 'event' || type === 'event limited') {
                    badgeHTML = `<span class="theme-badge event">Event Limited</span>`;
                }

                gameHTML += `
                    <div class="theme-section">
                        <div class="theme-header">
                            <span class="theme-title">${theme.name}</span>
                            ${badgeHTML}
                        </div>
                        <div class="cards-grid">
                `;

                activeCards.forEach(card => {
                    gameHTML += `
                        <div class="card-item">
                            <button type="button"
                                class="ss-card grade-x"
                                aria-label="${card.name}"
                                data-global-index="${card.globalId}"
                                data-grade="x"
                                onclick="openGradePicker(this)">
                                <span class="grade-badge">-</span>
                            </button>
                            <span class="card-name">${card.name}</span>
                        </div>
                    `;
                });

                gameHTML += `</div></div>`;
            });

            gameHTML += `</div>`;
        });

        gameHTML += `</div>`;
        container.innerHTML += gameHTML;
    });
}

// --- 3. Interactive Card Click (Cycles Grades) ---
function toggleCardGrade(cardElement) {
    const currentGrade = cardElement.getAttribute('data-grade') || 'x';
    const currentIndex = gradeCycle.indexOf(currentGrade);
    const nextGrade = gradeCycle[(currentIndex + 1) % gradeCycle.length];

    cardElement.classList.remove(`grade-${currentGrade}`);
    cardElement.classList.add(`grade-${nextGrade}`);
    cardElement.setAttribute('data-grade', nextGrade);

    cardElement.querySelector('.grade-badge').innerText = gradeConfig[nextGrade].badge;
}

// --- 4. Export Function ---
function exportCardString() {
    const displayBox = document.getElementById('cardStringBox');
    if (!displayBox) return;

    let currentMasterString = displayBox.value.trim();

    // 1. If the input box is empty or the wrong length, fallback to LocalStorage or initialize a full 'X' string
    if (currentMasterString.length !== totalGlobalCardsCount) {
        currentMasterString = localStorage.getItem('ss_card_inventory') || "X".repeat(totalGlobalCardsCount);
    }

    // Convert to an array of characters so we can safely update specific indices
    let masterChars = currentMasterString.split('');

    // Ensure the array length matches total global cards
    if (masterChars.length < totalGlobalCardsCount) {
        masterChars = masterChars.concat(new Array(totalGlobalCardsCount - masterChars.length).fill('X'));
    }

    // 2. Select only the cards currently visible on this filtered page
    const visibleCards = document.querySelectorAll('.ss-card');

    // 3. Update ONLY the indices for the visible cards, leaving other games untouched
    visibleCards.forEach(card => {
        const globalIndex = parseInt(card.getAttribute('data-global-index'), 10);
        const grade = (card.getAttribute('data-grade') || 'x').toUpperCase();

        if (!isNaN(globalIndex) && globalIndex < masterChars.length) {
            masterChars[globalIndex] = grade;
        }
    });

    // 4. Join back into the full master string and save
    const updatedMasterString = masterChars.join('');
    displayBox.value = updatedMasterString;
    localStorage.setItem('ss_card_inventory', updatedMasterString);

    alert("Game inventory exported successfully without affecting other games!");
}

// --- 5. Import Function ---
function importCardString() {
    const displayBox = document.getElementById('cardStringBox');
    if (!displayBox) return;

    let inputString = displayBox.value.trim().toUpperCase();
    const allCards = document.querySelectorAll('.ss-card');

    if (inputString.length === 0) {
        alert("Please paste a valid card string first!");
        return;
    }

    if (inputString.length > totalGlobalCardsCount) {
        inputString = inputString.substring(0, totalGlobalCardsCount);
    }
    if (inputString.length < totalGlobalCardsCount) {
        inputString += "X".repeat(totalGlobalCardsCount - inputString.length);
    }

    allCards.forEach(card => {
        const globalIndex = parseInt(card.getAttribute('data-global-index'), 10);
        const charToken = inputString[globalIndex] || 'X';

        let targetGrade = 'x';
        if (charToken === 'C') targetGrade = 'c';
        else if (charToken === 'B') targetGrade = 'b';
        else if (charToken === 'A') targetGrade = 'a';
        else if (charToken === 'S') targetGrade = 's';
        else if (charToken === 'R') targetGrade = 'r';

        let oldGrade = card.getAttribute('data-grade') || 'x';

        card.classList.remove(`grade-${oldGrade}`);
        card.classList.add(`grade-${targetGrade}`);
        card.setAttribute('data-grade', targetGrade);

        card.querySelector('.grade-badge').innerText = gradeConfig[targetGrade].badge;
    });

    localStorage.setItem('ss_card_inventory', inputString);
}

// --- 6. Load Progress from LocalStorage ---
function loadSavedInventory() {
    const savedString = localStorage.getItem('ss_card_inventory');
    if (savedString) {
        document.getElementById('cardStringBox').value = savedString;
        importCardString();
    }
}