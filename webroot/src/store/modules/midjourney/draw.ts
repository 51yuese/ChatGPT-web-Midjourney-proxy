import paper from 'paper'
import checkerboard from '@/assets/images/checkerboard.png'
export const ce = new paper.PaperScope()
type PaperToolEvent = paper.ToolEvent & { event: MouseEvent | TouchEvent }

export class MjPaper {
	width = 1024
	height = 700
	canvas: HTMLCanvasElement
	backgroundImageElement: HTMLImageElement
	toolbar: HTMLDivElement
	checkerboardImage: paper.Raster
	backgroundImage: paper.Raster
	drawingLayer: paper.Group
	undoLayer: paper.Group
	redoLayer: paper.Group
	tool: Tool
	selectedTool: 0 | 0.5 = 0
	movePath = true
	removeCmd = 'Remove-'
	currentPath: paper.Path | null = null
	constructor(canvas: HTMLCanvasElement, img: HTMLImageElement) {
		this.backgroundImageElement = img
		this.tool = new Tool(this)
		this.width = img.width;
		this.height = img.height;
		this.canvas = canvas;
		ce.setup(this.canvas);
		ce.project.activeLayer.name = 'EditorWorkspace'
		this.checkerboardImage = new ce.Raster(checkerboard)
		this.checkerboardImage.name = 'CheckerboardImage'
		this.checkerboardImage.position = new ce.Point(0, 0)
		this.checkerboardImage.strokeWidth = 0
		this.checkerboardImage.scale(Math.max(this.width, this.height) / 1024)

		this.drawingLayer = new ce.Group({
			name: 'Drawing',
			blendMode: 'destination-atop',
		})
		this.undoLayer = new ce.Group({
			name: 'Undo',
			visible: false,
		})
		this.redoLayer = new ce.Group({
			name: 'Redo',
			visible: false,
		})

		ce.project.activeLayer.addChildren([
			new ce.Group({
				name: 'CheckerboardCompositingGroup',
				children: [this.checkerboardImage, this.drawingLayer],
				blendMode: 'source-over',
				opacity: 0.4,
			}),
			this.undoLayer,
		])
		ce.project.activeLayer.addChild(this.redoLayer)

		ce.view.onFrame = () => {
			this.checkerboardImage.visible = false
			for (let i = 0; i < this.drawingLayer.children.length; i++) {
				if (this.drawingLayer.children[i].bounds.area > 0) {
					this.checkerboardImage.visible = true
					break
				}
			}
		}
		ce.view.onResize = this.onResize.bind(this)
		this.toolbar = document.getElementById('appbody') as HTMLDivElement
		this.onResize()
		this.backgroundImage = new ce.Raster(img)
		this.backgroundImage.name = 'BackgroundImage'
		this.backgroundImage.position = new ce.Point(0, 0)
		this.backgroundImage.strokeWidth = 0
		this.backgroundImage.insertBelow(this.drawingLayer.parent)
		this.canvas.setAttribute('oncontextmenu', 'return false;')
		ce.settings.handleSize = 0
	}

	public updateTool = (mode: 0 | 0.5) => {
	   this.selectedTool = mode;
	}

	public undo() {
		this.processDoCommand(this.drawingLayer, this.undoLayer, this.redoLayer)
	}

	public destroy() {
		this.drawingLayer.remove();
		this.undoLayer.remove();
		this.redoLayer.remove();
		this.canvas.remove();
		(ce as any).clear();
	}

