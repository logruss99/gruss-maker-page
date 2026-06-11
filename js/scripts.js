/*!
* Start Bootstrap - Personal v1.0.1 (https://startbootstrap.com/template-overviews/personal)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-personal/blob/master/LICENSE)
*/
window.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var body = document.body;
    var protectedPdfLinks = Array.prototype.slice.call(document.querySelectorAll("[data-pdf-password], [data-modal-password]"));
    var pdfModal;
    var pdfModalTitle;
    var pdfModalInput;
    var pdfModalError;
    var activeProtectedLink = null;
    var previousFocus = null;

    function getProtectedPdfTitle(link) {
        var explicitTitle = link.getAttribute("data-pdf-title") || link.getAttribute("data-modal-title");
        var bookTitle = link.querySelector(".article-post-hero-book-title");

        if (explicitTitle) {
            return explicitTitle;
        }

        if (bookTitle && bookTitle.textContent) {
            return bookTitle.textContent.trim();
        }

        return "Protected";
    }

    function closeProtectedPdfModal() {
        if (!pdfModal) {
            return;
        }

        pdfModal.setAttribute("hidden", "hidden");
        pdfModal.setAttribute("aria-hidden", "true");
        body.classList.remove("site-password-modal-open");
        activeProtectedLink = null;

        if (pdfModalInput) {
            pdfModalInput.value = "";
        }

        if (pdfModalError) {
            pdfModalError.textContent = "";
        }

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }

        previousFocus = null;
    }

    function openProtectedPdfDestination(link) {
        var destination = link.getAttribute("href");
        var target = link.getAttribute("target");

        if (!destination) {
            return;
        }

        if (target && target !== "_self") {
            window.open(destination, target, "noopener,noreferrer");
            return;
        }

        window.location.href = destination;
    }

    function submitProtectedPdfPassword(event) {
        var expectedPassword;
        var enteredPassword;
        var linkToOpen;

        if (event) {
            event.preventDefault();
        }

        if (!activeProtectedLink || !pdfModalInput || !pdfModalError) {
            return;
        }

        expectedPassword = activeProtectedLink.getAttribute("data-pdf-password") ||
                           activeProtectedLink.getAttribute("data-modal-password");
        enteredPassword = pdfModalInput.value.trim();

        if (enteredPassword !== expectedPassword) {
            pdfModalError.textContent = "That password was not recognized. Please try again.";
            pdfModalInput.focus();
            pdfModalInput.select();
            return;
        }

        linkToOpen = activeProtectedLink;
        closeProtectedPdfModal();

        var bsTarget = linkToOpen.getAttribute("data-modal-target");
        if (bsTarget && window.bootstrap) {
            var targetEl = document.querySelector(bsTarget);
            if (targetEl) {
                bootstrap.Modal.getOrCreateInstance(targetEl).show();
            }
        } else {
            openProtectedPdfDestination(linkToOpen);
        }
    }

    function buildProtectedPdfModal() {
        var modalMarkup;
        var form;
        var closeButtons;

        if (!body || pdfModal) {
            return;
        }

        modalMarkup = document.createElement("div");
        modalMarkup.className = "site-password-modal";
        modalMarkup.setAttribute("hidden", "hidden");
        modalMarkup.setAttribute("aria-hidden", "true");
        modalMarkup.innerHTML =
            '<div class="site-password-dialog" role="dialog" aria-modal="true" aria-labelledby="site-password-dialog-title">' +
                '<div class="site-password-dialog-header">' +
                    '<div class="site-password-dialog-title-wrap">' +
                        '<span class="site-password-dialog-kicker">Secure Access</span>' +
                        '<h2 class="site-password-dialog-title" id="site-password-dialog-title">Protected PDF</h2>' +
                    '</div>' +
                    '<button class="site-password-dialog-close" type="button" data-password-close aria-label="Close password dialog">&times;</button>' +
                '</div>' +
                '<p class="site-password-dialog-copy">Did not expect...locked door.</p>' +
                '<form class="site-password-dialog-form">' +
                    '<label class="site-password-dialog-label" for="site-password-dialog-input">Password</label>' +
                    '<input class="site-password-dialog-input" id="site-password-dialog-input" name="pdf-password" type="password" autocomplete="off" spellcheck="false" />' +
                    '<p class="site-password-dialog-error" aria-live="polite"></p>' +
                    '<div class="site-password-dialog-actions">' +
                        '<button class="site-password-dialog-btn site-password-dialog-btn-secondary" type="button" data-password-close>Cancel</button>' +
                        '<button class="site-password-dialog-btn site-password-dialog-btn-primary" type="submit">Open PDF</button>' +
                    '</div>' +
                '</form>' +
            '</div>';

        body.appendChild(modalMarkup);

        pdfModal = modalMarkup;
        pdfModalTitle = pdfModal.querySelector(".site-password-dialog-title");
        pdfModalInput = pdfModal.querySelector(".site-password-dialog-input");
        pdfModalError = pdfModal.querySelector(".site-password-dialog-error");
        form = pdfModal.querySelector(".site-password-dialog-form");
        closeButtons = Array.prototype.slice.call(pdfModal.querySelectorAll("[data-password-close]"));

        form.addEventListener("submit", submitProtectedPdfPassword);

        closeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                closeProtectedPdfModal();
            });
        });

        pdfModal.addEventListener("click", function (event) {
            if (event.target === pdfModal) {
                closeProtectedPdfModal();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && pdfModal && !pdfModal.hasAttribute("hidden")) {
                closeProtectedPdfModal();
            }
        });
    }

    function openProtectedPdfModal(link) {
        if (!link || !body) {
            return;
        }

        if (!pdfModal) {
            buildProtectedPdfModal();
        }

        activeProtectedLink = link;
        previousFocus = document.activeElement;

        if (pdfModalTitle) {
            pdfModalTitle.textContent = getProtectedPdfTitle(link);
        }

        if (pdfModalError) {
            pdfModalError.textContent = "";
        }

        if (pdfModalInput) {
            pdfModalInput.value = "";
        }

        pdfModal.removeAttribute("hidden");
        pdfModal.setAttribute("aria-hidden", "false");
        body.classList.add("site-password-modal-open");

        var submitBtn = pdfModal.querySelector(".site-password-dialog-btn-primary");
        if (submitBtn) {
            submitBtn.textContent = link.getAttribute("data-modal-target") ? "Unlock" : "Open PDF";
        }

        window.setTimeout(function () {
            if (pdfModalInput) {
                pdfModalInput.focus();
            }
        }, 0);
    }

    if (protectedPdfLinks.length) {
        buildProtectedPdfModal();

        protectedPdfLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                var pdfPassword   = link.getAttribute("data-pdf-password");
                var modalPassword = link.getAttribute("data-modal-password");
                var destination   = link.getAttribute("href");
                var modalTarget   = link.getAttribute("data-modal-target");

                if ((!pdfPassword && !modalPassword) || (!destination && !modalTarget)) {
                    return;
                }

                event.preventDefault();
                openProtectedPdfModal(link);
            });
        });
    }

    if (body && body.classList.contains("home-page") && root.classList.contains("home-intro-first")) {
        window.requestAnimationFrame(function () {
            root.classList.add("home-intro-animate");
        });

        window.setTimeout(function () {
            root.classList.remove("home-intro-first");
            root.classList.remove("home-intro-animate");
            root.classList.add("home-intro-seen");
        }, 3200);
    }

    // Project grid cards (.pf-card): the entrance stagger is pure CSS, so the
    // grid still appears without JS. Here we only add the live touches -
    // ambient loops run while a card is on screen, and a pointer-reactive
    // glow for fine pointers. Both respect prefers-reduced-motion.
    var pfCards = Array.prototype.slice.call(document.querySelectorAll(".pf-card"));
    var pfRevealTargets = Array.prototype.slice.call(document.querySelectorAll(".pf-reveal"));
    var pfMotionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll reveal for below-the-fold panels. The .pf-motion body class
    // gates the hiding CSS, so content stays visible without JS or with
    // reduced motion.
    if (pfRevealTargets.length && pfMotionOk && "IntersectionObserver" in window) {
        body.classList.add("pf-motion");

        var pfRevealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("pf-in");
                    pfRevealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -10% 0px" });

        pfRevealTargets.forEach(function (el) {
            pfRevealObserver.observe(el);
        });
    }

    if (pfCards.length && pfMotionOk) {
        if ("IntersectionObserver" in window) {
            var pfLiveObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    entry.target.classList.toggle("pf-live", entry.isIntersecting);
                });
            });

            pfCards.forEach(function (card) {
                pfLiveObserver.observe(card);
            });
        }

        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            pfCards.forEach(function (card) {
                var pfPointerFrame = 0;
                var pfPointerEvent = null;

                card.addEventListener("pointermove", function (event) {
                    pfPointerEvent = event;

                    if (pfPointerFrame) {
                        return;
                    }

                    pfPointerFrame = window.requestAnimationFrame(function () {
                        pfPointerFrame = 0;

                        var rect = card.getBoundingClientRect();

                        if (!rect.width || !rect.height) {
                            return;
                        }

                        card.style.setProperty("--pf-mx", (((pfPointerEvent.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
                        card.style.setProperty("--pf-my", (((pfPointerEvent.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
                    });
                });

                card.addEventListener("pointerleave", function () {
                    if (pfPointerFrame) {
                        window.cancelAnimationFrame(pfPointerFrame);
                        pfPointerFrame = 0;
                    }

                    card.style.removeProperty("--pf-mx");
                    card.style.removeProperty("--pf-my");
                });
            });
        }
    }
});
