// ----- This project has been developed by Gianmarco Ebeling as a student of the ZTM Academy.
// Thanks Andrei Neagoie, you are an amazing teacher! ------

const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogListEl = document.getElementById('backlog-list');
const progressListEl = document.getElementById('progress-list');
const completeListEl = document.getElementById('complete-list');
const onHoldListEl = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    // Default initial tasks
    backlogListArray = ['Write for Medium', 'Finish the project'];
    progressListArray = ['Workout', 'Study JavaScript'];
    completeListArray = ['Project of the day', 'Post on LinkedIn'];
    onHoldListArray = ['Being cool'];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  });
}

// Filter Array to remove empty values (removes nulls left by delete)
function filterArray(array) {
  // Ensure array elements are not null or undefined
  const filteredArray = array.filter(item => item !== null && item !== undefined);
  return filteredArray;
}

// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
  // List Item (The draggable container)
  const listEl = document.createElement('li');
  listEl.id = index;
  listEl.classList.add('drag-item');
  listEl.draggable = true;
  listEl.setAttribute('ondragstart', 'drag(event)');

  // Task Text Div (Where the text content lives)
  const taskTextEl = document.createElement('div');
  taskTextEl.textContent = item;
  taskTextEl.classList.add('task-text');
  // Handle saving/deleting when focus is lost after editing
  taskTextEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`);
  // Start with contenteditable=false, edit button will toggle it
  taskTextEl.setAttribute('contentEditable', 'false');

  // Controls Container (For the icons)
  const controlsEl = document.createElement('div');
  controlsEl.classList.add('item-controls');

  // Edit Button (fas fa-edit)
  const editBtn = document.createElement('i');
  editBtn.classList.add('fas', 'fa-edit', 'edit-btn');
  editBtn.setAttribute('title', 'Edit Task');
  // Edit logic: toggles contentEditable to 'true' and focuses
  editBtn.setAttribute('onclick', `editItem(${index}, ${column})`); 

  // Delete Button (fas fa-trash-alt)
  const deleteBtn = document.createElement('i');
  deleteBtn.classList.add('fas', 'fa-trash-alt', 'delete-btn');
  deleteBtn.setAttribute('title', 'Delete Task');
  deleteBtn.setAttribute('onclick', `deleteItem(${index}, ${column})`);

  // Append controls
  controlsEl.appendChild(editBtn);
  controlsEl.appendChild(deleteBtn);

  // Append text and controls to list item
  listEl.appendChild(taskTextEl);
  listEl.appendChild(controlsEl);

  // Append the complete list item to the column
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column
  backlogListEl.textContent = '';
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogListEl, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  // Progress Column
  progressListEl.textContent = '';
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressListEl, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  // Complete Column
  completeListEl.textContent = '';
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeListEl, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  // On Hold Column
  onHoldListEl.textContent = '';
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldListEl, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
  // Don't run more than once, Update Local Storage
  updatedOnLoad = true;
  updateSavedColumns();
}

// Update Item (triggered when focus is lost after editing)
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  const selectedList = listColumns[column].children;
  // Get the inner div element for the task text
  const taskTextElement = selectedList[id].querySelector('.task-text');

  // Re-disable editing after focusout
  taskTextElement.contentEditable = 'false';

  // Only proceed if not dragging (to avoid errors)
  if (!dragging) {
    // Check if the content is empty or only contains whitespace
    if (!taskTextElement.textContent.trim()) {
      // If content is empty after edit, mark for deletion
      delete selectedArray[id];
    } else {
      // Update the array value
      selectedArray[id] = taskTextElement.textContent.trim();
    }
    updateDOM();
  }
}

// New: Explicitly Delete Item
function deleteItem(id, column) {
  const selectedArray = listArrays[column];
  // Mark item for deletion. updateDOM will filter it out.
  delete selectedArray[id];
  updateDOM();
}

// New: Edit Item - Toggle contenteditable and focus
function editItem(id, column) {
    const selectedList = listColumns[column].children;
    const taskTextElement = selectedList[id].querySelector('.task-text');

    // 1. Enable editing
    taskTextElement.contentEditable = 'true';

    // 2. Focus the element
    taskTextElement.focus();

    // 3. Move cursor to the end (UX improvement)
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(taskTextElement);
    range.collapse(false); // false for end of content
    sel.removeAllRanges();
    sel.addRange(range);
}


// Add to Column List, Reset Textbox
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  if (itemText.trim() === '') return; // Prevent adding empty tasks
  const selectedArray = listArrays[column];
  selectedArray.push(itemText.trim());
  addItems[column].textContent = '';
  updateDOM(column);
}

// Show Add Item Input Box
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden';
  saveItemBtns[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

// Hide Item Input Box
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  addToColumn(column);
}

// Allows arrays to reflect Drag and Drop items
function rebuildArrays() {
  backlogListArray = [];
  // Get the text from the nested .task-text div
  for (let i = 0; i < backlogListEl.children.length; i++) {
    // Check if task-text element exists before accessing textContent
    const taskTextEl = backlogListEl.children[i].querySelector('.task-text');
    if (taskTextEl) {
      backlogListArray.push(taskTextEl.textContent);
    }
  }
  progressListArray = [];
  for (let i = 0; i < progressListEl.children.length; i++) {
    const taskTextEl = progressListEl.children[i].querySelector('.task-text');
    if (taskTextEl) {
      progressListArray.push(taskTextEl.textContent);
    }
  }
  completeListArray = [];
  for (let i = 0; i < completeListEl.children.length; i++) {
    const taskTextEl = completeListEl.children[i].querySelector('.task-text');
    if (taskTextEl) {
      completeListArray.push(taskTextEl.textContent);
    }
  }
  onHoldListArray = [];
  for (let i = 0; i < onHoldListEl.children.length; i++) {
    const taskTextEl = onHoldListEl.children[i].querySelector('.task-text');
    if (taskTextEl) {
      onHoldListArray.push(taskTextEl.textContent);
    }
  }
  updateSavedColumns(); // Use this function to save to local storage
  updateDOM();
}

// When Item Enters Column Area
function dragEnter(column) {
  listColumns[column].classList.add('over');
  currentColumn = column;
}

// When Item Starts Dragging
function drag(e) {
  // Ensure the whole <li> element is dragged
  draggedItem = e.target.closest('li');
  dragging = true;
}

// Column Allows for Item to Drop
function allowDrop(e) {
  e.preventDefault();
}

// Dropping Item in Column
function drop(e) {
  e.preventDefault();
  const parent = listColumns[currentColumn];
  // Remove Background Color/Padding
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });
  // Add item to Column
  parent.appendChild(draggedItem);
  // Dragging complete
  dragging = false;
  rebuildArrays();
}

// On Load
updateDOM();
