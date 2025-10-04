let newGoalText = '';
let button = document.getElementById("add-goal-button")

// event listeners
button.addEventListener('click', getNewGoalText);


// check and uncheck function logic.
//  Crossed out and greyes out li. 
    


//  Moves it to the bottom of the list.

// Function to capture New Goal input and add it to the list
function getNewGoalText() {
    //Get the text inside the text input box
    newGoalText = document.getElementById("new-goal-input").value;
    console.log("User input is: " + newGoalText);
    //create a new li element
    let createdListItem = document.createElement('li');
    let newItemCheckbox = document.createElement('input');
    newItemCheckbox.type = 'checkbox';
    newItemCheckbox.addEventListener('change', toggleGoalComplete)
    //Add newly created li element to ol list
    let parentElementOfNewGoalText = document.getElementById('goals-list');   
    parentElementOfNewGoalText.appendChild(createdListItem);
    //Add a checkbox to the newly created li element
    let parentElementOfNewListItem = createdListItem; 
    parentElementOfNewListItem.appendChild(newItemCheckbox);
    //Put it all together
    let newGoalTextNode = document.createTextNode(newGoalText);
    createdListItem.appendChild(newGoalTextNode);

}

   

function toggleGoalComplete() {
    let goalListItem = this.parentElement;
    goalListItem.classList.toggle('completed', this.checked)
};
    