import { $, $$ } from './helper.js'
import { handleDOMLoadedClock } from './clock.js'
import { createTemplateTodo, Todo } from './create-todo.js'

let users = []   // Массив пользователей
let todos = []   // Задачи из 1-го блока (Todo)
let todos2 = []  // Задачи из 2-го блока (In progress)
let todos3 = []  // Задачи из 3-го блока (Done)

const buttonAddTodo = $('#buttonAdd')
const buttonDeleteAllElement = $('#buttonDeleteAll')
const buttonEditModalElement = $('#buttonEdit')

const formAddElement = $('#addForm')
const inputTitleAddElement = $('#titleAdd')
const inputDescriptionAddElement = $('#descriptionAdd')
const inputEditElement = $('#titleEdit')
const textareaEditElement = $('#descriptionEdit')

const selectNamesElements = [...$$('.modal__select-user')]
const selectNameAddElement = $('#nameAdd')
const selectNameEditElement = $('#selectEdit')
const selectPriorityElement = $('#selectPriority')
const selectPriorityEditElement = $('#selectPriorityEdit')

const block1TopElement = $('#block1Top')
const block2TopElement = $('#block2Top')
const block3TopElement = $('#block3Top')

const blockList1Element = $('#list1')
const blockList2Element = $('#list2')
const blockList3Element = $('#list3')


window.addEventListener('beforeunload', handleBeforeunload)
window.addEventListener('DOMContentLoaded', handleDOMLoadedStorage)
window.addEventListener('DOMContentLoaded', handleDOMLoadedClock)
window.addEventListener('DOMContentLoaded', handleDomLoadedUsers)

formAddElement.addEventListener('submit', handleSubmitAddForm)

buttonAddTodo.addEventListener('click', handleClickButtonAddTodo)
buttonDeleteAllElement.addEventListener('click', handleClickDeleteAll)

blockList1Element.addEventListener('click', handleClickBlock)
blockList2Element.addEventListener('click', handleClickBlock)
blockList3Element.addEventListener('click', handleClickBlock)

blockList1Element.addEventListener('change', handleChangeSelectProgress)
blockList2Element.addEventListener('change', handleChangeSelectProgress)
blockList3Element.addEventListener('change', handleChangeSelectProgress)

block1TopElement.addEventListener('change', handleChangeSelectSort)
block2TopElement.addEventListener('change', handleChangeSelectSort)
block3TopElement.addEventListener('change', handleChangeSelectSort)


// ------ Сохраняем задачи в Local Storage перед тем, как покинуть страницу ---------

function handleBeforeunload () {
   localStorage.setItem('todos', JSON.stringify(todos))
   localStorage.setItem('todos2', JSON.stringify(todos2))
   localStorage.setItem('todos3', JSON.stringify(todos3))
}

// ------ Забираем данные из Local Storage во время загрузки страницы ----------

function handleDOMLoadedStorage () {
   const getFromLocalStorage = (name) => {
      return JSON.parse(localStorage.getItem(name))
   }

   todos = getFromLocalStorage('todos') ?? []
   todos2 = getFromLocalStorage('todos2') ?? []
   todos3 = getFromLocalStorage('todos3') ?? []

   renderAll()
}

// ------ Стягиваем данные о пользователях с JSON Placeholder, помещаем в массив users, заполняем селекты --------

async function handleDomLoadedUsers() {
   const response = await fetch('https://jsonplaceholder.typicode.com/users')
   const data = await response.json()

   users = data.map((item) => item.username)
   fillSelectNames()
}

// ------- Обрабатываем 'submit' формы по добавлению todo в массив, запускаем отрисовщик --------

function handleSubmitAddForm (event) {
   event.preventDefault()

   const title = inputTitleAddElement.value
   const description = inputDescriptionAddElement.value
   const name = selectNameAddElement.value
   const priority = selectPriorityElement.value

   todos.push(new Todo(title, description, name, priority))
   
   formAddElement.reset()
   render(1, todos)
}

// ------- Очищаем форму добавления todo при каждом её открытии  ---------

function handleClickButtonAddTodo () {
   formAddElement.reset()
}

// ------- Обрабатываем событие 'click' на каждом из 3-х блоков с todo  ---------

function handleClickBlock (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const role = target.dataset.role

   const todoElement = target.closest('.block__item')
   const id = todoElement.id
   const arr = (curTarget.id == 'list1') ? todos : (curTarget.id == 'list2') ? todos2 : todos3 

   // ---- Если роль кнопки 'remove' - находим todo в соотв-м массиве по id и удаляем ----
   if (role == 'removeTodo') {
      arr.forEach((todo, index) => {
         if (todo.id == id) {
            arr.splice(index, 1)
            renderAll()
         }
      })
   }

   // ---- Если роль 'edit' - заполняем форму данными из todo, затем по кнопке 'Edit' перезаписываем новые сведения ----
   if (role == 'editTodo') {
      fillEditFormAccordingTodo(arr, id)

      buttonEditModalElement.onclick = function () {
         arr.forEach((todo) => {
            if (todo.id == id) {
               todo.title = inputEditElement.value
               todo.description = textareaEditElement.value
               todo.user = selectNameEditElement.value
               todo.priority = selectPriorityEditElement.value
            }
         })        
         renderAll()
      }
   }
}

