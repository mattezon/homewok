import { formatTime } from '../utils.js'

export const displayData = (data, type, container) => {
	if (type === 'posts') {
		data.forEach(post => {
			const element = document.createElement('div')
			element.classList.add('post')
			element.innerHTML = `
				<span>${post.id}</span>
				<span>${post.title}</span>
				<span>${post.views}</span>
			`
			container.appendChild(element)
		})
	} else if (type === 'products') {
		if (Array.isArray(data)) {
			data.forEach(product => {
				const element = document.createElement('li')
				element.classList.add('product')
				element.innerHTML = `
				<img src="${product.img}" alt="product-img" />
				<span>${product.id}</span>
				<span>${product.title}</span>
				<span>${product.price}$</span>
				<span class="product-timer">${formatTime(product.discountTime)}</span>
			`

				container.appendChild(element)
			})
		}
	}
}
