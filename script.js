let newGoalText = '';
const addGoalButton = document.getElementById('add-goal-button');
const goalsList = document.getElementById('goals-list');
const newGoalInput = document.getElementById('new-goal-input');
const viewTabs = document.querySelectorAll('.view-tab');
const goalsGridView = document.getElementById('goals-grid');
const goalModal = document.getElementById('goal-modal');
const goalBuilderModal = document.getElementById('goal-builder-modal');
const openGoalBuilderButton = document.getElementById('open-goal-builder');
const closeGoalBuilderButton = document.getElementById('goal-builder-close');
const goalBuilderOverlay = goalBuilderModal ? goalBuilderModal.querySelector('[data-builder-dismiss]') : null;
const emptyState = document.getElementById('empty-state');
let goalModalTimeout = null;
let currentView = 'grid';

if (newGoalInput) {
    newGoalInput.addEventListener('input', enableAddGoalButton);
}

if (addGoalButton) {
    addGoalButton.addEventListener('click', getNewGoalText);
}

if (openGoalBuilderButton) {
    openGoalBuilderButton.addEventListener('click', openGoalBuilder);
}

if (closeGoalBuilderButton) {
    closeGoalBuilderButton.addEventListener('click', () => closeGoalBuilder({ returnFocus: true }));
}

if (goalBuilderOverlay) {
    goalBuilderOverlay.addEventListener('click', () => closeGoalBuilder({ returnFocus: true }));
}

if (emptyState) {
    emptyState.addEventListener('click', openGoalBuilder);
    emptyState.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openGoalBuilder();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) {
        return;
    }
    if (goalBuilderModal && goalBuilderModal.classList.contains('is-visible')) {
        event.preventDefault();
        closeGoalBuilder({ returnFocus: true });
    }
});

viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        if (targetView) {
            setActiveView(targetView);
        }
    });
});

let selectedImportance = 'Low';
let selectedUrgency = 'Low';
let isUpdatingPriority = false;

function openGoalBuilder() {
    if (!goalBuilderModal) {
        return;
    }
    if (goalBuilderModal.classList.contains('is-visible')) {
        return;
    }
    goalBuilderModal.classList.add('is-visible');
    goalBuilderModal.setAttribute('aria-hidden', 'false');
    if (document.body) {
        document.body.classList.add('builder-modal-open');
    }
    enableAddGoalButton();
    requestAnimationFrame(() => {
        if (!newGoalInput) {
            return;
        }
        try {
            newGoalInput.focus({ preventScroll: true });
        } catch (err) {
            newGoalInput.focus();
        }
    });
}

function closeGoalBuilder(options = {}) {
    if (!goalBuilderModal) {
        return;
    }
    if (!goalBuilderModal.classList.contains('is-visible')) {
        return;
    }
    goalBuilderModal.classList.remove('is-visible');
    goalBuilderModal.setAttribute('aria-hidden', 'true');
    if (document.body) {
        document.body.classList.remove('builder-modal-open');
    }
    if (options.returnFocus && openGoalBuilderButton) {
        openGoalBuilderButton.focus();
    }
}

// -------- Matrix Quadrant Selector ----------//
const matrixCells = document.querySelectorAll('.matrix-cell');
const importanceRadios = document.querySelectorAll('input[name="importance-level"]');
const urgencyRadios = document.querySelectorAll('input[name="urgency-level"]');

function updatePrioritySelection({ urgency, importance }) {
    if (!urgency || !importance) {
        return;
    }

    if (isUpdatingPriority) {
        return;
    }

    isUpdatingPriority = true;
    selectedUrgency = urgency;
    selectedImportance = importance;

    matrixCells.forEach(cell => {
        const matches = cell.dataset.urgency === urgency && cell.dataset.importance === importance;
        cell.classList.toggle('selected', matches);
    });

    importanceRadios.forEach(radio => {
        radio.checked = radio.value === importance;
    });

    urgencyRadios.forEach(radio => {
        radio.checked = radio.value === urgency;
    });

    isUpdatingPriority = false;
}

matrixCells.forEach(cell => {
    cell.addEventListener('click', () => {
        updatePrioritySelection({
            urgency: cell.dataset.urgency || 'Low',
            importance: cell.dataset.importance || 'Low'
        });
    });
});

importanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (!radio.checked) {
            return;
        }
        updatePrioritySelection({
            urgency: selectedUrgency,
            importance: radio.value
        });
    });
});

urgencyRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (!radio.checked) {
            return;
        }
        updatePrioritySelection({
            urgency: radio.value,
            importance: selectedImportance
        });
    });
});

const initialMatrixCell = document.querySelector('.matrix-cell.selected') || matrixCells[0];
if (initialMatrixCell) {
    updatePrioritySelection({
        urgency: initialMatrixCell.dataset.urgency || 'Low',
        importance: initialMatrixCell.dataset.importance || 'Low'
    });
}

