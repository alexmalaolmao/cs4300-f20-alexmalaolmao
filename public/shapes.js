const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const GREEN_HEX = "#00FF00"
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const LETTER_F = "LETTER_F"
const STAR = "STAR"
const CIRCLE = "CIRCLE"
const CUBE = "CUBE"
const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}

let camera = {
  translation: {x: -45, y: -35, z: 21},
  rotation: {x: 40, y: 235, z: 0}
}

let lightSource = [0.4, 0.3, 0.5]
let shapes = [
    {
      type: CUBE,
      position: origin,
      dimensions: sizeOne,
      color: BLUE_RGB,
      translation: {x:  0, y: 0, z: 0},
      scale:       {x:   0.5, y:   0.5, z:   0.5},
      rotation:    {x:   0, y:  0, z:   0},
    },
    {
      type: CUBE,
      position: origin,
      dimensions: sizeOne,
      color: GREEN_RGB,
      translation: {x: 20, y: 0, z: 0},
      scale:       {x:   0.5, y:   0.5, z:   0.5},
      rotation:    {x:   0, y:  0, z:   0},
    },
    {
      type: CUBE,
      position: origin,
      dimensions: sizeOne,
      color: RED_RGB,
      translation:  {x: -20, y: 0, z: 0},
      scale:       {x:   0.5, y:   0.5, z:   0.5},
      rotation:     {x: 0, y: 0, z: 0}
    }
]
