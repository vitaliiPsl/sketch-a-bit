const canvas = document.querySelector(".canvas");

const rainbowBtn = document.querySelector("#rainbow");
const eraserBtn = document.querySelector("#eraser");
const clearBtn = document.querySelector("#clear");

const colorInput = document.querySelector("input[name='color-picker']");
const sizeInput = document.querySelector("input[name='canvas-size']");

const canvasSizeFields = document.querySelectorAll(".size-field");

const downloadBtn = document.querySelector("#download-btn")
const pictureTitle = document.querySelector("#picture-title")
const saveBtn = document.querySelector('#save-btn')
const deleteBtn = document.querySelector('#delete-btn')

//state variables
let canvasSize = 16;
let mouseDown = false;
let rainbowMode = false
let color = '#000';

//event listeners

document.addEventListener('DOMContentLoaded', () => {
    let id = canvas.id
    if(id == 'none'){
        createCanvas(16);
    }
    else{
        loadCanvas(id);
    }
})

document.addEventListener("mousedown", () => mouseDown = true);

document.addEventListener("mouseup", () => mouseDown = false);

rainbowBtn.addEventListener("click", rainbowBtnClick)

eraserBtn.addEventListener("click", eraserBtnClick);

clearBtn.addEventListener("click", () => {
    createCanvas(canvasSize);
});

if(sizeInput){
    sizeInput.addEventListener("input", changeCanvasSize);
}

colorInput.addEventListener("change", () => {
    color = colorInput.value;
    document.documentElement.style.setProperty(`--color`, color);
});

if(downloadBtn){
    downloadBtn.addEventListener('click', downloadPicture);
}

if(saveBtn){
    saveBtn.addEventListener('click', saveCanvas);
}

if(deleteBtn){
    deleteBtn.addEventListener('click', deleteRecord);
}

function eraserBtnClick(){
    closeRainbow();

    if(eraserBtn.classList.contains("pressed")){
        closeEraser();
        return;
    }

    eraserBtn.classList.add("pressed");
    color = "#fff";
}

function closeEraser(){
    eraserBtn.classList.remove("pressed");
    color = colorInput.value;
}

function rainbowBtnClick(){
    closeEraser();

    if(rainbowBtn.classList.contains("pressed")){
        closeRainbow();
        return;
    }

    rainbowBtn.classList.add("pressed");
    rainbowMode = true;
}

function closeRainbow(){
    rainbowBtn.classList.remove("pressed");
    rainbowMode = false;
}

function changeCanvasSize(){
    canvasSize = sizeInput.value
    updateSizeFields()
    createCanvas(canvasSize)
}

function updateSizeFields(){
    for(let field of canvasSizeFields){
        field.innerHTML = canvasSize 
    }
    sizeInput.value = canvasSize
}

function changeBackground(element){
    if(rainbowMode){
        element.style.backgroundColor = getRainbow();
        
        return;
    }
    element.style.backgroundColor = color;
}

function getRainbow(){
    let rainbowColors = ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000']

    let rand = Math.floor(Math.random() * rainbowColors.length)

    return rainbowColors[rand]
}

function createCanvas(size){
    while(canvas.firstChild){
        canvas.removeChild(canvas.firstChild)
    }

    for(let i = 0; i < size; i++){
        let row = document.createElement("div");

        row.style.width = "600px";
        row.style.height = `${600 / size}px`;

        canvas.appendChild(row);

        for(let j = 0; j < size; j++){
            let column = document.createElement("div")
            row.appendChild(column);

            column.style.width = `${600 / size}px`;
            column.style.height = "100%"

            column.addEventListener("mouseover", () => {
                if(mouseDown){
                    changeBackground(column)
                }
            })

            column.addEventListener("mousedown", () => {
                changeBackground(column)
            })
        }
    }
}

function loadCanvas(id){
    data = {recordId: id}

    postData('/get_record', data).then(data => displayCanvas(data));
}

function displayCanvas(record){
    let size = record['size'];
    canvasSize = size;

    if(sizeInput){
        updateSizeFields();
    }
    createCanvas(size);

    body = record['body'];
    body = body.replace(/'/g, '"');
    body = JSON.parse(body);

    let rows = canvas.childNodes;
    for(let i = 0; i < size; i++){
        let cols = rows[i].childNodes;
        for(let j = 0; j < size; j++){
            cols[j].style.backgroundColor = body[i][j]
        }
    }

    console.log("Done");
}

function downloadPicture(){
    id = canvas.id;
    window.open(`/download/${id}`);
}

function saveCanvas(){
    let picture = []
    let rows = canvas.childNodes

    for(let row of rows){
        let pictureRow = []
        let rowChilds = row.childNodes
        
        for(let col of rowChilds){
            pictureRow.push(col.style.backgroundColor)
        }
        picture.push(pictureRow)
    }

    let saveData = {}
    saveData['title'] = pictureTitle.value
    saveData['size'] = canvasSize
    saveData['body'] = picture

    postData('/save', saveData)
    .then(data => {
      console.log(data);
    });
}

function deleteRecord(){
    let id = canvas.id;
    let deleteData = {'id': id}
    
    postData('/delete', deleteData)
        .then(data)

    window.location.href = "/";
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  