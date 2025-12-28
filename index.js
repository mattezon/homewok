import { getData, postData, patchData, deleteData } from './apiRequests.js'
import { displayData } from './domActions/displayData.js'
import { API_URL } from './config.js'
import { formatTime } from './utils.js'

// INPUTS
const NEW_DATA_INPUT = document.querySelector('.new-data')
const PATCH_ID_INPUT = document.querySelector('.patch-id-input')
const PATCH_DATA_INPUT = document.querySelector('.patch-data-input')
const DELETE_ID_INPUT = document.querySelector('.delete-id-input')

// BUTTONS
const GET_DATA_BTN = document.querySelector('.get-data-btn')
const ADD_DATA_BTN = document.querySelector('.add-data-btn')
const PATCH_DATA_BTN = document.querySelector('.patch-data-btn')
const DELETE_DATA_BTN = document.querySelector('.delete-data-btn')
const GET_PRODUCTS_BTN = document.querySelector('.get-products-btn')
const STOP_TIMER_BTN = document.querySelector('.stop-timer-btn')

// FLAGS
let timerRunning = true  // флаг: идёт ли таймер


// CONTAINERS
const CONTAINER = document.querySelector('.container')
const PRODUCTS = document.querySelector('.products')

// PRODUCTS
let PRODUCTS_DATA = null
let interval = null

// FUNCTIONS:HANDLERS
const getDataHandler = async () => {
	return await getData(`${API_URL}/posts`)
}

const postDataHandler = async () => {
	const inputData = NEW_DATA_INPUT.value.split(' ')
	const data = {
		id: inputData[0],
		title: inputData[1],
		views: +inputData[2]
	}
	const result = await postData(`${API_URL}/posts`, data)
	return result
}

const patchDataHandler = async () => {
	const inputData = PATCH_DATA_INPUT.value.split(' ')
	const data = {
		title: inputData[0],
		views: +inputData[1]
	}
	const postId = PATCH_ID_INPUT.value

	const result = await patchData(`${API_URL}/posts`, postId, data)
	return result
}

const deleteDataHandler = async () => {
	const postId = DELETE_ID_INPUT.value

	const result = await deleteData(`${API_URL}/posts`, postId)
	return result
}

const getProductsHandler = async id => {
	if (id) return getData(`${API_URL}/products/${id}`)
	return await getData(`${API_URL}/products`)
}

// FUNCTIONS:TIMERS
const updateProductTimersInDOM = () => {
	if (!PRODUCTS_DATA) return

	const timerElements = document.querySelectorAll('.product-timer')

	timerElements.forEach((timerElement, index) => {
		if (PRODUCTS_DATA[index]) {
			const timeLeft = PRODUCTS_DATA[index].discountTime
			timerElement.textContent = formatTime(timeLeft)
		}
	})
}

const discountTimer = () => {
  if (interval) clearInterval(interval)

  interval = setInterval(async () => {
    if (!timerRunning) return  // если остановлен — ничего не делаем

    try {
      PRODUCTS_DATA = await getProductsHandler()

      const updatePromises = PRODUCTS_DATA.map(async (product) => {
        let newTime = product.discountTime - 2

        // Ограничение: не меньше 0
        if (newTime < 0) newTime = 0

        // Если стало 0 → отправляем null в БД
        const patchValue = newTime === 0 ? null : newTime

        const result = await patchData(`${API_URL}/products`, product.id, {
          discountTime: patchValue
        })

        product.discountTime = newTime  // обновляем локально

        return result
      })

      await Promise.all(updatePromises)

      updateProductTimersInDOM()
    } catch (error) {
      alert('Ошибка при обновлении времени скидки')
      clearInterval(interval)
      return
    }
  }, 2000)
}

// LISTENERS
GET_DATA_BTN.addEventListener('click', async () => {
	const result = await getDataHandler()
	console.log(result)
	if (result) displayData(result, 'posts', CONTAINER)
})

STOP_TIMER_BTN.addEventListener('click', () => {
  timerRunning = false
  clearInterval(interval)
  alert('Таймер остановлен.')
})


ADD_DATA_BTN.addEventListener('click', async () => {
	const result = await postDataHandler()
	console.log(result)
})

PATCH_DATA_BTN.addEventListener('click', async () => {
	const result = await patchDataHandler()
	console.log(result)
})

DELETE_DATA_BTN.addEventListener('click', async () => {
	const result = await deleteDataHandler()
	console.log(result)
})

GET_PRODUCTS_BTN.addEventListener('click', async () => {
  PRODUCTS_DATA = await getProductsHandler()
  if (PRODUCTS_DATA) {
    displayData(PRODUCTS_DATA, 'products', PRODUCTS)
    timerRunning = true  // запускаем таймер
    discountTimer()
  }
})


// товар
// таймер - каждый раз обновляет время (отправляет запрос и меняет его (время) визуально в DOM
// при отображении преобразовываем из формата ss -> hh:mm:ss
