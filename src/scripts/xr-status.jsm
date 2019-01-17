export const XRStatus = new (class {
	constructor() {
		this.el = document.body.querySelector('.xr-status');
		this._status = "unchecked";
	}
	get status() {
		return this._status;
	}
	set status(newVal) {
		this.el.classList.remove('available', 'unchecked', 'unsupported', 'pre-loading');
		this.el.classList.add(newVal);
	}
	// Once XR is available, this button will
	async xr_enterred() {
		if (this.status != "available") {
			throw new Error("Please wait until XR is available before asking when XR has been enterred.");
		}
		const enter_button = this.el.querySelector('button');
		await listenOnce(enter_button, 'click');
	}
})();
