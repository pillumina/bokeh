import {TextAnnotation, TextAnnotationView} from "./text_annotation"
import {SpatialUnits, AngleUnits} from "core/enums"
import {undisplay} from "core/dom"
import {Size} from "core/layout"
import * as mixins from "core/property_mixins"
import * as p from "core/properties"

export class LabelView extends TextAnnotationView {
  model: Label
  visuals: Label.Visuals

  initialize(): void {
    super.initialize()
    this.visuals.warm_cache()
  }

  protected _get_size(): Size {
    const {ctx} = this.plot_view.canvas_view
    this.visuals.text.set_value(ctx)

    const {width, ascent} = ctx.measureText(this.model.text)
    return {width, height: ascent}
  }

  render(): void {
    if (!this.model.visible && this.model.render_mode == 'css')
      undisplay(this.el)

    if (!this.model.visible)
      return

    // Here because AngleSpec does units tranform and label doesn't support specs
    let angle: number
    switch (this.model.angle_units) {
      case "rad": {
        angle = -this.model.angle
        break
      }
      case "deg": {
        angle = (-this.model.angle*Math.PI)/180.0
        break
      }
      default:
        throw new Error("unreachable code")
    }

    const panel = this.panel != null ? this.panel : this.plot_view.frame
    const {x_scale, y_scale} = this.scope

    let sx = this.model.x_units == "data" ? x_scale.compute(this.model.x) : panel.xview.compute(this.model.x)
    let sy = this.model.y_units == "data" ? y_scale.compute(this.model.y) : panel.yview.compute(this.model.y)

    sx += this.model.x_offset
    sy -= this.model.y_offset

    const draw = this.model.render_mode == 'canvas' ? this._canvas_text.bind(this) : this._css_text.bind(this)
    draw(this.plot_view.canvas_view.ctx, this.model.text, sx, sy, angle)
  }
}

export namespace Label {
  export type Props = TextAnnotation.Props & {
    x: p.Property<number>
    x_units: p.Property<SpatialUnits>
    y: p.Property<number>
    y_units: p.Property<SpatialUnits>
    text: p.Property<string>
    angle: p.Property<number>
    angle_units: p.Property<AngleUnits>
    x_offset: p.Property<number>
    y_offset: p.Property<number>
  } & mixins.TextScalar
    & mixins.BorderLine
    & mixins.BackgroundFill

  export type Attrs = p.AttrsOf<Props>

  export type Visuals = TextAnnotation.Visuals
}

export interface Label extends Label.Attrs {}

export class Label extends TextAnnotation {
  properties: Label.Props

  constructor(attrs?: Partial<Label.Attrs>) {
    super(attrs)
  }

  static init_Label(): void {
    this.prototype.default_view = LabelView

    this.mixins(['text', 'line:border_', 'fill:background_'])

    this.define<Label.Props>({
      x:            [ p.Number                       ],
      x_units:      [ p.SpatialUnits, 'data'         ],
      y:            [ p.Number                       ],
      y_units:      [ p.SpatialUnits, 'data'         ],
      text:         [ p.String                       ],
      angle:        [ p.Angle,       0               ],
      angle_units:  [ p.AngleUnits,  'rad'           ],
      x_offset:     [ p.Number,      0               ],
      y_offset:     [ p.Number,      0               ],
    })

    this.override({
      background_fill_color: null,
      border_line_color: null,
    })
  }
}
