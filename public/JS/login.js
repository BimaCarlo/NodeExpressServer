window.onload = function () {
    window.localStorage.setItem("jwtoken","token!");
    let tokenLocalStorage =  window.localStorage.getItem('jwtoken');
    window.localStorage.clear()
    alert(tokenLocalStorage);
}