function createPriorityDots(urgency, importance) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('priority-dots');

    const urgencyDot = document.createElement('span');
    urgencyDot.classList.add('priority-dot', 'priority-dot--urgency');
    urgencyDot.dataset.level = urgency;
    urgencyDot.title = `Urgency: ${urgency}`;
    wrapper.appendChild(urgencyDot);

    const importanceDot = document.createElement('span');
    importanceDot.classList.add('priority-dot', 'priority-dot--importance');
    importanceDot.dataset.level = importance;
    importanceDot.title = `Importance: ${importance}`;
    wrapper.appendChild(importanceDot);

    return wrapper;
}

// -------- Color Theme System ----------//
const colorThemes = {
    slate: { primary: '#3B5B72', hover: '#314a5d', light: 'rgba(59, 91, 114, 0.12)', tag: 'rgba(59, 91, 114, 0.45)' },
    black: { primary: '#000', hover: '#333', light: 'rgba(0, 0, 0, 0.1)', tag: 'rgba(0, 0, 0, 0.5)' },
    blue: { primary: '#0066FF', hover: '#0052CC', light: 'rgba(0, 102, 255, 0.1)', tag: 'rgba(0, 102, 255, 0.5)' },
    orange: { primary: '#FF6B00', hover: '#CC5500', light: 'rgba(255, 107, 0, 0.1)', tag: 'rgba(255, 107, 0, 0.5)' },
    green: { primary: '#00C853', hover: '#00A142', light: 'rgba(0, 200, 83, 0.1)', tag: 'rgba(0, 200, 83, 0.5)' },
    pink: { primary: '#FF006E', hover: '#CC0058', light: 'rgba(255, 0, 110, 0.1)', tag: 'rgba(255, 0, 110, 0.5)' },
    purple: { primary: '#7C3AED', hover: '#6328E0', light: 'rgba(124, 58, 237, 0.1)', tag: 'rgba(124, 58, 237, 0.5)' }
};

const DEFAULT_THEME = 'slate';
const CUSTOM_COLOR_KEY = 'customThemeColor';
const colorOptions = document.querySelectorAll('.color-option');
const customColorOption = document.querySelector('.color-option[data-color="custom"]');
const customColorInput = customColorOption ? customColorOption.querySelector('.color-option__input') : null;

function normalizeHexColor(value) {
    if (typeof value !== 'string') {
        return null;
    }
    let hex = value.trim();
    if (!hex) {
        return null;
    }
    if (!hex.startsWith('#')) {
        hex = `#${hex}`;
    }
    const shortMatch = /^#([A-Fa-f0-9]{3})$/;
    const longMatch = /^#([A-Fa-f0-9]{6})$/;
    if (shortMatch.test(hex)) {
        const [, shorthand] = shortMatch.exec(hex);
        hex = `#${shorthand.split('').map(char => `${char}${char}`).join('')}`;
    } else if (!longMatch.test(hex)) {
        return null;
    }
    return hex.toUpperCase();
}

function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized) {
        return null;
    }
    const value = normalized.slice(1);
    const bigint = parseInt(value, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function componentToHex(component) {
    const clamped = Math.max(0, Math.min(255, Math.round(component)));
    return clamped.toString(16).padStart(2, '0');
}

function adjustHexBrightness(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return hex;
    }
    const adjustChannel = (channel) => {
        if (amount < 0) {
            return channel * (1 + amount);
        }
        return channel + (255 - channel) * amount;
    };
    const r = componentToHex(adjustChannel(rgb.r));
    const g = componentToHex(adjustChannel(rgb.g));
    const b = componentToHex(adjustChannel(rgb.b));
    return `#${r}${g}${b}`.toUpperCase();
}

function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return `rgba(59, 91, 114, ${alpha})`;
    }
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

function isHexColorDark(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return false;
    }
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance < 0.5;
}

function buildThemeFromColor(baseHex) {
    const normalized = normalizeHexColor(baseHex) || colorThemes[DEFAULT_THEME].primary;
    return {
        primary: normalized,
        hover: adjustHexBrightness(normalized, -0.2),
        light: hexToRgba(normalized, 0.14),
        tag: hexToRgba(normalized, 0.45)
    };
}

function updateCustomSwatch(hex) {
    if (!customColorOption) {
        return;
    }
    const normalized = normalizeHexColor(hex);
    customColorOption.classList.remove('is-dark', 'is-light', 'has-color');
    if (normalized) {
        customColorOption.style.background = normalized;
        customColorOption.classList.add('has-color');
        const dark = isHexColorDark(normalized);
        customColorOption.classList.toggle('is-dark', dark);
        customColorOption.classList.toggle('is-light', !dark);
    } else {
        customColorOption.style.removeProperty('background');
        customColorOption.classList.add('is-light');
    }
    if (customColorInput) {
        const fallback = colorThemes[DEFAULT_THEME].primary;
        customColorInput.value = normalized || fallback;
    }
}