	public submit() {
		const childLen = this.drawingLayer.children.length;
		const drawChild = this.drawingLayer.children

		if (!childLen) {
			return Promise.reject('请至少绘制一个区域',)
		}

		let areas = 0

		for (let i = 0; i < childLen; i++) {
			const child = drawChild[i]
			!child.name.includes('Image')
			&& (areas += child.bounds.width * child.bounds.height)
		}

		if (areas < 1e4) {
			return Promise.reject("绘制区域过小")
		}

		const viewWidth = ce.view.viewSize.width
		const viewHeight = ce.view.viewSize.height
		this.tool.clearSelection()
		ce.project.activeLayer.selected = false
		this.currentPath && (this.currentPath.bounds.selected = false)
		const Z = this.drawingLayer.parent.opacity
		this.drawingLayer.parent.opacity = 1
		this.drawingLayer.blendMode = 'normal'
		this.checkerboardImage.visible = false
		this.onResize({
			canonicalSpace: true,
		})
		const selectRegions = new ce.Path.Rectangle(ce.view.bounds)
		selectRegions.fillColor = new ce.Color('#fff')
		selectRegions.sendToBack()
		for (let i = 0; i < childLen; i++) {
			const child = drawChild[i]
			!child.name.includes('Image') && (child.visible = true)
		}
		const occluders = []
		const bgImg = this.backgroundImage
		if (bgImg.name && bgImg.visible && bgImg.name.includes('Image')) {
			const ye = new ce.Path.Rectangle(bgImg.bounds)
			ye.fillColor = new ce.Color('#000')
			ye.insertAbove(bgImg)
			ye.name = 'Occluder'
			occluders.push(ye)
		}
		this.tool.clearSelection()
		ce.project.activeLayer.selected = false
		this.currentPath && (this.currentPath.bounds.selected = false)
		this.onResize({
			canonicalSpace: true,
		})
		ce.view.update()
		this.tool.clearSelection()
		ce.project.activeLayer.selected = false
		this.currentPath && (this.currentPath.bounds.selected = !1)
		this.onResize({
			canonicalSpace: true,
		})
		const ctx = (ce.view as any).getContext()
		const imgData = ctx.getImageData(
			0,
			0,
			this.canvas.width / window.devicePixelRatio,
			this.canvas.height / window.devicePixelRatio,
		)
		const clampe = imgData.data
		for (let i = 0; i < clampe.length; i += 4) {
			clampe[i + 0] = clampe[i + 0] > 128 ? 255 : 0
			clampe[i + 1] = clampe[i + 1] > 128 ? 255 : 0
			clampe[i + 2] = clampe[i + 2] > 128 ? 255 : 0
			clampe[i + 3] = 255
		}
		ctx.putImageData(imgData, 0, 0)
		const base64 = this.canvas.toDataURL('image/webp', 1)
		for (let i = 0; i < occluders.length; i++) {
			occluders[i].remove()
			selectRegions.remove()
			ce.view.viewSize.set(viewWidth, viewHeight)
			ce.view.update()
			this.onResize()
			this.drawingLayer.parent.opacity = Z
			this.drawingLayer.blendMode = 'destination-atop'
			this.checkerboardImage.visible = true
		}
		const base64Str = base64.split(',')[1];

		return Promise.resolve(base64Str)
	}

	public processDoCommand(a: paper.Group, h: paper.Group, p: paper.Group) {
		const d = h.lastChild
		if (d) {
			if (d.name && d.name.startsWith(this.removeCmd)) {
				const M = d.name.substring(this.removeCmd.length)
				const F = a.getItem({
					match: (Z: paper.Item) => Z.name === M,
				})
				p.addChild(F)
				d.remove()
			}
			else {
				const M = a.getItem({
					match: (F: paper.Item) => F.name === d.name,
				})
				if (M) {
					const F = M.clone()
					F.name = M.name
					p.addChild(F)
					M.replaceWith(d)
				}
				else {
					a.addChild(d)
					p.addChild(
						new ce.Group({
							name: this.removeCmd + d.name,
						}),
					)
				}
			}
		}
	}

	public onResize(e?: { canonicalSpace?: boolean }) {
		let h = 0
		if (e && e.canonicalSpace) {
			ce.view.viewSize.set(
				this.width / window.devicePixelRatio,
				this.height / window.devicePixelRatio,
			)
			ce.view.zoom = 1 / window.devicePixelRatio
		}
		else {
			const d = this.toolbar.getBoundingClientRect().height * 1.75
			h = d
			const M = this.canvas.width / window.devicePixelRatio
			const F = this.canvas.height / window.devicePixelRatio
			ce.view.zoom = Math.max(
				0.01,
				Math.min(M / this.width, (F - d) / this.height) * 0.95,
			)
		}
		ce.view.translate(
			new ce.Point(
				ce.view.center.x,
				ce.view.center.y - (h * 0.5) / ce.view.zoom,
			),
		),
			ce.view.update()
	}
}

class Tool extends EventTarget {
	editor: MjPaper
	tool: paper.Tool
	lastTolerance = 5
	button: number | null = null
	minDistance = 0
	markForSave = false
	currentSegment: any
	currentPath: | (paper.Path & { isRectangle?: boolean, isStroke?: boolean }) | null = null

	selectionRectPath: paper.Path | null = null
	selectedSegments: paper.Segment[] = []

	constructor(ur: MjPaper) {
		super()
		this.tool = new ce.Tool()
		this.editor = ur
		this.tool.onMouseDown = this.onMouseDown.bind(this)
		this.tool.onMouseDrag = this.onMouseDrag.bind(this)
		this.tool.onMouseMove = this.onMouseMove.bind(this)
		this.tool.onMouseUp = this.onMouseUp.bind(this)
	}

