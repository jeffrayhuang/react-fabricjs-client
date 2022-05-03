import { fabric } from 'fabric';
import { FabricGroup, FabricObject, FabricObjectOption, toObject } from '../utils';

export type LightObject = (FabricGroup | FabricObject) & {
	loadSvg(option: LightOption): Promise<LightObject>;
	setFill(value: string): LightObject;
	setStroke(value: string): LightObject;
};

export interface LightOption extends FabricObjectOption {
	svg?: string;
	loadType?: 'file' | 'svg';
}

const Light = fabric.util.createClass(fabric.Group, {
	type: 'svg',
	onFlag: true,
	initialize(option: LightOption = {}) {
		this.callSuper('initialize', [], option);
		this.loadSvg(option);
	},
	addSvgElements(objects: FabricObject[], options: any, path: string) {
		const createdObj = fabric.util.groupSVGElements(objects, options, path) as LightObject;
		this.set(options);
		if (createdObj.getObjects) {
			(createdObj as FabricGroup).getObjects().forEach(obj => {
				this.add(obj);
				if (options.fill) {
					obj.set('fill', options.fill);
				}
				if (options.stroke) {
					obj.set('stroke', options.stroke);
				}
			});
		} else {
			createdObj.set({
				originX: 'center',
				originY: 'center',
			});
			if (options.fill) {
				createdObj.set({
					fill: options.fill,
				});
			}
			if (options.stroke) {
				createdObj.set({
					stroke: options.stroke,
				});
			}
			if (this._objects?.length) {
				(this as FabricGroup)._objects.forEach(obj => this.remove(obj));
			}
			this.add(createdObj);
		}
		this.set({
			fill: options.fill ,
			stroke: options.stroke,
		});
		this.setCoords();
		if (this.canvas) {
			this.canvas.requestRenderAll();
		}
		return this;
	},
	loadSvg(option: LightOption) {
		const { svg, loadType, fill, stroke } = option;
		return new Promise<LightObject>(resolve => {
			if (loadType === 'svg') {
				fabric.loadSVGFromString(svg, (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }, svg));
				});
			} else {
				fabric.loadSVGFromURL('./svg/light-bulb.svg', (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }, svg));
				});
			}
		});
	},
	toggleFill(){
		this.onFlag = ! this.onFlag;
		this.setFill(this.onFlag ? 'orange':'black');
	},
	setFill(value: any) {
		this.getObjects().forEach((obj: FabricObject) => obj.set('fill', value));
		return this;
	},
	setStroke(value: any) {
		this.getObjects().forEach((obj: FabricObject) => obj.set('stroke', value));
		return this;
	},
	toObject(propertiesToInclude: string[]) {
		return toObject(this, propertiesToInclude, {
			svg: this.get('svg'),
			loadType: this.get('loadType'),
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

Light.fromObject = (option: LightOption, callback: (obj: LightObject) => any) => {
	return callback(new Light(option));
};

// @ts-ignore
window.fabric.light = Light;

export default Light;