function selectColorOption(colorName) {
    colorOptions.forEach(option => {
        option.classList.toggle('selected', option.dataset.color === colorName);
    });
}

function setThemeColor(colorName, customHex) {
    const fallbackTheme = colorThemes[DEFAULT_THEME];
    let resolvedName = colorName;
    let themeConfig = null;

    if (colorName === 'custom') {
        const normalized = normalizeHexColor(customHex) || normalizeHexColor(localStorage.getItem(CUSTOM_COLOR_KEY));
        if (!normalized) {
            resolvedName = DEFAULT_THEME;
            themeConfig = fallbackTheme;
            localStorage.removeItem(CUSTOM_COLOR_KEY);
        } else {
            themeConfig = buildThemeFromColor(normalized);
            localStorage.setItem(CUSTOM_COLOR_KEY, normalized);
            updateCustomSwatch(normalized);
        }
    } else if (colorThemes[colorName]) {
        themeConfig = colorThemes[colorName];
    } else {
        resolvedName = DEFAULT_THEME;
        themeConfig = fallbackTheme;
    }

    const theme = themeConfig || fallbackTheme;
    document.documentElement.style.setProperty('--accent-color', theme.primary);
    document.documentElement.style.setProperty('--accent-hover', theme.hover);
    document.documentElement.style.setProperty('--accent-light', theme.light);
    document.documentElement.style.setProperty('--accent-tag', theme.tag);
    localStorage.setItem('themeColor', resolvedName);

    return resolvedName;
}

function loadThemeColor() {
    const storedCustom = normalizeHexColor(localStorage.getItem(CUSTOM_COLOR_KEY));
    updateCustomSwatch(storedCustom);
    const savedColor = localStorage.getItem('themeColor') || DEFAULT_THEME;
    const resolved = setThemeColor(savedColor, storedCustom);
    selectColorOption(resolved);
}

colorOptions.forEach(option => {
    const colorName = option.dataset.color;
    if (colorName === 'custom') {
        option.addEventListener('click', (event) => {
            if (event.target === customColorInput) {
                return;
            }
            const resolved = setThemeColor('custom');
            selectColorOption(resolved);
            if (customColorInput) {
                customColorInput.click();
            }
        });
        return;
    }
    option.addEventListener('click', () => {
        const resolved = setThemeColor(colorName);
        selectColorOption(resolved);
    });
});

if (customColorInput) {
    customColorInput.addEventListener('input', (event) => {
        const normalized = normalizeHexColor(event.target.value);
        if (!normalized) {
            return;
        }
        selectColorOption('custom');
        setThemeColor('custom', normalized);
    });
}

// Load theme on page load
loadThemeColor();

// -------- Menu Toggle ----------//
const menuButton = document.getElementById('menu-button');
const menuPanel = document.getElementById('menu-panel');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');
const menuDeleteAll = document.getElementById('menu-delete-all');

function openMenu() {
    menuPanel.classList.add('active');
    menuOverlay.classList.add('active');
}

function closeMenu() {
    menuPanel.classList.remove('active');
    menuOverlay.classList.remove('active');
}

menuButton.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

// Move delete all functionality to menu
menuDeleteAll.addEventListener('click', function() {
    deleteAllGoals();
    closeMenu();
});


function enableAddGoalButton(){
    if (!newGoalInput || !addGoalButton) {
        return;
    }
    const trimmedInput = newGoalInput.value.trim();
    if (trimmedInput.length > 0) {
        addGoalButton.disabled = false;
    } else {
        addGoalButton.disabled = true;
    }
}

function getNewGoalText() {
    const inputEl = document.getElementById("new-goal-input");
    if (!inputEl) {
        return;
    }
    newGoalText = inputEl.value.trim();
    if (!newGoalText) {
        return;
    }

    const createdListItem = document.createElement('li');
    createdListItem.dataset.urgency = selectedUrgency;
    createdListItem.dataset.importance = selectedImportance;

    const priorityDots = createPriorityDots(selectedUrgency, selectedImportance);
    createdListItem.appendChild(priorityDots);

    const newItemCheckbox = document.createElement('input');
    newItemCheckbox.type = 'checkbox';
    newItemCheckbox.addEventListener('change', toggleGoalComplete);
    createdListItem.appendChild(newItemCheckbox);

    const goalTextSpan = document.createElement('span');
    goalTextSpan.classList.add('goal-text');
    goalTextSpan.textContent = newGoalText;
    createdListItem.appendChild(goalTextSpan);

    const quickActions = document.createElement('div');
    quickActions.classList.add('quick-actions');
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('quick-action-btn');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', 'Remove goal');
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', function() {
        createdListItem.remove();
        updateGoalCount();
    });
    quickActions.appendChild(deleteBtn);
    createdListItem.appendChild(quickActions);

    const list = document.getElementById('goals-list');
    if (list) {
        list.appendChild(createdListItem);
    }

    inputEl.value = "";
    addGoalButton.disabled = true;
    updateGoalCount();
    sortGoalsList();
    closeGoalBuilder();
    showGoalModal();
}

