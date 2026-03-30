/*!
* Start Bootstrap - Personal v1.0.1 (https://startbootstrap.com/template-overviews/personal)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-personal/blob/master/LICENSE)
*/
window.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var body = document.body;

    if (body && body.classList.contains("home-page") && root.classList.contains("home-intro-first")) {
        window.requestAnimationFrame(function () {
            root.classList.add("home-intro-animate");
        });

        window.setTimeout(function () {
            root.classList.remove("home-intro-first");
            root.classList.remove("home-intro-animate");
            root.classList.add("home-intro-seen");
        }, 1200);

        try {
            sessionStorage.setItem("gruss-home-intro-seen", "1");
        } catch (error) {
            // Ignore storage availability issues and allow the page to render normally.
        }
    }
});
