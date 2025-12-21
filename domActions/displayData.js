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
	} else if (type === 'comments') {
		// ...
	}
}
