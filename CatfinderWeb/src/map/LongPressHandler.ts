import { h, render } from 'vue'
import CatUploadComponent from '@/components/CatUploadComponent.vue'
import MapView from "@arcgis/core/Views/MapView"
import Point from '@arcgis/core/geometry/Point';

export class LongPressHandler {
	private catUploadApp: any = null;
	private catUploadAppContainer: HTMLDivElement | null = null;
	private longPressTimer: number | null = null;
	private isLongPress: boolean = false;
	private menuVisible: boolean = false;
	private readonly LONG_PRESS_DURATION = 1000; // 长按持续时间设置为 1000ms

	constructor(private mapView: MapView) {}

	initLongPressEvent() {
		this.mapView.on("pointer-down", this.handlePointerDown.bind(this));
		this.mapView.on("pointer-up", this.handlePointerUp.bind(this));
		this.mapView.on("drag", this.handleDrag.bind(this));
		this.mapView.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
		this.mapView.container.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
		this.mapView.container.addEventListener("click", this.handleClick.bind(this));
	}

	private handlePointerDown(event: any) {
		this.isLongPress = false;
		this.longPressTimer = window.setTimeout(() => {
			this.isLongPress = true;
			const {x, y} = event;
			this.showCatUploadMenu(x, y, this.mapView.toMap(event));
		}, this.LONG_PRESS_DURATION);
	}

	private handlePointerUp(event: any) {
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
		this.isLongPress = false;
	}

	private handleDrag() {
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
		this.isLongPress = false;
		this.handleClick();
	}

	private handleMouseDown(event: MouseEvent) {
		if (event.button === 2) {  // 右键
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	}

	private handleTouchStart(event: TouchEvent) {
		if (event.touches.length > 1) {  // 多点触控
			event.preventDefault();
		}
	}

	private handleClick() {
		if (this.menuVisible) {
			this.catUploadApp?.exposed?.hideMenu();
			this.menuVisible = false;
		}
	}

	private showCatUploadMenu(x:number, y: number,p: Point) {
		if (!this.catUploadApp) {
			this.createCatUploadApp();
		}
		
		const { menuX, menuY } = this.calculateMenuPosition(x, y);
		this.catUploadApp?.exposed?.showMenu({ clientX: menuX, clientY: menuY, point: p });
		this.menuVisible = true;
	}

	private createCatUploadApp() {
		const vnode = h(CatUploadComponent, {
			onClose: () => {
				render(null, this.catUploadAppContainer!);
				document.body.removeChild(this.catUploadAppContainer!);
				this.catUploadApp = null;
			}
		});
		this.catUploadAppContainer = document.createElement('div');
		document.body.appendChild(this.catUploadAppContainer);
		render(vnode, this.catUploadAppContainer);
		this.catUploadApp = vnode.component;
	}

	private calculateMenuPosition(x: number, y: number) {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		
		const menuWidth = 200;
		const menuHeight = 80;
		
		let menuX = x;
		if (x + menuWidth > viewportWidth) {
			menuX = viewportWidth - menuWidth;
		}
		
		let menuY = y;
		if (y + menuHeight > viewportHeight) {
			menuY = viewportHeight - menuHeight;
		}
		
		menuY = Math.max(0, menuY);
		
		return { menuX, menuY };
	}

	destroy() {
		this.mapView.container.removeEventListener("mousedown", this.handleMouseDown);
		this.mapView.container.removeEventListener("touchstart", this.handleTouchStart);
		this.mapView.container.removeEventListener("click", this.handleClick);
		// 移除其他事件监听器...
	}
}
