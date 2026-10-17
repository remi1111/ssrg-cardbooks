// Configuration dictionary for grades
const gradeConfig = {
    'x': { badge: '-', stars: '' },
    'c': { badge: 'C', stars: '★' },
    'b': { badge: 'B', stars: '★★' },
    'a': { badge: 'A', stars: '★★★' },
    's': { badge: 'S', stars: '★★★★' },
    'r': { badge: 'R', stars: 'R' }
};

let totalGlobalCardsCount = 0;

// 1. Fetch JSON and render the page on load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/path/to/cards.json');
        const data = await response.json();

        // Count total cards globally for string length validation
        totalGlobalCardsCount = data.artists.reduce((acc, artist) => {
            return acc + artist.themes.reduce((tAcc, theme) => tAcc + theme.cards.length, 0);
        }, 0);

        renderCardbook(data.artists);

        // Load any previously saved string from localStorage if available
        loadSavedInventory();
    } catch (error) {
        console.error("Failed to load cards JSON:", error);
    }
});

// 2. Dynamically build the HTML structure
function renderCardbook(artists) {
    const container = document.getElementById('cardbook-container');
    container.innerHTML = '';

    artists.forEach(artist => {
        let artistHTML = `<div class="artist-section"><h2>${artist.name}</h2>`;

        artist.themes.forEach(theme => {
            artistHTML += `
                <div class="theme-section">
                    <h3>${theme.name}</h3>
                    <div class="cards-grid">
            `;

            theme.cards.forEach(card => {
                artistHTML += `
                    <div class="ss-card grade-x" data-global-index="${card.globalId}" data-grade="x">
                        <span class="grade-badge">-</span>
                        <span class="card-name">${card.name}</span>
                        <span class="stars"></span>
                    </div>
                `;
            });

            artistHTML += `</div></div>`;
        });

        artistHTML += `</div>`;
        container.innerHTML += artistHTML;
    });
}

// 3. Export Function (Generates Master String)
function exportCardString() {
    let masterChars = new Array(totalGlobalCardsCount).fill('X');
    const allCards = document.querySelectorAll('.ss-card');

    allCards.forEach(card => {
        const globalIndex = parseInt(card.getAttribute('data-global-index'), 10);
        const grade = (card.getAttribute('data-grade') || 'x').toUpperCase();

        if (!isNaN(globalIndex) && globalIndex < masterChars.length) {
            masterChars[globalIndex] = grade;
        }
    });

    const masterString = masterChars.join('');
    const displayBox = document.getElementById('cardStringBox');
    if (displayBox) displayBox.value = masterString;

    // Optional: Save to browser storage for persistence
    localStorage.setItem('ss_card_inventory', masterString);
    alert("Exported full card inventory string!");
}

// 4. Import Function (Applies String to DOM)
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

        const badgeSpan = card.querySelector('.grade-badge');
        const starsSpan = card.querySelector('.stars');

        if (badgeSpan) badgeSpan.innerText = gradeConfig[targetGrade].badge;
        if (starsSpan) starsSpan.innerText = gradeConfig[targetGrade].stars;
    });

    localStorage.setItem('ss_card_inventory', inputString);
    alert("Cards successfully imported!");
}

// 5. Local Storage persistence helper
function loadSavedInventory() {
    const savedString = localStorage.getItem('ss_card_inventory');
    if (savedString && document.getElementById('cardStringBox')) {
        document.getElementById('cardStringBox').value = savedString;
        importCardString();
    }
}