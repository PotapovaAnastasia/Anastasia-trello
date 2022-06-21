import { getRightTimeFormat } from './clock.js'

// ---- Шаблон создания todo. Передается объект свойств todo, а также номер блока (от 1 до 3) для определения цвета фона todo

function createTemplateTodo({ title, description, user, date, id, priority }, block) {
   const color = (block == 1) ? '#ead3f3b3' : (block == 2) ? '#ebe2e2c2' : '#dfffe2b3'
   const star = '<i class="fa-solid fa-star"></i>'
   const priorityStars = (priority == 1) ? (star + star + star) : (priority == 2) ? (star + star) : star

   return `
      <div class="block__todo block__item" style="background-color: ${color};" id="${id}"> 
         <div class="block__row">
            <div class="block__todo-top">
               <div class="block__todo-select">
                  <select class="form-select">
                     <option selected>Progress</option>
                     <option value="1">Todo</option>
                     <option value="2">In progress</option>
                     <option value="3">Done</option>
                  </select>
               </div>

               <button class="block__todo-button button-edit" type="button" data-bs-toggle="modal" data-bs-target="#edditModal" data-role="editTodo">Edit</button>
               <button class="block__todo-button button-delete" data-role="removeTodo">Delete</button>
            </div>

            <div class="block__todo-priority" id="priority">${priorityStars}</div>
            <div class="block__todo-title">${title}</div>
            <div class="block__todo-text">${description}</div>
         </div>

         <div class="block__todo-bottom">
            <div class="block__todo-user">${user}</div>
            <div class="block__todo-time">${date}</div>
         </div>

      </div>
   `
}

// --- Конструктор todo ---

class Todo {
   constructor (title, description, user, priority) {
      this.title = title
      this.description = description
      this.user = user
      this.priority = priority
      this.createdAt = new Date()
      this.id = this.createdAt.getTime()
      this.date = getDateInfo()
   }
}

// --- Получаем время и дату в привычном формате

function getDateInfo() {
   const createdAt = new Date()
   const hours = createdAt.getHours()
   const minutes = getRightTimeFormat(createdAt.getMinutes())
   const day = getRightTimeFormat(createdAt.getDate())
   const month = getRightTimeFormat(createdAt.getMonth() + 1)
   const year = createdAt.getFullYear()

   return `${hours}:${minutes}  ${day}.${month}.${year}`
}

export { createTemplateTodo, Todo }