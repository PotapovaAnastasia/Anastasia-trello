import { $ } from './helper.js'

// --- Реализует часы в хэдере приложения

function handleDOMLoadedClock() {
   const hoursClockElement = $('.header__time-hours')
   const minutsClockElement = $('.header__time-minuts')

   setInterval(() => {
      const time = new Date()
      const hours = time.getHours()
      const minuts = time.getMinutes()

      hoursClockElement.innerHTML = getRightTimeFormat(hours)
      minutsClockElement.innerHTML = getRightTimeFormat(minuts)
   }, 1000)
}

// --- Преобразовываем время/дату, если это необходимо. Н-р: 2.6.2022 -> 02.06.2022

function getRightTimeFormat(time) {
   return (time > 9) ? time : ('0' + time)
}

export { handleDOMLoadedClock, getRightTimeFormat }