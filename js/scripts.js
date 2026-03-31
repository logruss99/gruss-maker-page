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
        }, 3200);
    }

    if (body && body.classList.contains("projects-page")) {
        var stage = document.querySelector(".projects-network-stage");
        var svg = stage ? stage.querySelector(".projects-network-spokes") : null;
        var core = stage ? stage.querySelector(".projects-network-core-content") : null;
        var connectors = svg ? Array.prototype.slice.call(svg.querySelectorAll(".projects-connector")) : [];
        var branches = stage ? Array.prototype.slice.call(stage.querySelectorAll(".project-branch")) : [];
        var mobileQuery = window.matchMedia("(max-width: 767.98px)");
        var resizeFrame = 0;
        var startupFrame = 0;
        var startupTriggered = false;
        var wireRevealLocked = false;

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function cubicPoint(p0, p1, p2, p3, t) {
            var mt = 1 - t;
            return {
                x: (mt * mt * mt * p0.x) + (3 * mt * mt * t * p1.x) + (3 * mt * t * t * p2.x) + (t * t * t * p3.x),
                y: (mt * mt * mt * p0.y) + (3 * mt * mt * t * p1.y) + (3 * mt * t * t * p2.y) + (t * t * t * p3.y)
            };
        }

        function cubicTangent(p0, p1, p2, p3, t) {
            var mt = 1 - t;
            return {
                x: (3 * mt * mt * (p1.x - p0.x)) + (6 * mt * t * (p2.x - p1.x)) + (3 * t * t * (p3.x - p2.x)),
                y: (3 * mt * mt * (p1.y - p0.y)) + (6 * mt * t * (p2.y - p1.y)) + (3 * t * t * (p3.y - p2.y))
            };
        }

        function buildWirePath(start, end, normal, bend) {
            var dx = end.x - start.x;
            var dy = end.y - start.y;
            var cp1 = {
                x: start.x + (dx * 0.24) + (normal.x * bend),
                y: start.y + (dy * 0.18) + (normal.y * bend)
            };
            var cp2 = {
                x: start.x + (dx * 0.76) + (normal.x * bend * 0.7),
                y: start.y + (dy * 0.82) + (normal.y * bend * 0.7)
            };

            return {
                start: start,
                cp1: cp1,
                cp2: cp2,
                end: end,
                d: "M " + start.x.toFixed(2) + " " + start.y.toFixed(2) +
                    " C " + cp1.x.toFixed(2) + " " + cp1.y.toFixed(2) +
                    ", " + cp2.x.toFixed(2) + " " + cp2.y.toFixed(2) +
                    ", " + end.x.toFixed(2) + " " + end.y.toFixed(2)
            };
        }

        function getRectCenter(rect, stageRect) {
            return {
                x: rect.left - stageRect.left + (rect.width / 2),
                y: rect.top - stageRect.top + (rect.height / 2)
            };
        }

        function getProjectAnchor(branchRect, stageRect, direction, inset) {
            var center = getRectCenter(branchRect, stageRect);
            var dx = direction.x || 0.0001;
            var dy = direction.y || 0.0001;
            var halfWidth = Math.max((branchRect.width / 2) - inset, branchRect.width * 0.22);
            var halfHeight = Math.max((branchRect.height / 2) - inset, branchRect.height * 0.22);
            var scale = Math.min(Math.abs(halfWidth / dx), Math.abs(halfHeight / dy));

            return {
                x: center.x + (dx * scale),
                y: center.y + (dy * scale)
            };
        }

        function scheduleNetworkUpdate() {
            if (resizeFrame) {
                window.cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = window.requestAnimationFrame(updateProjectNetwork);
        }

        function triggerCoreStartup() {
            if (startupTriggered || mobileQuery.matches) {
                return;
            }

            startupTriggered = true;
            body.classList.remove("projects-core-startup");

            window.setTimeout(function () {
                startupFrame = window.requestAnimationFrame(function () {
                    startupFrame = window.requestAnimationFrame(function () {
                        body.classList.add("projects-core-startup");
                    });
                });
            }, 140);
        }

        function updateProjectNetwork() {
            resizeFrame = 0;

            if (!stage || !svg || !core || !connectors.length || connectors.length !== branches.length) {
                return;
            }

            if (mobileQuery.matches) {
                return;
            }

            var stageRect = stage.getBoundingClientRect();
            var stageWidth = stageRect.width;
            var stageHeight = stageRect.height;

            if (!stageWidth || !stageHeight) {
                return;
            }

            svg.setAttribute("viewBox", "0 0 " + stageWidth + " " + stageHeight);
            svg.setAttribute("preserveAspectRatio", "none");

            var coreRect = core.getBoundingClientRect();
            var coreCenter = getRectCenter(coreRect, stageRect);
            var coreRadius = Math.min(coreRect.width, coreRect.height) * 0.39;

            connectors.forEach(function (connector, index) {
                var branch = branches[index];
                var lines = Array.prototype.slice.call(connector.querySelectorAll(".projects-connector-line"));
                var pad = connector.querySelector(".projects-connector-pad-core");

                if (!branch || !lines.length || !pad) {
                    return;
                }

                var branchRect = branch.getBoundingClientRect();
                var branchCenter = getRectCenter(branchRect, stageRect);
                var vectorToCore = {
                    x: coreCenter.x - branchCenter.x,
                    y: coreCenter.y - branchCenter.y
                };
                var distance = Math.hypot(vectorToCore.x, vectorToCore.y) || 1;
                var unit = {
                    x: vectorToCore.x / distance,
                    y: vectorToCore.y / distance
                };
                var normal = {
                    x: -unit.y,
                    y: unit.x
                };
                var projectInset = 16;
                var startBase = getProjectAnchor(branchRect, stageRect, unit, projectInset);
                var coreBase = {
                    x: coreCenter.x - (unit.x * coreRadius),
                    y: coreCenter.y - (unit.y * coreRadius)
                };
                var conduitOffset = clamp(4 + (distance * 0.006), 4, 8);
                var start = {
                    x: startBase.x + (normal.x * conduitOffset),
                    y: startBase.y + (normal.y * conduitOffset)
                };
                var end = {
                    x: coreBase.x + (normal.x * conduitOffset * 0.35),
                    y: coreBase.y + (normal.y * conduitOffset * 0.35)
                };
                var conduitBend = clamp(10 + (distance * 0.03) + Math.max(0, 1100 - stageWidth) * 0.008, 10, 26);
                var conduitCurve = buildWirePath(start, end, normal, conduitBend);

                pad.setAttribute("cx", end.x.toFixed(2));
                pad.setAttribute("cy", end.y.toFixed(2));
                lines.forEach(function (line) {
                    line.setAttribute("d", conduitCurve.d);
                });
            });
        }

        function lockWireReveal() {
            if (wireRevealLocked) {
                return;
            }

            wireRevealLocked = true;
            body.classList.add("projects-wire-reveal-complete");
        }

        window.addEventListener("resize", scheduleNetworkUpdate);
        window.addEventListener("load", scheduleNetworkUpdate);

        if (svg) {
            svg.addEventListener("animationend", function (event) {
                if (event.animationName === "projectSpokeConnect") {
                    lockWireReveal();
                }
            });
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                scheduleNetworkUpdate();
                triggerCoreStartup();
            });
        }

        scheduleNetworkUpdate();
        triggerCoreStartup();
        window.setTimeout(lockWireReveal, 4400);
    }
});
