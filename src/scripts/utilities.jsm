export function listenOnce(object, event) {
	return new Promise(resolve => {
		try {
			object.addEventListener(event, resolve);
		} finally {
			object.removeEventListener(event, resolve);
		}
	})
}

export function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