	private hitTestActiveLayer(point: paper.Point) {
		return ce.project.hitTest(point, {
			segments: true,
			stroke: true,
			fill: true,
			tolerance: this.lastTolerance,
			match: (h: paper.HitResult) =>
				h.item.layer === ce.project.activeLayer
				&& !h.item.name.includes('Background')
				&& !h.item.name.includes('Checkerboard'),
		})
	}

	onMouseDown(e: PaperToolEvent) {
		this.clampToBounds(e)
		this.button
			= !(e.event as MouseEvent).button || (e.event as MouseEvent).button <= 0
			? this.editor.selectedTool
			: (e.event as MouseEvent).button
		this.minDistance = this.button === 2 ? this.lastTolerance * 2 : 0
		this.currentSegment = this.currentPath = null
		const hitResult = this.hitTestActiveLayer(e.point)
		if (!this.button || this.button <= 0) {
			this.currentPath = new ce.Path.Rectangle({
				from: e.point,
				to: e.point,
			})
			this.currentPath.strokeColor = new ce.Color('#eeeeee')
			this.currentPath.strokeColor.alpha = 1
			this.currentPath.strokeCap = 'round'
			this.currentPath.isRectangle = true
			this.currentPath.strokeWidth = 4
			this.currentPath.strokeColor = new ce.Color('rgba(255,255,255,1)')
			this.currentPath.dashArray = [10, 10]
			this.currentPath.add(e.point)
			this.editor.drawingLayer.addChild(this.currentPath)
		}
		else if (this.button === 0.5) {
			this.currentPath = new ce.Path({
				segments: [e.point],
			})
			this.currentPath.strokeWidth = 4
			this.currentPath.strokeColor = new ce.Color('rgba(255,255,255,1)')
			this.currentPath.dashArray = [10, 10]
			this.currentPath.add(e.point)
			this.currentPath.strokeCap = 'round'
			this.currentPath.isStroke = true
			this.currentPath.closed = true
			this.currentPath.fillColor = new ce.Color(1, 1, 1)
			this.editor.drawingLayer.addChild(this.currentPath)
		}
		else if (this.button === 1) {
			if (!hitResult) {
				this.selectionRectPath = new ce.Path.Rectangle({
					from: e.point,
					to: e.point,
				})
			}
			else if (this.selectedSegments.length > 0) {
				this.markForSave = true
			}
			else {
				this.currentPath = hitResult.item as paper.Path
				if (this.currentPath) {
					this.saveItemStateForUndo(hitResult.item)
					if (hitResult.type === 'stroke' || hitResult.type === 'fill') {
						if (this.editor.movePath) {
							this.currentSegment = null
						}
						else {
							const location = hitResult.location
							this.currentSegment = this.currentPath.insert(
								location.index + 1,
								e.point,
							)
							this.currentPath.smooth()
						}
					}
				}
			}
		}
		else if (hitResult && this.button === 2) {
			if (this.selectedSegments.length > 0) {
				for (let i = ce.project.selectedItems.length - 1; i >= 0; i--) {
					const item = ce.project.selectedItems[i]
					item.selected = false
					this.saveItemStateForUndo(item)
					item.remove()
				}
			}
			else {
				if (
					hitResult.type === 'stroke'
					|| hitResult.type === 'fill'
					|| hitResult.segment.path.segments.length <= 2
				) {
					this.saveItemStateForUndo(hitResult.item)
					hitResult.item.remove()
				}
				else if (hitResult.type === 'segment') {
					this.saveItemStateForUndo(hitResult.item)
					hitResult.segment.remove()
				}
			}
		}
	}

	onMouseMove(e: PaperToolEvent) {
		if ((this.clampToBounds(e), this.selectedSegments.length === 0)) {
			ce.project.activeLayer.selected = !1
			const h = this.hitTestActiveLayer(e.point)
			h
			&& ((h.item.selected = !0),
			h.item.strokeWidth
			&& (this.lastTolerance = Math.max(h.item.strokeWidth / 4, 5)))
		}
	}

