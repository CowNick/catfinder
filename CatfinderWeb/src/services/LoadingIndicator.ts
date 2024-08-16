import { useLoading, type ActiveLoader } from 'vue-loading-overlay'

class LoadingIndicator
{
	activeLoading? : ActiveLoader;
	loadingIndicator = useLoading({
			isFullPage: true,
			loader: 'dots'
		});

	show()
	{
		if (!this.activeLoading)
		{
			this.activeLoading = this.loadingIndicator.show();
		}
	}

	hide()
	{
		if (!this.activeLoading)
		{
			return;
		}

		setTimeout(() => {
			this.activeLoading?.hide();
		}, 1000);
	}
}

const loadingIndicator = new LoadingIndicator()
export { loadingIndicator }
