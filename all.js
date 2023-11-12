if (document.getElementById("navigation")) {
    var elements = document.getElementById("navigation").getElementsByTagName("a");
    for (var i = 0; i < elements.length; i++) {
        elements[i].onclick = function (elem) {
            if (elem.target.getAttribute("href") === "javascript:void(0)") {
                var submenu = elem.target.nextElementSibling.nextElementSibling;
                submenu.classList.toggle('open');
            }
        }
    }
}


function windowScroll() {
    const navbar = document.getElementById("topnav");
    if (navbar != null) {
        if (document.body.scrollTop >= 50) {
            navbar.classList.add("nav-sticky");
        } else {
            navbar.classList.remove("nav-sticky");
        }
    }
}

window.addEventListener('scroll', (ev) => {
    ev.preventDefault();
    windowScroll();
})
/*********************/
/*    Back To Top    */
/*********************/

window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    var mybutton = document.getElementById("back-to-top");
    if(mybutton!=null){
        if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
            mybutton.classList.add("flex");
            mybutton.classList.remove("hidden");
        } else {
            mybutton.classList.add("hidden");
            mybutton.classList.remove("flex");
        }
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}


/*  Active Sidebar   */






/*********************/
/* Dark & Light Mode */
/*********************/
try {
    function changeTheme(e){
        e.preventDefault()
        const htmlTag = document.getElementsByTagName("html")[0]
        
        if (htmlTag.className.includes("dark")) {
            htmlTag.className = 'light'
        } else {
            htmlTag.className = 'dark'
        }
    }

    const switcher = document.getElementById("theme-mode")
    switcher?.addEventListener("click" ,changeTheme )
    
    const chk = document.getElementById('chk');

    chk.addEventListener('change',changeTheme);
} catch (err) {
    
}



document.querySelectorAll(".dropdown").forEach(function (item) {
    item.querySelectorAll(".dropdown-toggle").forEach(function (subitem) {
        subitem.addEventListener("click", function (event) {
            subitem.classList.toggle("block");
            if (subitem.classList.contains("block") != true) {
                item.querySelector(".dropdown-menu").classList.remove("block")
                item.querySelector(".dropdown-menu").classList.add("hidden")
            } else {
                dismissDropdownMenu()
                item.querySelector(".dropdown-menu").classList.add("block")
                item.querySelector(".dropdown-menu").classList.remove("hidden")
                if (item.querySelector(".dropdown-menu").classList.contains("block")) {
                    subitem.classList.add("block")
                } else {
                    subitem.classList.remove("block")
                }
                event.stopPropagation();
            }
        });
    });
  });
  
  function dismissDropdownMenu() {
    document.querySelectorAll(".dropdown-menu").forEach(function (item) {
        item.classList.remove("block")
        item.classList.add("hidden")
    });
    document.querySelectorAll(".dropdown-toggle").forEach(function (item) {
        item.classList.remove("block")
    });
  }
  
  window.addEventListener('click', function (e) {
    dismissDropdownMenu();
  });

  /* modal closing after 10sec */
  var myModal = new bootstrap.Modal(document.getElementById('myModal'));

  function myFunction() {
      myModal.show();
      setTimeout(function () {
          myModal.hide();
          window.location.href = 'signup.html'; 
      }, 10000);
  }