	onMouseDrag(e: PaperToolEvent) {
		this.clampToBounds(e)
		if (!this.button || this.button <= 0) {
			ce.project.activeLayer.selected = false
			if (this.currentPath && this.currentPath.isRectangle) {
				const h = new ce.Path.Rectangle(e.downPoint, e.point)
				h.fillColor = new ce.Color('#fff')
				this.currentPath.replaceWith(h)
				this.currentPath.remove()
				this.currentPath = h
				this.currentPath.bounds.selected = true
				this.currentPath.isRectangle = true
			}
		}
		else if (this.button === 0.5) {
			ce.project.activeLayer.selected = false
			this.currentPath!.add(e.point)
		}
		else if (this.button === 1) {
			if (this.selectionRectPath) {
				const newPath = new ce.Path.Rectangle(e.downPoint, e.point)
				this.selectionRectPath.replaceWith(newPath)
				this.selectionRectPath.remove()
				this.selectionRectPath = newPath
				this.selectionRectPath.bounds.selected = true
				this.selectedSegments = []

				for (let i = 0; i < ce.project.selectedItems.length; i++)
					ce.project.selectedItems[i].selected = false

				const overlappingItems = this.editor.drawingLayer.getItems({
					overlapping: newPath.bounds,
				}) as paper.Path[]

				for (let i = 0; i < overlappingItems.length; i++) {
					if (overlappingItems[i].segments) {
						for (let j = 0; j < overlappingItems[i].segments.length; j++) {
							if (
								this.selectionRectPath.bounds.contains(
									overlappingItems[i].segments[j].point,
								)
							) {
								overlappingItems[i].segments[j].selected = true
								this.selectedSegments.push(overlappingItems[i].segments[j])
							}
						}
					}
				}
			}
			else if (this.selectedSegments.length > 0) {
				if (this.markForSave) {
					for (let i = ce.project.selectedItems.length - 1; i >= 0; i--)
						this.saveItemStateForUndo(ce.project.selectedItems[i])

					this.markForSave = false
				}

				for (let i = 0; i < this.selectedSegments.length; i++) {
					this.selectedSegments[i].point = this.selectedSegments[i].point.add(
						e.delta,
					)
				}
			}
			else {
				if (this.currentSegment)
					this.currentSegment.point = this.currentSegment.point.add(e.delta)
				else if (this.currentPath)
					this.currentPath.position = this.currentPath.position.add(e.delta)
			}
		}
		else if (this.button === 2) {
			const hitResult = this.hitTestActiveLayer(e.point)
			if (!hitResult)
				return
			if (
				hitResult.type === 'stroke'
				|| hitResult.type === 'fill'
				|| hitResult.segment.path.segments.length <= 2
			) {
				this.saveItemStateForUndo(hitResult.item)
				hitResult.item.remove()
			}
			else if (hitResult.type === 'segment') {
				this.saveItemStateForUndo(hitResult.item)
				hitResult.segment.remove()
			}
		}
	}

	onMouseUp(e: PaperToolEvent) {
		this.clampToBounds(e),
		this.selectionRectPath
		&& (this.selectionRectPath.remove(), (this.selectionRectPath = null)),
		(!this.button || this.button <= 0.5)
		&& this.currentPath
		&& (this.currentPath.isRectangle
		|| (this.currentPath.segments.length > 1
			? this.currentPath.simplify(3)
			: this.currentPath.add(e.point),
			(this.currentPath.strokeColor = new ce.Color('#ffffff'))),
			this.clearSelection(),
			(this.currentPath.bounds.selected = false),
			(this.currentPath.name
				= `Stroke-${this.stringHashCode(this.currentPath.toString())}`),
			(this.currentPath.strokeColor = null),
			this.editor.undoLayer.addChild(
				new ce.Group({
					name: this.editor.removeCmd + this.currentPath.name,
				}),
			),
			this.editor.redoLayer.removeChildren())
	}

	clearSelection() {
		for (let a = 0; a < this.selectedSegments.length; a++)
			this.selectedSegments[a].selected = false
		this.selectedSegments = []
		for (let a = 0; a < ce.project.selectedItems.length; a++)
			ce.project.selectedItems[a].selected = false
	}

	saveItemStateForUndo(item: paper.Item) {
		item.name
		|| (item.name = `ForeignObject-${this.stringHashCode(item.toString())}`)
		const h = item.clone()
		h.name = item.name
		this.editor.undoLayer.addChild(h)
		this.editor.redoLayer.removeChildren()
	}

	stringHashCode(a: string) {
		let h = 0
		if (a.length === 0)
			return h
		for (let p = 0; p < a.length; p++) {
			const d = a.charCodeAt(p)
			;(h = (h << 5) - h + d), (h = h & h)
		}
		return h
	}

	clampToBounds(e: PaperToolEvent) {
		const width = this.editor.backgroundImageElement.width
		const height = this.editor.backgroundImageElement.height
		e.point = e.point.set(
			Math.min(width * 0.5, Math.max(-width * 0.5, e.point.x)),
			Math.min(height * 0.5, Math.max(-height * 0.5, e.point.y)),
		)
	}
}
