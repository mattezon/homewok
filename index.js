import { getData, postData, patchData, deleteData } from './apiRequests.js'
import { displayData } from './domActions/displayData.js'
import { API_URL } from './config.js'

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

// CONTAINERS
const CONTAINER = document.querySelector('.container')

// FUNCTIONS:HANDLERS
const getDataHandler = async () => {
	return await getData(`${API_URL}/posts`)
}

const postDataHandler = async () => {
	if(NEW_DATA_INPUT.value == ""){return 'er'}
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
	if(PATCH_DATA_INPUT.value == "" || PATCH_ID_INPUT.value == ""){return "er"} 
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
	if(DELETE_ID_INPUT.value == ""){return 'er'}
	const postId = DELETE_ID_INPUT.value

	const result = await deleteData(`${API_URL}/posts`, postId)
	return result
}

// LISTENERS

GET_DATA_BTN.addEventListener('click', async () => {
	const result = await getDataHandler()
	console.log(result)
	if (result) displayData(result, 'posts', CONTAINER)
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
