let newGoalText = '';
let addGoalButton = document.getElementById("add-goal-button")
let goalsList = document.getElementById('goals-list');
let newGoalInput = document.getElementById('new-goal-input');
newGoalInput.addEventListener('input', enableAddGoalButton);
addGoalButton.addEventListener('click', getNewGoalText);

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
    black: { primary: '#000', hover: '#333', light: 'rgba(0, 0, 0, 0.1)' },
    blue: { primary: '#0066FF', hover: '#0052CC', light: 'rgba(0, 102, 255, 0.1)' },
    orange: { primary: '#FF6B00', hover: '#CC5500', light: 'rgba(255, 107, 0, 0.1)' },
    green: { primary: '#00C853', hover: '#00A142', light: 'rgba(0, 200, 83, 0.1)' },
    pink: { primary: '#FF006E', hover: '#CC0058', light: 'rgba(255, 0, 110, 0.1)' },
    purple: { primary: '#7C3AED', hover: '#6328E0', light: 'rgba(124, 58, 237, 0.1)' }
};

function setThemeColor(colorName) {
    const theme = colorThemes[colorName];
    document.documentElement.style.setProperty('--accent-color', theme.primary);
    document.documentElement.style.setProperty('--accent-hover', theme.hover);
    document.documentElement.style.setProperty('--accent-light', theme.light);
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
    let urgencyBadge = document.createElement('span')
    urgencyBadge.classList.add('urgency-badge')
    urgencyBadge.textContent = `U: ${selectedUrgency}`;
    createdListItem.appendChild(urgencyBadge);
    let importanceBadge = document.createElement('span')
    importanceBadge.classList.add('importance-badge')
    importanceBadge.textContent = `I: ${selectedImportance}`;
    createdListItem.appendChild(importanceBadge);
    
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
}

function toggleGoalComplete() {
    let goalListItem = this.parentElement;
    goalListItem.classList.toggle('completed', this.checked)
    updateGoalCount();
};
    
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
    
    return goalsCount;
};

function calculateGoals(goalsCount) {  
    let completedGoals = goalsList.querySelectorAll('.completed').length;
    let displayElement = document.getElementById('progress-bar-text');
    displayElement.textContent = `You've completed ${completedGoals} of ${goalsCount}  goals | ${Math.floor((completedGoals / goalsCount) * 100 )} %  `;
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
    return goalsListArray;
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
        let loadedUrgencyBadge = document.createElement('span');
        loadedUrgencyBadge.classList.add('urgency-badge');
        loadedUrgencyBadge.textContent = `Urgency: ${goalDataFromJSON.urgency}`;
        loadedListItem.appendChild(loadedUrgencyBadge);
        let loadedImportanceBadge = document.createElement('span');
        loadedImportanceBadge.classList.add('importance-badge');
        loadedImportanceBadge.textContent = `Importance: ${goalDataFromJSON.importance}`;
        loadedListItem.appendChild(loadedImportanceBadge);

        goalsList.appendChild(loadedListItem);
    
    }
    updateGoalCount();
}

lookForGoalsOnPageLoad();
function lookForGoalsOnPageLoad() {
    const goalsJSON = localStorage.getItem('goals');
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