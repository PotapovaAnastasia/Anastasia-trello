import { $, $$ } from './helper.js'
import { handleDOMLoadedClock } from './clock.js'
import { createTemplateTodo, Todo } from './create-todo.js'

let users = []
let todos = []
let todos2 = []
let todos3 = []

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

function handleBeforeunload () {
   localStorage.setItem('todos', JSON.stringify(todos))
   localStorage.setItem('todos2', JSON.stringify(todos2))
   localStorage.setItem('todos3', JSON.stringify(todos3))
}

function handleDOMLoadedStorage () {
   const getFromLocalStorage = (name) => {
      return JSON.parse(localStorage.getItem(name))
   }

   todos = getFromLocalStorage('todos') ?? []
   todos2 = getFromLocalStorage('todos2') ?? []
   todos3 = getFromLocalStorage('todos3') ?? []

   renderAll()
}

async function handleDomLoadedUsers() {
   const response = await fetch('https://jsonplaceholder.typicode.com/users')
   const data = await response.json()

   users = data.map(item => item.username)
   fillSelectNames()
}

function handleSubmitAddForm (event) {
   event.preventDefault()

   const title = inputTitleAddElement.value
   const description = inputDescriptionAddElement.value
   const name = selectNameAddElement.value

   todos.push(new Todo(title, description, name))
   
   formAddElement.reset()
   render(1, todos)
}

function handleClickButtonAddTodo () {
   formAddElement.reset()
}

function handleClickBlock (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const role = target.dataset.role

   const todoElement = target.closest('.block__item')
   const id = todoElement.id

   const arr = (curTarget.id == 'list1') ? todos : (curTarget.id == 'list2') ? todos2 : todos3 

   if (role == 'removeTodo') {
      arr.forEach((item, index) => {
         if (item.id == id) {
            arr.splice(index, 1)
            renderAll()
         }
      })
   }

   if (role == 'editTodo') {
      const optionsElement = [...selectNameEditElement.querySelectorAll('option')]
      optionsElement.forEach(item => item.removeAttribute('selected'))
      
      arr.forEach((item) => {
         if (item.id == id) {
            inputEditElement.value = item.title
            textareaEditElement.value = item.description
            
            users.forEach((elem, index) => {
               if (elem == item.user) {
                  optionsElement[index + 1].setAttribute('selected', 'selected')
               }
            })
         }
      })

      buttonEditModalElement.onclick = function () {
         arr.forEach((item) => {
            if (item.id == id) {
               item.title = inputEditElement.value
               item.description = textareaEditElement.value
               item.user = selectNameEditElement.value
            }
         })
         renderAll()
      }
   }
}

function handleChangeSelectProgress (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const value = target.value 
    
   if (target.tagName == 'SELECT') {    
      if (curTarget.id[4] == value) return 0   // Если выбирается перемещение в блок, в котором элемент и так находится, ничего не происходит
      
      if (value == 2 && todos2.length >= 3) {   // В In Progress > 6 не добавлять, показать модальное окно
         const myModal = new bootstrap.Modal(document.getElementById('only6Modal'))
         myModal.show()
         return 0
      }

      const todoElement = target.closest('.block__item')
      const id = todoElement.id
      const arr = (curTarget.id == 'list1') ? todos : (curTarget.id == 'list2') ? todos2 : todos3            

      arr.forEach((item, index) => {
         if (item.id == id) {
            (value == 2) ? todos2 = [...todos2, ...arr.slice(index, index + 1)] :
               (value == 3) ? todos3 = [...todos3, ...arr.slice(index, index + 1)] :
                  todos = [...todos, ...arr.slice(index, index + 1)]
            arr.splice(index, 1)
            renderAll()
         }
      })
   }
}

function handleClickDeleteAll () {
   todos3.length = 0
   render(3, todos3)
}

function handleChangeSelectSort (event) {
   const target = event.target
   const curTarget = event.currentTarget
   const value = target.value

   if (target.tagName == 'SELECT') {
      const arr = (curTarget.id == 'block1Top') ? todos : (curTarget.id == 'block2Top') ? todos2 : todos3

      if (arr.length && value == 1) {
         arr.sort((a, b) => b.id - a.id) 
      } else if (arr.length && value == 2) {
         arr.sort((a, b) => a.id - b.id)
      } else if (arr.length && value == 3) {
         arr.sort((a, b) => (b.user < a.user) ? 1 : -1)
      }
      renderAll()
   }
}

function cleanContainerHTML (block) {
   block == 1 ? blockList1Element.innerHTML = '' 
      : block == 2 ? blockList2Element.innerHTML = '' 
      : blockList3Element.innerHTML = ''
}

function fillSelectNames () {
   for (let item of selectNamesElements) {
      users.forEach(elem => item.innerHTML += `<option value=${elem}>${elem}</option>`)
   }
}

function render(block, arr) {
   cleanContainerHTML(block)
   fillCounter(block, arr)

   arr.forEach(item => {
      block == 1 ? blockList1Element.innerHTML += createTemplateTodo(item, 1) 
         : block == 2 ? blockList2Element.innerHTML += createTemplateTodo(item, 2) 
         : blockList3Element.innerHTML += createTemplateTodo(item, 3)
   })
}

function fillCounter (block, arr) {
   const counterElement = $(`.block${block}__top-counter`)
   counterElement.innerHTML = arr.length
}

function renderAll () {
   render(1, todos)
   render(2, todos2)
   render(3, todos3)
}
