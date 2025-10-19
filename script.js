let newGoalText = '';
let addGoalButton = document.getElementById("add-goal-button")
let deleteAllGoalsButton = document.getElementById("delete-all-goals-button");
let goalsList = document.getElementById('goals-list');

let selectedImportance;
let selectedUrgency;

addGoalButton.addEventListener('click', getNewGoalText);

function getNewGoalText() {
    newGoalText = document.getElementById("new-goal-input").value;
    selectedImportance = document.querySelector('input[name="importance"]:checked');
    selectedUrgency = document.querySelector('input[name="urgency"]:checked');
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
    parentElementOfNewListItem.appendChild(newItemCheckbox);
    createdListItem.appendChild(goalTextSpan);
    // let newGoalTextNode = document.createTextNode(newGoalText);
    // createdListItem.appendChild(newGoalTextNode);
    let createdMatrixBadge = document.createElement('span')
    createdMatrixBadge.classList.add('matrix-badge')
    createdListItem.appendChild(createdMatrixBadge);
    createdMatrixBadge.textContent = (`Urgency: ${selectedUrgency.value}. Importance: ${selectedImportance.value}`)
    createdListItem.dataset.urgency = selectedUrgency.value;
    createdListItem.dataset.importance = selectedImportance.value;

    document.getElementById('new-goal-input').value = "";
    // <-- clear radio bubbles    
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
   

        loadedListItem.appendChild(loadedItemCheckbox);
        loadedListItem.appendChild(loadedListTextSpan);
        loadedListItem.dataset.importance = goalDataFromJSON.importance;
        loadedListItem.dataset.urgency = goalDataFromJSON.urgency;
        let loadedMatrixBadge = document.createElement('span');
        loadedMatrixBadge.textContent = `Urgency: ${goalDataFromJSON.urgency}. Importance: ${goalDataFromJSON.importance}`;
        loadedListItem.appendChild(loadedMatrixBadge);

        loadedMatrixBadge.classList.add('matrix-badge')
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
deleteAllGoalsButton.addEventListener('click', deleteAllGoals);
function deleteAllGoals() {
    localStorage.removeItem('goals');
    goalsList.innerHTML = "";
    updateGoalCount();
}


// -------- DOT MENU FUNCTIONS ----------//
 
// -------- Delete single item ----------//