// ------- Обрабатываем событие 'change' в селекте по перемещению todo в другой блок ---------

function handleChangeSelectProgress (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const value = target.value

   // ----- Если выбирается перемещение в блок, в котором элемент и так находится, остановить выполнение функции ----
   if (curTarget.id[4] == value) return 0

   // ----- В 'In Progress' больше 3-х todo не добавлять, показать модальное окно ----
   if (value == 2 && todos2.length >= 3) {   
      const myModal = new bootstrap.Modal(document.getElementById('only6Modal'))
      myModal.show()
      return 0
   }

   // ----- Удаляем 'todo' из текущего массива (находим по id) и пушим в нужный ----
   const todoElement = target.closest('.block__item')
   const id = todoElement.id

   const arrCurrent = (curTarget.id == 'list1') ? todos : (curTarget.id == 'list2') ? todos2 : todos3
   const arrDestination = (value == 2) ? todos2 : (value == 3) ? todos3 : todos            

   arrCurrent.forEach((todo, index) => {
      if (todo.id == id) {
         arrDestination.push(arrCurrent.slice(index, index + 1)[0])
         arrCurrent.splice(index, 1)
         renderAll()
      }
   })  
}

// ------- Удаляем все todo из 3-го блока по клику на соотв-ю кнопку в модальном окне ------

function handleClickDeleteAll () {
   todos3.length = 0
   render(3, todos3)
}

// ------- Сортируем todo в каждом отдельном блоке (исходя из выбора селекта) ------

function handleChangeSelectSort (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const value = target.value
   
   const arr = (curTarget.id == 'block1Top') ? todos : (curTarget.id == 'block2Top') ? todos2 : todos3

   if (value == 1) {
      arr.sort((a, b) => b.id - a.id)  // ----- Сортирует по принципу 'сначала новые' ---- 
   } else if (value == 2 || value == 5) {
      arr.sort((a, b) => a.id - b.id)  // ----- Сортирует по принципу 'сначала старые' ----
   } else if (value == 3) {
      arr.sort((a, b) => (b.user < a.user) ? 1 : -1)  // ---- Сортирует по имени исполнителя ----
   } else if (value == 4) {
      arr.sort((a, b) => (a.priority > b.priority) ? 1 : -1) // ---- Сортирует по приоритету ----
   }
   renderAll()  
}

// ------- Функция очищает содержимое блока перед рендером. Передается номер блока (от 1 до 3) ------

function cleanContainerHTML (block) {
   if (block == 1) {
      blockList1Element.innerHTML = '' 
   } else if (block == 2) {
      blockList2Element.innerHTML = ''
   } else {
      blockList3Element.innerHTML = '' 
   }
}

// ------- Функция заполняет селекты (их 2), содержащие имена юзеров, исходя из массива users ------

function fillSelectNames () {
   for (let select of selectNamesElements) {
      users.forEach((name) => select.innerHTML += `<option value=${name}>${name}</option>`)
   }
}

// ------- Функция заполняет форму 'Edit' данными из изменяемой todo ------

function fillEditFormAccordingTodo(arr, id) {
   arr.forEach((todo) => {
      if (todo.id == id) {
         inputEditElement.value = todo.title
         textareaEditElement.value = todo.description
         selectPriorityEditElement.value = todo.priority
         selectNameEditElement.value = todo.user
      }
   })
}

// ------- Функция записывает в хэдер блока сведения о количестве todo. Передается номер блока (от 1 до 3) и соотв-й массив ------

function fillCounter (block, arr) {
   const counterElement = $(`.block${block}__top-counter`)
   counterElement.innerHTML = arr.length
}

// ------- Рендер отдельного блока. Передается номер блока (от 1 до 3) и соотв-й массив ------

function render(block, arr) {
   cleanContainerHTML(block)
   fillCounter(block, arr)

   arr.forEach((todo) => {
      if (block == 1) {
         blockList1Element.innerHTML += createTemplateTodo(todo, 1) 
      }  else if (block == 2) {
         blockList2Element.innerHTML += createTemplateTodo(todo, 2) 
      } else {
         blockList3Element.innerHTML += createTemplateTodo(todo, 3)
      } 
   })
}

// ------- Рендер всех блоков одновременно ------

function renderAll () {
   render(1, todos)
   render(2, todos2)
   render(3, todos3)
}