function toggleGoalComplete() {
    let goalListItem = this.parentElement;
    goalListItem.classList.toggle('completed', this.checked)
    updateGoalCount();
    sortGoalsList();
};

function sortGoalsList() {
    const goalItems = Array.from(goalsList.children);
    
    goalItems.sort((a, b) => {
        const aCompleted = a.classList.contains('completed');
        const bCompleted = b.classList.contains('completed');
        
        if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1;
        }
        
        const aUrg = a.dataset.urgency === 'High' ? 1 : 0;
        const aImp = a.dataset.importance === 'High' ? 1 : 0;
        const bUrg = b.dataset.urgency === 'High' ? 1 : 0;
        const bImp = b.dataset.importance === 'High' ? 1 : 0;
        
        const aScore = aUrg * 2 + aImp;
        const bScore = bUrg * 2 + bImp;
        
        return bScore - aScore;
    });
    
    goalItems.forEach(item => goalsList.appendChild(item));
}

function setActiveView(view) {
    if (!goalsList || !goalsGridView) {
        currentView = view;
        return;
    }

    currentView = view;

    viewTabs.forEach(tab => {
        const isActive = tab.dataset.view === view;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (view === 'grid') {
        goalsGridView.classList.remove('is-hidden');
        goalsList.classList.add('is-hidden');
        renderGoalsGrid();
    } else {
        goalsGridView.classList.add('is-hidden');
        goalsList.classList.remove('is-hidden');
        sortGoalsList();
    }

    if (goalsList) {
        updateEmptyStateVisibility(goalsList.children.length);
    }
}

function renderGoalsGrid() {
    if (!goalsGridView) {
        return;
    }

    const quadrantBodies = goalsGridView.querySelectorAll('.quadrant-body');
    quadrantBodies.forEach(body => {
        body.innerHTML = '';
    });

    const completedGridSection = document.getElementById('completed-grid-section');
    const completedGridBody = document.getElementById('completed-grid-body');
    if (completedGridBody) {
        completedGridBody.innerHTML = '';
    }
    
    let hasCompletedGoals = false;

    Array.from(goalsList.children).forEach(goalItem => {
        const isCompleted = goalItem.classList.contains('completed');
        
        if (isCompleted) {
            hasCompletedGoals = true;
        }
        
        const importance = goalItem.dataset.importance || 'Low';
        const urgency = goalItem.dataset.urgency || 'Low';
        
        const targetContainer = isCompleted ? completedGridBody : 
            goalsGridView.querySelector(`.grid-quadrant[data-importance="${importance}"][data-urgency="${urgency}"] .quadrant-body`);
        
        if (!targetContainer) {
            return;
        }

        const gridGoal = document.createElement('div');
        gridGoal.classList.add('grid-goal');
        if (isCompleted) {
            gridGoal.classList.add('completed');
        }

        const originalCheckbox = goalItem.querySelector('input[type="checkbox"]');
        const gridCheckbox = document.createElement('input');
        gridCheckbox.type = 'checkbox';
        gridCheckbox.checked = originalCheckbox ? originalCheckbox.checked : false;
        gridCheckbox.addEventListener('change', () => {
            if (!originalCheckbox) {
                return;
            }
            if (originalCheckbox.checked !== gridCheckbox.checked) {
                originalCheckbox.checked = gridCheckbox.checked;
                originalCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        gridGoal.appendChild(gridCheckbox);

        const textSpan = document.createElement('span');
        textSpan.classList.add('goal-text');
        const sourceText = goalItem.querySelector('.goal-text');
        textSpan.textContent = sourceText ? sourceText.textContent : '';
        gridGoal.appendChild(textSpan);

        const quickActionsWrapper = document.createElement('div');
        quickActionsWrapper.classList.add('grid-quick-actions');
        const deleteOriginal = goalItem.querySelector('.quick-action-btn');
        if (deleteOriginal) {
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('aria-label', 'Delete goal');
            deleteBtn.textContent = '✕';
            deleteBtn.addEventListener('click', () => {
                deleteOriginal.click();
            });
            quickActionsWrapper.appendChild(deleteBtn);
        }
        if (quickActionsWrapper.children.length > 0) {
            gridGoal.appendChild(quickActionsWrapper);
        }

        targetContainer.appendChild(gridGoal);
    });
    
    if (completedGridSection) {
        if (hasCompletedGoals) {
            completedGridSection.classList.remove('is-hidden');
        } else {
            completedGridSection.classList.add('is-hidden');
        }
    }
}
    
function updateGoalCount() {
    let goalsCount = goalsList.children.length;
    calculateGoals(goalsCount);
    saveGoals();
    
    // Update badge
    const badge = document.getElementById('goal-count-badge');
    if (badge) {
        badge.textContent = goalsCount;
    }
    
    // Update progress ring
    const circle = document.getElementById('progress-ring-circle');
    const ring = document.getElementById('progress-ring');
    if (circle) {
        const completedGoals = goalsList.querySelectorAll('.completed').length;
        const percentage = goalsCount > 0 ? (completedGoals / goalsCount) : 0;
        
        // Calculate circle values
        const radius = 14;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - percentage);
        
        // Update circle
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;

        if (ring) {
            ring.setAttribute('aria-label', `${completedGoals} of ${goalsCount} goals completed`);
        }
    }
    
    // Toggle empty state
    updateEmptyStateVisibility(goalsCount);
    
    renderGoalsGrid();
    window.dispatchEvent(new CustomEvent('carousel:reposition'));

    return goalsCount;
};

function updateEmptyStateVisibility(goalsCount) {
    if (!emptyState) {
        return;
    }
    const shouldShow = goalsCount === 0 && currentView !== 'grid';
    emptyState.classList.toggle('hidden', !shouldShow);
}

function calculateGoals(goalsCount) {  
    let completedGoals = goalsList.querySelectorAll('.completed').length;
    let displayElement = document.getElementById('progress-bar-text');
    if (displayElement) {
        const percent = goalsCount > 0 ? Math.floor((completedGoals / goalsCount) * 100) : 0;
        displayElement.textContent = `You've completed ${completedGoals} of ${goalsCount} goals | ${percent}%`;
    }
};


// -------- Persistant Local Data ----------//

function saveGoals() {
    let goalsListArray = []
    //Add goals and their status to an array   
    goalsListArray = [] //start fresh, avoid concetatenation 
    for (const goalLine of goalsList.children) {
        const goalStatus = goalLine.querySelector('input').checked;
        const goalText = goalLine.querySelector('.goal-text').textContent;
        const goalUrgency =goalLine.dataset.urgency;
        const goalImportance= goalLine.dataset.importance;
        const goalDataForJSON = {
            text: goalText,
            completed: goalStatus,
            importance: goalImportance,
            urgency: goalUrgency
        }


        goalsListArray.push(goalDataForJSON);
        
    } ;
    const goalsJSON = JSON.stringify(goalsListArray);
    localStorage.setItem('goals', goalsJSON);
    console.log('Saved goals:', goalsJSON);
    return goalsListArray;
}

function hideGoalModal() {
    if (!goalModal) {
        return;
    }
    goalModal.classList.remove('is-visible');
    if (goalModalTimeout) {
        clearTimeout(goalModalTimeout);
        goalModalTimeout = null;
    }
}

function showGoalModal() {
    if (!goalModal) {
        return;
    }
    if (!goalModal.dataset.clickBound) {
        goalModal.addEventListener('click', hideGoalModal);
        goalModal.dataset.clickBound = 'true';
    }
    if (goalModalTimeout) {
        clearTimeout(goalModalTimeout);
    }
    goalModal.classList.add('is-visible');
    goalModalTimeout = setTimeout(() => {
        hideGoalModal();
    }, 1000);
}

function buildListFromLocalStorage(goalsArray) {
    for (const goalDataFromJSON of goalsArray) {
        const loadedListItem = document.createElement('li');
        loadedListItem.dataset.importance = goalDataFromJSON.importance;
        loadedListItem.dataset.urgency = goalDataFromJSON.urgency;
        const loadedItemCheckbox = document.createElement('input');
        loadedItemCheckbox.type = 'checkbox';
        loadedItemCheckbox.addEventListener('change', toggleGoalComplete);
        loadedItemCheckbox.checked = goalDataFromJSON.completed;
        if (goalDataFromJSON.completed === true) {
            loadedListItem.classList.add('completed'); 
        } 
       
        let loadedListTextSpan = document.createElement('span');
        loadedListTextSpan.classList.add('goal-text');
        loadedListTextSpan.textContent = goalDataFromJSON.text;

        const loadedPriorityDots = createPriorityDots(goalDataFromJSON.urgency, goalDataFromJSON.importance);
        loadedListItem.appendChild(loadedPriorityDots);

        loadedListItem.appendChild(loadedItemCheckbox);
        loadedListItem.appendChild(loadedListTextSpan);

        // Add quick actions
        let quickActions = document.createElement('div');
        quickActions.classList.add('quick-actions');
        let deleteBtn = document.createElement('button');
        deleteBtn.classList.add('quick-action-btn');
        deleteBtn.type = 'button';
        deleteBtn.setAttribute('aria-label', 'Remove goal');
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', function() {
            loadedListItem.remove();
            updateGoalCount();
        });
        quickActions.appendChild(deleteBtn);
        loadedListItem.appendChild(quickActions);

        goalsList.appendChild(loadedListItem);
    
    }
    updateGoalCount();
    sortGoalsList();
}

lookForGoalsOnPageLoad();
setActiveView(currentView);
function lookForGoalsOnPageLoad() {
    const goalsJSON = localStorage.getItem('goals');
    console.log('Loading goals from localStorage:', goalsJSON);
    if (goalsJSON) {
        const goalsArray = JSON.parse(goalsJSON);
        buildListFromLocalStorage(goalsArray);
        return goalsArray;
    } else {
        console.log("no goals in local storage")
    }
};

// -------- Delete All Goals Button ----------//
function deleteAllGoals() {
    localStorage.removeItem('goals');
    goalsList.innerHTML = "";
    updateGoalCount();
}


// -------- DOT MENU FUNCTIONS ----------//
 
// -------- Delete single item ----------//

// -------- Carousel Controller ----------//
(function () {
    const carouselRoot = document.querySelector('[data-carousel]');
    if (!carouselRoot) {
        return;
    }

    const windowEl = carouselRoot.querySelector('[data-carousel-window]');
    const track = carouselRoot.querySelector('[data-carousel-track]');
    const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prevButton = carouselRoot.querySelector('[data-carousel-prev]');
    const nextButton = carouselRoot.querySelector('[data-carousel-next]');
    const thumb = carouselRoot.querySelector('[data-carousel-thumb]');
    const hint = carouselRoot.querySelector('[data-carousel-hint]');
    const carouselLine = carouselRoot.querySelector('.carousel-line');
    const TRANSITION_STYLE = 'transform 0.35s cubic-bezier(0.33, 1, 0.68, 1)';
    const totalSlides = originalSlides.length;
    const hasLoop = totalSlides > 1;
    const cloneOffset = hasLoop ? 1 : 0;
    const swipeThreshold = 60;

    const sanitizeClone = (clone, sourceIndex) => {
        clone.setAttribute('data-carousel-clone', 'true');
        clone.setAttribute('data-carousel-source-index', String(sourceIndex));
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        if (clone.hasAttribute('id')) {
            clone.removeAttribute('id');
        }
        clone.querySelectorAll('[id]').forEach(node => {
            node.removeAttribute('id');
        });
        clone.querySelectorAll('label[for]').forEach(node => {
            node.removeAttribute('for');
        });
        clone.querySelectorAll('[aria-labelledby]').forEach(node => {
            node.removeAttribute('aria-labelledby');
        });
        clone.querySelectorAll('[aria-controls]').forEach(node => {
            node.removeAttribute('aria-controls');
        });
        clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(node => {
            node.setAttribute('tabindex', '-1');
        });
        clone.querySelectorAll('input[name]').forEach(input => {
            const name = input.getAttribute('name');
            if (!name) {
                return;
            }
            input.setAttribute('data-clone-original-name', name);
            input.setAttribute('name', `${name}__clone-${sourceIndex}`);
            if (input.type === 'radio') {
                input.checked = input.defaultChecked;
            }
        });
    };

    if (hasLoop) {
        const firstClone = originalSlides[0].cloneNode(true);
        sanitizeClone(firstClone, 0);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
        sanitizeClone(lastClone, originalSlides.length - 1);
        track.insertBefore(lastClone, originalSlides[0]);
        track.appendChild(firstClone);
    }

    const cloneSlides = hasLoop
        ? Array.from(track.querySelectorAll('[data-carousel-clone]'))
        : [];

    const carouselLabels = carouselRoot.querySelectorAll('.carousel-label');

    const setActiveSlide = (index) => {
        originalSlides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        if (hasLoop) {
            cloneSlides.forEach(clone => {
                const sourceIndex = Number(clone.getAttribute('data-carousel-source-index'));
                clone.classList.toggle('is-active', sourceIndex === index);
            });
        }
        
        // Update label colors
        carouselLabels.forEach((label, labelIndex) => {
            if (labelIndex === index) {
                label.style.color = 'var(--accent-color)';
                label.style.fontWeight = '900';
            } else {
                label.style.color = '';
                label.style.fontWeight = '';
            }
        });
    };

    if (totalSlides === 0) {
        return;
    }

    let activeIndex = 0;
    let slideWidth = windowEl.offsetWidth;
    let isDragging = false;
    let dragStartX = 0;
    let dragDeltaX = 0;
    let activePointerId = null;
    let thumbDragging = false;

    const dismissHint = () => {
        if (hint && !hint.classList.contains('is-dismissed')) {
            hint.classList.add('is-dismissed');
        }
    };

    const computeAnchorOffset = () => {
        const windowRect = windowEl.getBoundingClientRect();
        const activeSlide = originalSlides[activeIndex];
        if (!activeSlide) {
            return windowRect.height / 2;
        }
        const anchorEl = activeSlide.querySelector('[data-arrow-anchor]');
        if (!anchorEl) {
            return windowRect.height / 2;
        }
        const anchorRect = anchorEl.getBoundingClientRect();
        const offset = anchorRect.top + anchorRect.height / 2 - windowRect.top;
        return Math.min(Math.max(offset, 0), windowRect.height);
    };

    const repositionArrows = () => {
        if (!prevButton || !nextButton) {
            return;
        }
        requestAnimationFrame(() => {
            const offset = computeAnchorOffset();
            const formatted = `${offset}px`;
            prevButton.style.top = formatted;
            nextButton.style.top = formatted;
        });
    };

    const updateThumb = () => {
        if (!thumb) {
            return;
        }
        const segment = 100 / totalSlides;
        const offsetX = segment * activeIndex;
        thumb.style.width = `${segment}%`;
        thumb.style.left = `${offsetX}%`;
    };

    const getVisualIndexForActive = () => activeIndex + cloneOffset;
    const getTranslateForVisualIndex = (visualIndex) => -(visualIndex * slideWidth);

    const jumpToActive = () => {
        track.style.transition = 'none';
        track.style.transform = `translateX(${getTranslateForVisualIndex(getVisualIndexForActive())}px)`;
        repositionArrows();
    };

    const animateToActive = () => {
        track.style.transition = TRANSITION_STYLE;
        track.style.transform = `translateX(${getTranslateForVisualIndex(getVisualIndexForActive())}px)`;
        updateThumb();
        repositionArrows();
    };

    const animateToVisualIndex = (visualIndex) => {
        track.style.transition = TRANSITION_STYLE;
        track.style.transform = `translateX(${getTranslateForVisualIndex(visualIndex)}px)`;
    };

    let isLoopingTransition = false;

    const goToIndex = (targetIndex) => {
        if (totalSlides <= 1) {
            return;
        }
        dismissHint();
        const rawTarget = targetIndex;
        const normalizedTarget = ((rawTarget % totalSlides) + totalSlides) % totalSlides;
        const previousIndex = activeIndex;

        if (normalizedTarget === previousIndex) {
            animateToActive();
            try {
                windowEl.focus({ preventScroll: true });
            } catch (err) {
                windowEl.focus();
            }
            return;
        }

        const isForwardWrap = hasLoop && previousIndex === totalSlides - 1 && normalizedTarget === 0 && rawTarget > previousIndex;
        const isBackwardWrap = hasLoop && previousIndex === 0 && normalizedTarget === totalSlides - 1 && rawTarget < previousIndex;

        activeIndex = normalizedTarget;
        setActiveSlide(activeIndex);

        if (isForwardWrap) {
            isLoopingTransition = true;
            updateThumb();
            repositionArrows();
            animateToVisualIndex(totalSlides + cloneOffset);
        } else if (isBackwardWrap) {
            isLoopingTransition = true;
            updateThumb();
            repositionArrows();
            animateToVisualIndex(0);
        } else {
            isLoopingTransition = false;
            animateToActive();
        }

        try {
            windowEl.focus({ preventScroll: true });
        } catch (err) {
            windowEl.focus();
        }
    };

    const handleResize = () => {
        slideWidth = windowEl.offsetWidth;
        jumpToActive();
        updateThumb();
        requestAnimationFrame(() => {
            track.style.transition = TRANSITION_STYLE;
        });
    };

    const interactiveSelector = 'button, input, textarea, select, a, label, [data-carousel-static]';
    const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;

    const startDragging = (clientX, pointerId = null) => {
        isDragging = true;
        activePointerId = pointerId;
        dragStartX = clientX;
        dragDeltaX = 0;
        windowEl.classList.add('is-dragging');
        track.style.transition = 'none';
        dismissHint();
    };

    const updateDragPosition = (clientX) => {
        if (!isDragging) {
            return;
        }
        dragDeltaX = clientX - dragStartX;
        track.style.transform = `translateX(${ getTranslateForVisualIndex(getVisualIndexForActive()) + dragDeltaX }px)`;
    };

    const settleToActive = () => {
        animateToActive();
    };

    const finishDrag = () => {
        if (!isDragging) {
            return;
        }
        windowEl.classList.remove('is-dragging');
        isDragging = false;
        activePointerId = null;
        dismissHint();
        const traveled = Math.abs(dragDeltaX);
        if (traveled > swipeThreshold) {
            if (dragDeltaX < 0) {
                goToIndex(activeIndex + 1);
            } else {
                goToIndex(activeIndex - 1);
            }
        } else {
            settleToActive();
        }
        dragDeltaX = 0;
    };

    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        if (isDragging || isLoopingTransition) {
            return;
        }
        const interactiveTarget = event.target.closest(interactiveSelector);
        if (interactiveTarget) {
            return;
        }
        startDragging(event.clientX, event.pointerId);
        if (typeof windowEl.setPointerCapture === 'function') {
            try {
                windowEl.setPointerCapture(event.pointerId);
            } catch (err) {
                // Some browsers may reject capture on non-primary pointers; ignore.
            }
        }
    };

    const handlePointerMove = (event) => {
        if (!isDragging || event.pointerId !== activePointerId) {
            return;
        }
        updateDragPosition(event.clientX);
    };

    const handlePointerEnd = (event) => {
        if (!isDragging || (event.pointerId !== undefined && event.pointerId !== activePointerId)) {
            return;
        }
        if (typeof windowEl.releasePointerCapture === 'function') {
            try {
                windowEl.releasePointerCapture(event.pointerId);
            } catch (err) {
                // Pointer capture might already be released; ignore errors.
            }
        }
        finishDrag();
    };

    const handlePointerCancel = handlePointerEnd;

    if (supportsPointerEvents) {
        windowEl.addEventListener('pointerdown', handlePointerDown);
        windowEl.addEventListener('pointermove', handlePointerMove);
        windowEl.addEventListener('pointerup', handlePointerEnd);
        windowEl.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('pointerup', handlePointerEnd);
        window.addEventListener('pointercancel', handlePointerCancel);
    } else {
        const handleTouchStart = (event) => {
            if (isDragging || isLoopingTransition) {
                return;
            }
            if (event.touches.length === 0) {
                return;
            }
            const interactiveTarget = event.target.closest(interactiveSelector);
            if (interactiveTarget) {
                return;
            }
            const touch = event.touches[0];
            if (!touch) {
                return;
            }
            startDragging(touch.clientX, 'touch');
        };

        const handleTouchMove = (event) => {
            if (!isDragging) {
                return;
            }
            const touch = event.touches[0] || event.changedTouches[0];
            if (!touch) {
                return;
            }
            updateDragPosition(touch.clientX);
            if (event.cancelable) {
                event.preventDefault();
            }
        };

        const handleTouchEnd = () => {
            finishDrag();
        };

        windowEl.addEventListener('touchstart', handleTouchStart, { passive: true });
        windowEl.addEventListener('touchmove', handleTouchMove, { passive: false });
        windowEl.addEventListener('touchend', handleTouchEnd);
        windowEl.addEventListener('touchcancel', handleTouchEnd);
    }

    const handleTransitionEnd = (event) => {
        if (event.target !== track || event.propertyName !== 'transform') {
            return;
        }
        if (!isLoopingTransition) {
            return;
        }
        jumpToActive();
        requestAnimationFrame(() => {
            track.style.transition = TRANSITION_STYLE;
        });
        isLoopingTransition = false;
    };

    track.addEventListener('transitionend', handleTransitionEnd);

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            goToIndex(activeIndex - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            goToIndex(activeIndex + 1);
        });
    }

    windowEl.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToIndex(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToIndex(activeIndex + 1);
        }
    });

    // Slider thumb dragging and clicking
    if (thumb && carouselLine) {
        const handleThumbDrag = (event) => {
            if (!thumbDragging) return;
            
            const lineRect = carouselLine.getBoundingClientRect();
            const clientX = event.clientX || (event.touches && event.touches[0] && event.touches[0].clientX);
            if (!clientX) return;
            
            const offsetX = clientX - lineRect.left;
            const percentage = Math.max(0, Math.min(1, offsetX / lineRect.width));
            const targetIndex = Math.round(percentage * (totalSlides - 1));
            
            goToIndex(targetIndex);
        };

        const handleThumbStart = (event) => {
            thumbDragging = true;
            handleThumbDrag(event);
            event.preventDefault();
        };

        const handleThumbEnd = () => {
            thumbDragging = false;
        };

        thumb.addEventListener('pointerdown', handleThumbStart);
        thumb.addEventListener('touchstart', handleThumbStart, { passive: false });
        
        carouselLine.addEventListener('pointerdown', handleThumbStart);
        carouselLine.addEventListener('touchstart', handleThumbStart, { passive: false });
        
        document.addEventListener('pointermove', handleThumbDrag);
        document.addEventListener('touchmove', handleThumbDrag, { passive: false });
        
        document.addEventListener('pointerup', handleThumbEnd);
        document.addEventListener('touchend', handleThumbEnd);
        
        thumb.style.cursor = 'grab';
        carouselLine.style.cursor = 'pointer';
    }

    // Make carousel labels clickable
    carouselLabels.forEach((label, index) => {
        label.style.cursor = 'pointer';
        label.addEventListener('click', () => {
            goToIndex(index);
        });
    });

    const observer = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null;

    if (observer) {
        observer.observe(windowEl);
    } else {
        window.addEventListener('resize', handleResize);
    }

    window.addEventListener('carousel:reposition', repositionArrows);

    updateThumb();
    jumpToActive();
    requestAnimationFrame(() => {
        track.style.transition = TRANSITION_STYLE;
    });
    setActiveSlide(activeIndex);
})();
