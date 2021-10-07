let burgerMenu = document.querySelector(".burger-menu");
let valList = document.querySelector(".nav");
let navDropDown = document.querySelector(".nav-drop-down")


burgerMenu.addEventListener('click', toggleBurgerMenu);

function toggleBurgerMenu(){
    burgerMenu.classList.toggle("active");
    navDropDown.classList.toggle("active");
}