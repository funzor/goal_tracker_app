let newGoalText = '';
let button = document.getElementById("add-goal-button")

button.addEventListener('click', getNewGoalText);

function getNewGoalText() {
    newGoalText = document.getElementById("new-goal-input").value;
    let createdListItem = document.createElement('li');
    let newItemCheckbox = document.createElement('input');
    newItemCheckbox.type = 'checkbox';
    newItemCheckbox.addEventListener('change', toggleGoalComplete)
    let parentElementOfNewGoalText = document.getElementById('goals-list');   
    parentElementOfNewGoalText.appendChild(createdListItem);
    let parentElementOfNewListItem = createdListItem; 
    parentElementOfNewListItem.appendChild(newItemCheckbox);
    let newGoalTextNode = document.createTextNode(newGoalText);
    createdListItem.appendChild(newGoalTextNode);
    document.getElementById('new-goal-input').value = "";
    updateGoalCount();
}

function toggleGoalComplete() {
    let goalListItem = this.parentElement;
    goalListItem.classList.toggle('completed', this.checked)
    updateGoalCount();
};
    
function updateGoalCount() {
    let goalsList = document.getElementById('goals-list');
    let goalsCount = goalsList.children.length;
    calculateGoals(goalsCount, goalsList);
    return goalsCount;
};

function calculateGoals(goalsCount) {
    let goalsList = document.getElementById('goals-list'); 
    let completedGoals = goalsList.querySelectorAll('.completed').length;
    let displayElement = document.getElementById('progress-bar-text');
    displayElement.textContent = `You've completed ${completedGoals} of ${goalsCount}  goals | ${Math.floor((completedGoals / goalsCount) * 100 )} %  `;
};