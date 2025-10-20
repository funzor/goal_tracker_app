let newGoalText = '';
const addGoalButton = document.getElementById('add-goal-button');
const goalsList = document.getElementById('goals-list');
const newGoalInput = document.getElementById('new-goal-input');
const viewTabs = document.querySelectorAll('.view-tab');
const goalsGridView = document.getElementById('goals-grid');
const goalModal = document.getElementById('goal-modal');
let goalModalTimeout = null;
let currentView = 'grid';

if (newGoalInput) {
    newGoalInput.addEventListener('input', enableAddGoalButton);
}

if (addGoalButton) {
    addGoalButton.addEventListener('click', getNewGoalText);
}

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

// -------- Matrix Quadrant Selector ----------//
const matrixCells = document.querySelectorAll('.matrix-cell');

matrixCells.forEach(cell => {
    cell.addEventListener('click', function() {
        // Remove selected from all cells
        matrixCells.forEach(c => c.classList.remove('selected'));
        // Add selected to clicked cell
        this.classList.add('selected');
        // Store the values
        selectedUrgency = this.dataset.urgency;
        selectedImportance = this.dataset.importance;
    });
});

// -------- Color Theme System ----------//
const colorThemes = {
    black: { primary: '#000', hover: '#333', light: 'rgba(0, 0, 0, 0.1)', tag: 'rgba(0, 0, 0, 0.5)' },
    blue: { primary: '#0066FF', hover: '#0052CC', light: 'rgba(0, 102, 255, 0.1)', tag: 'rgba(0, 102, 255, 0.5)' },
    orange: { primary: '#FF6B00', hover: '#CC5500', light: 'rgba(255, 107, 0, 0.1)', tag: 'rgba(255, 107, 0, 0.5)' },
    green: { primary: '#00C853', hover: '#00A142', light: 'rgba(0, 200, 83, 0.1)', tag: 'rgba(0, 200, 83, 0.5)' },
    pink: { primary: '#FF006E', hover: '#CC0058', light: 'rgba(255, 0, 110, 0.1)', tag: 'rgba(255, 0, 110, 0.5)' },
    purple: { primary: '#7C3AED', hover: '#6328E0', light: 'rgba(124, 58, 237, 0.1)', tag: 'rgba(124, 58, 237, 0.5)' }
};

function setThemeColor(colorName) {
    const theme = colorThemes[colorName];
    document.documentElement.style.setProperty('--accent-color', theme.primary);
    document.documentElement.style.setProperty('--accent-hover', theme.hover);
    document.documentElement.style.setProperty('--accent-light', theme.light);
    document.documentElement.style.setProperty('--accent-tag', theme.tag);
    localStorage.setItem('themeColor', colorName);
}

function loadThemeColor() {
    const savedColor = localStorage.getItem('themeColor') || 'black';
    setThemeColor(savedColor);
    
    // Update selected state in UI
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === savedColor) {
            option.classList.add('selected');
        }
    });
}

// Color picker event listeners
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        const colorName = this.dataset.color;
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        setThemeColor(colorName);
    });
});

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
    const trimmedInput = newGoalInput.value.trim();
    if (trimmedInput.length > 0) {
        addGoalButton.disabled = false;
    } else {
        addGoalButton.disabled = true;
    }
}

function getNewGoalText() {
    newGoalText = document.getElementById("new-goal-input").value;
    let createdListItem = document.createElement('li');
    let newItemCheckbox = document.createElement('input');
    newItemCheckbox.type = 'checkbox';
    newItemCheckbox.addEventListener('change', toggleGoalComplete)
    let goalTextSpan = document.createElement('span');
    goalTextSpan.classList.add('goal-text');
    goalTextSpan.textContent = newGoalText;
    let parentElementOfNewGoalText = document.getElementById('goals-list');   
    parentElementOfNewGoalText.appendChild(createdListItem);
    let parentElementOfNewListItem = createdListItem; 
    
    // Add category dot based on matrix quadrant
    let categoryDot = document.createElement('span');
    categoryDot.classList.add('category-dot');
    categoryDot.dataset.urgency = selectedUrgency;
    categoryDot.dataset.importance = selectedImportance;
    createdListItem.appendChild(categoryDot);
    
    parentElementOfNewListItem.appendChild(newItemCheckbox);
    createdListItem.appendChild(goalTextSpan);

    const badgeContainer = document.createElement('div');
    badgeContainer.classList.add('goal-tags');

    const urgencyBadge = document.createElement('span');
    urgencyBadge.classList.add('urgency-badge');
    urgencyBadge.dataset.level = selectedUrgency;
    urgencyBadge.textContent = `Urg: ${selectedUrgency}`;
    badgeContainer.appendChild(urgencyBadge);

    const importanceBadge = document.createElement('span');
    importanceBadge.classList.add('importance-badge');
    importanceBadge.dataset.level = selectedImportance;
    importanceBadge.textContent = `Imp: ${selectedImportance}`;
    badgeContainer.appendChild(importanceBadge);

    createdListItem.appendChild(badgeContainer);
    
    // Add quick actions
    let quickActions = document.createElement('div');
    quickActions.classList.add('quick-actions');
    let deleteBtn = document.createElement('button');
    deleteBtn.classList.add('quick-action-btn');
    deleteBtn.textContent = '🗑';
    deleteBtn.addEventListener('click', function() {
        createdListItem.remove();
        updateGoalCount();
    });
    quickActions.appendChild(deleteBtn);
    createdListItem.appendChild(quickActions);
    
    createdListItem.dataset.urgency = selectedUrgency;
    createdListItem.dataset.importance = selectedImportance;

    document.getElementById('new-goal-input').value = "";
    addGoalButton.disabled = true;
    updateGoalCount();
    showGoalModal();
}

