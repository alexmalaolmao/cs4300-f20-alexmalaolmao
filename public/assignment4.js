const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)

const origin = {x: 0, y: 0}
const sizeOne = {width: 1, height: 1}
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const STAR = "STAR"
const CIRCLE = "CIRCLE"
let shapes = [
    {
        type: RECTANGLE,
        position: origin,
        dimensions: sizeOne,
        color: BLUE_RGB,
        translation: {x: 200, y: 100},
        rotation: {z: 0},
        scale: {x: 50, y: 50}
    },
    {
        type: TRIANGLE,
        position: origin,
        dimensions: sizeOne,
        color: RED_RGB,
        translation: {x: 300,y: 100},
        rotation: {z: 0},
        scale: {x: 50, y: 50}
    }
]

let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords
let selectedShapeIndex = 1

const init = () => {
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");

    canvas.addEventListener(
        "mousedown",
        doMouseDown,
        false);

    gl = canvas.getContext("webgl");

    // create and use a GLSL program
    const program = webglUtils.createProgramFromScripts(gl,
        "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix")
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    bufferCoords = gl.createBuffer();

    // configure canvas resolution and clear the canvas
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById("tx").onchange = event => updateTranslation(event, "x")
    document.getElementById("ty").onchange = event => updateTranslation(event, "y")

    document.getElementById("sx").onchange = event => updateScale(event, "x")
    document.getElementById("sy").onchange = event => updateScale(event, "y")
    
    document.getElementById("rz").onchange = event => updateRotation(event, "z")
    document.getElementById("color").onchange = event => updateColor(event)
    
    selectShape(0)
}

// renders the image
const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER,
        bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        2,
        gl.FLOAT,
        false,
        0,

        0);

    const $shapeList = $("#object-list")
    $shapeList.empty()
    shapes.forEach((shape, index) => {
        const $li = $(`
            <li>
              <button onclick="deleteShape(${index})">
                Delete
              </button>  
              <label>
              <input
                type="radio"
                id="${shape.type}-${index}"
                name="shape-index"
                ${index === selectedShapeIndex ? "checked": ""}
                onclick="selectShape(${index})"
                value="${index}"/>
                ${shape.type};
                X: ${shape.translation.x};
                Y: ${shape.translation.y}
              </label>
            </li>
          `)
        $shapeList.append($li)
    })

    shapes.forEach(shape => {
        gl.uniform4f(uniformColor,
            shape.color.red,
            shape.color.green,
            shape.color.blue, 1);

        // compute transformation matrix
        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
        matrix = m3.rotate(matrix, shape.rotation.z);
        matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);

        // apply transformation matrix.
        gl.uniformMatrix3fv(uniformMatrix, false, matrix);

        if (shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            renderTriangle(shape)
        } else if (shape.type === STAR) {
            renderStar(shape)
        } else if (shape.type === CIRCLE) {
            renderCircle(shape)
        }
    })
}

const addShape = (translation, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    if (translation) {
        tx = translation.x
        ty = translation.y
    }
    const shape = {
        type: type,
        position: origin,
        dimensions: sizeOne,
        color: colorRgb,
        translation: { x: tx, y: ty, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 20, y: 20, z: 20 }
    }
    shapes.push(shape)
    render()
}

const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
        - rectangle.dimensions.width / 2;
    const y1 = rectangle.position.y
        - rectangle.dimensions.height / 2;
    const x2 = rectangle.position.x
        + rectangle.dimensions.width / 2;
    const y2 = rectangle.position.y
        + rectangle.dimensions.height / 2;

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            x1, y1, x2, y1, x1, y2,
            x1, y2, x2, y1, x2, y2,
        ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderTriangle = (triangle) => {
    const x1 = triangle.position.x
        - triangle.dimensions.width / 2
    const y1 = triangle.position.y
        + triangle.dimensions.height / 2
    const x2 = triangle.position.x
        + triangle.dimensions.width / 2
    const y2 = triangle.position.y
        + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
        - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
        x1, y1, x2, y2, x3, y3
    ])

    gl.bufferData(gl.ARRAY_BUFFER,
        float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const renderStar = (star) => {
    const x_center = star.position.x
    const y_top = star.position.y + star.dimensions.height / 2
    const y_bot = star.position.y - star.dimensions.height / 2
    const x_left = star.position.x - star.dimensions.width / 2
    const x_right = star.position.x + star.dimensions.width / 2
    const y_upper = star.position.y + star.dimensions.height / 4
    const y_lower = star.position.y - star.dimensions.height / 4

    const float32Array = new Float32Array([
        x_center, y_top, x_left, y_lower, x_right, y_lower,
        x_center, y_bot, x_left, y_upper, x_right, y_upper
    ])

    gl.bufferData(gl.ARRAY_BUFFER,
        float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderCircle = (circle) => {
    var positions = [];
    var center_x = circle.position.x;
    var center_y = circle.position.y;
    var radius_height = circle.dimensions.height / 2;
    var radius_width = circle.dimensions.width / 2;

    for (var i = 0; i < 360; i += 4) {
        positions.push(center_x);
        positions.push(center_y);
        var radians_one = i * (Math.PI/180);
        var radians_two = (i + 4) * (Math.PI/180);
        positions.push(center_x + (Math.cos(radians_one) * radius_width));
        positions.push(center_y + (Math.sin(radians_one) * radius_height));
        positions.push(center_x + (Math.cos(radians_two) * radius_width));
        positions.push(center_y + (Math.sin(radians_two) * radius_height));
    }

    const float32Array = new Float32Array(positions)

    gl.bufferData(gl.ARRAY_BUFFER,
        float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 540);
}

const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = event.clientX - boundingRectangle.left;
    const y = event.clientY - boundingRectangle.top;
    const translation = {x, y}
    const shape = document.querySelector("input[name='shape']:checked").value

    addShape(translation, shape)
}

const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    render()
}

// populates the fields with the set values
const selectShape = (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
}

const updateTranslation = (event, axis) => {
    const value = event.target.value;
    shapes[selectedShapeIndex].translation[axis] = value;
    render();
}

const updateScale = (event, axis) => {
    const value = event.target.value;
    shapes[selectedShapeIndex].scale[axis] = value;
    render();
}

const updateRotation = (event, axis) => {
    const value = event.target.value;
    const angleInDegrees = (360 - value) * Math.PI / 180;
    shapes[selectedShapeIndex].rotation[axis] = angleInDegrees;
    render();
}

const updateColor = (event) => {
    const value = event.target.value;
    shapes[selectedShapeIndex].color = webglUtils.hexToRgb(value);
    render();
}
