document.addEventListener('DOMContentLoaded', loadRecords)
const galleryBox = document.querySelector(".gallery")

function loadRecords(){
    fetch('/get_gallery_records')
    .then(response => response.json())
    .then(result => {
        displayRecords(result);
    });
}

function displayRecords(pictures){
    console.log(pictures)
    console.log(pictures['pictures'].length)
    counter = 0

    for(let picture of pictures['pictures']){
        console.log(picture['title'])

        let record = document.createElement("div")
        record.classList.add('record')
        galleryBox.appendChild(record)

        let link = document.createElement("a")
        link.href = `/?id=${picture['id']}`
        record.appendChild(link)

        let recordTitle = document.createElement("h3")
        recordTitle.classList.add("name") 
        recordTitle.innerHTML = picture['title']
        link.appendChild(recordTitle)

        let picturePreview = document.createElement("div")
        picturePreview.classList.add("picture-preview")
        record.appendChild(picturePreview)
        
        makePicturePreview(picturePreview, picture['body'], picture['size'])

        let recordInfo = document.createElement("div")
        recordInfo.classList.add("record-info") 
        
        let authorSpan = document.createElement("span")
        authorSpan.classList.add("author")
        authorSpan.innerHTML = picture['username']
        recordInfo.appendChild(authorSpan)

        let idSpan = document.createElement("span")
        idSpan.classList.add("id")
        idSpan.innerHTML = picture['id']
        
        console.log()
        recordInfo.appendChild(idSpan)

        record.appendChild(recordInfo)
    } 
}

function makePicturePreview(picturePreview, body, size){
    body = body.replace(/'/g, '"')
    body = JSON.parse(body)

    for(let i = 0; i < body.length; i++){
        let row = document.createElement("div");
        row.style.width = "100%";
        row.style.height = 200 / size + 'px';
        
        for(let j = 0; j < body.length; j++){
            let col = document.createElement("div");
            
            col.style.backgroundColor = body[i][j];

            col.style.width = 200 / size + 'px';
            col.style.height = "100%";

            row.appendChild(col);
        }
        picturePreview.appendChild(row);
    }
}