function toggleGoalComplete() {
    let goalListItem = this.parentElement;
    goalListItem.classList.toggle('completed', this.checked)
    updateGoalCount();
};

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

    Array.from(goalsList.children).forEach(goalItem => {
        const importance = goalItem.dataset.importance || 'Low';
        const urgency = goalItem.dataset.urgency || 'Low';
        const quadrant = goalsGridView.querySelector(`.grid-quadrant[data-importance="${importance}"][data-urgency="${urgency}"] .quadrant-body`);
        if (!quadrant) {
            return;
        }

        const gridGoal = document.createElement('div');
        gridGoal.classList.add('grid-goal');
        if (goalItem.classList.contains('completed')) {
            gridGoal.classList.add('completed');
        }

        const sourceDot = goalItem.querySelector('.category-dot');
        if (sourceDot) {
            const dotClone = sourceDot.cloneNode(true);
            gridGoal.appendChild(dotClone);
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
            deleteBtn.textContent = '🗑';
            deleteBtn.addEventListener('click', () => {
                deleteOriginal.click();
            });
            quickActionsWrapper.appendChild(deleteBtn);
        }
        if (quickActionsWrapper.children.length > 0) {
            gridGoal.appendChild(quickActionsWrapper);
        }

        quadrant.appendChild(gridGoal);
    });
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
    
    // Update progress indicator
    const progressIndicator = document.getElementById('progress-indicator');
    if (progressIndicator) {
        const completedGoals = goalsList.querySelectorAll('.completed').length;
        progressIndicator.textContent = `${completedGoals}/${goalsCount}`;
    }
    
    // Toggle empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        if (goalsCount === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }
    
    renderGoalsGrid();
    window.dispatchEvent(new CustomEvent('carousel:reposition'));

    return goalsCount;
};

function calculateGoals(goalsCount) {  
    let completedGoals = goalsList.querySelectorAll('.completed').length;
    let displayElement = document.getElementById('progress-bar-text');
    if (displayElement) {
        displayElement.textContent = `You've completed ${completedGoals} of ${goalsCount}  goals | ${Math.floor((completedGoals / goalsCount) * 100 )} %  `;
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

function showGoalModal() {
    if (!goalModal) {
        return;
    }
    if (goalModalTimeout) {
        clearTimeout(goalModalTimeout);
    }
    goalModal.classList.add('is-visible');
    goalModalTimeout = setTimeout(() => {
        goalModal.classList.remove('is-visible');
    }, 2000);
}

function buildListFromLocalStorage(goalsArray) {
    for (const goalDataFromJSON of goalsArray) {
        const loadedListItem = document.createElement('li');
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
   
        // Add category dot
        let loadedCategoryDot = document.createElement('span');
        loadedCategoryDot.classList.add('category-dot');
        loadedCategoryDot.dataset.urgency = goalDataFromJSON.urgency;
        loadedCategoryDot.dataset.importance = goalDataFromJSON.importance;
        loadedListItem.appendChild(loadedCategoryDot);

        loadedListItem.appendChild(loadedItemCheckbox);
        loadedListItem.appendChild(loadedListTextSpan);
        loadedListItem.dataset.importance = goalDataFromJSON.importance;
        loadedListItem.dataset.urgency = goalDataFromJSON.urgency;
        const loadedBadgeContainer = document.createElement('div');
        loadedBadgeContainer.classList.add('goal-tags');
        const loadedUrgencyBadge = document.createElement('span');
        loadedUrgencyBadge.classList.add('urgency-badge');
        loadedUrgencyBadge.dataset.level = goalDataFromJSON.urgency;
        loadedUrgencyBadge.textContent = `Urg: ${goalDataFromJSON.urgency}`;
        loadedBadgeContainer.appendChild(loadedUrgencyBadge);
        const loadedImportanceBadge = document.createElement('span');
        loadedImportanceBadge.classList.add('importance-badge');
        loadedImportanceBadge.dataset.level = goalDataFromJSON.importance;
        loadedImportanceBadge.textContent = `Imp: ${goalDataFromJSON.importance}`;
        loadedBadgeContainer.appendChild(loadedImportanceBadge);
        loadedListItem.appendChild(loadedBadgeContainer);

        // Add quick actions
        let quickActions = document.createElement('div');
        quickActions.classList.add('quick-actions');
        let deleteBtn = document.createElement('button');
        deleteBtn.classList.add('quick-action-btn');
        deleteBtn.textContent = '🗑';
        deleteBtn.addEventListener('click', function() {
            loadedListItem.remove();
            updateGoalCount();
        });
        quickActions.appendChild(deleteBtn);
        loadedListItem.appendChild(quickActions);

        goalsList.appendChild(loadedListItem);
    
    }
    updateGoalCount();
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
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prevButton = carouselRoot.querySelector('[data-carousel-prev]');
    const nextButton = carouselRoot.querySelector('[data-carousel-next]');
    const thumb = carouselRoot.querySelector('[data-carousel-thumb]');
    const hint = carouselRoot.querySelector('[data-carousel-hint]');
    const TRANSITION_STYLE = 'transform 0.35s cubic-bezier(0.33, 1, 0.68, 1)';
    const totalSlides = slides.length;
    const swipeThreshold = 60;

    if (totalSlides === 0) {
        return;
    }

    let activeIndex = 0;
    let slideWidth = windowEl.offsetWidth;
    let isDragging = false;
    let dragStartX = 0;
    let dragDeltaX = 0;

    const dismissHint = () => {
        if (hint && !hint.classList.contains('is-dismissed')) {
            hint.classList.add('is-dismissed');
        }
    };

    const computeAnchorOffset = () => {
        const windowRect = windowEl.getBoundingClientRect();
        const activeSlide = slides[activeIndex];
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
        thumb.style.width = `${segment}%`;
        thumb.style.transform = `translateX(${segment * activeIndex}%)`;
    };

    const applyTransform = () => {
        track.style.transition = TRANSITION_STYLE;
        track.style.transform = `translateX(-${slideWidth * activeIndex}px)`;
        updateThumb();
        repositionArrows();
    };

    const goToIndex = (targetIndex) => {
        if (totalSlides <= 1) {
            return;
        }
        dismissHint();
        activeIndex = ((targetIndex % totalSlides) + totalSlides) % totalSlides;
        track.style.transition = TRANSITION_STYLE;
        applyTransform();
        windowEl.focus({ preventScroll: true });
    };

    const handleResize = () => {
        slideWidth = windowEl.offsetWidth;
        track.style.transition = 'none';
        track.style.transform = `translateX(-${slideWidth * activeIndex}px)`;
        updateThumb();
        repositionArrows();
        requestAnimationFrame(() => {
            track.style.transition = TRANSITION_STYLE;
        });
    };

    const interactiveSelector = 'button, input, textarea, select, a, label, [data-carousel-static]';

    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        const interactiveTarget = event.target.closest(interactiveSelector);
        if (interactiveTarget) {
            return;
        }
        isDragging = true;
        dragStartX = event.clientX;
        dragDeltaX = 0;
        try {
            windowEl.setPointerCapture(event.pointerId);
        } catch (err) {
            // Some browsers may reject capture on non-primary pointers; ignore.
        }
        windowEl.classList.add('is-dragging');
        track.style.transition = 'none';
        dismissHint();
    };

    const handlePointerMove = (event) => {
        if (!isDragging) {
            return;
        }
        dragDeltaX = event.clientX - dragStartX;
        track.style.transform = `translateX(${ -activeIndex * slideWidth + dragDeltaX }px)`;
    };

    const settleToActive = () => {
        track.style.transition = TRANSITION_STYLE;
        applyTransform();
    };

    const handlePointerEnd = (event) => {
        if (!isDragging) {
            return;
        }
        try {
            windowEl.releasePointerCapture(event.pointerId);
        } catch (err) {
            // Pointer capture might already be released; ignore errors.
        }
        dismissHint();
        windowEl.classList.remove('is-dragging');
        isDragging = false;
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

    windowEl.addEventListener('pointerdown', handlePointerDown);
    windowEl.addEventListener('pointermove', handlePointerMove);
    windowEl.addEventListener('pointerup', handlePointerEnd);
    windowEl.addEventListener('pointercancel', handlePointerEnd);

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
    applyTransform();
    repositionArrows();
})();
